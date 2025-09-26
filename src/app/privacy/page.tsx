'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Cookie, Mail, Lock } from 'lucide-react';

const sections = [
  {
    id: 'introduction',
    title: '1. 简介',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'collection',
    title: '2. 信息收集',
    icon: <Database className="h-5 w-5" />,
  },
  {
    id: 'usage',
    title: '3. 信息使用',
    icon: <Eye className="h-5 w-5" />,
  },
  {
    id: 'sharing',
    title: '4. 信息共享',
    icon: <Mail className="h-5 w-5" />,
  },
  {
    id: 'security',
    title: '5. 数据安全',
    icon: <Lock className="h-5 w-5" />,
  },
  {
    id: 'cookies',
    title: '6. Cookie政策',
    icon: <Cookie className="h-5 w-5" />,
  },
  {
    id: 'rights',
    title: '7. 您的权利',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'changes',
    title: '8. 政策更新',
    icon: <Eye className="h-5 w-5" />,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            隐私政策
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
                    1. 简介
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    本隐私政策说明了创意竞价平台（"我们"、"本平台"）如何收集、使用、处理和保护您的个人信息。我们承诺保护您的隐私权，并遵守适用的数据保护法律法规。
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    使用我们的服务即表示您同意本政策中描述的数据处理方式。
                  </p>
                </section>

                <section id="collection" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    2. 我们收集的信息
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        您直接提供的信息
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                        <li>注册信息：用户名、邮箱地址、手机号码</li>
                        <li>个人资料：姓名、头像、个人简介</li>
                        <li>创意内容：您上传的创意、想法和相关材料</li>
                        <li>支付信息：支付方式和交易记录</li>
                        <li>通讯记录：与我们的客服或技术支持的沟通</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        自动收集的信息
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                        <li>设备信息：设备类型、操作系统、浏览器类型</li>
                        <li>使用数据：访问时间、页面浏览记录、功能使用情况</li>
                        <li>网络信息：IP地址、网络连接类型</li>
                        <li>位置信息：大致的地理位置（如有权限）</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="usage" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    3. 信息使用方式
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    我们使用收集的信息来：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                    <li>提供和改进我们的服务</li>
                    <li>处理您的交易和支付</li>
                    <li>发送服务相关的通知和更新</li>
                    <li>提供客户支持</li>
                    <li>防止欺诈和确保平台安全</li>
                    <li>分析服务使用情况以优化用户体验</li>
                    <li>遵守法律义务</li>
                  </ul>
                </section>

                <section id="sharing" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    4. 信息共享
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    我们不会出售您的个人信息。我们可能在以下情况下共享您的信息：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                    <li>
                      <strong>服务提供商：</strong>与帮助我们运营平台的第三方服务商（如云服务、支付处理商）
                    </li>
                    <li>
                      <strong>法律要求：</strong>当法律要求或为保护我们的权利时
                    </li>
                    <li>
                      <strong>业务转让：</strong>在合并、收购或资产出售的情况下
                    </li>
                    <li>
                      <strong>经您同意：</strong>在获得您明确同意的其他情况下
                    </li>
                  </ul>
                </section>

                <section id="security" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    5. 数据安全
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    我们采用行业标准的安全措施来保护您的个人信息，包括：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                    <li>SSL/TLS加密传输</li>
                    <li>数据库加密存储</li>
                    <li>访问控制和身份验证</li>
                    <li>定期安全审计和漏洞扫描</li>
                    <li>员工安全培训和保密协议</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                    尽管我们努力保护您的信息，但没有任何传输或存储方法是100%安全的。我们建议您也采取措施保护自己的信息安全。
                  </p>
                </section>

                <section id="cookies" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    6. Cookie和类似技术
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    我们使用Cookie和类似技术来：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                    <li>记住您的登录状态和偏好设置</li>
                    <li>分析网站使用情况</li>
                    <li>提供个性化的内容和功能</li>
                    <li>确保网站安全</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                    您可以通过浏览器设置来管理Cookie偏好，但禁用某些Cookie可能会影响网站功能。
                  </p>
                </section>

                <section id="rights" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    7. 您的权利
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    根据适用的数据保护法律，您享有以下权利：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                    <li><strong>访问权：</strong>查看我们持有的关于您的个人信息</li>
                    <li><strong>更正权：</strong>要求更正不准确或不完整的信息</li>
                    <li><strong>删除权：</strong>要求删除您的个人信息</li>
                    <li><strong>限制权：</strong>限制对您个人信息的处理</li>
                    <li><strong>可携权：</strong>以结构化格式获取您的数据</li>
                    <li><strong>撤回同意：</strong>撤回您之前给予的同意</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                    如需行使这些权利，请通过下面的联系方式联系我们。
                  </p>
                </section>

                <section id="changes" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    8. 政策更新
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    我们可能会不时更新本隐私政策。重大变更将通过平台通知、电子邮件或其他适当方式告知您。我们建议您定期查看本政策以了解最新信息。
                  </p>
                </section>

                <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    联系我们
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
                  </p>
                  <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                    <p>数据保护官邮箱：privacy@creativebidding.com</p>
                    <p>客服电话：400-123-4567</p>
                    <p>通讯地址：北京市朝阳区创意大厦123号</p>
                    <p>工作时间：周一至周五 9:00-18:00</p>
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