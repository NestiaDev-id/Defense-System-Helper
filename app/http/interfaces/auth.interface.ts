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

// Python responses
export interface PythonRegisterSuccessResponse {
  message: string;
}

// Definisikan tipe respons yang diharapkan dari Python untuk setiap endpoint
export interface PythonMessageResponse {
  // Umumnya untuk register, dll.
  message: string;
  [key: string]: any;
}

export interface PythonErrorResponse {
  detail: string | { msg: string; type: string }[] | any;
}

export interface PythonLoginSuccessResponse {
  message: string;
  username: string;
}

export interface PythonHashPasswordResponse {
  hash: string;
}

export interface PythonVerifyPasswordResponse {
  valid: boolean;
}

export interface PythonRefreshTokenSuccessResponse {
  access_token: string;
}
