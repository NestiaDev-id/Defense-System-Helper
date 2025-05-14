from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import hmac
import hashlib
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os
import numpy as np
from cryptography.fernet import Fernet

app = FastAPI(
    title="Defense System Helper - Python Backend",
    description="Quantum-Safe Security Implementation",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Models
class User(BaseModel):
    username: str
    password: str

class EncryptRequest(BaseModel):
    data: str
    key: str

class DecryptRequest(BaseModel):
    encrypted: str
    iv: str
    tag: str
    key: str

class SignatureRequest(BaseModel):
    data: str
    key: str

# Security Utils
def generate_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA512(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return kdf.derive(password.encode())

def aes_gcm_encrypt(data: str, key: bytes) -> dict:
    aesgcm = AESGCM(key)
    iv = os.urandom(12)
    encrypted = aesgcm.encrypt(iv, data.encode(), None)
    return {
        "encrypted": base64.b64encode(encrypted[:-16]).decode(),
        "tag": base64.b64encode(encrypted[-16:]).decode(),
        "iv": base64.b64encode(iv).decode()
    }

def aes_gcm_decrypt(encrypted: str, iv: str, tag: str, key: bytes) -> str:
    aesgcm = AESGCM(key)
    encrypted_bytes = base64.b64decode(encrypted)
    iv_bytes = base64.b64decode(iv)
    tag_bytes = base64.b64decode(tag)
    decrypted = aesgcm.decrypt(iv_bytes, encrypted_bytes + tag_bytes, None)
    return decrypted.decode()

# Routes
@app.post("/auth/register")
async def register(user: User):
    # In a real implementation, store user data securely
    return {"message": "User registered successfully"}

@app.post("/auth/login")
async def login(user: User):
    # In a real implementation, verify credentials
    return {"message": "Login successful"}

@app.post("/data/encrypt")
async def encrypt_data(request: EncryptRequest):
    try:
        key = generate_key(request.key, b"salt")  # In production, use a secure salt
        result = aes_gcm_encrypt(request.data, key)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/data/decrypt")
async def decrypt_data(request: DecryptRequest):
    try:
        key = generate_key(request.key, b"salt")  # Use the same salt as encryption
        decrypted = aes_gcm_decrypt(
            request.encrypted,
            request.iv,
            request.tag,
            key
        )
        return {"decrypted": decrypted}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/integrity/sign")
async def create_signature(request: SignatureRequest):
    signature = hmac.new(
        request.key.encode(),
        request.data.encode(),
        hashlib.sha512
    ).hexdigest()
    return {"signature": signature}

@app.post("/integrity/verify")
async def verify_signature(
    data: str,
    signature: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    expected = hmac.new(
        b"your-hmac-key",  # In production, use a secure key
        data.encode(),
        hashlib.sha512
    ).hexdigest()
    return {"valid": hmac.compare_digest(signature, expected)}

@app.get("/")
async def root():
    return {"message": "Defense System Helper Python Service is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 