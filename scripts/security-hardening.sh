#!/bin/bash
# ==========================================
# AI创意协作平台 - 生产环境安全加固脚本
# ==========================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置防火墙
configure_firewall() {
    log_info "配置UFW防火墙..."

    # 启用UFW
    ufw --force enable

    # 默认策略
    ufw default deny incoming
    ufw default allow outgoing

    # 允许SSH (如果不是22端口，请修改)
    ufw allow ssh
    ufw allow 22/tcp

    # 允许HTTP/HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp

    # 允许监控端口 (限制源IP)
    ufw allow from 127.0.0.1 to any port 3001  # Grafana
    ufw allow from 127.0.0.1 to any port 9090  # Prometheus

    # 允许内部通信
    ufw allow from 172.16.0.0/12  # Docker网络
    ufw allow from 192.168.0.0/16  # 私有网络

    # 显示状态
    ufw status numbered

    log_info "防火墙配置完成"
}

# 安装和配置fail2ban
install_fail2ban() {
    log_info "安装和配置fail2ban..."

    # 安装fail2ban
    apt update
    apt install -y fail2ban

    # 创建自定义配置
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = auto
usedns = warn
logencoding = auto
enabled = false
mode = normal
filter = %(__name__)s[mode=%(mode)s]

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
logpath = /opt/ai-marketplace/logs/nginx/*.log
maxretry = 3
bantime = 1800

[nginx-noscript]
enabled = true
port = http,https
logpath = /opt/ai-marketplace/logs/nginx/*.log
maxretry = 6
bantime = 600

[nginx-bad-request]
enabled = true
port = http,https
logpath = /opt/ai-marketplace/logs/nginx/*.log
maxretry = 2
bantime = 3600

[aijiayuan-api]
enabled = true
port = http,https
logpath = /opt/ai-marketplace/logs/nginx/access.log
filter = aijiayuan
maxretry = 5
bantime = 1800
findtime = 300
EOF

    # 复制自定义过滤器
    cp /opt/ai-marketplace/security/fail2ban-aijiayuan.conf /etc/fail2ban/filter.d/aijiayuan.conf

    # 启动fail2ban
    systemctl enable fail2ban
    systemctl restart fail2ban

    log_info "fail2ban配置完成"
}

# 配置SSH安全
configure_ssh_security() {
    log_info "配置SSH安全设置..."

    # 备份原配置
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

    # 应用安全配置
    cat >> /etc/ssh/sshd_config << 'EOF'

# AI创意协作平台安全配置
Protocol 2
PermitRootLogin yes
PasswordAuthentication yes
PermitEmptyPasswords no
ChallengeResponseAuthentication no
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
MaxStartups 10:30:60
LoginGraceTime 60
EOF

    # 重启SSH服务
    systemctl restart sshd

    log_info "SSH安全配置完成"
}

# 安装安全扫描工具
install_security_tools() {
    log_info "安装安全扫描工具..."

    # 安装基础安全工具
    apt install -y \
        rkhunter \
        chkrootkit \
        clamav \
        clamav-daemon \
        logwatch \
        unattended-upgrades

    # 配置自动安全更新
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
};

Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF

    # 启用自动更新
    echo 'APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";' > /etc/apt/apt.conf.d/20auto-upgrades

    # 更新病毒库
    freshclam

    log_info "安全工具安装完成"
}

# 配置日志审计
configure_audit_logging() {
    log_info "配置审计日志..."

    # 安装auditd
    apt install -y auditd audispd-plugins

    # 配置审计规则
    cat > /etc/audit/rules.d/aijiayuan.rules << 'EOF'
# AI创意协作平台审计规则

# 监控重要文件修改
-w /opt/ai-marketplace/.env -p wa -k config_change
-w /opt/ai-marketplace/docker-compose*.yml -p wa -k docker_change
-w /etc/nginx/ -p wa -k nginx_change
-w /etc/ssl/ -p wa -k ssl_change

# 监控系统调用
-a always,exit -F arch=b64 -S adjtimex -S settimeofday -k time_change
-a always,exit -F arch=b32 -S adjtimex -S settimeofday -S stime -k time_change

# 监控网络配置
-a always,exit -F arch=b64 -S sethostname -S setdomainname -k system_locale
-a always,exit -F arch=b32 -S sethostname -S setdomainname -k system_locale

# 监控用户账户变更
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k identity

# 监控权限变更
-a always,exit -F arch=b64 -S chmod -S fchmod -S fchmodat -F auid>=1000 -F auid!=4294967295 -k perm_mod
-a always,exit -F arch=b32 -S chmod -S fchmod -S fchmodat -F auid>=1000 -F auid!=4294967295 -k perm_mod
EOF

    # 启动auditd
    systemctl enable auditd
    systemctl restart auditd

    log_info "审计日志配置完成"
}

# 设置文件权限
set_file_permissions() {
    log_info "设置文件权限..."

    cd /opt/ai-marketplace

    # 设置配置文件权限
    chmod 600 .env* 2>/dev/null || true
    chmod 600 ssl/private/* 2>/dev/null || true

    # 设置脚本权限
    chmod +x scripts/*.sh

    # 设置日志目录权限
    chmod 755 logs/
    chmod 644 logs/*.log 2>/dev/null || true

    # 设置SSL证书权限
    chmod 644 ssl/live/*/fullchain.pem 2>/dev/null || true
    chmod 600 ssl/live/*/privkey.pem 2>/dev/null || true

    log_info "文件权限设置完成"
}

# 配置系统安全参数
configure_kernel_security() {
    log_info "配置内核安全参数..."

    cat > /etc/sysctl.d/99-aijiayuan-security.conf << 'EOF'
# AI创意协作平台安全配置

# 网络安全
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1

# 内存保护
kernel.exec-shield = 1
kernel.randomize_va_space = 2

# 进程安全
fs.suid_dumpable = 0
kernel.core_uses_pid = 1
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1

# 文件系统安全
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
EOF

    # 应用配置
    sysctl -p /etc/sysctl.d/99-aijiayuan-security.conf

    log_info "内核安全参数配置完成"
}

# 主函数
main() {
    log_info "开始生产环境安全加固..."

    configure_firewall
    install_fail2ban
    configure_ssh_security
    install_security_tools
    configure_audit_logging
    set_file_permissions
    configure_kernel_security

    log_info "=========================================="
    log_info "🔒 生产环境安全加固完成！"
    log_info "=========================================="
    echo
    log_info "已完成的安全配置："
    echo "  ✅ UFW防火墙配置"
    echo "  ✅ Fail2ban入侵检测"
    echo "  ✅ SSH安全加固"
    echo "  ✅ 安全扫描工具安装"
    echo "  ✅ 审计日志配置"
    echo "  ✅ 文件权限设置"
    echo "  ✅ 内核安全参数"
    echo
    log_info "安全状态检查命令："
    echo "  - ufw status"
    echo "  - fail2ban-client status"
    echo "  - systemctl status auditd"
    echo "  - rkhunter --check"
    echo
    log_warn "请定期执行安全检查和更新！"
}

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    log_error "请使用root权限运行此脚本"
    exit 1
fi

# 执行主函数
main "$@"