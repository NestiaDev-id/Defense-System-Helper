from pydantic import BaseModel
from typing import Optional

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

class MessageResponse(BaseModel):
    message: str 