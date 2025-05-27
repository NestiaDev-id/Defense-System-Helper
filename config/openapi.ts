export const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Defense System Helper API",
    version: "1.0.0",
    description: "Military-grade security API with quantum-safe encryption",
  },
  servers: [
    {
      url: "https://defense-system-helper.vercel.app/api/v1",
      description: "Production server",
    },
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "http://localhost:8000/api/v1",
      description: "Development server",
    },
  ],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  password: { type: "string", format: "password" },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: {
                      type: "string",
                      description:
                        "JWT access token for authenticated requests.",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    refreshToken: {
                      type: "string",
                      description: "Token used to refresh the access token.",
                      example: "def50200a3f2b6a43b...",
                    },
                  },
                  required: ["accessToken", "refreshToken"],
                },
              },
            },
          },
          "400": {
            description: "Invalid input or validation error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      description:
                        "Descriptive error message for validation or input failure.",
                      example: "Password must be at least 6 characters long.",
                    },
                  },
                  required: ["error"],
                },
              },
            },
          },
          "409": {
            description: "Conflict - e.g., username already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      description: "Conflict or duplication error message.",
                      example: "Username already taken",
                    },
                  },
                  required: ["error"],
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  password: { type: "string", format: "password" },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/hash-password": {
      post: {
        tags: ["Authentication"],
        summary: "Hash a password using Argon2id",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  password: { type: "string", format: "password" },
                },
                required: ["password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password hashed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    hash: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/verify-password": {
      post: {
        tags: ["Authentication"],
        summary: "Verify password against hash",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  password: { type: "string", format: "password" },
                  hash: { type: "string" },
                },
                required: ["password", "hash"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Verification result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/refresh-token": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string" },
                },
                required: ["refreshToken"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    // --- BIOMETRIC ENROLLMENT ---
    "/auth/biometric/face/enroll": {
      post: {
        tags: ["Biometric Authentication"],
        summary: "Enroll face template for a user 🤳",
        security: [{ bearerAuth: [] }], // Asumsi user sudah login untuk enrollment
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              // Umumnya gambar wajah dikirim sebagai file
              schema: {
                type: "object",
                properties: {
                  faceImage: {
                    type: "string",
                    format: "binary",
                    description:
                      "Image file of the user's face for enrollment.",
                  },
                  userId: {
                    // Atau didapatkan dari token sesi
                    type: "string",
                    description:
                      "User ID to associate with this face template.",
                  },
                },
                required: ["faceImage", "userId"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Face template successfully enrolled.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    message: {
                      type: "string",
                      example: "Face template enrolled.",
                    },
                    faceTemplateId: { type: "string", example: "ft_123xyz" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "409": {
            // Conflict, misal wajah sudah terdaftar atau kualitas buruk
            description: "Face enrollment conflict or quality issue.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/biometric/voice/enroll": {
      post: {
        tags: ["Biometric Authentication"],
        summary: "Enroll voice sample for a user 🎤",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              // Sampel suara bisa berupa file audio
              schema: {
                type: "object",
                properties: {
                  voiceSample: {
                    type: "string",
                    format: "binary",
                    description:
                      "Audio file of the user's voice sample (e.g., specific passphrase).",
                  },
                  userId: { type: "string" },
                  passphraseId: {
                    // Jika menggunakan frasa sandi tertentu
                    type: "string",
                    description:
                      "Identifier for the passphrase spoken, if applicable.",
                    nullable: true,
                  },
                },
                required: ["voiceSample", "userId"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Voice sample successfully enrolled.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    message: {
                      type: "string",
                      example: "Voice sample enrolled.",
                    },
                    voiceSampleId: { type: "string", example: "vs_456abc" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
        },
      },
    },

    // --- BIOMETRIC VERIFICATION (Contoh saat login atau sebagai faktor kedua) ---
    "/auth/biometric/face/verify": {
      post: {
        tags: ["Biometric Authentication"],
        summary: "Verify user's face 🤳",
        // Bisa tanpa security jika ini bagian dari login awal, atau dengan security jika MFA
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  faceImage: {
                    type: "string",
                    format: "binary",
                    description:
                      "Image file of the user's face for verification.",
                  },
                  userId: {
                    // Untuk mencocokkan dengan template yang tersimpan
                    type: "string",
                    description:
                      "User ID whose face template should be used for verification.",
                  },
                },
                required: ["faceImage", "userId"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Face verification result.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    verified: { type: "boolean" },
                    confidence: {
                      type: "number",
                      format: "float",
                      nullable: true,
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
          "404": {
            // User atau template tidak ditemukan
            description: "User or face template not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/biometric/voice/verify": {
      post: {
        tags: ["Biometric Authentication"],
        summary: "Verify user's voice via passphrase 🎤",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  voiceSample: {
                    type: "string",
                    format: "binary",
                    description:
                      "Audio file of the user's voice speaking the challenge passphrase.",
                  },
                  userId: { type: "string" },
                  challengePassphrase: {
                    // Frasa yang harus diucapkan pengguna
                    type: "string",
                    description:
                      "The passphrase the user was prompted to speak.",
                  },
                },
                required: ["voiceSample", "userId", "challengePassphrase"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Voice verification result.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    verified: { type: "boolean" },
                    confidence: {
                      type: "number",
                      format: "float",
                      nullable: true,
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
          "404": {
            description: "User or voice template not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // --- BEHAVIORAL BIOMETRICS ---
    "/auth/behavioral/data-capture": {
      // Endpoint untuk klien mengirim data perilaku
      post: {
        tags: ["Behavioral Biometrics"],
        summary: "Capture and analyze behavioral data ⌨️🖱️",
        security: [{ bearerAuth: [] }], // User harus login untuk mengirim data perilakunya
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  sessionId: { type: "string" },
                  keystrokeData: {
                    // Contoh data, bisa lebih kompleks
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { type: "string" },
                        pressTime: { type: "integer", format: "int64" },
                        releaseTime: { type: "integer", format: "int64" },
                      },
                    },
                    nullable: true,
                  },
                  mouseData: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        x: { type: "integer" },
                        y: { type: "integer" },
                        timestamp: { type: "integer", format: "int64" },
                        eventType: {
                          type: "string",
                          enum: ["move", "click", "scroll"],
                        },
                      },
                    },
                    nullable: true,
                  },
                  navigationEvents: {
                    type: "array",
                    items: { type: "string" },
                    nullable: true,
                    description: "e.g., ['view_profile', 'edit_settings']",
                  },
                  textInputFeatures: {
                    // Dari NLP jika ada input teks
                    type: "object",
                    properties: {
                      /* ... fitur NLP ... */
                    },
                    nullable: true,
                  },
                },
                required: ["userId", "sessionId"],
              },
            },
          },
        },
        responses: {
          "202": {
            // Accepted, analisis mungkin berjalan async
            description: "Behavioral data received and queued for analysis.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "received" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
        },
      },
    },
    "/auth/behavioral/risk-score": {
      // Endpoint untuk mendapatkan skor risiko perilaku (opsional)
      get: {
        tags: ["Behavioral Biometrics"],
        summary: "Get behavioral risk score for a user/session 🚦",
        security: [{ bearerAuth: [] }], // Hanya admin atau sistem internal
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "sessionId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Behavioral risk score.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "string" },
                    sessionId: { type: "string", nullable: true },
                    riskScore: { type: "number", format: "float" },
                    confidence: { type: "number", format: "float" },
                    contributingFactors: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "404": { $ref: "#/components/responses/NotFoundError" },
        },
      },
    },

    "/auth/login/mfa": {
      post: {
        tags: ["Multi-Factor Authentication (MFA)"],
        summary:
          "Perform multi-factor login (e.g., face + voice passphrase) 🎭",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              // Atau multipart jika ada file
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" }, // Atau email/userId
                  // Faktor 1: Password (jika masih digunakan sebagai salah satu faktor)
                  password: {
                    type: "string",
                    format: "password",
                    nullable: true,
                  },
                  // Faktor 2: Data Wajah (bisa base64 string atau referensi ke upload sebelumnya)
                  faceImageData: {
                    type: "string",
                    format: "byte",
                    nullable: true,
                    description: "Base64 encoded face image for verification.",
                  },
                  // Faktor 3: Data Suara (bisa base64 string atau referensi)
                  voiceSampleData: {
                    type: "string",
                    format: "byte",
                    nullable: true,
                    description:
                      "Base64 encoded voice sample for verification.",
                  },
                  voicePassphrase: { type: "string", nullable: true },
                  // Faktor 4: OTP
                  otpCode: { type: "string", nullable: true },
                  // Informasi lain yang mungkin dibutuhkan
                  sessionIdForBehavioralCheck: {
                    type: "string",
                    nullable: true,
                  },
                },
                required: ["username"], // Minimal username, faktor lain kondisional
              },
            },
          },
        },
        responses: {
          "200": {
            // Jika semua faktor berhasil
            description: "MFA login successful, session token issued.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string", nullable: true },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "401": {
            // Jika salah satu faktor gagal
            description: "MFA failed for one or more factors.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "mfa_failed" },
                    message: {
                      type: "string",
                      example: "Face verification failed.",
                    },
                    failedFactors: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    // --- SMS OTP ---
    "/auth/otp/sms/send": {
      post: {
        tags: ["Multi-Factor Authentication (MFA)"],
        summary: "Request and send an OTP to the user via SMS 💬",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  phoneNumber: {
                    type: "string",
                    description:
                      "The user's phone number in E.164 format (e.g., +6281234567890).",
                    example: "+6281234567890",
                  },
                  userId: {
                    type: "string",
                    description: "Optional User ID if known.",
                    nullable: true,
                  },
                  purpose: {
                    type: "string",
                    description: "Optional purpose of the OTP.",
                    nullable: true,
                    example: "login_mfa",
                  },
                },
                required: ["phoneNumber"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/OtpSentSuccessResponse" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
          "401": { $ref: "#/components/responses/UnauthorizedError" }, // Jika endpoint ini memerlukan auth
          "429": { $ref: "#/components/responses/TooManyRequestsError" },
          "503": { $ref: "#/components/responses/OtpServiceUnavailableError" },
        },
      },
    },

    // --- Phone Call OTP ---
    "/auth/otp/call/send": {
      post: {
        tags: ["Multi-Factor Authentication (MFA)"],
        summary: "Request and send an OTP to the user via a phone call 📞",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  phoneNumber: {
                    type: "string",
                    description: "The user's phone number in E.164 format.",
                    example: "+6281234567890",
                  },
                  userId: { type: "string", nullable: true },
                  purpose: {
                    type: "string",
                    nullable: true,
                    example: "password_reset",
                  },
                  language: {
                    // Opsional untuk panggilan suara
                    type: "string",
                    description:
                      "Preferred language for the voice call (e.g., 'en-US', 'id-ID').",
                    nullable: true,
                    example: "id-ID",
                  },
                },
                required: ["phoneNumber"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/OtpSentSuccessResponse" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "429": { $ref: "#/components/responses/TooManyRequestsError" },
          "503": { $ref: "#/components/responses/OtpServiceUnavailableError" },
        },
      },
    },

    // --- WhatsApp OTP ---
    "/auth/otp/whatsapp/send": {
      post: {
        tags: ["Multi-Factor Authentication (MFA)"],
        summary: "Request and send an OTP to the user via WhatsApp ✅",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  whatsappNumber: {
                    // Bisa jadi sama dengan phoneNumber, tapi eksplisit lebih baik
                    type: "string",
                    description:
                      "The user's WhatsApp number, typically in E.164 format.",
                    example: "+6281234567890",
                  },
                  userId: { type: "string", nullable: true },
                  purpose: {
                    type: "string",
                    nullable: true,
                    example: "transaction_confirm",
                  },
                  templateName: {
                    // WhatsApp sering menggunakan template pesan yang disetujui
                    type: "string",
                    description:
                      "Name of the pre-approved WhatsApp message template for OTP.",
                    nullable: true, // Jika tidak pakai template, backend bisa punya default
                  },
                  templateParameters: {
                    // Parameter untuk template
                    type: "object",
                    description: "Key-value pairs for template placeholders.",
                    nullable: true,
                    example: {
                      otp_code: "DYNAMIC_OTP_HERE",
                      user_name: "User",
                    },
                  },
                },
                required: ["whatsappNumber"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/OtpSentSuccessResponse" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "429": { $ref: "#/components/responses/TooManyRequestsError" },
          "503": { $ref: "#/components/responses/OtpServiceUnavailableError" },
        },
      },
    },

    // --- Email OTP ---
    "/auth/otp/email/send": {
      post: {
        tags: ["Multi-Factor Authentication (MFA)"],
        summary: "Request and send an OTP to the user via Email 📧",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  emailAddress: {
                    type: "string",
                    format: "email",
                    description: "The user's email address.",
                    example: "user@example.com",
                  },
                  userId: { type: "string", nullable: true },
                  purpose: {
                    type: "string",
                    nullable: true,
                    example: "account_verification",
                  },
                  emailSubject: {
                    type: "string",
                    description: "Optional custom subject for the OTP email.",
                    nullable: true,
                    example: "Your Verification Code",
                  },
                  emailTemplateName: {
                    type: "string",
                    description: "Optional name of the email template to use.",
                    nullable: true,
                  },
                },
                required: ["emailAddress"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/OtpSentSuccessResponse" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "429": { $ref: "#/components/responses/TooManyRequestsError" },
          "503": { $ref: "#/components/responses/OtpServiceUnavailableError" },
        },
      },
    },

    // --- Centralized OTP Verification ---
    "/auth/otp/verify": {
      post: {
        tags: ["Multi-Factor Authentication (MFA)"],
        summary: "Verify an OTP provided by the user (from any channel) ✅",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  otpCode: {
                    type: "string",
                    description:
                      "The One-Time Password code entered by the user.",
                    example: "123456",
                  },
                  otpSessionId: {
                    type: "string",
                    description:
                      "The session ID received from the respective /auth/otp/.../send endpoint.",
                    example: "otp_sess_abcdef123456",
                  },
                  purpose: {
                    type: "string",
                    description:
                      "Optional purpose of the OTP, should match the purpose during send if provided.",
                    nullable: true,
                    example: "login_mfa",
                  },
                },
                required: ["otpCode", "otpSessionId"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/OtpVerifySuccessResponse" },
          "400": { $ref: "#/components/responses/OtpVerifyFailedResponse" },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
        },
      },
    },

    "/data/encrypt": {
      post: {
        tags: ["Standard Data Encryption & Decryption"],
        summary: "Encrypt data using AES-256-GCM",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string" },
                },
                required: ["data"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Data encrypted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encrypted: { type: "string" },
                    iv: { type: "string" },
                    tag: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/decrypt": {
      post: {
        tags: ["Standard Data Encryption & Decryption"],
        summary: "Decrypt data using AES-256-GCM",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encrypted: { type: "string" },
                  iv: { type: "string" },
                  tag: { type: "string" },
                },
                required: ["encrypted", "iv", "tag"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Data decrypted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    decrypted: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/generate-key": {
      post: {
        tags: ["Standard Data Encryption & Decryption"],
        summary: "Generate AES-256 symmetric key",
        responses: {
          "200": {
            description: "Symmetric key generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    key: {
                      type: "string",
                      description: "Base64-encoded AES key",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/encrypt-with-key": {
      post: {
        tags: ["Standard Data Encryption & Decryption"],
        summary: "Encrypt data using AES-256-GCM with custom key",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  key: {
                    type: "string",
                    description: "Base64-encoded AES key",
                  },
                },
                required: ["data", "key"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Data encrypted with custom key",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encrypted: { type: "string" },
                    iv: { type: "string" },
                    tag: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/decrypt-with-key": {
      post: {
        tags: ["Standard Data Encryption & Decryption"],
        summary: "Decrypt data using AES-256-GCM with custom key",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encrypted: { type: "string" },
                  iv: { type: "string" },
                  tag: { type: "string" },
                  key: {
                    type: "string",
                    description: "Base64-encoded AES key",
                  },
                },
                required: ["encrypted", "iv", "tag", "key"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Data decrypted with custom key",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    decrypted: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/crypto/key/kem": {
      post: {
        tags: ["Post-Quantum Cryptography"],
        summary: "Generate Kyber KEM key pair",
        responses: {
          "200": {
            description: "Kyber key pair generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    publicKey: { type: "string" },
                    privateKey: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/crypto/key/sign": {
      post: {
        tags: ["Post-Quantum Cryptography"],
        summary: "Generate Dilithium signature key pair",
        responses: {
          "200": {
            description: "Dilithium key pair generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    publicKey: { type: "string" },
                    privateKey: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/data/sign": {
      post: {
        tags: ["Post-Quantum Cryptography"],
        summary: "Sign data using Dilithium",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  privateKey: { type: "string" },
                },
                required: ["message", "privateKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signature created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    signature: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/verify-sign": {
      post: {
        tags: ["Post-Quantum Cryptography"],
        summary: "Verify Dilithium signature",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  signature: { type: "string" },
                  publicKey: { type: "string" },
                },
                required: ["message", "signature", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Verification result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/pq/benchmark": {
      get: {
        tags: ["Post-Quantum Cryptography"],
        summary: "Benchmark PQ algorithms on this system",
        responses: {
          "200": {
            description: "Benchmark result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    kyberEncryptTimeMs: { type: "number" },
                    kyberDecryptTimeMs: { type: "number" },
                    dilithiumSignTimeMs: { type: "number" },
                    dilithiumVerifyTimeMs: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/pq/status": {
      get: {
        tags: ["Post-Quantum Cryptography"],
        summary: "Check PQ readiness and fallback status",
        responses: {
          "200": {
            description: "Post-Quantum status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    pqReady: { type: "boolean" },
                    algorithms: {
                      type: "array",
                      items: { type: "string" },
                    },
                    fallbackDetected: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/pq/convert-key-format": {
      post: {
        tags: ["Post-Quantum Cryptography"],
        summary: "Convert PQ key format",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  inputFormat: {
                    type: "string",
                    enum: ["PEM", "DER", "BASE64"],
                  },
                  outputFormat: {
                    type: "string",
                    enum: ["PEM", "DER", "BASE64"],
                  },
                },
                required: ["key", "inputFormat", "outputFormat"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Key converted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    convertedKey: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/pq/interop/test-vector": {
      get: {
        tags: ["Post-Quantum Cryptography"],
        summary: "Retrieve test vector for interoperability",
        responses: {
          "200": {
            description: "Test vector",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    kyberSample: { type: "string" },
                    dilithiumSample: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/hybrid/kyber-aes/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using Kyber + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "string",
                    description: "Plaintext data to encrypt (UTF-8 string).",
                  },
                  kyberPublicKey: {
                    type: "string",
                    format: "byte",
                    description:
                      "Kyber public key of the recipient (Base64 encoded).",
                  },
                },
                required: ["data", "kyberPublicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Kyber+AES hybrid encryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encryptedData: { type: "string", format: "byte" },
                    encapsulatedKey: { type: "string", format: "byte" },
                    iv: { type: "string", format: "byte" },
                    tag: { type: "string", format: "byte" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/kyber-aes/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using Kyber + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encryptedData: { type: "string", format: "byte" },
                  encapsulatedKey: { type: "string", format: "byte" },
                  iv: { type: "string", format: "byte" },
                  tag: { type: "string", format: "byte" },
                  kyberPrivateKey: {
                    type: "string",
                    format: "byte",
                    description:
                      "Kyber private key of the recipient (Base64 encoded).",
                  },
                },
                required: [
                  "encryptedData",
                  "encapsulatedKey",
                  "iv",
                  "tag",
                  "kyberPrivateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Kyber+AES hybrid decryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { decryptedData: { type: "string" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/DecryptionError" },
        },
      },
    },
    "/data/hybrid/kyber-chacha/encrypt": {
      // PATH BARU untuk Kyber + ChaCha20-Poly1305
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using Kyber + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "string",
                    description: "Plaintext data to encrypt (UTF-8 string).",
                  },
                  kyberPublicKey: {
                    type: "string",
                    format: "byte",
                    description:
                      "Kyber public key of the recipient (Base64 encoded).",
                  },
                },
                required: ["data", "kyberPublicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Kyber+ChaCha20 hybrid encryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encryptedData: { type: "string", format: "byte" },
                    encapsulatedKey: { type: "string", format: "byte" },
                    iv: { type: "string", format: "byte" }, // ChaCha20-Poly1305 juga menggunakan IV/Nonce
                    tag: { type: "string", format: "byte" }, // ChaCha20-Poly1305 juga menghasilkan tag
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/kyber-chacha/decrypt": {
      // PATH BARU untuk Kyber + ChaCha20-Poly1305
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using Kyber + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encryptedData: { type: "string", format: "byte" },
                  encapsulatedKey: { type: "string", format: "byte" },
                  iv: { type: "string", format: "byte" },
                  tag: { type: "string", format: "byte" },
                  kyberPrivateKey: {
                    type: "string",
                    format: "byte",
                    description:
                      "Kyber private key of the recipient (Base64 encoded).",
                  },
                },
                required: [
                  "encryptedData",
                  "encapsulatedKey",
                  "iv",
                  "tag",
                  "kyberPrivateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Kyber+ChaCha20 hybrid decryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { decryptedData: { type: "string" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/DecryptionError" },
        },
      },
    },
    "/data/hybrid/hqc-aes/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using HQC + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  hqcPublicKey: {
                    type: "string",
                    format: "byte",
                    description: "HQC public key (Base64 encoded).",
                  },
                },
                required: ["data", "hqcPublicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "HQC+AES hybrid encryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encryptedData: { type: "string", format: "byte" },
                    encapsulatedKey: { type: "string", format: "byte" },
                    iv: { type: "string", format: "byte" },
                    tag: { type: "string", format: "byte" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/hqc-aes/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using HQC + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encryptedData: { type: "string", format: "byte" },
                  encapsulatedKey: { type: "string", format: "byte" },
                  iv: { type: "string", format: "byte" },
                  tag: { type: "string", format: "byte" },
                  hqcPrivateKey: {
                    type: "string",
                    format: "byte",
                    description: "HQC private key (Base64 encoded).",
                  },
                },
                required: [
                  "encryptedData",
                  "encapsulatedKey",
                  "iv",
                  "tag",
                  "hqcPrivateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "HQC+AES hybrid decryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { decryptedData: { type: "string" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/DecryptionError" },
        },
      },
    },
    "/data/hybrid/hqc-chacha/encrypt": {
      // PATH BARU untuk HQC + ChaCha20-Poly1305
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using HQC + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  hqcPublicKey: {
                    type: "string",
                    format: "byte",
                    description: "HQC public key (Base64 encoded).",
                  },
                },
                required: ["data", "hqcPublicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "HQC+ChaCha20 hybrid encryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encryptedData: { type: "string", format: "byte" },
                    encapsulatedKey: { type: "string", format: "byte" },
                    iv: { type: "string", format: "byte" },
                    tag: { type: "string", format: "byte" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/hqc-chacha/decrypt": {
      // PATH BARU untuk HQC + ChaCha20-Poly1305
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using HQC + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encryptedData: { type: "string", format: "byte" },
                  encapsulatedKey: { type: "string", format: "byte" },
                  iv: { type: "string", format: "byte" },
                  tag: { type: "string", format: "byte" },
                  hqcPrivateKey: {
                    type: "string",
                    format: "byte",
                    description: "HQC private key (Base64 encoded).",
                  },
                },
                required: [
                  "encryptedData",
                  "encapsulatedKey",
                  "iv",
                  "tag",
                  "hqcPrivateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "HQC+ChaCha20 hybrid decryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { decryptedData: { type: "string" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/DecryptionError" },
        },
      },
    },
    // --- Pola untuk NTRU ---
    "/data/hybrid/ntru-aes/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using NTRU + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  plaintext: {
                    type: "string",
                    description: "The original plaintext to be encrypted.",
                    example: "Hello, world!",
                  },
                  publicKey: {
                    type: "string",
                    description: "Public key used for post-quantum encryption.",
                    example: "base64encodedPublicKey==",
                  },
                },
                required: ["plaintext", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridEncryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/ntru-aes/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using NTRU + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ciphertext: {
                    type: "string",
                    description: "The encrypted ciphertext.",
                    example: "base64encodedciphertext==",
                  },
                  encapsulatedKey: {
                    type: "string",
                    description: "The key used to derive the symmetric key.",
                    example: "base64encodedKey==",
                  },
                  nonce: {
                    type: "string",
                    example: "base64encodedNonce==",
                  },
                  tag: {
                    type: "string",
                    example: "base64encodedTag==",
                  },
                  privateKey: {
                    type: "string",
                    description:
                      "Private key used to decrypt the encapsulated key.",
                    example: "base64encodedPrivateKey==",
                  },
                },
                required: [
                  "ciphertext",
                  "encapsulatedKey",
                  "nonce",
                  "tag",
                  "privateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridDecryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/ntru-chacha/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using NTRU + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  plaintext: {
                    type: "string",
                    description: "The original plaintext to be encrypted.",
                    example: "Hello, world!",
                  },
                  publicKey: {
                    type: "string",
                    description: "Public key used for post-quantum encryption.",
                    example: "base64encodedPublicKey==",
                  },
                },
                required: ["plaintext", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridEncryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/ntru-chacha/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using NTRU + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ciphertext: {
                    type: "string",
                    description: "The encrypted ciphertext.",
                    example: "base64encodedciphertext==",
                  },
                  encapsulatedKey: {
                    type: "string",
                    description: "The key used to derive the symmetric key.",
                    example: "base64encodedKey==",
                  },
                  nonce: {
                    type: "string",
                    example: "base64encodedNonce==",
                  },
                  tag: {
                    type: "string",
                    example: "base64encodedTag==",
                  },
                  privateKey: {
                    type: "string",
                    description:
                      "Private key used to decrypt the encapsulated key.",
                    example: "base64encodedPrivateKey==",
                  },
                },
                required: [
                  "ciphertext",
                  "encapsulatedKey",
                  "nonce",
                  "tag",
                  "privateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridDecryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    // --- Pola untuk MCELIECE ---
    "/data/hybrid/mceliece-aes/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using McEliece + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  plaintext: {
                    type: "string",
                    description: "The original plaintext to be encrypted.",
                    example: "Hello, world!",
                  },
                  publicKey: {
                    type: "string",
                    description: "Public key used for post-quantum encryption.",
                    example: "base64encodedPublicKey==",
                  },
                },
                required: ["plaintext", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridEncryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/mceliece-aes/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using McEliece + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ciphertext: {
                    type: "string",
                    description: "The encrypted ciphertext.",
                    example: "base64encodedciphertext==",
                  },
                  encapsulatedKey: {
                    type: "string",
                    description: "The key used to derive the symmetric key.",
                    example: "base64encodedKey==",
                  },
                  nonce: {
                    type: "string",
                    example: "base64encodedNonce==",
                  },
                  tag: {
                    type: "string",
                    example: "base64encodedTag==",
                  },
                  privateKey: {
                    type: "string",
                    description:
                      "Private key used to decrypt the encapsulated key.",
                    example: "base64encodedPrivateKey==",
                  },
                },
                required: [
                  "ciphertext",
                  "encapsulatedKey",
                  "nonce",
                  "tag",
                  "privateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridDecryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/mceliece-chacha/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary:
          "Encrypt data using McEliece + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  plaintext: {
                    type: "string",
                    description: "The original plaintext to be encrypted.",
                    example: "Hello, world!",
                  },
                  publicKey: {
                    type: "string",
                    description: "Public key used for post-quantum encryption.",
                    example: "base64encodedPublicKey==",
                  },
                },
                required: ["plaintext", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridEncryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/mceliece-chacha/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary:
          "Decrypt data using McEliece + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ciphertext: {
                    type: "string",
                    description: "The encrypted ciphertext.",
                    example: "base64encodedciphertext==",
                  },
                  encapsulatedKey: {
                    type: "string",
                    description: "The key used to derive the symmetric key.",
                    example: "base64encodedKey==",
                  },
                  nonce: {
                    type: "string",
                    example: "base64encodedNonce==",
                  },
                  tag: {
                    type: "string",
                    example: "base64encodedTag==",
                  },
                  privateKey: {
                    type: "string",
                    description:
                      "Private key used to decrypt the encapsulated key.",
                    example: "base64encodedPrivateKey==",
                  },
                },
                required: [
                  "ciphertext",
                  "encapsulatedKey",
                  "nonce",
                  "tag",
                  "privateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridDecryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    // --- Pola untuk BIKE ---
    "/data/hybrid/bike-aes/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using BIKE + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  plaintext: {
                    type: "string",
                    description: "The original plaintext to be encrypted.",
                    example: "Hello, world!",
                  },
                  publicKey: {
                    type: "string",
                    description: "Public key used for post-quantum encryption.",
                    example: "base64encodedPublicKey==",
                  },
                },
                required: ["plaintext", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridEncryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/bike-aes/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using BIKE + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ciphertext: {
                    type: "string",
                    description: "The encrypted ciphertext.",
                    example: "base64encodedciphertext==",
                  },
                  encapsulatedKey: {
                    type: "string",
                    description: "The key used to derive the symmetric key.",
                    example: "base64encodedKey==",
                  },
                  nonce: {
                    type: "string",
                    example: "base64encodedNonce==",
                  },
                  tag: {
                    type: "string",
                    example: "base64encodedTag==",
                  },
                  privateKey: {
                    type: "string",
                    description:
                      "Private key used to decrypt the encapsulated key.",
                    example: "base64encodedPrivateKey==",
                  },
                },
                required: [
                  "ciphertext",
                  "encapsulatedKey",
                  "nonce",
                  "tag",
                  "privateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridDecryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/bike-chacha/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using BIKE + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  plaintext: {
                    type: "string",
                    description: "The original plaintext to be encrypted.",
                    example: "Hello, world!",
                  },
                  publicKey: {
                    type: "string",
                    description: "Public key used for post-quantum encryption.",
                    example: "base64encodedPublicKey==",
                  },
                },
                required: ["plaintext", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridEncryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/bike-chacha/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using BIKE + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ciphertext: {
                    type: "string",
                    description: "The encrypted ciphertext.",
                    example: "base64encodedciphertext==",
                  },
                  encapsulatedKey: {
                    type: "string",
                    description: "The key used to derive the symmetric key.",
                    example: "base64encodedKey==",
                  },
                  nonce: {
                    type: "string",
                    example: "base64encodedNonce==",
                  },
                  tag: {
                    type: "string",
                    example: "base64encodedTag==",
                  },
                  privateKey: {
                    type: "string",
                    description:
                      "Private key used to decrypt the encapsulated key.",
                    example: "base64encodedPrivateKey==",
                  },
                },
                required: [
                  "ciphertext",
                  "encapsulatedKey",
                  "nonce",
                  "tag",
                  "privateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/HybridDecryptSuccess" },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    // --- CLASSICAL HYBRID SCHEMES ---
    "/data/hybrid/ecc-chacha/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Encrypt data using ECDH + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "string",
                    description: "Plaintext data to encrypt (UTF-8 string).",
                  },
                  eccPublicKey: {
                    // Kunci publik ECC penerima
                    type: "string",
                    format: "byte",
                    description:
                      "Recipient's ECC public key (e.g., X25519, P-256) (Base64 encoded).",
                  },
                  // Untuk ECDH, pengirim juga menghasilkan pasangan kunci ephemeral
                  // Kunci publik ephemeral pengirim akan menjadi bagian dari 'encapsulatedKey'
                  // atau dikirim secara terpisah jika mengikuti skema HPKE secara ketat.
                  // Untuk KEM-like usage, kita bisa sederhanakan.
                },
                required: ["data", "eccPublicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "ECC+ChaCha20 hybrid encryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encryptedData: { type: "string", format: "byte" },
                    ephemeralPublicKey: {
                      // Kunci publik ephemeral pengirim
                      type: "string",
                      format: "byte",
                      description:
                        "Sender's ephemeral ECC public key (Base64 encoded). This forms part of the KEM ciphertext.",
                    },
                    iv: { type: "string", format: "byte" },
                    tag: { type: "string", format: "byte" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/ecc-chacha/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using ECDH + ChaCha20-Poly1305 hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encryptedData: { type: "string", format: "byte" },
                  ephemeralPublicKey: {
                    // Kunci publik ephemeral pengirim
                    type: "string",
                    format: "byte",
                    description:
                      "Sender's ephemeral ECC public key (Base64 encoded).",
                  },
                  iv: { type: "string", format: "byte" },
                  tag: { type: "string", format: "byte" },
                  eccPrivateKey: {
                    // Kunci privat ECC penerima
                    type: "string",
                    format: "byte",
                    description:
                      "Recipient's ECC private key (Base64 encoded).",
                  },
                },
                required: [
                  "encryptedData",
                  "ephemeralPublicKey",
                  "iv",
                  "tag",
                  "eccPrivateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "ECC+ChaCha20 hybrid decryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { decryptedData: { type: "string" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/DecryptionError" },
        },
      },
    },
    "/data/hybrid/rsa-aes/encrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary:
          "Encrypt data using RSA-KEM (e.g., RSAES-OAEP) + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "string",
                    description: "Plaintext data to encrypt (UTF-8 string).",
                  },
                  rsaPublicKey: {
                    // Kunci publik RSA penerima
                    type: "string",
                    format: "byte",
                    description:
                      "Recipient's RSA public key (Base64 encoded, e.g., PKCS#1 or SPKI format).",
                  },
                },
                required: ["data", "rsaPublicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "RSA+AES hybrid encryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encryptedData: { type: "string", format: "byte" },
                    encapsulatedKey: {
                      // Kunci AES yang dienkapsulasi dengan RSA
                      type: "string",
                      format: "byte",
                      description:
                        "AES key encapsulated with RSA (Base64 encoded).",
                    },
                    iv: { type: "string", format: "byte" },
                    tag: { type: "string", format: "byte" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/InvalidInputError" },
        },
      },
    },
    "/data/hybrid/rsa-aes/decrypt": {
      post: {
        tags: ["Post-Quantum Hybrid"],
        summary: "Decrypt data using RSA-KEM + AES-GCM hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encryptedData: { type: "string", format: "byte" },
                  encapsulatedKey: {
                    type: "string",
                    format: "byte",
                    description:
                      "AES key encapsulated with RSA (Base64 encoded).",
                  },
                  iv: { type: "string", format: "byte" },
                  tag: { type: "string", format: "byte" },
                  rsaPrivateKey: {
                    // Kunci privat RSA penerima
                    type: "string",
                    format: "byte",
                    description:
                      "Recipient's RSA private key (Base64 encoded, e.g., PKCS#1 atau PKCS#8 format).",
                  },
                },
                required: [
                  "encryptedData",
                  "encapsulatedKey",
                  "iv",
                  "tag",
                  "rsaPrivateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "RSA+AES hybrid decryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { decryptedData: { type: "string" } },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/DecryptionError" },
        },
      },
    },
    "/data/integrity/generate-hash": {
      post: {
        tags: ["Integrity"],
        summary: "Generate hash (SHA-256) of the data",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  original: { type: "string" },
                },
                required: ["original"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Hash generated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    hash: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/data/integrity/verify-hash": {
      post: {
        tags: ["Integrity"],
        summary: "Verify data against its SHA-256 hash",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  hash: { type: "string" },
                },
                required: ["original", "hash"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Hash verification result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/data/integrity/compare-files": {
      post: {
        tags: ["Integrity"],
        summary: "Compare two data inputs for integrity",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data1: { type: "string" },
                  data2: { type: "string" },
                },
                required: ["data1", "data2"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Comparison result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    identical: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/integrity/generate-checksum": {
      post: {
        tags: ["Integrity"],
        summary: "Generate checksum (e.g., CRC32, MD5) of data",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string" },
                },
                required: ["data"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Checksum generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    checksum: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/data/integrity/sign": {
      post: {
        tags: ["Integrity"],
        summary: "Sign data using private key",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  privateKey: { type: "string" },
                },
                required: ["data", "privateKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signature created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    signature: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/integrity/verify-signature": {
      post: {
        tags: ["Integrity"],
        summary: "Verify signature with public key",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  signature: { type: "string" },
                  publicKey: { type: "string" },
                },
                required: ["data", "signature", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signature verification result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/integrity/status": {
      get: {
        tags: ["Integrity"],
        summary: "Get current data integrity status",
        responses: {
          "200": {
            description: "Status of integrity checks",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    lastCheck: { type: "string", format: "date-time" },
                    anomaliesDetected: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", description: "A short error code or type." },
          message: {
            type: "string",
            description: "A human-readable message explaining the error.",
          },
          statusCode: {
            type: "integer",
            description: "HTTP status code for the error.",
            example: 400,
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the error occurred.",
            example: "2023-10-01T12:00:00Z",
          },
          path: {
            type: "string",
            description: "The path of the request that caused the error.",
            example: "/data/hybrid/kyber-aes/encrypt",
          },
          details: {
            type: "object",
            additionalProperties: true,
            description:
              "Optional additional details about the error, such as validation errors.",
            items: {
              type: "object",
              properties: {
                field: {
                  type: "string",
                  description: "Name of the field that caused the issue.",
                  example: "publicKey",
                },
                issue: {
                  type: "string",
                  description: "Description of the issue with the field",
                  example: "Invalid public key format",
                },
              },
            },
          },
        },
      },
      // Bisa menambahkan skema lain di sini jika diperlukan
    },

    responses: {
      OtpSentSuccessResponse: {
        description: "OTP successfully sent to the user's email.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "OTP sent successfully.",
                },
                status: {
                  type: "string",
                  example: "success",
                },
              },
            },
          },
        },
      },
      InvalidInputError: {
        description: "Invalid input provided.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Invalid email address format.",
                },
                statusCode: {
                  type: "integer",
                  example: 400,
                },
              },
            },
          },
        },
      },
      UnauthorizedError: {
        description:
          "Authentication is required and has failed or has not yet been provided.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Unauthorized access. Please login.",
                },
                statusCode: {
                  type: "integer",
                  example: 401,
                },
              },
            },
          },
        },
      },
      TooManyRequestsError: {
        description:
          "Too many requests have been made in a short time. Rate limit exceeded.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Too many OTP requests. Please try again later.",
                },
                statusCode: {
                  type: "integer",
                  example: 429,
                },
              },
            },
          },
        },
      },
      OtpServiceUnavailableError: {
        description: "The OTP service is currently unavailable.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "OTP service is temporarily unavailable.",
                },
                statusCode: {
                  type: "integer",
                  example: 503,
                },
              },
            },
          },
        },
      },

      NotFoundError: {
        description: "The requested resource was not found.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      OtpSentSuccessBody: {
        // Skema untuk respons sukses pengiriman OTP
        type: "object",
        properties: {
          status: { type: "string", example: "otp_sent_sms" },
          message: {
            type: "string",
            example: "OTP has been sent to +62812XXXX7890 via SMS.",
          },
          otpSessionId: {
            type: "string",
            example: "otp_sess_abcdef123456",
            description:
              "A unique session ID for this OTP attempt, to be used in verification.",
          },
          expiresInSeconds: {
            type: "integer",
            example: 300,
            description: "Approximate time in seconds until the OTP expires.",
          },
          nextRetryAllowedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            description:
              "Timestamp when the next OTP request for this recipient/purpose might be allowed.",
          },
        },
      },
      OtpVerifySuccessBody: {
        // Skema untuk respons sukses verifikasi OTP
        type: "object",
        properties: {
          verified: { type: "boolean", example: true },
          message: { type: "string", example: "OTP verified successfully." },
          accessToken: { type: "string", nullable: true }, // Jika bagian dari login
          refreshToken: { type: "string", nullable: true },
        },
      },
      OtpVerifyFailedBody: {
        // Skema untuk respons gagal verifikasi OTP
        type: "object",
        properties: {
          verified: { type: "boolean", example: false },
          error: { type: "string", example: "invalid_otp_code" },
          message: {
            type: "string",
            example: "The OTP code provided is invalid or has expired.",
          },
          attemptsRemaining: { type: "integer", nullable: true },
        },
      },

      OtpVerifySuccessResponse: {
        description: "OTP was successfully verified.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                accessToken: {
                  type: "string",
                },
                refreshToken: {
                  type: ["string", "null"],
                },
                message: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      OtpVerifyFailedResponse: {
        description: "OTP verification failed due to invalid or expired code.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Invalid or expired OTP code.",
                },
                statusCode: {
                  type: "integer",
                  example: 400,
                },
              },
            },
          },
        },
      },
      HybridEncryptSuccess: {
        description: "Data successfully encrypted using the hybrid scheme.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                ciphertext: {
                  type: "string",
                  example: "base64encodedciphertext==",
                },
                encapsulatedKey: {
                  type: "string",
                  example: "base64encodedKey==",
                },
                nonce: { type: "string", example: "base64encodedNonce==" },
                tag: { type: "string", example: "base64encodedTag==" },
              },
            },
          },
        },
      },
      HybridDecryptSuccess: {
        description: "Data successfully decrypted using the hybrid scheme.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                plaintext: {
                  type: "string",
                  example: "Hello, post-quantum world!",
                },
              },
            },
          },
        },
      },
      // InvalidInputError: {
      //   description: "Invalid input provided.",
      //   content: {
      //     "application/json": {
      //       schema: {
      //         type: "object",
      //         properties: {
      //           error: { type: "string", example: "Invalid key format." },
      //           statusCode: { type: "integer", example: 400 },
      //         },
      //       },
      //     },
      //   },
      // },

      DecryptionError: {
        // Dari definisi sebelumnya, masih relevan
        description:
          "Invalid input, unsupported algorithm, or decryption failure (e.g., tag mismatch)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
    securitySchemes: {
      // Penting untuk endpoint yang memerlukan autentikasi
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT", // Atau format token lain yang Anda gunakan
      },
    },
  },
};
