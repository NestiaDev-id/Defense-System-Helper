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
} from "../interfaces/crypto.interface";

// Type guard helpers
function isKeyPair(obj: unknown): obj is KeyPair {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "publicKey" in obj &&
    "privateKey" in obj &&
    typeof (obj as any).publicKey === "string" &&
    typeof (obj as any).privateKey === "string"
  );
}

export class CryptoController {
  static async generateKemKeyPair(c: Context) {
    const response = await fetch("http://localhost:8000/crypto/key/kem", {
      method: "POST",
    });
    if (!response.ok)
      return c.json({ error: "Failed to generate KEM key pair" }, 500);

    const data = await response.json();
    return isKeyPair(data)
      ? c.json<KeyPair>(data)
      : c.json({ error: "Invalid KEM key pair format" }, 500);
  }

  static async generateSignKeyPair(c: Context) {
    const response = await fetch("http://localhost:8000/crypto/key/sign", {
      method: "POST",
    });
    if (!response.ok)
      return c.json({ error: "Failed to generate signing key pair" }, 500);

    const data = await response.json();
    return isKeyPair(data)
      ? c.json<KeyPair>(data)
      : c.json({ error: "Invalid signing key pair format" }, 500);
  }

  static async encrypt(c: Context) {
    const body = await c.req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof body.data !== "string"
    ) {
      return c.json({ error: "Invalid encryption request body" }, 400);
    }

    const key = Buffer.from(
      process.env.ENCRYPTION_KEY || "your-encryption-key",
      "hex"
    );
    const result = await SecurityService.encryptData(body.data, key);
    return c.json<EncryptResponse>(result);
  }

  static async decrypt(c: Context) {
    const body = await c.req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof body.encrypted !== "string" ||
      typeof body.iv !== "string" ||
      typeof body.tag !== "string"
    ) {
      return c.json({ error: "Invalid decryption request body" }, 400);
    }

    const key = Buffer.from(
      process.env.ENCRYPTION_KEY || "your-encryption-key",
      "hex"
    );
    const decrypted = await SecurityService.decryptData(
      body.encrypted,
      body.iv,
      body.tag,
      key
    );
    return c.json<DecryptResponse>({ decrypted });
  }

  static async hybridEncrypt(c: Context) {
    const body = await c.req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof body.data !== "string"
    ) {
      return c.json({ error: "Invalid hybrid encryption request body" }, 400);
    }

    const response = await fetch("http://localhost:8000/data/hybrid/encrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) return c.json({ error: "Hybrid encryption failed" }, 500);
    const data = (await response.json()) as EncryptResponse;
    return c.json<EncryptResponse>(data);
  }

  static async hybridDecrypt(c: Context) {
    const body = await c.req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof body.encrypted !== "string" ||
      typeof body.encapsulatedKey !== "string" ||
      typeof body.privateKey !== "string"
    ) {
      return c.json({ error: "Invalid hybrid decryption request body" }, 400);
    }

    const response = await fetch("http://localhost:8000/data/hybrid/decrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) return c.json({ error: "Hybrid decryption failed" }, 500);
    const data = (await response.json()) as DecryptResponse;
    return c.json<DecryptResponse>(data);
  }

  static async sign(c: Context) {
    const body = await c.req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof body.message !== "string" ||
      typeof body.privateKey !== "string"
    ) {
      return c.json({ error: "Invalid sign request body" }, 400);
    }

    const response = await fetch("http://localhost:8000/data/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) return c.json({ error: "Signing failed" }, 500);
    const data = (await response.json()) as SignResponse;
    return c.json<SignResponse>(data);
  }

  static async verifySign(c: Context) {
    const body = await c.req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof body.message !== "string" ||
      typeof body.signature !== "string" ||
      typeof body.publicKey !== "string"
    ) {
      return c.json({ error: "Invalid verify-sign request body" }, 400);
    }

    const response = await fetch("http://localhost:8000/data/verify-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok)
      return c.json({ error: "Signature verification failed" }, 500);
    const data = (await response.json()) as VerifySignResponse;
    return c.json<VerifySignResponse>(data);
  }

  static async checkIntegrity(c: Context) {
    const body = await c.req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof body.original !== "string" ||
      typeof body.hmac !== "string"
    ) {
      return c.json({ error: "Invalid integrity check request body" }, 400);
    }

    const response = await fetch("http://localhost:8000/data/integrity/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) return c.json({ error: "Integrity check failed" }, 500);
    const data = (await response.json()) as IntegrityCheckResponse;
    return c.json<IntegrityCheckResponse>(data);
  }
}
