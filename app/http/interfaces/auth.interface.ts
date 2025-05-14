export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {}

export interface TokenResponse {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface HashPasswordRequest {
  password: string;
  timeCost?: number;
  memoryCost?: number;
  parallelism?: number;
}

export interface VerifyPasswordRequest {
  password: string;
  hash: string;
}

export interface VerifyPasswordResponse {
  valid: boolean;
}
