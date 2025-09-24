'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { cn } from '@/lib/utils';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordFormData) => Promise<void>;
  onBackToLogin?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  onBackToLogin,
  isLoading = false,
  className,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const watchedEmail = watch('email');
  const isFormLoading = isLoading || isSubmitting;

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      
      await onSubmit?.(data);
      
      setSubmitSuccess(true);
      startResendCountdown();
    } catch (error) {
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : '发送重置邮件失败，请稍后重试'
      );
    }
  };

  const startResendCountdown = () => {
    setResendCountdown(60);
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendEmail = async () => {
    if (resendCountdown > 0 || isFormLoading || !watchedEmail) {return;}
    
    try {
      setSubmitError(null);
      await onSubmit?.({ email: watchedEmail });
      startResendCountdown();
    } catch (error) {
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : '重发邮件失败，请稍后重试'
      );
    }
  };

  const handleBackToLogin = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
    onBackToLogin?.();
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
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
        >
          <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          {submitSuccess ? '邮件已发送' : '重置密码'}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-2 text-gray-600 dark:text-gray-400"
        >
          {submitSuccess 
            ? '我们已向您的邮箱发送了重置密码的链接'
            : '请输入您的邮箱地址，我们将发送重置密码的链接'
          }
        </motion.p>
      </div>

      {!submitSuccess ? (
        /* Form */
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          {/* Email Field */}
          <FormField
            {...register('email')}
            label="邮箱地址"
            type="email"
            placeholder="请输入您注册时使用的邮箱地址"
            error={errors.email?.message}
            leftIcon={<Mail className="h-4 w-4" />}
            disabled={isFormLoading}
            autoComplete="email"
            autoFocus
          />

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
                发送中...
              </div>
            ) : (
              '发送重置链接'
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
        </motion.form>
      ) : (
        /* Success State */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* Success Message */}
          <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">邮件发送成功</p>
              <p className="text-sm">请检查您的邮箱并点击重置链接</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
              接下来该怎么做？
            </h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• 检查您的邮箱（包括垃圾邮件文件夹）</li>
              <li>• 点击邮件中的重置密码链接</li>
              <li>• 设置新的密码</li>
              <li>• 使用新密码登录您的账户</li>
            </ul>
          </div>

          {/* Resend Email */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              没有收到邮件？
            </p>
            <button
              onClick={handleResendEmail}
              disabled={resendCountdown > 0 || isFormLoading}
              className={cn(
                'mt-1 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {resendCountdown > 0 ? (
                <span className="flex items-center justify-center">
                  <Clock className="mr-1 h-3 w-3" />
                  重新发送 ({resendCountdown}s)
                </span>
              ) : (
                '重新发送邮件'
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Back to Login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <button
          onClick={handleBackToLogin}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          返回登录
        </button>
      </motion.div>

      {/* Additional Help */}
      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
            需要帮助？
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            如果您在5分钟内没有收到邮件，请{' '}
            <Link
              href="/contact"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              联系我们的客服团队
            </Link>
            ，我们将为您提供帮助。
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};