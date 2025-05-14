import { Context } from "hono";
import { Buffer } from "buffer";
import { SecurityService } from "../../services/security.service";
import {
  KeyPair,
  EncryptRequest,
  EncryptResponse,
  DecryptRequest,
  DecryptResponse,
  SignRequest,
  SignResponse,
  VerifySignRequest,
  VerifySignResponse,
  IntegrityCheckRequest,
  IntegrityCheckResponse,
} from "../interfaces/crypto.interface";

export class CryptoController {
  static async generateKemKeyPair(c: Context) {
    const response = await fetch("http://localhost:8000/crypto/key/kem", {
      method: "POST",
    });
    return c.json<KeyPair>(await response.json());
  }

  static async generateSignKeyPair(c: Context) {
    const response = await fetch("http://localhost:8000/crypto/key/sign", {
      method: "POST",
    });
    return c.json<KeyPair>(await response.json());
  }

  static async encrypt(c: Context) {
    const { data }: EncryptRequest = await c.req.json();
    const key = Buffer.from("your-encryption-key", "hex");
    const result = await SecurityService.encryptData(data, key);
    return c.json<EncryptResponse>(result);
  }

  static async decrypt(c: Context) {
    const { encrypted, iv, tag }: DecryptRequest = await c.req.json();
    const key = Buffer.from("your-encryption-key", "hex");
    const decrypted = await SecurityService.decryptData(
      encrypted,
      iv,
      tag,
      key
    );
    return c.json<DecryptResponse>({ decrypted });
  }

  static async hybridEncrypt(c: Context) {
    const { data, publicKey }: EncryptRequest = await c.req.json();
    const response = await fetch("http://localhost:8000/data/hybrid/encrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, publicKey }),
    });
    return c.json<EncryptResponse>(await response.json());
  }

  static async hybridDecrypt(c: Context) {
    const { encrypted, encapsulatedKey, privateKey }: DecryptRequest =
      await c.req.json();
    const response = await fetch("http://localhost:8000/data/hybrid/decrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encrypted, encapsulatedKey, privateKey }),
    });
    return c.json<DecryptResponse>(await response.json());
  }

  static async sign(c: Context) {
    const { message, privateKey }: SignRequest = await c.req.json();
    const response = await fetch("http://localhost:8000/data/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, privateKey }),
    });
    return c.json<SignResponse>(await response.json());
  }

  static async verifySign(c: Context) {
    const { message, signature, publicKey }: VerifySignRequest =
      await c.req.json();
    const response = await fetch("http://localhost:8000/data/verify-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature, publicKey }),
    });
    return c.json<VerifySignResponse>(await response.json());
  }

  static async checkIntegrity(c: Context) {
    const { original, hmac }: IntegrityCheckRequest = await c.req.json();
    const response = await fetch("http://localhost:8000/data/integrity/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ original, hmac }),
    });
    return c.json<IntegrityCheckResponse>(await response.json());
  }
}
