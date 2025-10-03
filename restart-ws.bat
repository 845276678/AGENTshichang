@echo off
chcp 65001 > nul
echo Stopping old WebSocket server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a > nul 2>&1
)
echo Waiting for port to be released...
timeout /t 3 /nobreak > nul
echo Starting new WebSocket server...
start /B node server.js > websocket-server.log 2>&1
echo WebSocket server restarted!
