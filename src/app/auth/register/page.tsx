'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const dynamic = 'force-dynamic'

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Get redirect URL from search params
  const redirectTo = searchParams?.get('redirect') || '/';

  const handleRegister = async (data: any) => {
    setIsLoading(true);
    try {
      // 调用真实注册API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          username: data.username || data.email.split('@')[0], // 如果没有用户名，使用邮箱前缀
          password: data.password,
          firstName: data.firstName || '',
          lastName: data.lastName || ''
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || '注册失败');
      }

      if (!result.success) {
        throw new Error(result.message || '注册失败');
      }

      // 保存认证信息
      const { user, token, refreshToken } = result.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_data', JSON.stringify(user));

      // 跳转到首页并显示成功消息
      window.location.href = '/?message=registration-success';
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : '注册失败，请检查您的信息并重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    try {
      // TODO: Implement actual social registration logic here
      console.log('Social registration with:', provider);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success - redirect to dashboard or original destination
      router.push(redirectTo);
    } catch (error) {
      console.error('Social registration error:', error);
      throw new Error(`${provider} 注册失败，请稍后重试`);
    } finally {
      setSocialLoading(null);
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <RegisterForm
                onSubmit={handleRegister}
                onSocialLogin={handleSocialLogin}
                isLoading={isLoading}
                socialLoading={socialLoading}
              />
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 space-y-4"
            >
              {/* Features */}
              <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/20">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  加入我们，您将获得：
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <svg className="mr-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    分享创意想法获得积分
                  </li>
                  <li className="flex items-center">
                    <svg className="mr-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    AI竞价师实时评估竞价
                  </li>
                  <li className="flex items-center">
                    <svg className="mr-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    购买精选创意增值方案
                  </li>
                  <li className="flex items-center">
                    <svg className="mr-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    创意生态循环获得收益
                  </li>
                </ul>
              </div>

              {/* Security Notice */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start">
                  <svg className="mr-2 mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      数据安全承诺
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      我们采用银行级加密技术保护您的数据，绝不会向第三方泄露您的个人信息。
                    </p>
                  </div>
                </div>
              </div>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}