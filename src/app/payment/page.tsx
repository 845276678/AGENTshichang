'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Smartphone, Shield } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'alipay',
    name: '支付宝',
    icon: <Smartphone className="h-6 w-6" />,
    description: '使用支付宝快速支付',
    available: true,
  },
  {
    id: 'wechat',
    name: '微信支付',
    icon: <Smartphone className="h-6 w-6" />,
    description: '使用微信支付安全便捷',
    available: true,
  },
  {
    id: 'card',
    name: '银行卡',
    icon: <CreditCard className="h-6 w-6" />,
    description: '支持主流银行卡支付',
    available: false,
  },
];

const creditPackages = [
  { credits: 1000, price: 10, bonus: 0 },
  { credits: 5000, price: 45, bonus: 500 },
  { credits: 10000, price: 85, bonus: 1500 },
  { credits: 50000, price: 400, bonus: 10000 },
];

export default function PaymentPage() {
  const [selectedPackage, setSelectedPackage] = useState(creditPackages[1]);
  const [selectedMethod, setSelectedMethod] = useState('alipay');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            积分充值
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            选择合适的积分套餐，享受更多AI服务
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 套餐选择 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              选择套餐
            </h2>
            <div className="grid gap-4">
              {creditPackages.map((pkg) => (
                <motion.button
                  key={pkg.credits}
                  onClick={() => setSelectedPackage(pkg)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedPackage.credits === pkg.credits
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {pkg.credits.toLocaleString()} 积分
                        {pkg.bonus > 0 && (
                          <span className="ml-2 text-sm text-green-600">
                            +{pkg.bonus.toLocaleString()} 赠送
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        实际获得 {(pkg.credits + pkg.bonus).toLocaleString()} 积分
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ¥{pkg.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(pkg.price / (pkg.credits + pkg.bonus) * 1000).toFixed(1)}¥/千积分
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 支付方式 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              支付方式
            </h2>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => method.available && setSelectedMethod(method.id)}
                  disabled={!method.available}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : method.available
                      ? 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      : 'border-gray-200 opacity-50 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600 dark:text-blue-400">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                        {!method.available && ' (即将开放)'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 订单详情 */}
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                订单详情
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">基础积分</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedPackage.credits.toLocaleString()}
                  </span>
                </div>
                {selectedPackage.bonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">赠送积分</span>
                    <span className="text-green-600">
                      +{selectedPackage.bonus.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 dark:border-gray-600">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-900 dark:text-white">总计</span>
                    <span className="text-gray-900 dark:text-white">
                      {(selectedPackage.credits + selectedPackage.bonus).toLocaleString()} 积分
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900 dark:text-white">支付金额</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      ¥{selectedPackage.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 支付按钮 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Wallet className="h-5 w-5" />
              <span>立即支付 ¥{selectedPackage.price}</span>
            </motion.button>

            {/* 安全提示 */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="h-4 w-4" />
              <span>支付过程采用SSL加密，确保交易安全</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}