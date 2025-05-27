import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "your-secret-key";

export class SecurityUtils {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async generateJWT(payload: object): Promise<string> {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "30m",
      algorithm: "HS512",
    });
  }

  static async verifyJWT(token: string): Promise<any> {
    try {
      return jwt.verify(token, JWT_SECRET, { algorithms: ["HS512"] });
    } catch (error) {
      return null;
    }
  }

  static generateRandomBytes(length: number): string {
    return crypto.randomBytes(length).toString("hex");
  }
}
