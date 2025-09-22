#!/bin/bash
# ==========================================
# GitHub推送脚本 - 网络问题解决方案
# ==========================================

echo "🚀 AI创意协作平台 - GitHub推送脚本"
echo "=================================="

# 检查网络连接
echo "🌐 检查GitHub连接..."
if curl -s --connect-timeout 10 https://github.com > /dev/null 2>&1; then
    echo "✅ GitHub连接正常"
else
    echo "❌ GitHub连接失败，请检查网络或尝试以下解决方案："
    echo ""
    echo "🔧 解决方案："
    echo "1. 检查网络连接和防火墙设置"
    echo "2. 尝试使用VPN"
    echo "3. 配置Git代理（如果有）："
    echo "   git config --global http.proxy http://proxy:port"
    echo "4. 使用SSH代替HTTPS："
    echo "   git remote set-url origin git@github.com:845276678/AGENTshichang.git"
    echo ""
    read -p "按Enter键继续或Ctrl+C退出..."
fi

# 显示当前状态
echo ""
echo "📊 当前Git状态："
git status --porcelain | wc -l | xargs echo "已提交文件数量:"
git log --oneline -1 | head -1

echo ""
echo "🔄 推送选项："
echo "1. 标准推送 (推荐)"
echo "2. 强制推送"
echo "3. 推送特定分支"
echo "4. 查看远程信息"

read -p "请选择推送方式 (1-4): " choice

case $choice in
    1)
        echo "📤 执行标准推送..."
        git push -u origin master
        ;;
    2)
        echo "⚠️ 执行强制推送..."
        read -p "确认强制推送？这会覆盖远程仓库 (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            git push -u origin master --force
        else
            echo "❌ 取消强制推送"
        fi
        ;;
    3)
        git branch -a
        read -p "输入要推送的分支名: " branch
        git push -u origin "$branch"
        ;;
    4)
        echo "📋 远程仓库信息："
        git remote -v
        git remote show origin
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

# 验证推送结果
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 推送成功！"
    echo "🌐 查看仓库: https://github.com/845276678/AGENTshichang"
    echo ""
    echo "📋 下一步建议："
    echo "1. 在GitHub上检查推送的文件"
    echo "2. 设置仓库描述和README"
    echo "3. 配置GitHub Pages（如果需要）"
    echo "4. 设置分支保护规则"
else
    echo ""
    echo "❌ 推送失败！"
    echo ""
    echo "🔧 故障排除建议："
    echo "1. 检查网络连接"
    echo "2. 验证GitHub访问权限"
    echo "3. 检查仓库URL是否正确"
    echo "4. 尝试重新认证："
    echo "   git config --global user.name 'your-name'"
    echo "   git config --global user.email 'your-email'"
    echo ""
    echo "📝 手动推送命令："
    echo "git push -u origin master"
fi

echo ""
echo "✨ 脚本执行完成"