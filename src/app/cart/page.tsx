'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  type: 'agent' | 'credits' | 'premium';
}

const initialCartItems: CartItem[] = [
  {
    id: '1',
    name: 'AI创意分析师',
    description: '专业的创意分析和市场调研服务',
    price: 99,
    quantity: 1,
    type: 'agent',
  },
  {
    id: '2',
    name: '5000积分包',
    description: '包含5000积分，可用于AI服务',
    price: 45,
    quantity: 2,
    type: 'credits',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  const updateQuantity = (id: string, change: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            购物车
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {cartItems.length === 0
              ? '您的购物车是空的'
              : `共 ${totalItems} 件商品`
            }
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              购物车是空的
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              去看看有什么好东西吧！
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700"
            >
              开始购物
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* 商品列表 */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-1">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {item.type === 'agent' && 'AI助手'}
                          {item.type === 'credits' && '积分包'}
                          {item.type === 'premium' && '高级服务'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ¥{item.price}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">移除</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 订单摘要 */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  订单摘要
                </h3>

                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        ¥{item.price * item.quantity}
                      </span>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 pt-3 dark:border-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">小计</span>
                      <span className="text-gray-900 dark:text-white">¥{totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">税费</span>
                      <span className="text-gray-900 dark:text-white">¥0</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 dark:border-gray-600">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-gray-900 dark:text-white">总计</span>
                      <span className="text-blue-600 dark:text-blue-400">¥{totalAmount}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>立即结算</span>
                </motion.button>

                <div className="mt-4 text-center">
                  <button className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    继续购物
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}