'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, Lock, User, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { SocialLoginButtons } from './SocialLoginButtons';
import { cn } from '@/lib/utils';

// Validation schema
const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, '请输入您的姓名')
    .min(2, '姓名至少需要2个字符')
    .max(50, '姓名不能超过50个字符'),
  email: z
    .string()
    .min(1, '请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^1[3-9]\d{9}$/.test(val),
      '请输入有效的手机号码'
    ),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(8, '密码至少需要8个字符')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/\d/, '密码必须包含数字')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, '密码必须包含特殊字符'),
  confirmPassword: z
    .string()
    .min(1, '请确认您的密码'),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, '请同意服务条款和隐私政策'),
  subscribeToNewsletter: z.boolean().default(false),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }
);

type RegisterFormData = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => Promise<void>;
  onSocialLogin?: (provider: string) => void;
  isLoading?: boolean;
  socialLoading?: string | null;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSocialLogin,
  isLoading = false,
  socialLoading = null,
  className,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      subscribeToNewsletter: false,
    },
  });

  const watchedPassword = watch('password');
  const isFormLoading = isLoading || isSubmitting;

  const handleFormSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      
      await onSubmit?.(data);
      
      setSubmitSuccess(true);
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : '注册失败，请稍后重试'
      );
    }
  };

  const handleSocialLoginClick = (provider: string) => {
    setSubmitError(null);
    onSocialLogin?.(provider);
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
          创建账户
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 text-gray-600 dark:text-gray-400"
        >
          加入AI Agent市场，开始您的智能之旅
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
        {/* Full Name Field */}
        <FormField
          {...register('fullName')}
          label="姓名"
          type="text"
          placeholder="请输入您的姓名"
          error={errors.fullName?.message}
          leftIcon={<User className="h-4 w-4" />}
          disabled={isFormLoading}
          autoComplete="name"
        />

        {/* Email Field */}
        <FormField
          {...register('email')}
          label="邮箱地址"
          type="email"
          placeholder="请输入您的邮箱地址"
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          disabled={isFormLoading}
          autoComplete="email"
        />

        {/* Phone Field (Optional) */}
        <FormField
          {...register('phone')}
          label="手机号码（可选）"
          type="tel"
          placeholder="请输入您的手机号码"
          error={errors.phone?.message}
          leftIcon={<Phone className="h-4 w-4" />}
          disabled={isFormLoading}
          autoComplete="tel"
          hint="填写手机号可获得更好的账户安全保护"
        />

        {/* Password Field */}
        <FormField
          {...register('password')}
          label="密码"
          type="password"
          placeholder="请输入您的密码"
          error={errors.password?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          showPasswordToggle
          isPassword
          disabled={isFormLoading}
          autoComplete="new-password"
          onFocus={() => setShowPasswordStrength(true)}
        />

        {/* Password Strength Meter */}
        {showPasswordStrength && watchedPassword && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PasswordStrengthMeter password={watchedPassword} />
          </motion.div>
        )}

        {/* Confirm Password Field */}
        <FormField
          {...register('confirmPassword')}
          label="确认密码"
          type="password"
          placeholder="请再次输入您的密码"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          showPasswordToggle
          isPassword
          disabled={isFormLoading}
          autoComplete="new-password"
        />

        {/* Terms and Newsletter */}
        <div className="space-y-3">
          {/* Terms Agreement */}
          <label className="flex items-start space-x-3">
            <input
              {...register('agreeToTerms')}
              type="checkbox"
              disabled={isFormLoading}
              className={cn(
                'mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                'dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-600',
                errors.agreeToTerms && 'border-red-500'
              )}
            />
            <div className="flex-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                我同意{' '}
                <Link
                  href="/terms"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  target="_blank"
                >
                  服务条款
                </Link>{' '}
                和{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  target="_blank"
                >
                  隐私政策
                </Link>
              </span>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>
          </label>

          {/* Newsletter Subscription */}
          <label className="flex items-center space-x-3">
            <input
              {...register('subscribeToNewsletter')}
              type="checkbox"
              disabled={isFormLoading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              订阅我们的新闻通讯，获取最新产品更新和优惠信息
            </span>
          </label>
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
              注册中...
            </div>
          ) : (
            '创建账户'
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
            <span className="text-sm">注册成功！请查看您的邮箱激活账户</span>
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

      {/* Login Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          已有账户？{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            立即登录
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};