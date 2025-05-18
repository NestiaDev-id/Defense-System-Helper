import { User, UserSession } from '../models/User';

export class UserRepository {
  private static users: Map<string, User> = new Map();
  private static sessions: Map<string, UserSession> = new Map();

  static async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  static async create(user: User): Promise<User> {
    const id = Math.random().toString(36).substring(7);
    const newUser = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  static async createSession(session: UserSession): Promise<void> {
    this.sessions.set(session.token, session);
  }

  static async findSessionByToken(token: string): Promise<UserSession | null> {
    return this.sessions.get(token) || null;
  }
} 