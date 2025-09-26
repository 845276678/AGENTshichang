'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, User, AlertTriangle } from 'lucide-react';

const sections = [
  {
    id: 'introduction',
    title: '1. 引言',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'acceptance',
    title: '2. 接受条款',
    icon: <User className="h-5 w-5" />,
  },
  {
    id: 'services',
    title: '3. 服务说明',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'user-obligations',
    title: '4. 用户义务',
    icon: <User className="h-5 w-5" />,
  },
  {
    id: 'intellectual-property',
    title: '5. 知识产权',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'liability',
    title: '6. 责任限制',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    id: 'termination',
    title: '7. 终止条款',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: 'changes',
    title: '8. 条款变更',
    icon: <FileText className="h-5 w-5" />,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            服务条款
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            最后更新：2024年1月1日
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* 导航侧边栏 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <nav className="sticky top-4 space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center space-x-3 rounded-lg px-4 py-3 text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-gray-400">{section.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {section.title}
                  </span>
                </a>
              ))}
            </nav>
          </motion.div>

          {/* 主要内容 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
              <div className="prose prose-gray max-w-none dark:prose-invert">
                <section id="introduction" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    1. 引言
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    欢迎使用创意竞价平台（以下简称"本平台"或"我们"）。本服务条款（"条款"）适用于您对本平台提供的所有服务的访问和使用。
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    通过访问或使用我们的服务，您同意受这些条款的约束。如果您不同意这些条款，请不要使用我们的服务。
                  </p>
                </section>

                <section id="acceptance" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    2. 接受条款
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    您必须年满18岁或在您所在司法管辖区的法定成年年龄才能使用本服务。通过使用本服务，您声明并保证您有权、权限和能力签订这些条款并遵守其所有条款。
                  </p>
                </section>

                <section id="services" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    3. 服务说明
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    本平台提供以下服务：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                    <li>创意提交和展示平台</li>
                    <li>AI驱动的创意分析和评估服务</li>
                    <li>创意竞价和交易系统</li>
                    <li>商业计划生成工具</li>
                    <li>用户社区和交流功能</li>
                  </ul>
                </section>

                <section id="user-obligations" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    4. 用户义务
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    作为本平台的用户，您同意：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                    <li>提供准确、完整和最新的注册信息</li>
                    <li>保护您的账户密码和安全信息</li>
                    <li>不进行任何非法、有害或违反道德的活动</li>
                    <li>尊重其他用户的权利和知识产权</li>
                    <li>不传播垃圾信息、恶意软件或有害内容</li>
                    <li>遵守所有适用的法律法规</li>
                  </ul>
                </section>

                <section id="intellectual-property" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    5. 知识产权
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    您上传到平台的创意内容的知识产权归您所有。但是，通过上传内容，您授予我们在平台上使用、展示和分析该内容的非排他性许可。
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    平台本身的技术、软件、设计和其他元素的知识产权归我们所有，受相关知识产权法保护。
                  </p>
                </section>

                <section id="liability" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    6. 责任限制
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    我们努力提供高质量的服务，但不对服务的连续性、准确性或完整性做出保证。在法律允许的最大范围内，我们不承担因使用本服务而导致的任何直接、间接、偶然或后果性损害的责任。
                  </p>
                </section>

                <section id="termination" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    7. 终止条款
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    您可以随时删除您的账户来终止使用我们的服务。我们也保留在您违反这些条款时暂停或终止您的账户的权利。
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    终止后，您对我们服务的访问权限将立即停止，但本条款中关于责任限制、知识产权等条款将继续有效。
                  </p>
                </section>

                <section id="changes" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    8. 条款变更
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    我们可能会不时更新这些条款。重大变更将通过平台通知或电子邮件告知您。继续使用服务即表示您接受修订后的条款。
                  </p>
                </section>

                <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    联系我们
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    如果您对这些服务条款有任何疑问，请通过以下方式联系我们：
                  </p>
                  <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                    <p>邮箱：legal@creativebidding.com</p>
                    <p>电话：400-123-4567</p>
                    <p>地址：北京市朝阳区创意大厦123号</p>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}