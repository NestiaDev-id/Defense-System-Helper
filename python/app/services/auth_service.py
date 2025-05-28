import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from ..models.schemas import (
    User,
    LoginResponse,
    HashPasswordRequest,
    HashPasswordResponse,
    VerifyPasswordRequest,
    VerifyPasswordResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    MessageResponse,
)


class AuthService:
    def __init__(self):
        # In production, use a proper database
        self.users = {}
        self.secret_key = os.environ.get("JWT_SECRET_KEY", os.urandom(32).hex())
        self.algorithm = "HS512"

    async def register(self, user: User) -> MessageResponse:
        if user.username in self.users:
            raise ValueError("Username already exists")

        # Hash the password before storing
        hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())
        self.users[user.username] = hashed
        return MessageResponse(message="User registered successfully")

    async def login(self, user: User) -> LoginResponse:
        stored_hash = self.users.get(user.username)

        if not stored_hash or not bcrypt.checkpw(user.password.encode(), stored_hash):
            raise ValueError("Invalid credentials")

        # Generate tokens
        access_token = self.create_access_token(
            data={"sub": user.username}, expires_delta=timedelta(minutes=15)
        )
        refresh_token = self.create_access_token(
            data={"sub": user.username, "refresh": True},
            expires_delta=timedelta(days=7),
        )
        return LoginResponse(access_token=access_token, refresh_token=refresh_token)

    async def hash_password(self, request: HashPasswordRequest) -> HashPasswordResponse:
        hashed = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt())
        return HashPasswordResponse(hash=hashed.decode())

    async def verify_password(
        self, request: VerifyPasswordRequest
    ) -> VerifyPasswordResponse:
        try:
            valid = bcrypt.checkpw(request.password.encode(), request.hash.encode())
            return VerifyPasswordResponse(valid=valid)
        except Exception:
            return VerifyPasswordResponse(valid=False)

    async def refresh_token(self, request: RefreshTokenRequest) -> RefreshTokenResponse:
        try:
            payload = jwt.decode(
                request.refresh_token, self.secret_key, algorithms=[self.algorithm]
            )
            if not payload.get("refresh"):
                raise ValueError("Invalid refresh token")

            access_token = self.create_access_token(
                data={"sub": payload["sub"]}, expires_delta=timedelta(minutes=30)
            )
            return RefreshTokenResponse(access_token=access_token)
        except jwt.ExpiredSignatureError:
            raise ValueError("Refresh token expired")
        except jwt.JWTError:
            raise ValueError("Invalid refresh token")

    def create_access_token(self, data: dict, expires_delta: timedelta = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
