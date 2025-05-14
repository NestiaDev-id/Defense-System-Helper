import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

export class SecurityUtils {
  static async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString("hex");
      crypto.pbkdf2(password, salt, 1000, 64, "sha512", (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ":" + derivedKey.toString("hex"));
      });
    });
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(":");
      crypto.pbkdf2(password, salt, 1000, 64, "sha512", (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString("hex"));
      });
    });
  }

  static async generateJWT(payload: any, secret: string): Promise<string> {
    return jwt.sign(payload, secret, { expiresIn: "1h" });
  }

  static async verifyJWT(token: string, secret: string): Promise<any> {
    return jwt.verify(token, secret);
  }
}
