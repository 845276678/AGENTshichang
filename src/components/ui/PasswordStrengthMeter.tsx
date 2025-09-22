'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export interface PasswordStrengthMeterProps {
  password: string;
  showDetails?: boolean;
  className?: string;
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  let score = 0;
  let feedback: string[] = [];

  // Calculate score based on checks passed
  if (passedChecks >= 5) {score = 4;}
  else if (passedChecks >= 4) {score = 3;}
  else if (passedChecks >= 3) {score = 2;}
  else if (passedChecks >= 2) {score = 1;}
  else {score = 0;}

  // Additional checks for common patterns
  if (password.length > 0) {
    // Check for common weak patterns
    const commonPatterns = [
      /^(.)\1{7,}$/, // Repeated characters
      /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde)/, // Sequential
      /^(password|123456|qwerty|admin|root)/i, // Common passwords
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      score = Math.max(0, score - 1);
      feedback.push('避免使用常见密码模式');
    }

    // Length bonus/penalty
    if (password.length >= 12) {
      score = Math.min(4, score + 1);
    } else if (password.length < 6) {
      score = Math.max(0, score - 1);
    }
  }

  // Generate feedback
  if (!checks.length) {feedback.push('密码至少需要8个字符');}
  if (!checks.lowercase) {feedback.push('需要小写字母');}
  if (!checks.uppercase) {feedback.push('需要大写字母');}
  if (!checks.number) {feedback.push('需要数字');}
  if (!checks.special) {feedback.push('需要特殊字符');}

  if (score >= 4) {
    feedback = ['密码强度很高'];
  } else if (score >= 3) {
    feedback = ['密码强度良好'];
  } else if (score >= 2) {
    feedback = ['密码强度中等'];
  } else if (score >= 1) {
    feedback = ['密码强度较弱'];
  } else if (password.length > 0) {
    feedback = ['密码强度很弱'];
  }

  return { score, feedback, checks };
};

const getStrengthConfig = (score: number) => {
  switch (score) {
    case 0:
      return {
        label: '很弱',
        color: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400',
        width: '20%',
      };
    case 1:
      return {
        label: '较弱',
        color: 'bg-orange-500',
        textColor: 'text-orange-600 dark:text-orange-400',
        width: '40%',
      };
    case 2:
      return {
        label: '中等',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        width: '60%',
      };
    case 3:
      return {
        label: '良好',
        color: 'bg-blue-500',
        textColor: 'text-blue-600 dark:text-blue-400',
        width: '80%',
      };
    case 4:
      return {
        label: '很强',
        color: 'bg-green-500',
        textColor: 'text-green-600 dark:text-green-400',
        width: '100%',
      };
    default:
      return {
        label: '',
        color: 'bg-gray-300',
        textColor: 'text-gray-500',
        width: '0%',
      };
  }
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showDetails = true,
  className,
}) => {
  const strength = calculatePasswordStrength(password);
  const config = getStrengthConfig(strength.score);

  if (!password) {return null;}

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn('space-y-3', className)}
    >
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            密码强度
          </span>
          <span className={cn('text-sm font-medium', config.textColor)}>
            {config.label}
          </span>
        </div>
        
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: config.width }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn('h-full rounded-full transition-colors', config.color)}
          />
        </div>
      </div>

      {/* Detailed Requirements */}
      {showDetails && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            密码要求：
          </h4>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {[
              { key: 'length', label: '至少8个字符' },
              { key: 'lowercase', label: '包含小写字母' },
              { key: 'uppercase', label: '包含大写字母' },
              { key: 'number', label: '包含数字' },
              { key: 'special', label: '包含特殊字符' },
            ].map(({ key, label }) => {
              const isValid = strength.checks[key as keyof typeof strength.checks];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-full text-xs',
                      isValid
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    )}
                  >
                    {isValid ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      isValid
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {strength.feedback.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
        >
          <ul className="space-y-1">
            {strength.feedback.map((message, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                • {message}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};