'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  isPassword?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  hintClassName?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      isPassword = false,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      hintClassName,
      className,
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const hasError = Boolean(error);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('relative w-full', containerClassName)}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300',
              hasError && 'text-red-600 dark:text-red-400',
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              // Base styles
              'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-500 transition-all duration-200',
              // Dark mode
              'dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400',
              // Focus styles
              'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              'dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
              // Error styles
              hasError &&
                'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20',
              // Focus animation
              isFocused && 'scale-[1.01]',
              // Icon padding
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle) && 'pr-10',
              // Custom styles
              inputClassName,
              className
            )}
            {...props}
          />

          {(rightIcon || showPasswordToggle) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPasswordToggle && isPassword ? (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {(error || hint) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            {error && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm text-red-600 dark:text-red-400',
                  errorClassName
                )}
              >
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {hint && !error && (
              <div
                className={cn(
                  'text-sm text-gray-500 dark:text-gray-400',
                  hintClassName
                )}
              >
                {hint}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }
);

FormField.displayName = 'FormField';