from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import secrets
import hmac
import hashlib
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import bcrypt
import jwt
from datetime import datetime, timedelta

# Import services
from python.app.services.auth_service import AuthService
from python.app.services.crypto_service import CryptoService
from python.app.services.integrity_service import IntegrityService

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Defense System Helper - Python Backend",
    description="Quantum-Safe Security Implementation",
    version="1.0.0"
)

# Security configuration
API_KEY = os.getenv("API_KEY", secrets.token_urlsafe(32))
API_KEY_NAME = os.getenv("API_KEY_HEADER", "X-API-Key")
JWT_SECRET = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
auth_service = AuthService()
crypto_service = CryptoService()
integrity_service = IntegrityService()

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Could not validate API key"
        )
    return api_key_header

# Models
class User(BaseModel):
    username: str
    password: str

class HashPasswordRequest(BaseModel):
    password: str

class HashPasswordResponse(BaseModel):
    hash: str

class VerifyPasswordRequest(BaseModel):
    password: str
    hash: str

class VerifyPasswordResponse(BaseModel):
    valid: bool

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    access_token: str

class EncryptRequest(BaseModel):
    data: str
    key: str

class EncryptResponse(BaseModel):
    encrypted: str
    iv: str
    tag: str

class DecryptRequest(BaseModel):
    encrypted: str
    iv: str
    tag: str
    key: str

class DecryptResponse(BaseModel):
    decrypted: str

class SignRequest(BaseModel):
    data: str
    key: str

class SignResponse(BaseModel):
    signature: str

class VerifyRequest(BaseModel):
    data: str
    signature: str
    key: str

class VerifyResponse(BaseModel):
    valid: bool

class KeyPairResponse(BaseModel):
    publicKey: str
    privateKey: str

# Security Utils
def derive_key(key: str, salt: bytes = None) -> tuple[bytes, bytes]:
    if salt is None:
        salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    derived_key = kdf.derive(key.encode())
    return derived_key, salt

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

# Auth Routes
@app.post("/auth/register")
async def register(user: User):
    try:
        return await auth_service.register(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login", response_model=LoginResponse)
async def login(user: User):
    try:
        return await auth_service.login(user)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/auth/hash-password", response_model=HashPasswordResponse)
async def hash_password(request: HashPasswordRequest):
    hashed = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt())
    return {"hash": hashed.decode()}

@app.post("/auth/verify-password", response_model=VerifyPasswordResponse)
async def verify_password(request: VerifyPasswordRequest):
    try:
        valid = bcrypt.checkpw(
            request.password.encode(),
            request.hash.encode()
        )
        return {"valid": valid}
    except Exception as e:
        return {"valid": False}

@app.post("/auth/refresh-token", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    try:
        payload = jwt.decode(request.refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if not payload.get("refresh"):
            raise HTTPException(status_code=400, detail="Invalid refresh token")
        
        access_token = create_access_token(
            data={"sub": payload["sub"]},
            expires_delta=timedelta(minutes=30)
        )
        return {"access_token": access_token}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# Crypto Routes
@app.post("/crypto/key/kem", response_model=KeyPairResponse)
async def generate_kem_key_pair():
    try:
        return await crypto_service.generate_kem_key_pair()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/crypto/key/sign", response_model=KeyPairResponse)
async def generate_sign_key_pair():
    try:
        return await crypto_service.generate_sign_key_pair()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/encrypt", response_model=EncryptResponse)
async def encrypt_data(request: EncryptRequest, api_key: str = Depends(get_api_key)):
    try:
        return await crypto_service.encrypt_data(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/decrypt", response_model=DecryptResponse)
async def decrypt_data(request: DecryptRequest, api_key: str = Depends(get_api_key)):
    try:
        return await crypto_service.decrypt_data(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/hybrid/encrypt", response_model=EncryptResponse)
async def hybrid_encrypt(request: EncryptRequest):
    try:
        return await crypto_service.hybrid_encrypt(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/hybrid/decrypt", response_model=DecryptResponse)
async def hybrid_decrypt(request: DecryptRequest):
    try:
        return await crypto_service.hybrid_decrypt(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/sign", response_model=SignResponse)
async def sign_data(request: SignRequest):
    try:
        return await integrity_service.create_signature(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/verify-sign", response_model=VerifyResponse)
async def verify_sign(request: VerifyRequest):
    try:
        return await integrity_service.verify_signature(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/integrity/check", response_model=VerifyResponse)
async def check_integrity(request: VerifyRequest):
    try:
        return await integrity_service.verify_signature(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Documentation Routes
# @app.get("/")
# async def root():
#     return {"message": "Defense System Helper Python Service is running"}

@app.get("/")
async def root():
    print("Python root endpoint was hit!") # Tambahkan log ini
    print(f"CORS_ORIGIN env var: {os.getenv('CORS_ORIGIN')}") # Contoh cek env var
    return {"message": "Defense System Helper Python Service is running"}

@app.get("/docs")
async def get_docs():
    return {"message": "API documentation"}

@app.get("/openapi.json")
async def get_openapi():
    return app.openapi()

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(
#         "main:app",
#         host="0.0.0.0",
#         port=8000,
#         reload=True if os.getenv("DEBUG", "False").lower() == "true" else False
#     ) 