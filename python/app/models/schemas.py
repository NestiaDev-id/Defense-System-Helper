from pydantic import BaseModel
from typing import Optional

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

class VerifyRequest(BaseModel):
    data: str
    signature: str

class TokenResponse(BaseModel):
    token: str
    token_type: str = "bearer"

class MessageResponse(BaseModel):
    message: str 