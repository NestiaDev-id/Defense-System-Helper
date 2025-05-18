import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function generateSecureKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

const envContent = `# Hono Application Configuration
HONO_SECRET_KEY=${generateSecureKey()}
PORT=3000

# Python Service Configuration
PYTHON_API_URL=http://localhost:8000
PYTHON_SECRET_KEY=${generateSecureKey()}

# Security Configuration
JWT_EXPIRATION=3600 # 1 hour in seconds
CORS_ORIGIN=http://localhost:3000
`;

const envExampleContent = `# Hono Application Configuration
HONO_SECRET_KEY=your-super-secret-key-for-hono-jwt-signing
PORT=3000

# Python Service Configuration
PYTHON_API_URL=http://localhost:8000
PYTHON_SECRET_KEY=your-super-secret-key-for-python-backend

# Security Configuration
JWT_EXPIRATION=3600 # 1 hour in seconds
CORS_ORIGIN=http://localhost:3000
`;

// Create .env file
fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
console.log('✅ Created .env file with secure random keys');

// Create .env.example file
fs.writeFileSync(path.join(__dirname, '..', '.env.example'), envExampleContent);
console.log('✅ Created .env.example file');

// Create .env file for Python backend
const pythonEnvContent = `# Python Backend Configuration
SECRET_KEY=${generateSecureKey()}
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGIN=http://localhost:3000

# Security Settings
JWT_SECRET_KEY=${generateSecureKey()}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
`;

fs.writeFileSync(path.join(__dirname, '..', 'python', '.env'), pythonEnvContent);
console.log('✅ Created Python .env file with secure random keys');

// Add .env to .gitignore if it's not already there
const gitignorePath = path.join(__dirname, '..', '.gitignore');
let gitignoreContent = '';

try {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
} catch (error) {
    // File doesn't exist, create it
    gitignoreContent = '';
}

const envEntries = ['.env', '*.env', '.env.local', '.env.*.local'];
let updatedGitignore = gitignoreContent;

for (const entry of envEntries) {
    if (!gitignoreContent.includes(entry)) {
        updatedGitignore += `\n${entry}`;
    }
}

fs.writeFileSync(gitignorePath, updatedGitignore.trim() + '\n');
console.log('✅ Updated .gitignore file');

console.log('\n🔐 Environment setup completed successfully!');
console.log('⚠️  Make sure to never commit the .env files to version control'); 