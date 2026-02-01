// Email validation regex - RFC 5322 simplified
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation - minimum 8 chars, at least one uppercase, one lowercase, one number, one special character
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// Name validation - at least 2 characters, only letters and spaces
export const NAME_REGEX = /^[a-zA-Z\s]{2,}$/;

export interface ValidationRules {
  email: {
    pattern: RegExp;
    message: string;
  };
  password: {
    pattern: RegExp;
    message: string;
    minLength: number;
  };
  name: {
    pattern: RegExp;
    message: string;
  };
}

export const VALIDATION_RULES: ValidationRules = {
  email: {
    pattern: EMAIL_REGEX,
    message: "Please enter a valid email address",
  },
  password: {
    pattern: PASSWORD_REGEX,
    message:
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
    minLength: 8,
  },
  name: {
    pattern: NAME_REGEX,
    message: "Name must be at least 2 characters with only letters and spaces",
  },
};

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.email.pattern.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  return VALIDATION_RULES.password.pattern.test(password);
};

export const validateName = (name: string): boolean => {
  return VALIDATION_RULES.name.pattern.test(name.trim());
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword && password.length > 0;
};

export const getPasswordValidationErrors = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("At least 8 characters");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("At least one number");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("At least one special character (!@#$%^&*)");
  }

  return errors;
};
