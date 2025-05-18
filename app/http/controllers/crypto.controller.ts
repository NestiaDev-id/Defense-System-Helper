import { Context } from "hono";
import { Buffer } from "buffer";
import { SecurityService } from "../../services/security.service";
import {
  KeyPair,
  EncryptResponse,
  DecryptResponse,
  SignResponse,
  VerifySignResponse,
  IntegrityCheckResponse,
  DecryptRequest
} from "../interfaces/crypto.interface";
import { PythonService } from '../../services/PythonService';
import { AppError } from '../../exceptions/AppError';

type ErrorResponse = {
  error: string;
};

// Type guard helpers
function isKeyPair(obj: unknown): obj is KeyPair {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "publicKey" in obj &&
    "privateKey" in obj &&
    typeof (obj as KeyPair).publicKey === "string" &&
    typeof (obj as KeyPair).privateKey === "string"
  );
}

export class CryptoController {
  static async generateKemKeyPair(c: Context) {
    try {
      const response = await fetch("http://localhost:8000/crypto/key/kem", {
        method: "POST",
      });
      if (!response.ok) {
        return c.json<ErrorResponse>({ error: "Failed to generate KEM key pair" }, 500);
      }

      const data = await response.json();
      if (!isKeyPair(data)) {
        return c.json<ErrorResponse>({ error: "Invalid KEM key pair format" }, 500);
      }

      return c.json<KeyPair>(data);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
    }
  }

  static async generateSignKeyPair(c: Context) {
    try {
      const response = await fetch("http://localhost:8000/crypto/key/sign", {
        method: "POST",
      });
      if (!response.ok) {
        return c.json<ErrorResponse>({ error: "Failed to generate signing key pair" }, 500);
      }

      const data = await response.json();
      if (!isKeyPair(data)) {
        return c.json<ErrorResponse>({ error: "Invalid signing key pair format" }, 500);
      }

      return c.json<KeyPair>(data);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
    }
  }

  static async verifySign(c: Context) {
    try {
      const { data, signature } = await c.req.json<{ data: string; signature: string }>();
      const result = await PythonService.checkIntegrity(data, signature);
      return c.json<VerifySignResponse>(result);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Signature verification failed" }, 500);
    }
  }

  static async encrypt(c: Context) {
    try {
      const { data, key } = await c.req.json<{ data: string; key: string }>();
      const result = await PythonService.encryptData(data, key);
      return c.json<EncryptResponse>(result);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Encryption failed" }, 500);
    }
  }

  static async decrypt(c: Context) {
    try {
      const { encrypted, iv, tag, privateKey } = await c.req.json<DecryptRequest>();
      if (!privateKey) {
        return c.json<ErrorResponse>({ error: "Private key is required" }, 400);
      }
      const result = await PythonService.decryptData(encrypted, iv, tag, privateKey);
      return c.json<DecryptResponse>(result);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Decryption failed" }, 500);
    }
  }

  static async hybridEncrypt(c: Context) {
    try {
      const body = await c.req.json<{ data: string }>();
      if (typeof body.data !== "string") {
        return c.json<ErrorResponse>({ error: "Invalid hybrid encryption request body" }, 400);
      }

      const response = await fetch("http://localhost:8000/data/hybrid/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        return c.json<ErrorResponse>({ error: "Hybrid encryption failed" }, 500);
      }

      const data = await response.json() as EncryptResponse;
      return c.json<EncryptResponse>(data);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Hybrid encryption failed" }, 500);
    }
  }

  static async hybridDecrypt(c: Context) {
    try {
      const body = await c.req.json<{
        encrypted: string;
        encapsulatedKey: string;
        privateKey: string;
      }>();

      if (!body.encrypted || !body.encapsulatedKey || !body.privateKey) {
        return c.json<ErrorResponse>({ error: "Invalid hybrid decryption request body" }, 400);
      }

      const response = await fetch("http://localhost:8000/data/hybrid/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return c.json<ErrorResponse>({ error: "Hybrid decryption failed" }, 500);
      }

      const data = await response.json() as DecryptResponse;
      return c.json<DecryptResponse>(data);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Hybrid decryption failed" }, 500);
    }
  }

  static async sign(c: Context) {
    try {
      const { data, key } = await c.req.json<{ data: string; key: string }>();
      const result = await PythonService.generateSignature(data, key);
      return c.json<SignResponse>(result);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Signature generation failed" }, 500);
    }
  }

  static async verifySignature(c: Context) {
    try {
      const { data, signature } = await c.req.json<{ data: string; signature: string }>();
      const result = await PythonService.checkIntegrity(data, signature);
      return c.json<VerifySignResponse>(result);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Signature verification failed" }, 500);
    }
  }

  static async checkIntegrity(c: Context) {
    try {
      const body = await c.req.json<{ original: string; hmac: string }>();
      if (!body.original || !body.hmac) {
        return c.json<ErrorResponse>({ error: "Invalid integrity check request body" }, 400);
      }

      const response = await fetch("http://localhost:8000/data/integrity/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return c.json<ErrorResponse>({ error: "Integrity check failed" }, 500);
      }

      const data = await response.json() as IntegrityCheckResponse;
      return c.json<IntegrityCheckResponse>(data);
    } catch (error) {
      return c.json<ErrorResponse>({ error: error instanceof Error ? error.message : "Integrity check failed" }, 500);
    }
  }
}
