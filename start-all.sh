#!/bin/bash

# 零食商城 - 启动所有服务
# 适用于 macOS/Linux

echo "================================"
echo "零食商城 - 启动所有服务"
echo "================================"
echo ""

# 检查 MongoDB 是否运行
echo "检查 MongoDB 服务状态..."
if pgrep -x "mongod" > /dev/null
then
    echo "✅ MongoDB 运行中"
else
    echo "⚠️  MongoDB 未运行，请先启动 MongoDB"
    echo "macOS: brew services start mongodb-community"
    echo "Linux: sudo systemctl start mongod"
    exit 1
fi

echo ""
echo "正在启动所有服务..."
echo ""

# 启动后端服务
echo "🚀 启动后端服务 (端口 8088)..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..
sleep 3

# 启动管理端
echo "🚀 启动管理端 (端口 5173)..."
cd react-oa
npm run dev &
ADMIN_PID=$!
cd ..
sleep 3

# 启动用户/商家端
echo "🚀 启动用户/商家端 (端口 5174)..."
cd supermarks
npm run dev &
USER_PID=$!
cd ..

echo ""
echo "================================"
echo "✅ 所有服务启动完成！"
echo "================================"
echo ""
echo "访问地址："
echo "- 管理端: http://localhost:5173"
echo "- 用户/商家端: http://localhost:5174"
echo "- 后端 API: http://localhost:8088"
echo ""
echo "默认管理员账号: root / 123456"
echo ""
echo "进程 ID："
echo "- 后端: $BACKEND_PID"
echo "- 管理端: $ADMIN_PID"
echo "- 用户/商家端: $USER_PID"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "================================"

# 等待用户中断
trap "echo ''; echo '正在停止所有服务...'; kill $BACKEND_PID $ADMIN_PID $USER_PID 2>/dev/null; echo '✅ 所有服务已停止'; exit 0" INT

# 保持脚本运行
wait
