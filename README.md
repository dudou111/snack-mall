# 零食商城 (Snack Mall)

一个基于 React + Node.js + MongoDB 的全栈电商系统，支持管理员、用户、商家三种角色的协同业务闭环。

## 项目简介

零食商城是一个完整的电商解决方案，实现了从商品上传、用户购买、支付结算到物流追踪、退款处理的全流程管理。

### 核心特性

- 🎯 **三角色协同**：管理员、用户、商家各司其职
- 🛒 **完整购物流程**：浏览、下单、支付、物流、退款
- 📦 **商家管理**：商品上传、库存管理、订单履约
- 📊 **数据统计**：订单分析、支付转化、退款率监控
- 🔐 **权限控制**：基于 JWT 的身份认证与角色权限
- 💳 **支付模拟**：模拟支付成功/失败场景
- 🚚 **物流追踪**：订单状态实时更新

## 技术栈

### 前端

- **管理端 (react-oa)**：React 18 + TypeScript + Ant Design + Redux Toolkit + ECharts
- **用户/商家端 (supermarks)**：React 18 + TypeScript + Vite + React Router

### 后端

- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- Socket.io (实时通信)
- Stripe (支付集成)

## 项目结构

```text
snack-mall/
├── react-oa/          # 管理员后台系统
│   ├── src/
│   │   ├── components/  # 公共组件
│   │   ├── pages/       # 页面组件
│   │   ├── store/       # Redux 状态管理
│   │   └── utils/       # 工具函数
│   └── package.json
├── supermarks/        # 用户/商家前端
│   ├── src/
│   └── package.json
├── server/            # 后端服务
│   ├── model/         # 数据模型
│   │   ├── user.js        # 用户模型
│   │   ├── adminUser.js   # 管理员模型
│   │   ├── shopUser.js    # 商家模型
│   │   ├── Product.js     # 商品模型
│   │   ├── Order.js       # 订单模型
│   │   ├── Brand.js       # 品牌模型
│   │   └── Category.js    # 分类模型
│   ├── router/        # 路由
│   │   ├── authRouter.js      # 用户认证路由
│   │   ├── adminAuthRouter.js # 管理员认证路由
│   │   ├── shopAuthRouter.js  # 商家认证路由
│   │   ├── productRouter.js   # 商品路由
│   │   ├── orderRouter.js     # 订单路由
│   │   └── userRouter.js      # 用户路由
│   ├── controllers/   # 控制器
│   ├── middleware/    # 中间件
│   ├── static/        # 静态资源
│   └── package.json
└── doc/               # 项目文档
    └── 三角色商城需求文档.md
```

## 快速开始

### 环境要求

- Node.js >= 16.x
- MongoDB >= 5.x
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装管理端依赖
cd ../react-oa
npm install

# 安装用户/商家端依赖
cd ../supermarks
npm install
```

### 配置数据库

1. 确保 MongoDB 服务已启动
2. 修改 `server/index.js` 中的数据库连接配置（如需要）
3. 初始化数据：

```bash
cd server
npm run init-data
```

### 启动项目

```bash
# 启动后端服务 (默认端口 3000)
cd server
npm run dev

# 启动管理端 (默认端口 5173)
cd react-oa
npm run dev

# 启动用户/商家端 (默认端口 5174)
cd supermarks
npm run dev
```

## 角色说明

### 管理员 (Admin)
- 查看全量购买记录和商家上传记录
- 订单追踪与状态管理
- 退款申请审核与处理
- 数据统计与分析

### 用户 (User)
- 浏览商品、搜索筛选
- 下单购买、模拟支付
- 查看订单状态与物流信息
- 发起退款申请

### 商家 (Merchant)
- 上传商品、编辑商品信息
- 管理库存、上下架商品
- 查看上传记录
- 订单履约与物流状态更新

## 核心功能

### 订单状态流转

```text
待支付 → 待发货 → 配送中 → 已完成
   ↓
已取消
```

### 支付状态流转

```text
未支付 → 已支付 → 已退款
```

### 物流状态流转

```text
待发货 → 配送中 → 已送达
            ↓
        配送失败
```

## API 接口

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/admin/login` - 管理员登录
- `POST /api/shop/login` - 商家登录

### 商品相关

- `GET /api/product/products` - 获取商品列表
- `POST /api/product/products` - 创建商品
- `PUT /api/product/products/:id` - 更新商品
- `PATCH /api/product/products/:id/status` - 更新商品状态

### 订单相关

- `GET /api/order/list` - 获取订单列表
- `GET /api/order/detail/:id` - 获取订单详情
- `POST /api/order/create` - 创建订单
- `PATCH /api/order/status/:id` - 更新订单状态

## 开发脚本

### 后端

```bash
npm run dev              # 开发模式启动
npm run start            # 生产模式启动
npm run init-data        # 初始化数据
npm run test             # 运行测试
```

### 前端脚本

```bash
npm run dev              # 开发模式
npm run build            # 生产构建
npm run preview          # 预览构建结果
npm run lint             # 代码检查
```

## 数据模型

### 用户模型 (User)
- username, password, role (admin/user/merchant)
- isAdmin, status
- merchantProfile (商家信息)

### 商品模型 (Product)
- name, price, stock, status
- category, brand, images
- merchantId (商家ID)
- uploadTime, lastModifiedTime

### 订单模型 (Order)
- buyerId, merchantIds
- status, paymentStatus, deliveryStatus
- paymentTime, shipmentTime, completionTime
- refund (退款信息)

## 权限控制

- 所有业务接口需 JWT 认证
- 管理员可访问所有管理接口
- 商家只能访问自身商品和相关订单
- 用户只能访问自身订单和支付信息

## 注意事项

- 当前支付功能为模拟实现，未接入真实支付网关
- 物流追踪为状态流转模拟，未接入真实物流接口
- 下单采用"下单即扣库存"策略
- 退款成功且未发货时会自动回补库存

## 开发计划

- [ ] 接入真实支付网关 (微信/支付宝)
- [ ] 集成真实物流追踪 API
- [ ] 完善 RBAC 权限控制
- [ ] 多租户财务结算
- [ ] 移动端适配

## 许可证

ISC

## 贡献

欢迎提交 Issue 和 Pull Request！
