import { AppError } from "../exceptions/AppError.js";
import { env } from "../config/env.js";

interface ErrorResponse {
  detail: string;
}

export class PythonService {
  static async makeRequest(endpoint: string, method: string, body?: any) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (env.PYTHON_SECRET_KEY) {
        headers["X-API-Key"] = env.PYTHON_SECRET_KEY;
      }

      const response = await fetch(`${env.PYTHON_API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({ detail: "Unknown error" }))) as ErrorResponse;
        throw new AppError(
          response.status,
          errorData.detail || "Python service error"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, "Failed to communicate with Python service");
    }
  }

  static async encryptData(data: string, key: string) {
    return this.makeRequest("/data/encrypt", "POST", { data, key });
  }

  static async decryptData(
    encrypted: string,
    iv: string,
    tag: string,
    key: string
  ) {
    return this.makeRequest("/data/decrypt", "POST", {
      encrypted,
      iv,
      tag,
      key,
    });
  }

  static async checkIntegrity(data: string, signature: string) {
    return this.makeRequest("/integrity/verify", "POST", { data, signature });
  }

  static async generateSignature(data: string, key: string) {
    return this.makeRequest("/integrity/sign", "POST", { data, key });
  }

  static async getArgon2idHash(password: string) {
    // Gunakan tipe yang sesuai
    return this.makeRequest("/auth/argon2id-hash", "POST", {
      password,
    });
  }

  static async aesEncryptPassword(payload: {
    password: string;
    salt_for_kdf: string;
    iv_b64: string;
  }) {
    return this.makeRequest("/data/aes-encrypt-password", "POST", payload);
  }

  static async generateHmac(payload: {
    data_to_hmac_b64: string;
    hmac_key_material: string;
  }) {
    return this.makeRequest("/integrity/generate-hmac", "POST", payload);
  }
}
