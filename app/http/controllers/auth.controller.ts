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
  Argon2idHashRequest,
  PythonArgon2idHashResponse,
  PythonAesEncryptPasswordResponse,
} from "../interfaces/auth.interface.js";
import { env } from "../../config/env.js";
import { AuthService } from "../../services/AuthService.js";
import { validatePassword, validateUsername } from "../../utils/validators.js";
import { Buffer } from "buffer";
import { randomBytes } from "crypto";
import { AppError, AuthenticationError } from "../../exceptions/AppError.js";
import { PythonService } from "../../services/PythonService.js";
import { PythonGenerateHmacResponse } from "../interfaces/crypto.interface.js";
import { ComplexPasswordData } from "../../models/User.js";

type ApiResponse = Record<string, unknown>;

export class AuthController {
  static async register(c: Context) {
    const { username, password: user_password }: RegisterRequest =
      await c.req.json();

    // Langkah 0: Validasi Input Awal
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return c.json({ error: usernameValidation.message }, 400);
    }

    const passwordValidation = validatePassword(user_password);
    if (!passwordValidation.isValid) {
      return c.json({ error: passwordValidation.message }, 400);
    }

    try {
      // Langkah 1 & 2 (Alur Anda): Dapatkan Argon2id Hash dan Salt-nya dari Python
      console.log(
        `[AuthController] Registering ${username}: Getting Argon2id hash...`
      );
      const argon2idResult =
        await PythonService.callPythonApi<PythonArgon2idHashResponse>(
          "/auth/argon2id-hash", // Pastikan endpoint ini ada di Python
          "POST",
          { password: user_password }
        );
      const { hashed_password, salt_argon_hex } = argon2idResult;
      console.log(
        `[AuthController] Registering ${username}: Argon2id hash received.`
      );

      // Langkah 3 (Alur Anda): Hasilkan Initialization Vector (IV) untuk AES di Hono
      const iv_aes_bytes = randomBytes(16); // 16 byte untuk AES-CBC atau 12 byte untuk AES-GCM
      const iv_aes_b64 = iv_aes_bytes.toString("base64");
      console.log(
        `[AuthController] Registering ${username}: AES IV generated.`
      );

      // Langkah 3 (Alur Anda) & 5 (Alur Anda): Minta Python untuk mengenkripsi password asli menggunakan AES
      // Mengirim password asli, salt_argon (untuk KDF kunci AES), dan iv_aes
      console.log(
        `[AuthController] Registering ${username}: Encrypting password with AES...`
      );
      const aesResult =
        await PythonService.callPythonApi<PythonAesEncryptPasswordResponse>(
          "/data/aes-encrypt-password", // Pastikan endpoint ini ada di Python
          "POST",
          {
            password: user_password,
            salt_for_kdf: salt_argon_hex, // Kirim salt Argon2id (hex) untuk digunakan Python dalam KDF AES
            iv_b64: iv_aes_b64,
          }
        );
      const { encrypted_password: cipherdata_b64 } = aesResult; // cipherdata sudah base64 dari Python
      console.log(
        `[AuthController] Registering ${username}: Password AES encrypted.`
      );

      // Langkah 6 (Alur Anda): Minta Python untuk menghasilkan Combined Hash (HMAC)
      console.log(
        `[AuthController] Registering ${username}: Generating HMAC...`
      );
      const hmacResult =
        await PythonService.callPythonApi<PythonGenerateHmacResponse>(
          "/integrity/generate-hmac", // Pastikan endpoint ini ada di Python
          "POST",
          {
            data_to_hmac_b64: cipherdata_b64, // cipherdata (base64) dari AES
            hmac_key_material: hashed_password, // $hashed_password (output Argon2id) sebagai kunci HMAC
          }
        );
      const { combined_hash_hex } = hmacResult; // combined_hash (hex) dari Python
      console.log(`[AuthController] Registering ${username}: HMAC generated.`);

      // Langkah 7 (Alur Anda): Encode Combined Hash ke Base64 (jika diterima sebagai hex)
      const encoded_combined_hmac_b64 = Buffer.from(
        combined_hash_hex,
        "hex"
      ).toString("base64");

      // Persiapkan data untuk disimpan
      const complexPasswordData: ComplexPasswordData = {
        argon2id_hash: hashed_password,
        encoded_combined_hmac: encoded_combined_hmac_b64,
        aes_cipherdata_b64: cipherdata_b64,
        argon_salt_b64: Buffer.from(salt_argon_hex, "hex").toString("base64"), // Simpan salt Argon2id sebagai base64
        aes_iv_b64: iv_aes_b64,
      };

      // Langkah 8 (Alur Anda): Simpan ke Database melalui AuthService Node.js
      console.log(
        `[AuthController] Registering ${username}: Saving to database...`
      );
      const newUser = await AuthService.registerComplex(
        username,
        complexPasswordData
      );
      console.log(
        `[AuthController] Registering ${username}: User saved with ID ${newUser.id}.`
      );

      return c.json({
        message: "User registered successfully using complex password storage.",
        userId: newUser.id,
      });
    } catch (error: any) {
      console.error(
        `[AuthController] Registration failed for ${username}:`,
        error
      );
      if (error instanceof AppError) {
        // AppError dari PythonService atau AuthService
        return c.json({ error: error.message }, 500);
      }
      // Error tidak terduga lainnya
      return c.json(
        { error: "An unexpected error occurred during registration." },
        500
      );
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
