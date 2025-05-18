from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002"],  # Hono app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class User(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str

# Mock database
users_db = {}

@app.post("/auth/register")
async def register(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    users_db[user.username] = user.password
    return {"message": "User registered successfully"}

@app.post("/auth/login")
async def login(user: User):
    if user.username not in users_db or users_db[user.username] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": f"mock_token_for_{user.username}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 