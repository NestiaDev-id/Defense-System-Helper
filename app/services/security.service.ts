import { Buffer } from "buffer";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import jwt from "jsonwebtoken";

export class SecurityService {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly JWT_EXPIRY = "1h";

  static async generateJWT(
    payload: any,
    secret: string = this.JWT_SECRET
  ): Promise<string> {
    return jwt.sign(payload, secret, { expiresIn: this.JWT_EXPIRY });
  }

  static async verifyJWT(
    token: string,
    secret: string = this.JWT_SECRET
  ): Promise<any> {
    return jwt.verify(token, secret);
  }

  static async encryptData(
    data: string,
    key: Buffer
  ): Promise<{ encrypted: string; iv: string; tag: string }> {
    const iv = randomBytes(12);
    const cipher = createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: cipher.getAuthTag().toString("hex"),
    };
  }

  static async decryptData(
    encrypted: string,
    iv: string,
    tag: string,
    key: Buffer
  ): Promise<string> {
    const decipher = createDecipheriv(
      this.ALGORITHM,
      key,
      Buffer.from(iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(tag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  static async hashPassword(password: string, options = {}): Promise<string> {
    const response = await fetch("http://localhost:8000/auth/hash-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...options }),
    });
    const data = (await response.json()) as { hash: string };
    return data.hash;
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    const response = await fetch("http://localhost:8000/auth/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, hash }),
    });
    const data = (await response.json()) as { valid: boolean };
    return data.valid;
  }
}
