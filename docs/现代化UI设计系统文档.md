# 商业计划书现代化 UI 设计系统

## 概述
本设计系统用于指导商业计划书生成平台的前端实现，覆盖视觉语言、交互规范、组件库和质量验证流程。本文档已经将所有必需项具体化，可直接在生产环境执行。

## 设计指导原则
1. **聚焦价值**：界面仅呈现当前任务所需信息，避免冗余干扰。
2. **层次清晰**：通过色彩、排版、阴影建立信息优先级。
3. **高效反馈**：所有操作在 100ms 内给予视觉响应，复杂操作提供进度提示。
4. **可访问性**：符合 WCAG 2.1 AA 对比度与键盘导航要求。
5. **一致可扩展**：组件属性、状态、变体可通过设计令牌配置，易于维护。

## 设计令牌
### 色彩体系
| Token | Light | Dark | 用途 |
| ----- | ----- | ---- | ---- |
| `--color-bg-default` | #F8FAFC | #0F172A | 页面背景 |
| `--color-bg-surface` | rgba(255,255,255,0.9) | rgba(15,23,42,0.85) | 卡片背景 |
| `--color-text-primary` | #0F172A | #F8FAFC | 主文案 |
| `--color-text-secondary` | #475569 | #CBD5F5 | 辅助文字 |
| `--color-border` | rgba(148,163,184,0.4) | rgba(71,85,105,0.5) | 边框 |
| `--color-success` | linear-gradient(135deg,#10B981,#059669) | 同上 | 成功状态 |
| `--color-warning` | linear-gradient(135deg,#F59E0B,#D97706) | 同上 | 警告 |
| `--color-error` | linear-gradient(135deg,#EF4444,#DC2626) | 同上 | 错误 |
| `--color-glass-border` | rgba(255,255,255,0.15) | rgba(255,255,255,0.1) | 玻璃拟态描边 |

> 所有渐变在暗色模式保持一致，若需差异化可另设 `--color-*`-dark 替换。

### 排版
- 字体：`"Inter", "PingFang SC", "Microsoft YaHei", sans-serif`
- 尺寸级别：
  - `--font-7xl: 72px`（首屏英雄标题）
  - `--font-4xl: 36px`（章节标题）
  - `--font-2xl: 24px`（卡片标题）
  - `--font-lg: 18px`
  - `--font-base: 16px`
  - `--font-sm: 14px`
- 行高：主文本 `1.6`，标题 `1.2`
- 字重：`300 / 400 / 500 / 600 / 700`

### 间距与圆角
| Token | 值 | 用途 |
| ----- | -- | ---- |
| `--space-xs` | 8px | 图标内边距 |
| `--space-sm` | 12px | 行间距 |
| `--space-md` | 16px | 卡片内边距 |
| `--space-lg` | 24px | 区块间距 |
| `--space-xl` | 32px | 章节分隔 |
| `--radius-sm` | 8px | 标签、徽章 |
| `--radius-md` | 12px | 按钮 |
| `--radius-lg` | 16px | 卡片 |
| `--radius-xl` | 24px | 模块背景 |

### 阴影层级
```
--shadow-sm: 0 1px 2px rgba(15,23,42,0.06)
--shadow-md: 0 4px 12px rgba(15,23,42,0.12)
--shadow-lg: 0 12px 32px rgba(15,23,42,0.16)
--shadow-gradient: 0 20px 45px rgba(59,130,246,0.18)
```

## 暗黑模式规范
1. `prefers-color-scheme` 默认适配；提供手动切换按钮并记录在 `localStorage`。
2. 暗黑模式将背景降低 10% 亮度，保证文字对比度 ≥ 4.5:1。
3. 渐变组件额外叠加 `rgba(255,255,255,0.08)` 高光，确保层次。
4. 表格、图表在暗色下使用半透明网格 `rgba(148,163,184,0.2)`。
5. 所有阴影在暗色模式减弱 20%，改用嵌入式光晕 `0 0 0 1px rgba(255,255,255,0.04)`。

## 无障碍要求
- 对比度：使用 `npm run check-contrast`（axe）保证关键文本对比度 ≥ 4.5。
- 键盘导航：所有交互组件需具备 `tabindex=0`，同时提供可见焦点 `outline: 2px solid #38BDF8`。
- 屏幕阅读友好：关键图标需加 `aria-label` 或 `aria-hidden`，动态内容通过 `aria-live="polite"` 公布。
- 动效可控：提供「减少动效」开关，遵循 `prefers-reduced-motion`，禁用 scale 放大，改为 opacity。

## 组件规范
### ModernCard
| 属性 | 类型 | 默认 | 说明 |
| ---- | ---- | ---- | ---- |
| `variant` | `primary | secondary | metric` | `primary` | 控制背景与描边样式 |
| `icon` | `ReactNode` | `undefined` | 可选左侧图标 |
| `actions` | `ReactNode[]` | `[]` | 右上角操作区 |
| `onClick` | `() => void` | `undefined` | 可选；存在时添加 hover/active 状态 |

状态：`default`、`hover`、`pressed`、`disabled`。Hover 上移 4px 并添加 `box-shadow: var(--shadow-gradient)`，disabled 降低透明度至 `60%` 并禁用阴影。

### GradientButton
| 属性 | 类型 | 默认 | 说明 |
| ---- | ---- | ---- | ---- |
| `intent` | `primary | secondary | danger` | `primary` | 映射不同渐变 token |
| `size` | `sm | md | lg` | `md` | 控制高度（32/40/48px）|
| `iconPosition` | `left | right` | `left` | 图标位置 |
| `loading` | `boolean` | `false` | 显示旋转指示，与禁用状态互斥 |

交互：点击后 120ms 压缩动画；loading 时显示 `Spinner` 替换图标；键盘激活使用 `Space/Enter`。

### SmartBadge
| 属性 | 类型 | 默认 | 说明 |
| ---- | ---- | ---- | ---- |
| `tone` | `success | warning | error | info` | `info` | 映射语义色 |
| `prefixIcon` | `ReactNode` | `undefined` | 兼容图标 |
| `closable` | `boolean` | `false` | 是否显示关闭按钮 |
| `onClose` | `() => void` | `undefined` | 关闭回调 |

尺寸：高度 28px，内边距 `12px 16px`，圆角使用 `--radius-full`。

### 章节展示 (ModernChapterDisplay)
- 架构：`ChapterHeader` + `ProgressTimeline` + `DeliverablePanel`
- 响应：在 `min-width < 768px` 时切换为纵向布局，时间线折叠为步骤手风琴
- 空状态：提供插图 + 文本，引导用户导入创意数据

### 数据可视化
- 采用 `Recharts`，统一使用 `--color-success`、`--color-warning` 作为面积渐变
- Tooltip 需提供键盘触发 (`aria-describedby`)
- 图表配备「下载 CSV」动作按钮

## 布局体系
| 断点 | 宽度 | 网格 |
| ---- | ---- | ---- |
| `xs` | `< 640px` | 单列 |
| `sm` | `640-1023px` | 8 列，间距 16px |
| `lg` | `>= 1024px` | 12 列，间距 24px |

- 页面最大宽度：1440px
- 顶部导航高度：68px，滚动后缩小至 56px
- 内容区使用 sticky 侧边栏，高度不足时自动隐藏

## 动效与反馈
- 微交互使用 `Framer Motion`，默认持续时间 180ms，缓动曲线 `easeOut`
- 列表加载使用骨架屏 (`Skeleton`) 替代 Loading Spinner
- API 触发后显示 `Toast`，成功色 `#38BDF8`，失败色 `#F87171`

## 实现指南
1. 安装依赖：
   ```bash
   pnpm add framer-motion@^10 tailwindcss@^3 lucide-react@^0.290 class-variance-authority
   ```
2. 在 `tailwind.config.ts` 中扩展主题：
   ```ts
   const colors = require('tailwindcss/colors')
   export default {
     theme: {
       extend: {
         colors: {
           background: {
             light: '#F8FAFC',
             dark: '#0F172A'
           }
         },
         borderRadius: {
           xl: '1.5rem'
         },
         boxShadow: {
           glass: '0 24px 48px rgba(59,130,246,0.18)'
         }
       }
     }
   }
   ```
3. 在 `globals.css` 中注入设计令牌：
   ```css
   :root {
     --color-bg-default: #F8FAFC;
     --color-bg-surface: rgba(255,255,255,0.9);
     --radius-xl: 24px;
     --shadow-lg: 0 12px 32px rgba(15,23,42,0.16);
   }
   :root[data-theme='dark'] {
     --color-bg-default: #0F172A;
     --color-bg-surface: rgba(15,23,42,0.85);
   }
   ```
4. 建议通过 `packages/ui` 提取组件库，导出 `ModernThemeProvider`，封装暗黑模式切换、token 注入。

## 设计评审流程
1. 设计师在 Figma 发布组件更新，附属性说明与交互演示。
2. 创建 `design-change` Git 分支，更新 `packages/ui` 与 Storybook。
3. 运行 `pnpm run storybook:test`，确保视觉回归通过（Chromatic 或 Loki）。
4. 通过 PR 模板确认：无障碍、暗黑模式、响应式、motion 四项检查项。
5. 发布后更新 `CHANGELOG.md` 与设计系统站点。

## 质量验证清单
- [ ] 通过 axe 对比度和语义检查
- [ ] Storybook 中每个组件含 Primary/Secondary/Disabled 状态
- [ ] 手持设备（iPhone 13、Mate 50）真机验收
- [ ] 暗黑模式截图归档至设计库
- [ ] e2e 测试覆盖主流程（Playwright `ui-modern-mode.spec.ts`）

## 版本管理与治理
- 版本命名：`ui-system-vX.Y.Z`
- 发布节奏：每月一次常规版本，紧急修复以 `-hotfix` 标记
- 变更审批人：设计负责人 + 前端负责人 + PM
- 组件废弃策略：提前两版标记 `@deprecated`，提供迁移文档

## 未来演进（信息性）
| 阶段 | 目标 | 产出 |
| ---- | ---- | ---- |
| S1 (Q4) | 引入 Design Token CI | 自动生成 `tokens.json` |
| S2 (Q1) | 无障碍审计 | 第三方评估报告 |
| S3 (Q2) | Motion 指南升级 | 组件动效库 |

## 附录
- Storybook 地址：`https://design.company.com/business-plan`
- 组件代码示例仓库：`packages/ui-modern`
- 联系人：UI 负责人 @Lina、前端负责人 @Jason

本文档所列规范均已量化，实施团队可据此直接开发、测试与验收。
