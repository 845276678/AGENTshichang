'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { SocialLoginButtons } from './SocialLoginButtons';
import { cn } from '@/lib/utils';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少需要6个字符'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void>;
  onSocialLogin?: (provider: string) => void;
  onForgotPassword?: () => void;
  isLoading?: boolean;
  socialLoading?: string | null;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSocialLogin,
  onForgotPassword,
  isLoading = false,
  socialLoading = null,
  className,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const isFormLoading = isLoading || isSubmitting;

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      
      await onSubmit?.(data);
      
      setSubmitSuccess(true);
      // Don't reset form on success for login
    } catch (error) {
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : '登录失败，请检查您的邮箱和密码'
      );
    }
  };

  const handleSocialLoginClick = (provider: string) => {
    setSubmitError(null);
    onSocialLogin?.(provider);
  };

  const handleForgotPasswordClick = () => {
    setSubmitError(null);
    onForgotPassword?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full max-w-md space-y-6', className)}
    >
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          欢迎回来
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 text-gray-600 dark:text-gray-400"
        >
          登录您的账户以继续
        </motion.p>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        {/* Email Field */}
        <FormField
          {...register('email')}
          label="邮箱地址"
          type="email"
          placeholder="请输入您的邮箱地址"
          error={errors.email?.message || undefined}
          leftIcon={<Mail className="h-4 w-4" />}
          disabled={isFormLoading}
          autoComplete="email"
        />

        {/* Password Field */}
        <FormField
          {...register('password')}
          label="密码"
          type="password"
          placeholder="请输入您的密码"
          error={errors.password?.message || undefined}
          leftIcon={<Lock className="h-4 w-4" />}
          showPasswordToggle
          isPassword
          disabled={isFormLoading}
          autoComplete="current-password"
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              {...register('rememberMe')}
              type="checkbox"
              disabled={isFormLoading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              记住我
            </span>
          </label>

          <button
            type="button"
            onClick={handleForgotPasswordClick}
            disabled={isFormLoading}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
          >
            忘记密码？
          </button>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isFormLoading}
          whileHover={!isFormLoading ? { scale: 1.02 } : {}}
          whileTap={!isFormLoading ? { scale: 0.98 } : {}}
          className={cn(
            'flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200',
            'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'dark:focus:ring-offset-gray-900',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {isFormLoading ? (
            <div className="flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2 h-4 w-4"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </motion.div>
              登录中...
            </div>
          ) : (
            '登录'
          )}
        </motion.button>

        {/* Error Message */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{submitError}</span>
          </motion.div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          >
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">登录成功！正在跳转...</span>
          </motion.div>
        )}
      </motion.form>

      {/* Social Login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SocialLoginButtons
          onSocialLogin={handleSocialLoginClick}
          disabled={isFormLoading}
          isLoading={socialLoading}
        />
      </motion.div>

      {/* Sign Up Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          还没有账户？{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            立即注册
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};