'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'login' | 'forgot-password';

export const dynamic = 'force-dynamic'

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn, error } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Get redirect URL from search params
  const redirectTo = searchParams?.get('redirect') || '/';

  const handleLogin = async (data: any) => {
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false
      });

      // 登录成功后跳转
      router.push(redirectTo);
    } catch (error) {
      console.error('Login error:', error);
      // 错误已经在AuthContext中处理，这里不需要额外处理
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    try {
      // TODO: Implement actual social login logic here
      console.log('Social login with:', provider);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success - redirect to dashboard or original destination
      router.push(redirectTo);
    } catch (error) {
      console.error('Social login error:', error);
      throw new Error(`${provider} 登录失败，请稍后重试`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleForgotPassword = async (data: any) => {
    try {
      // TODO: 使用AuthContext的forgotPassword方法
      console.log('Forgot password data:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success is handled by the form component
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error('发送重置邮件失败，请稍后重试');
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSubmit={handleLogin}
            onSocialLogin={handleSocialLogin}
            onForgotPassword={() => handleModeChange('forgot-password')}
            isLoading={isLoggingIn}
            socialLoading={socialLoading}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBackToLogin={() => handleModeChange('login')}
            isLoading={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* Left Side - Background */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden w-1/2 lg:block"
        >
          <AuthBackground />
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12"
        >
          <div className="w-full max-w-md">
            {/* Mobile Background Preview */}
            <div className="mb-8 block lg:hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mx-auto h-32 w-32 overflow-hidden rounded-full"
              >
                <div className="h-full w-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      className="h-12 w-12 text-white/80"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H21ZM19 21H5V3H13V9H19V21Z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Form Container */}
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderForm()}
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              <p>© 2024 创意交易市场. 保留所有权利.</p>
              <div className="mt-2 space-x-4">
                <a
                  href="/privacy"
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  隐私政策
                </a>
                <span>•</span>
                <a
                  href="/terms"
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  服务条款
                </a>
                <span>•</span>
                <a
                  href="/help"
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  帮助中心
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}