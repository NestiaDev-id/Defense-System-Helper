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
  PythonHashPasswordResponse,
  PythonLoginSuccessResponse,
} from "../interfaces/auth.interface.js";
import { env } from "../../config/env.js";
import { AuthService } from "../../services/AuthService.js";
import { validatePassword, validateUsername } from "../../utils/validators.js";

type ApiResponse = Record<string, unknown>;

export class AuthController {
  static async register(c: Context) {
    const { username, password }: RegisterRequest = await c.req.json(); // 1. Dapat request

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
      // 3. Minta tolong Python buatkan "kunci" (hash password)
      const hashResponse = await fetch(
        `${env.PYTHON_API_URL}/auth/hash-password`,
        {
          // Panggil endpoint hashing Python
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": env.PYTHON_SECRET_KEY,
          },
          body: JSON.stringify({ password }), // Kirim password asli untuk di-hash Python
        }
      );

      const hashResponseBody = await hashResponse.json();

      if (!hashResponse.ok) {
        const errorDetail =
          (hashResponseBody as PythonErrorResponse)?.detail ||
          "Python password hashing failed";
        console.error("Python password hashing error:", errorDetail);
        return c.json({
          error:
            typeof errorDetail === "string"
              ? errorDetail
              : JSON.stringify(errorDetail),
        });
      }

      const { hash: hashedPassword } =
        hashResponseBody as PythonHashPasswordResponse; // 4. Terima "kunci" (hashedPassword) dari Python

      if (!hashedPassword) {
        return c.json(
          { error: "Failed to get hashed password from Python service" },
          500
        );
      }

      // 5. Jika semua kunci sudah siap (username & hashedPassword), simpan ke database
      // Ini menggunakan AuthService dari Node.js Anda, yang akan berinteraksi dengan UserRepository.ts,
      // dan UserRepository.ts idealnya akan menyimpan ke database persisten (Supabase, MongoDB, dll.)
      // bukan lagi Map di memori.
      const newUser = await AuthService.register(username, hashedPassword); // AuthService.ts Node.js Anda
      // perlu dimodifikasi agar menerima hashedPassword
      // dan tidak melakukan hashing lagi.

      return c.json({
        message: "User registered successfully",
        userId: newUser.id,
      });
    } catch (error: any) {
      console.error("Registration process error:", error);
      // Tangani error spesifik dari AuthService.register (misalnya, username sudah ada)
      if (error.message && error.message.includes("Username already exists")) {
        return c.json({ error: error.message }, 409); // 409 Conflict
      }
      return c.json({ error: error.message || "Registration failed" }, 500);
    }
  }

  static async login(c: Context) {
    const { username, password }: LoginRequest = await c.req.json();

    // 1. Validasi Input dari Klien (Username & Password)
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return c.json({ error: usernameValidation.message }, 400);
    }
    if (!password) {
      // Validasi password sederhana untuk login (hanya cek keberadaan)
      return c.json({ error: "Password is required" }, 400);
    }

    try {
      const pythonLoginResponse = await fetch(
        `${env.PYTHON_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": env.PYTHON_SECRET_KEY,
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const responseBody = await pythonLoginResponse.json();

      if (!pythonLoginResponse.ok) {
        const errorDetail =
          (responseBody as PythonErrorResponse)?.detail ||
          "Invalid credentials from Python";
        console.error("Python login error:", errorDetail);
        return c.json(
          {
            error:
              typeof errorDetail === "string"
                ? errorDetail
                : JSON.stringify(errorDetail),
          },
          401
        );
      }

      // Dapatkan username dari respons Python jika login Python berhasil
      const pythonData = responseBody as PythonLoginSuccessResponse;

      // Hono generate tokennya sendiri
      const token = await SecurityService.generateJWT({
        username: pythonData.username || username,
      });
      return c.json<TokenResponse>({ token });
    } catch (error: any) {
      console.error("Login fetch/parse error:", error);
      return c.json(
        { error: error.message || "Login failed due to an unexpected error" },
        500
      );
    }
  }

  static async hashPassword(c: Context) {
    const {
      password,
      timeCost = 3,
      memoryCost = 65536,
      parallelism = 1,
    }: HashPasswordRequest = await c.req.json();

    if (!password || typeof password !== "string") {
      return c.json(
        { error: "Password is required and must be a string" },
        400
      );
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
}
