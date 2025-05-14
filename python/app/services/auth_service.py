from ..models.schemas import User, TokenResponse, MessageResponse
from ..utils.security import SecurityUtils
import os

class AuthService:
    def __init__(self):
        # In production, use a proper database
        self.users = {}
        self.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key')

    async def register(self, user: User) -> MessageResponse:
        if user.username in self.users:
            raise ValueError("Username already exists")
        
        # In production, hash the password before storing
        self.users[user.username] = user.password
        return MessageResponse(message="User registered successfully")

    async def login(self, user: User) -> MessageResponse:
        stored_password = self.users.get(user.username)
        if not stored_password or stored_password != user.password:
            raise ValueError("Invalid credentials")
        
        return MessageResponse(message="Login successful") 