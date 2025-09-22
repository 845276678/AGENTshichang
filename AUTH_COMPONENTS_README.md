# 认证系统组件文档

完整的登录注册页面系统，基于Next.js 14 App Router构建，包含表单验证、动画效果和响应式设计。

## 🎯 功能特性

- ✅ 完整的登录/注册/忘记密码流程
- ✅ React Hook Form + Zod表单验证
- ✅ Framer Motion动画效果
- ✅ 响应式设计，完美支持移动端
- ✅ 第三方登录集成（Google、GitHub、微信、Apple）
- ✅ 密码强度实时检测
- ✅ TypeScript严格类型检查
- ✅ 深色模式支持
- ✅ 无障碍访问优化

## 📁 文件结构

```
src/
├── app/auth/
│   ├── login/page.tsx           # 登录页面
│   └── register/page.tsx        # 注册页面
├── components/
│   ├── auth/
│   │   ├── AuthBackground.tsx   # 背景装饰组件
│   │   ├── LoginForm.tsx        # 登录表单
│   │   ├── RegisterForm.tsx     # 注册表单
│   │   ├── ForgotPasswordForm.tsx # 忘记密码表单
│   │   ├── SocialLoginButtons.tsx # 第三方登录按钮
│   │   └── index.ts            # 导出文件
│   └── ui/
│       ├── FormField.tsx        # 表单字段组件
│       ├── PasswordStrengthMeter.tsx # 密码强度检测
│       └── index.ts            # 导出文件
```

## 🚀 快速开始

### 1. 访问页面

- 登录页面：`/auth/login`
- 注册页面：`/auth/register`

### 2. 基本使用

```tsx
import { LoginForm, RegisterForm } from '@/components/auth';

// 登录表单
<LoginForm
  onSubmit={async (data) => {
    // 处理登录逻辑
    console.log('Login:', data);
  }}
  onSocialLogin={(provider) => {
    // 处理第三方登录
    console.log('Social login:', provider);
  }}
  onForgotPassword={() => {
    // 处理忘记密码
    setMode('forgot-password');
  }}
/>

// 注册表单
<RegisterForm
  onSubmit={async (data) => {
    // 处理注册逻辑
    console.log('Register:', data);
  }}
  onSocialLogin={(provider) => {
    // 处理第三方注册
    console.log('Social register:', provider);
  }}
/>
```

### 3. 表单数据结构

#### 登录表单数据
```typescript
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
```

#### 注册表单数据
```typescript
interface RegisterFormData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  subscribeToNewsletter: boolean;
}
```

#### 忘记密码表单数据
```typescript
interface ForgotPasswordFormData {
  email: string;
}
```

## 🎨 设计特性

### 响应式布局
- **桌面端**: 左右分栏布局，左侧背景装饰，右侧表单
- **移动端**: 单栏布局，顶部图标，下方表单

### 动画效果
- 页面进入动画
- 表单字段动画
- 按钮交互动画
- 密码强度动画
- 背景装饰动画

### 深色模式
- 完整的深色模式支持
- 自动适配系统主题
- 平滑的颜色过渡

## 🔧 配置说明

### 1. 第三方登录配置

在 `SocialLoginButtons.tsx` 中配置支持的登录提供商：

```tsx
const socialProviders: SocialProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: GoogleIcon,
    color: 'bg-white border border-gray-300 hover:bg-gray-50',
    textColor: 'text-gray-700',
  },
  // 更多提供商...
];
```

### 2. 表单验证规则

在对应的组件文件中修改Zod schema：

```tsx
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
```

### 3. 密码强度规则

在 `PasswordStrengthMeter.tsx` 中自定义密码强度计算：

```tsx
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  // 计算逻辑...
};
```

## 🔌 API 集成

### 实现登录API

```tsx
const handleLogin = async (data: LoginFormData) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('登录失败');
    }
    
    const result = await response.json();
    // 保存token，跳转页面
    localStorage.setItem('token', result.token);
    router.push('/dashboard');
  } catch (error) {
    throw new Error('登录失败，请检查您的邮箱和密码');
  }
};
```

### 实现注册API

```tsx
const handleRegister = async (data: RegisterFormData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('注册失败');
    }
    
    // 跳转到邮箱验证页面或登录页面
    router.push('/auth/verify-email');
  } catch (error) {
    throw new Error('注册失败，请稍后重试');
  }
};
```

## 🎯 最佳实践

### 1. 安全考虑
- 使用HTTPS传输敏感数据
- 实现CSRF保护
- 限制登录尝试次数
- 强制使用强密码

### 2. 用户体验
- 实时表单验证
- 清晰的错误提示
- 合理的loading状态
- 保持表单数据（除密码外）

### 3. 无障碍访问
- 使用语义化HTML
- 提供ARIA标签
- 支持键盘导航
- 合理的焦点管理

## 🛠 依赖要求

确保项目已安装以下依赖：

```json
{
  "dependencies": {
    "react-hook-form": "^7.52.1",
    "@hookform/resolvers": "^3.7.0",
    "zod": "^3.23.8",
    "framer-motion": "^11.3.2",
    "lucide-react": "^0.408.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0"
  }
}
```

## 📱 移动端优化

- 使用合适的input类型（email、tel等）
- 优化虚拟键盘体验
- 适配安全区域
- 优化触摸交互区域

## 🎨 自定义样式

所有组件都使用Tailwind CSS构建，支持深度自定义：

```tsx
<LoginForm
  className="max-w-lg mx-auto"
  // 自定义样式类
/>
```

## 📝 注意事项

1. **表单重置**: 登录成功后不重置表单，注册成功后重置表单
2. **密码可见性**: 支持密码显示/隐藏切换
3. **记住我**: 登录表单包含"记住我"选项
4. **重定向**: 支持登录后重定向到指定页面
5. **错误处理**: 统一的错误提示和处理机制

## 🚀 部署建议

1. 配置环境变量存储API端点
2. 设置适当的CSP头
3. 启用压缩和缓存
4. 配置错误监控
5. 设置性能监控

这套认证系统提供了完整的用户认证体验，可以直接用于生产环境，也可以根据具体需求进行定制和扩展。