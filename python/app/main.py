from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware

from .models.schemas import (
    User, 
    EncryptRequest, 
    DecryptRequest, 
    SignatureRequest,
    VerifyRequest
)
from .services.auth_service import AuthService
from .services.crypto_service import CryptoService
from .services.integrity_service import IntegrityService

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

# Security
security = HTTPBearer()

# Services
auth_service = AuthService()
crypto_service = CryptoService()
integrity_service = IntegrityService()

@app.get("/")
async def root():
    return {"message": "Defense System Helper Python Service is running"}

# Auth Routes
@app.post("/auth/register")
async def register(user: User):
    try:
        return await auth_service.register(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
async def login(user: User):
    try:
        return await auth_service.login(user)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

# Crypto Routes
@app.post("/data/encrypt")
async def encrypt_data(request: EncryptRequest):
    try:
        return await crypto_service.encrypt_data(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/data/decrypt")
async def decrypt_data(request: DecryptRequest):
    try:
        decrypted = await crypto_service.decrypt_data(request)
        return {"decrypted": decrypted}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Integrity Routes
@app.post("/integrity/sign")
async def create_signature(request: SignatureRequest):
    try:
        return await integrity_service.create_signature(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/integrity/verify")
async def verify_signature(
    request: VerifyRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        return await integrity_service.verify_signature(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 