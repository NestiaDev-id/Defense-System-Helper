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
} from "../interfaces/auth.interface.js";

type ApiResponse = Record<string, unknown>;

export class AuthController {
  static async register(c: Context) {
    const { username, password }: RegisterRequest = await c.req.json();
    const hashedPassword = await SecurityService.hashPassword(password);

    // Forward to Python service for storage
    const response = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: hashedPassword }),
    });

    const data = (await response.json()) as ApiResponse;
    return c.json(data);
  }

  static async login(c: Context) {
    const { username, password }: LoginRequest = await c.req.json();

    // Forward to Python service for verification
    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const token = await SecurityService.generateJWT({ username });
      return c.json<TokenResponse>({ token });
    }

    return c.json({ error: "Invalid credentials" }, 401);
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
    const response = await fetch("http://localhost:8000/auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = (await response.json()) as ApiResponse;
    return c.json(data);
  }
}
