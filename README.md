# Defense System Helper API

A military-grade security API with quantum-safe encryption capabilities.

## Features

- User Authentication with Argon2id password hashing
- JWT-based authorization
- AES-256-GCM encryption
- Post-quantum cryptography using Kyber KEM
- Digital signatures using Dilithium
- Data integrity verification using HMAC
- Hybrid encryption schemes (classical + post-quantum)

## Project Structure

```
api-application/
├─ app/
│  ├─ exceptions/        # Custom exception classes
│  ├─ http/
│  │  ├─ interfaces/    # TypeScript interfaces and types
│  │  ├─ guards/        # Authentication and authorization guards
│  │  ├─ controllers/   # Route handlers and controllers
│  │  ├─ middleware/    # Request/response middleware
│  │  ├─ providers/     # Service providers and DI containers
│  ├─ jobs/            # Background jobs and tasks
│  ├─ models/          # Data models and schemas
│  ├─ services/        # Business logic and services
│  ├─ repositories/    # Data access layer
├─ config/            # Configuration files
├─ database/         # Database migrations and seeds
├─ logs/            # Application logs
├─ tests/
│  ├─ unit/        # Unit tests
│  ├─ integration/ # Integration tests
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

API documentation is available at:

- OpenAPI UI: http://localhost:3000
- OpenAPI JSON: http://localhost:3000/openapi.json

## Testing

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run all tests
npm test
```

## Security

This project implements various security measures including:

- Quantum-safe encryption algorithms
- Secure password hashing
- JWT-based authentication
- Data integrity verification
- Hybrid encryption schemes

## License

MIT License
