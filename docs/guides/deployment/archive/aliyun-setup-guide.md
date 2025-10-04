# 阿里云服务配置操作指南

## 🏪 阿里云账号准备

### 1. 注册阿里云账号
1. 访问 [阿里云官网](https://www.aliyun.com)
2. 点击"免费注册"
3. 完成企业认证（推荐）或个人认证
4. 绑定支付方式（支付宝/银行卡）

### 2. 实名认证
```
企业认证资料：
- 营业执照
- 法人身份证
- 企业银行账户

个人认证资料：
- 身份证正反面
- 手机号码
- 银行卡
```

## 💻 ECS云服务器购买配置

### 购买步骤
1. 登录阿里云控制台
2. 选择"云服务器ECS" → "实例"
3. 点击"创建实例"

### 配置参数
```yaml
基础配置:
  付费模式: 包年包月
  地域: 华东1(杭州)
  可用区: 随机分配

实例规格:
  实例族: 计算型c6
  实例规格: ecs.c6.large (2vCPU 4GiB)

镜像:
  操作系统: Ubuntu
  版本: Ubuntu 20.04 64位

存储:
  系统盘: ESSD云盘 40GiB
  数据盘: ESSD云盘 100GiB

网络:
  网络类型: 专有网络VPC
  交换机: 自动创建
  公网IP: 分配
  带宽: 按固定带宽 5Mbps

安全组:
  选择: 新建安全组
  规则: HTTP(80), HTTPS(443), SSH(22)
```

### 购买时长和费用
```
建议购买时长: 3个月
预估费用: 约1050元 (350元/月 × 3个月)
```

## 🗄️ RDS云数据库配置

### 购买步骤
1. 控制台 → "云数据库RDS" → "实例列表"
2. 点击"创建实例"

### 配置参数
```yaml
基础配置:
  付费模式: 包年包月
  地域: 华东1(杭州) # 与ECS同地域
  数据库引擎: MySQL
  版本: 8.0

实例规格:
  规格族: 通用型
  规格: mysql.n2.medium.1 (2核4GB)
  存储类型: ESSD云盘
  存储空间: 100GB

网络:
  网络类型: 专有网络VPC
  交换机: 选择与ECS相同的交换机

备份:
  备份周期: 每天
  备份时间: 凌晨2:00-3:00
  日志备份: 开启
  备份保留: 7天
```

### 安全配置
```sql
-- 创建数据库和用户
CREATE DATABASE aimarket_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aimarket'@'%' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON aimarket_prod.* TO 'aimarket'@'%';
FLUSH PRIVILEGES;
```

## 🔄 Redis缓存配置

### 购买步骤
1. 控制台 → "云数据库Redis" → "实例列表"
2. 点击"创建实例"

### 配置参数
```yaml
基础配置:
  付费模式: 包年包月
  地域: 华东1(杭州)
  可用区: 与ECS相同

实例配置:
  架构: 标准版-双副本
  规格: redis.master.micro.default (1GB)
  Redis版本: 6.0

网络:
  网络类型: 专有网络VPC
  交换机: 选择与ECS相同

安全:
  密码认证: 开启
  设置访问密码: your_redis_password
```

## 📦 OSS对象存储配置

### 创建Bucket
1. 控制台 → "对象存储OSS" → "Bucket列表"
2. 点击"创建Bucket"

### 配置参数
```yaml
基本信息:
  Bucket名称: aimarket-prod-files
  地域: 华东1(杭州)
  存储类型: 标准存储

访问控制:
  读写权限: 私有

静态网站托管: 关闭
服务端加密: AES256
实时日志查询: 开启
```

### 跨域配置(CORS)
```json
{
  "AllowedOrigins": ["https://yourdomain.com"],
  "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}
```

## 🌐 CDN配置

### 开通CDN
1. 控制台 → "CDN" → "域名管理"
2. 点击"添加域名"

### 配置参数
```yaml
基础信息:
  加速域名: static.yourdomain.com
  业务类型: 图片小文件
  源站信息: OSS域名
  端口: 80/443

缓存配置:
  缓存规则:
    - 文件类型: jpg,png,gif,jpeg 缓存时间: 30天
    - 文件类型: js,css 缓存时间: 7天
    - 文件类型: html 缓存时间: 1小时
```

## 📱 短信服务配置

### 开通短信服务
1. 控制台 → "短信服务" → "国内消息"
2. 申请签名和模板

### 签名申请
```
签名名称: AI创意市场
签名来源: 企业全称
申请说明: 用于用户注册登录验证码发送
```

### 模板申请
```
模板名称: 注册验证码
模板内容: 您的注册验证码是${code}，请在5分钟内输入，请勿泄露给他人。
模板类型: 验证码

模板名称: 登录验证码
模板内容: 您的登录验证码是${code}，请在5分钟内输入，请勿泄露给他人。
模板类型: 验证码
```

## 🔐 访问控制配置

### 创建RAM子账号
1. 控制台 → "访问控制RAM" → "用户"
2. 点击"创建用户"

### 用户配置
```yaml
用户信息:
  登录名称: aimarket-api
  显示名称: AI市场API用户
  访问方式: 编程访问

权限配置:
  权限策略: 自定义策略
  权限内容:
    - ECS: FullAccess
    - RDS: FullAccess
    - Redis: FullAccess
    - OSS: FullAccess
    - SMS: FullAccess
```

### 获取AccessKey
```bash
# 创建用户后获取
AccessKey ID: LTAI5t...
AccessKey Secret: xxx...

# 保存到环境变量
export ALIYUN_ACCESS_KEY_ID="your_access_key_id"
export ALIYUN_ACCESS_KEY_SECRET="your_access_key_secret"
```

## 🌍 域名和备案

### 域名注册
1. 控制台 → "域名" → "域名注册"
2. 搜索并购买域名（建议.com/.cn）

### 备案流程
```
1. 准备备案资料
   - 营业执照
   - 法人身份证
   - 网站负责人身份证
   - 备案核验单

2. 提交备案申请
   - 登录阿里云备案系统
   - 填写备案信息
   - 上传资料

3. 等待审核
   - 阿里云初审: 1-2个工作日
   - 管局终审: 7-20个工作日

4. 备案完成
   - 获得备案号
   - 域名可以正常使用
```

## 💰 费用预算明细

### 月费用预算表
| 服务名称 | 规格配置 | 月费用 | 年费用 | 备注 |
|---------|---------|-------|--------|------|
| ECS服务器 | 2核4G | 350元 | 3570元 | 包年85折 |
| RDS数据库 | 2核4G | 280元 | 2856元 | 包年85折 |
| Redis缓存 | 1G内存 | 70元 | 714元 | 包年85折 |
| OSS存储 | 100G | 50元 | 600元 | 按量付费 |
| CDN流量 | 500G | 80元 | 960元 | 按量付费 |
| 短信服务 | 1500条 | 70元 | 840元 | 按量付费 |
| 域名费用 | .com域名 | 8元 | 100元 | 年费 |
| **总计** | - | **908元** | **9640元** | 年付更优惠 |

### 成本优化建议
```
1. 包年付费: 享受85折优惠，节省约1400元/年
2. 预付费套餐: OSS和CDN使用预付费套餐更便宜
3. 资源监控: 定期检查资源使用情况，避免浪费
4. 自动扩缩容: 根据业务量自动调整资源
```

## 🔧 一键购买脚本

### 使用Terraform自动化部署
```hcl
# main.tf
provider "alicloud" {
  access_key = var.access_key
  secret_key = var.secret_key
  region     = "cn-hangzhou"
}

# VPC网络
resource "alicloud_vpc" "main" {
  vpc_name   = "aimarket-vpc"
  cidr_block = "10.0.0.0/8"
}

# ECS实例
resource "alicloud_instance" "web" {
  instance_name   = "aimarket-web"
  image_id        = "ubuntu_20_04_x64_20G_alibase_20210420.vhd"
  instance_type   = "ecs.c6.large"
  security_groups = [alicloud_security_group.default.id]
  vswitch_id     = alicloud_vswitch.main.id
}

# RDS实例
resource "alicloud_db_instance" "mysql" {
  instance_name     = "aimarket-mysql"
  engine           = "MySQL"
  engine_version   = "8.0"
  instance_type    = "mysql.n2.medium.1"
  instance_storage = 100
  vswitch_id      = alicloud_vswitch.main.id
}
```

## 📞 技术支持

### 阿里云技术支持
- **在线咨询**: 阿里云控制台右下角
- **工单系统**: 提交技术工单
- **电话支持**: 95187
- **文档中心**: [https://help.aliyun.com](https://help.aliyun.com)

### 常见问题解决
```
Q: ECS无法访问？
A: 检查安全组规则，确保开放80/443端口

Q: RDS连接失败？
A: 检查白名单设置，添加ECS内网IP

Q: OSS上传失败？
A: 检查跨域配置和访问权限

Q: 短信发送失败？
A: 确认签名和模板已审核通过
```

---

**配置完成后**，您将获得：
- ECS服务器公网IP和内网IP
- RDS数据库连接地址和端口
- Redis连接地址和密码
- OSS访问域名和密钥
- 短信服务AccessKey

这些信息需要配置到项目的环境变量中。