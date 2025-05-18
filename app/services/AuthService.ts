import { User, UserSession } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { AuthenticationError, ValidationError } from '../exceptions/AppError';
import { SecurityUtils } from '../utils/SecurityUtils';

export class AuthService {
  static async register(username: string, password: string): Promise<User> {
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      throw new ValidationError('Username already exists');
    }

    const hashedPassword = await SecurityUtils.hashPassword(password);
    return UserRepository.create({
      username,
      password: hashedPassword,
    });
  }

  static async login(username: string, password: string): Promise<string> {
    const user = await UserRepository.findByUsername(username);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isValid = await SecurityUtils.verifyPassword(password, user.password);
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    const token = await SecurityUtils.generateJWT({ userId: user.id! });
    await UserRepository.createSession({
      userId: user.id!,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    return token;
  }

  static async validateToken(token: string): Promise<User> {
    const session = await UserRepository.findSessionByToken(token);
    if (!session || session.expiresAt < new Date()) {
      throw new AuthenticationError('Invalid or expired token');
    }

    const user = await UserRepository.findByUsername(session.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return user;
  }
} 