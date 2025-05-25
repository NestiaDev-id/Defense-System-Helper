import { ComplexPasswordData, User } from "../models/User.js";
import { UserRepository } from "../repositories/UserRepository.js";
import {
  AuthenticationError,
  ValidationError,
} from "../exceptions/AppError.js";
import { SecurityUtils } from "../utils/SecurityUtils.js";
import { SecurityService } from "./security.service.js";

export class AuthService {
  static async register(
    username: string,
    hashedPasswordFromPython: string
  ): Promise<User> {
    // Terima hashedPassword
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      throw new ValidationError("Username already exists");
    }

    return UserRepository.create({
      username,
      password: hashedPasswordFromPython, // Simpan hash yang sudah dibuat Python
    });
  }

  static async login(username: string, password: string): Promise<string> {
    const user = await UserRepository.findByUsername(username);
    if (!user) {
      throw new AuthenticationError("Invalid credentials"); // Ganti dengan AuthenticationError jika ada
    }

    // Verifikasi password bisa tetap memanggil Python jika Anda mau
    // atau lakukan di Node.js jika library bcrypt/argon2 ada di Node.js
    const isValid = await SecurityService.verifyPassword(
      password,
      user.password
    ); // SecurityService.ts
    if (!isValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    const token = await SecurityUtils.generateJWT({
      userId: user.id!,
      username: user.username,
    }); // SecurityUtils.ts

    // await UserRepository.createSession({
    //   userId: user.id!,
    //   token,
    //   expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    // });
    return token;
  }

  static async validateToken(token: string): Promise<User> {
    const session = await UserRepository.findSessionByToken(token);
    if (!session || session.expiresAt < new Date()) {
      throw new AuthenticationError("Invalid or expired token");
    }

    const user = await UserRepository.findByUsername(session.userId);
    if (!user) {
      throw new AuthenticationError("User not found");
    }

    return user;
  }

  static async registerComplex(
    username: string,
    passwordData: ComplexPasswordData // Menerima objek dengan semua data terenkripsi/hash
  ): Promise<User> {
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      throw new ValidationError("Username already exists");
    }

    // Panggil metode UserRepository yang sesuai
    return UserRepository.createComplexUser(username, passwordData);
  }
}
