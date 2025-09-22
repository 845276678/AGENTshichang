import bcrypt from 'bcryptjs';

// Default salt rounds (10 is a good balance between security and performance)
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

/**
 * Hash a password using bcrypt
 * @param password - The plain text password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param password - The plain text password
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise<boolean> - True if passwords match, false otherwise
 */
export async function comparePassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Failed to compare passwords');
  }
}

/**
 * Check password strength
 * @param password - The password to check
 * @returns Object with strength details
 */
export interface PasswordStrength {
  score: number; // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[];
  isStrong: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  if (password.length >= 12) {
    score++;
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Password should contain lowercase letters');
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Password should contain uppercase letters');
  }

  // Check for numbers
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Password should contain numbers');
  }

  // Check for special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
    score++;
  } else {
    feedback.push('Password should contain special characters');
  }

  // Check for common patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters (aaa, 111)
    /123456/, // Sequential numbers
    /abcdef/, // Sequential letters
    /password/i, // Contains "password"
    /admin/i, // Contains "admin"
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Avoid common patterns and dictionary words');
      break;
    }
  }

  // Normalize score to 0-4 range
  score = Math.min(4, Math.max(0, score - 2));

  // Determine if password is strong enough
  const isStrong = score >= 3;

  if (feedback.length === 0 && isStrong) {
    feedback.push('Strong password!');
  }

  return {
    score,
    feedback,
    isStrong
  };
}

/**
 * Generate a random password
 * @param length - Length of the password (default: 12)
 * @param options - Options for password generation
 * @returns string - Generated password
 */
export interface PasswordGenerationOptions {
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSpecialChars?: boolean;
  excludeSimilar?: boolean; // Exclude similar characters like 0, O, l, 1
}

export function generatePassword(
  length: number = 12,
  options: PasswordGenerationOptions = {}
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = true,
    excludeSimilar = true
  } = options;

  let chars = '';
  
  if (includeLowercase) {
    chars += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  }
  
  if (includeUppercase) {
    chars += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  
  if (includeNumbers) {
    chars += excludeSimilar ? '23456789' : '0123456789';
  }
  
  if (includeSpecialChars) {
    chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  if (chars === '') {
    throw new Error('At least one character type must be enabled');
  }

  let password = '';
  const crypto = require('crypto');
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars[randomIndex];
  }

  return password;
}

/**
 * Validate password meets minimum requirements
 * @param password - Password to validate
 * @returns Object with validation result
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Hash multiple passwords in batch (useful for seeding data)
 * @param passwords - Array of passwords to hash
 * @returns Promise<string[]> - Array of hashed passwords
 */
export async function hashPasswordsBatch(passwords: string[]): Promise<string[]> {
  const hashPromises = passwords.map(password => hashPassword(password));
  return Promise.all(hashPromises);
}

/**
 * Check if a password needs to be rehashed (useful after changing salt rounds)
 * @param hashedPassword - The hashed password to check
 * @returns boolean - True if password needs rehashing
 */
export function needsRehash(hashedPassword: string): boolean {
  try {
    const rounds = bcrypt.getRounds(hashedPassword);
    return rounds !== SALT_ROUNDS;
  } catch (error) {
    // If we can't determine rounds, assume it needs rehashing
    return true;
  }
}