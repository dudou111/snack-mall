@echo off
chcp 65001 >nul
echo ================================
echo 零食商城 - 启动所有服务
echo ================================
echo.

REM 检查 MongoDB 是否运行
echo 检查 MongoDB 服务状态...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB 未运行，正在启动...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo ❌ MongoDB 启动失败，请手动启动
        pause
        exit /b 1
    )
)
echo ✅ MongoDB 运行中

echo.
echo 正在启动所有服务...
echo.

REM 启动后端服务
echo 🚀 启动后端服务 (端口 8088)...
start "后端服务" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 >nul

REM 启动管理端
echo 🚀 启动管理端 (端口 5173)...
start "管理端" cmd /k "cd /d %~dp0react-oa && npm run dev"
timeout /t 3 >nul

REM 启动用户/商家端
echo 🚀 启动用户/商家端 (端口 5174)...
start "用户/商家端" cmd /k "cd /d %~dp0supermarks && npm run dev"

echo.
echo ================================
echo ✅ 所有服务启动完成！
echo ================================
echo.
echo 访问地址：
echo - 管理端: http://localhost:5173
echo - 用户/商家端: http://localhost:5174
echo - 后端 API: http://localhost:8088
echo.
echo 默认管理员账号: root / 123456
echo.
echo 提示：关闭此窗口不会停止服务
echo 要停止服务，请关闭对应的命令行窗口
echo ================================
pause
