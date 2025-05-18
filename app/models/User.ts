export interface User {
  id?: string;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSession {
  userId: string;
  token: string;
  expiresAt: Date;
} 