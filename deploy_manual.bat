@echo off
REM Windows批处理SSH部署脚本
REM 需要在Windows系统上运行

set SERVER=139.155.232.19
set USERNAME=ubuntu
set PASSWORD={y%OwD63Bi[7V?jEX
set PROJECT_NAME=project-68d4f29defadf4d878ac0583

echo 🚀 开始部署到 %SERVER%...

echo.
echo 📋 请按以下步骤手动执行：
echo.
echo 1. 打开新的命令行窗口
echo 2. 执行以下命令连接服务器：
echo    ssh %USERNAME%@%SERVER%
echo.
echo 3. 输入密码：%PASSWORD%
echo.
echo 4. 在服务器上执行以下命令：
echo.

echo    # 检查当前状态
echo    whoami ^&^& pwd ^&^& ls -la
echo.

echo    # 克隆或更新项目
echo    if [ -d '%PROJECT_NAME%' ]; then
echo        cd %PROJECT_NAME% ^&^& git pull origin master
echo    else
echo        git clone https://github.com/845276678/AGENTshichang.git %PROJECT_NAME%
echo        cd %PROJECT_NAME%
echo    fi
echo.

echo    # 执行部署脚本
echo    chmod +x quick_deploy.sh
echo    ./quick_deploy.sh
echo.

echo 5. 部署完成后访问：
echo    - http://www.aijiayuan.top
echo    - http://%SERVER%
echo.

pause