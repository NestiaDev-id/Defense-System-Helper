import { Context } from "hono";
import { SecurityService } from "../../services/security.service.js";
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  RefreshTokenRequest,
  HashPasswordRequest,
  VerifyPasswordRequest,
  VerifyPasswordResponse,
  PythonErrorResponse,
  PythonHmacResponse,
  PythonAesEncryptResponse,
  PythonArgon2idResponse,
  Argon2idHashRequest,
} from "../interfaces/auth.interface.js";
import { env } from "../../config/env.js";
import { AuthService } from "../../services/AuthService.js";
import { validatePassword, validateUsername } from "../../utils/validators.js";
import { Buffer } from "buffer";
import { randomBytes } from "crypto";
import { AuthenticationError } from "../../exceptions/AppError.js";

type ApiResponse = Record<string, unknown>;

export class AuthController {
  static async register(c: Context) {
    const { username, password }: RegisterRequest = await c.req.json();

    // 1. Validasi Input dari Klien
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return c.json({ error: usernameValidation.message }, 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return c.json({ error: passwordValidation.message }, 400);
    }

    try {
      // 2. Dapatkan Argon2id Hash dan Salt-nya dari Python
      const argonResponse = await fetch(
        `${env.PYTHON_API_URL}/auth/argon2id-hash`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": env.PYTHON_SECRET_KEY,
          },
          body: JSON.stringify({ password }),
        }
      );
      if (!argonResponse.ok)
        throw new Error("Failed to get Argon2id hash from Python");
      const { hashed_password, salt_argon } =
        (await argonResponse.json()) as PythonArgon2idResponse;

      // 3. Hasilkan IV untuk AES di Hono
      const iv_aes_bytes = randomBytes(16); // crypto dari Node.js
      const iv_aes_b64 = iv_aes_bytes.toString("base64");

      // Minta Python untuk mengenkripsi password menggunakan AES
      // Mengirim password asli, salt_argon (untuk KDF kunci AES), dan iv_aes
      const aesEncryptResponse = await fetch(
        `${env.PYTHON_API_URL}/data/aes-encrypt-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": env.PYTHON_SECRET_KEY,
          },
          body: JSON.stringify({
            password: password,
            salt_for_kdf: salt_argon,
            iv_b64: iv_aes_b64,
          }),
        }
      );
      if (!aesEncryptResponse.ok)
        throw new Error("Failed to encrypt password with AES via Python");
      const { cipherdata } =
        (await aesEncryptResponse.json()) as PythonAesEncryptResponse; // cipherdata sudah base64 dari Python

      // 4. Minta Python untuk menghasilkan Combined Hash (HMAC)
      const hmacResponse = await fetch(
        `${env.PYTHON_API_URL}/integrity/generate-hmac`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": env.PYTHON_SECRET_KEY,
          },
          body: JSON.stringify({
            data_to_hmac: cipherdata, // cipherdata (base64)
            hmac_key_material: hashed_password, // $hashed_password (output Argon2id) sebagai kunci HMAC
          }),
        }
      );
      if (!hmacResponse.ok)
        throw new Error("Failed to generate HMAC via Python");
      const { combined_hash } =
        (await hmacResponse.json()) as PythonHmacResponse; // combined_hash (misalnya hex)

      // 5. Encode Combined Hash ke Base64 (jika belum)
      // Asumsi combined_hash dari Python adalah hex, kita ubah ke base64 untuk konsistensi penyimpanan
      const encoded_combined_hash = Buffer.from(combined_hash, "hex").toString(
        "base64"
      );

      // 6. Simpan ke Database (melalui AuthService Node.js dan UserRepository Node.js)
      // Anda perlu memodifikasi User model dan UserRepository untuk menyimpan semua field ini.
      await AuthService.registerComplex(username, {
        argon2id_hash: hashed_password,
        encoded_combined_hmac: encoded_combined_hash,
        aes_cipherdata_b64: cipherdata,
        argon_salt_b64: Buffer.from(salt_argon, "hex").toString("base64"), // Jika salt_argon adalah hex dari Python
        aes_iv_b64: iv_aes_b64,
      });

      return c.json({
        message: "User registered successfully with complex password storage.",
      });
    } catch (error: any) {
      console.error("Complex registration error:", error);
      return c.json({ error: error.message || "Registration failed" }, 500);
    }
  }

  static async login(c: Context) {
    const { username, password }: LoginRequest = await c.req.json();

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return c.json({ error: usernameValidation.message }, 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return c.json({ error: passwordValidation.message }, 400);
    }

    try {
      // Panggil metode login kompleks yang baru di AuthService
      const token = await AuthService.loginComplex(username, password);
      return c.json<TokenResponse>({ token });
    } catch (error: any) {
      console.error("Login process error in AuthController:", error.message);
      if (error instanceof AuthenticationError) {
        // Tangani error spesifik dari AuthService
        return c.json({ error: error.message }, 401);
      }
      if (error.response && error.response.data) {
        // Error dari PythonService/fetch
        const pythonError = error.response.data as { detail?: string };
        return c.json(
          { error: pythonError.detail || "Login failed via Python service" },
          error.response.status || 500
        );
      }
      return c.json({ error: error.message || "Login failed" }, 500);
    }
  }

  static async hashPassword(c: Context) {
    const {
      password,
      timeCost = 3,
      memoryCost = 65536,
      parallelism = 1,
    }: HashPasswordRequest = await c.req.json();

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return c.json({ error: passwordValidation.message }, 400);
    }

    // Limit protection
    if (timeCost > 10 || memoryCost > 262144) {
      return c.json({ error: "Parameters too high" }, 400);
    }

    const hash = await SecurityService.hashPassword(password, {
      timeCost,
      memoryCost,
      parallelism,
    });

    return c.json({ hash });
  }

  static async verifyPassword(c: Context) {
    const { password, hash }: VerifyPasswordRequest = await c.req.json();

    if (!password || !hash) {
      return c.json({ error: "Password and hash are required" }, 400);
    }

    // Optional: Reject unsupported hash format
    if (!hash.startsWith("$argon2id$")) {
      return c.json({ error: "Unsupported hash format" }, 400);
    }

    const valid = await SecurityService.verifyPassword(password, hash);

    return c.json<VerifyPasswordResponse>({ valid });
  }

  static async refreshToken(c: Context) {
    const { refreshToken }: RefreshTokenRequest = await c.req.json();

    // Forward to Python service for verification
    const response = await fetch(`${env.PYTHON_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = (await response.json()) as ApiResponse;
    return c.json(data);
  }

  static async argon2idHash(c: Context) {
    try {
      const { password } = await c.req.json<Argon2idHashRequest>();
      if (!password) {
        return c.json(
          { error: "Password is required for Argon2id hashing" },
          400
        );
      }

      // Panggil PythonService untuk endpoint hashing Argon2id
      // Anda mungkin perlu menambahkan metode baru di PythonService.ts
      // seperti `getArgon2idHash(password: string)`

      const response = await fetch(`${env.PYTHON_API_URL}/auth/argon2id-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      return c.json(response);
    } catch (error: any) {
      console.error("Argon2id hash error in AuthController:", error);
      if (error.response && error.response.data) {
        // Jika error dari fetch di PythonService
        return c.json(
          {
            error:
              (error.response.data as PythonErrorResponse).detail ||
              "Failed to hash password with Argon2id",
          },
          error.response.status || 500
        );
      }
      return c.json(
        { error: error.message || "Failed to hash password with Argon2id" },
        500
      );
    }
  }
}
