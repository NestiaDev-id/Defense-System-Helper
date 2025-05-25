// Regex Definitions
export const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
export const nameRegex = /^[a-zA-Z\s]+$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^(\+62|62|08)[0-9]{8,13}$/;
export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const nikRegex = /^\d{16}$/;
export const otpRegex = /^\d{6}$/;
export const creditCardRegex = /^\d{16}$/;
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const npwpRegex = /^\d{15}$/;
export const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const hexColorRegex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
export const urlRegex = /^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/([\w/_.]*)?)?$/;
export const plateNumberRegex = /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/;
export const postalCodeRegex = /^\d{5}$/;
export const ipV4Regex =
  /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){2}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
export const timeHHMMRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const pinRegex = /^\d{4,6}$/;
export const coordinateRegex = /^-?\d{1,3}\.\d+,\s?-?\d{1,3}\.\d+$/;
export const fileExtensionRegex = /\.(jpg|jpeg|png|gif|pdf)$/i;
export const base64Regex =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
export const hexRegex = /^[0-9a-fA-F]+$/;

// Validation Result Type
interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Reusable Validator Factory
function makeValidator(regex: RegExp, errorMessage: string) {
  return function (input: string): ValidationResult {
    if (!input) return { isValid: false, message: "Input is required." };
    if (!regex.test(input)) return { isValid: false, message: errorMessage };
    return { isValid: true };
  };
}

// Specific Validators
export const validateUsername = makeValidator(
  usernameRegex,
  "Username must be 3-20 characters long and can only contain alphanumeric characters and underscores."
);

export function validatePassword(password: string): ValidationResult {
  if (!password) return { isValid: false, message: "Password is required." };
  if (password.length < 8)
    return {
      isValid: false,
      message: "Password must be at least 8 characters long.",
    };
  if (password.length > 30)
    return {
      isValid: false,
      message: "Password must be no more than 30 characters long.",
    };
  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    };
  }
  return { isValid: true };
}

export function validateExactLength(
  input: string,
  length: number,
  fieldName: string = "Input"
): ValidationResult {
  if (!input) return { isValid: false, message: `${fieldName} is required.` };
  if (input.length !== length) {
    return {
      isValid: false,
      message: `${fieldName} must be exactly ${length} characters long.`,
    };
  }
  return { isValid: true };
}

export const validateName = makeValidator(
  nameRegex,
  "Name must contain only letters and spaces."
);
export const validateEmail = makeValidator(emailRegex, "Invalid email format.");
export const validatePhone = makeValidator(
  phoneRegex,
  "Invalid Indonesian phone number format."
);
export const validateDate = makeValidator(
  dateRegex,
  "Date must be in YYYY-MM-DD format."
);
export const validateNIK = makeValidator(nikRegex, "NIK must be 16 digits.");
export const validateOTP = makeValidator(otpRegex, "OTP must be 6 digits.");
export const validateCreditCard = makeValidator(
  creditCardRegex,
  "Credit card must be 16 digits."
);
export const validateSlug = makeValidator(
  slugRegex,
  "Slug must contain only lowercase letters, numbers, and hyphens."
);
export const validateNPWP = makeValidator(npwpRegex, "NPWP must be 15 digits.");
export const validateUUID = makeValidator(uuidRegex, "Invalid UUID format.");
export const validateHexColor = makeValidator(
  hexColorRegex,
  "Invalid HEX color code."
);
export const validateURL = makeValidator(urlRegex, "Invalid URL format.");
export const validatePlateNumber = makeValidator(
  plateNumberRegex,
  "Invalid Indonesian plate number."
);
export const validatePostalCode = makeValidator(
  postalCodeRegex,
  "Postal code must be 5 digits."
);
export const validateIPv4 = makeValidator(ipV4Regex, "Invalid IPv4 address.");
export const validateTimeHHMM = makeValidator(
  timeHHMMRegex,
  "Time must be in HH:MM format."
);
export const validatePIN = makeValidator(
  pinRegex,
  "PIN must be 4 to 6 digits."
);
export const validateCoordinate = makeValidator(
  coordinateRegex,
  "Coordinates must be in 'lat, long' decimal format."
);
export const validateFileExtension = makeValidator(
  fileExtensionRegex,
  "Unsupported file type."
);

export const validateBase64 = makeValidator(
  base64Regex,
  "Input must be a valid Base64 string."
);
export const validateHex = makeValidator(
  hexRegex,
  "Input must be a valid hexadecimal string."
);
