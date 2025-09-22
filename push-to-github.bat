@echo off
REM ==========================================
REM GitHub推送脚本 - Windows版本
REM ==========================================

echo.
echo 🚀 AI创意协作平台 - GitHub推送脚本
echo ==================================
echo.

REM 检查Git状态
echo 📊 当前Git状态:
git status --porcelain | find /c /v ""
echo 已提交文件数量

git log --oneline -1
echo.

echo 🔄 推送选项:
echo 1. 标准推送 (推荐)
echo 2. 强制推送
echo 3. 查看远程信息
echo 4. 重新配置认证
echo.

set /p choice="请选择推送方式 (1-4): "

if "%choice%"=="1" goto standard_push
if "%choice%"=="2" goto force_push
if "%choice%"=="3" goto show_remote
if "%choice%"=="4" goto config_auth
goto invalid_choice

:standard_push
echo.
echo 📤 执行标准推送...
git push -u origin master
goto check_result

:force_push
echo.
echo ⚠️ 执行强制推送...
set /p confirm="确认强制推送？这会覆盖远程仓库 (y/N): "
if /i "%confirm%"=="y" (
    git push -u origin master --force
) else (
    echo ❌ 取消强制推送
    goto end
)
goto check_result

:show_remote
echo.
echo 📋 远程仓库信息:
git remote -v
git remote show origin
goto end

:config_auth
echo.
echo 🔧 重新配置Git认证...
set /p username="输入GitHub用户名: "
set /p email="输入GitHub邮箱: "
git config --global user.name "%username%"
git config --global user.email "%email%"
echo ✅ 认证配置完成
goto standard_push

:check_result
if errorlevel 1 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 🔧 故障排除建议:
    echo 1. 检查网络连接
    echo 2. 验证GitHub访问权限
    echo 3. 检查仓库URL是否正确
    echo 4. 尝试使用VPN或代理
    echo.
    echo 📝 手动推送命令:
    echo git push -u origin master
) else (
    echo.
    echo 🎉 推送成功！
    echo 🌐 查看仓库: https://github.com/845276678/AGENTshichang
    echo.
    echo 📋 下一步建议:
    echo 1. 在GitHub上检查推送的文件
    echo 2. 设置仓库描述和README
    echo 3. 配置GitHub Pages（如果需要）
    echo 4. 设置分支保护规则
)
goto end

:invalid_choice
echo ❌ 无效选择
goto end

:end
echo.
echo ✨ 脚本执行完成
pause