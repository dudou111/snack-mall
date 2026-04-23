# 零食商城 (Snack Mall)

一个基于 React + Node.js + MongoDB 的全栈电商系统，支持管理员、用户、商家三种角色的协同业务闭环。

## 项目简介

零食商城是一个完整的电商解决方案，实现了从商品上传、用户购买、支付结算到物流追踪、退款处理的全流程管理。系统采用前后端分离架构，支持三端协同工作。

### 核心特性

- 🎯 **三角色协同**：管理员、用户、商家各司其职，权限清晰
- 🛒 **完整购物流程**：浏览、下单、支付、物流、退款全链路
- 📦 **商家管理**：商品上传、库存管理、订单履约、图片上传
- 📊 **数据统计**：实时仪表盘、订单分析、支付转化、退款率监控
- 🔐 **权限控制**：基于 JWT 的身份认证与角色权限管理
- 💳 **支付集成**：Stripe 支付集成 + 模拟支付场景
- 🚚 **物流追踪**：订单状态实时更新与物流信息追踪
- 🔔 **实时通知**：基于 Socket.io 的实时消息推送
- 📱 **响应式设计**：支持多端访问，界面友好

## 技术栈

### 前端技术

**管理端 (react-oa)**
- React 18.2 + TypeScript
- Ant Design 5.25 - UI 组件库
- Redux Toolkit 2.8 - 状态管理
- ECharts 5.6 - 数据可视化
- React Router 6 - 路由管理
- Axios - HTTP 请求
- Day.js - 日期处理
- Sass/Less - 样式预处理

**用户/商家端 (supermarks)**
- React 18.3 + TypeScript
- Vite 6.3 - 构建工具
- React Router 6.30 - 路由管理
- Axios 1.9 - HTTP 请求

### 后端技术

- Node.js + Express 4.18 - Web 框架
- MongoDB 5.x + Mongoose 7.5 - 数据库
- JWT (jsonwebtoken 9.0) - 身份认证
- Socket.io 4.7 - 实时通信
- Stripe 22.0 - 支付集成
- Multer - 文件上传
- MD5 - 密码加密
- Express Validator - 数据验证
- CORS - 跨域支持

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
- Git

### 一键启动（推荐）

**方式一：使用启动脚本（最简单）**

```bash
# Windows
install.bat        # 安装所有依赖
start-all.bat      # 启动所有服务

# macOS/Linux
chmod +x install.sh start-all.sh
./install.sh       # 安装所有依赖
./start-all.sh     # 启动所有服务
```

**方式二：手动启动**

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/snack-mall.git
cd snack-mall

# 2. 安装所有依赖
# Windows: install.bat
# macOS/Linux: ./install.sh

# 3. 启动 MongoDB
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod

# 4. 初始化数据
cd server
npm run init-data

# 5. 启动所有服务（需要三个终端窗口）
# 终端 1: 启动后端
cd server && npm run dev

# 终端 2: 启动管理端
cd react-oa && npm run dev

# 终端 3: 启动用户/商家端
cd supermarks && npm run dev
```

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

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

2. 数据库连接配置（默认配置）

```javascript
// server/index.js
mongoose.connect('mongodb://127.0.0.1:27017/snack-mall')
```

3. 初始化数据

```bash
cd server
npm run init-data
```

初始化脚本会自动创建：

- 默认管理员账号：`root` / `123456`
- 示例商品数据
- 品牌和分类数据

### 启动项目

按以下顺序启动各个服务：

1. 启动后端服务（端口 8088）

```bash
cd server
npm run dev
```

2. 启动管理端（端口 5173）

```bash
cd react-oa
npm run dev
```

3. 启动用户/商家端（端口 5174）

```bash
cd supermarks
npm run dev
```

启动成功后访问：

- 管理端：<http://localhost:5173>
- 用户/商家端：<http://localhost:5174>
- 后端 API：<http://localhost:8088>

### 默认账号

初始化数据后，可使用以下账号登录：

**管理员账号**

- 用户名：`root`
- 密码：`123456`
- 访问地址：<http://localhost:5173>

**测试用户账号**（需要先注册或通过初始化脚本创建）

- 可在用户端自行注册
- 访问地址：<http://localhost:5174>

**测试商家账号**（需要管理员分配商家角色）

- 先注册普通用户
- 管理员登录后在用户管理中将角色改为 `merchant`
- 访问地址：<http://localhost:5174>

## 使用指南

### 管理员操作流程

1. 使用 `root/123456` 登录管理端
2. 查看仪表盘统计数据
3. 管理用户（查看、编辑、分配角色）
4. 查看所有订单和商品
5. 处理退款申请
6. 查看商家上传记录

### 用户操作流程

1. 在用户端注册账号
2. 浏览商品列表
3. 查看商品详情
4. 创建订单
5. 模拟支付（选择成功或失败）
6. 查看订单状态和物流信息
7. 申请退款（如需要）

### 商家操作流程

1. 注册账号后联系管理员分配商家角色
2. 登录商家端
3. 上传商品（填写信息、上传图片）
4. 管理商品库存
5. 查看上传记录
6. 处理订单履约
7. 更新物流状态

## 角色说明

### 管理员 (Admin)

访问 react-oa 管理后台，拥有最高权限：

- 查看全量购买记录和商家上传记录
- 订单追踪与状态管理（订单状态、支付状态、物流状态）
- 退款申请审核与处理
- 数据统计与分析（实时仪表盘）
- 用户管理与权限分配

默认管理员账号：`root` / `123456`

### 用户 (User)

访问 supermarks 用户端，可以：

- 浏览商品、搜索筛选、查看商品详情
- 下单购买、选择支付方式
- 模拟支付（支持成功/失败场景）
- 查看订单状态与物流信息
- 发起退款申请并跟踪退款进度
- 管理个人信息

### 商家 (Merchant)

访问 supermarks 商家端，可以：

- 上传商品（支持图片上传）
- 编辑商品信息、管理库存
- 上下架商品
- 查看上传记录
- 订单履约与物流状态更新
- 查看销售数据

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

**用户认证**

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

**管理员认证**

- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/profile` - 获取管理员信息

**商家认证**

- `POST /api/shop/login` - 商家登录
- `GET /api/shop/profile` - 获取商家信息

### 商品相关

- `GET /api/product/products` - 获取商品列表（支持分页、筛选）
- `GET /api/product/products/:id` - 获取商品详情
- `POST /api/product/products` - 创建商品（商家）
- `PUT /api/product/products/:id` - 更新商品（商家）
- `PATCH /api/product/products/:id/status` - 更新商品状态
- `DELETE /api/product/products/:id` - 删除商品
- `POST /api/product/upload` - 上传商品图片
- `GET /api/product/upload-records` - 查看上传记录（商家）

### 订单相关

- `GET /api/order/list` - 获取订单列表
- `GET /api/order/detail/:id` - 获取订单详情
- `POST /api/order/create` - 创建订单
- `PATCH /api/order/status/:id` - 更新订单状态
- `POST /api/order/pay/mock` - 模拟支付
- `POST /api/order/refund/apply` - 申请退款
- `GET /api/order/refund/list` - 获取退款列表
- `PATCH /api/order/refund/review/:id` - 审核退款（管理员）
- `PATCH /api/order/delivery/:id` - 更新物流状态

### 用户管理

- `GET /api/user/list` - 获取用户列表（管理员）
- `GET /api/user/:id` - 获取用户详情
- `PATCH /api/user/role/:id` - 设置用户角色（管理员）
- `PATCH /api/user/:id` - 更新用户信息

### 数据统计

- `GET /api/dashboard/stats` - 获取统计数据
- `GET /api/dashboard/orders` - 订单趋势分析
- `GET /api/dashboard/sales` - 销售数据分析

## 开发脚本

### 后端脚本

```bash
npm run dev              # 开发模式启动（nodemon 热重载）
npm run start            # 生产模式启动
npm run init-data        # 初始化数据库数据
npm run test             # 运行 API 测试

# 测试脚本
npm run test:auth-models          # 测试认证模型
npm run test:auth-routes          # 测试认证路由
npm run test:auth-middleware      # 测试认证中间件
npm run test:startup-diagnostics  # 启动诊断测试
npm run test:stripe-shape         # 测试 Stripe 支付结构
npm run test:server-routes        # 测试服务器路由导入
npm run test:role-compat          # 测试角色兼容性
```

### 前端脚本

```bash
npm run dev              # 开发模式（Vite 热重载）
npm run build            # 生产构建
npm run preview          # 预览构建结果
npm run lint             # ESLint 代码检查
```

## 数据模型

### 用户模型 (User)

```javascript
{
  username: String,        // 用户名
  password: String,        // 密码（MD5 加密）
  role: String,           // 角色：admin/user/merchant
  isAdmin: Boolean,       // 是否管理员
  status: String,         // 状态：active/inactive
  tel: String,            // 联系电话
  avatar: String,         // 头像 URL
  merchantProfile: {      // 商家信息（仅商家角色）
    shopName: String,     // 店铺名称
    contact: String,      // 联系人
    phone: String         // 联系电话
  },
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

### 商品模型 (Product)

```javascript
{
  name: String,           // 商品名称
  price: Number,          // 价格
  stock: Number,          // 库存
  status: String,         // 状态：active/inactive/deleted
  category: String,       // 分类
  brand: String,          // 品牌
  images: [String],       // 图片 URL 数组
  description: String,    // 商品描述
  merchantId: ObjectId,   // 商家 ID
  createdByRole: String,  // 创建者角色
  uploadTime: Date,       // 上传时间
  lastModifiedBy: ObjectId, // 最后修改人
  lastModifiedTime: Date  // 最后修改时间
}
```

### 订单模型 (Order)

```javascript
{
  buyerId: ObjectId,      // 买家 ID
  merchantIds: [ObjectId], // 商家 ID 数组
  items: [{               // 订单商品
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: Number,    // 总金额
  status: String,         // 订单状态：待支付/待发货/配送中/已完成/已取消
  paymentStatus: String,  // 支付状态：未支付/已支付/已退款
  deliveryStatus: String, // 物流状态：待发货/配送中/已送达/配送失败
  paymentTime: Date,      // 支付时间
  paymentMockNo: String,  // 模拟支付流水号
  shipmentTime: Date,     // 发货时间
  completionTime: Date,   // 完成时间
  refund: {               // 退款信息
    applyTime: Date,      // 申请时间
    applyReason: String,  // 申请原因
    applyAmount: Number,  // 申请金额
    reviewStatus: String, // 审核状态
    reviewBy: ObjectId,   // 审核人
    reviewTime: Date,     // 审核时间
    rejectReason: String, // 驳回原因
    refundTime: Date      // 退款时间
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 品牌模型 (Brand)

```javascript
{
  name: String,           // 品牌名称
  logo: String,           // 品牌 Logo
  description: String,    // 品牌描述
  status: String          // 状态
}
```

### 分类模型 (Category)

```javascript
{
  name: String,           // 分类名称
  icon: String,           // 分类图标
  description: String,    // 分类描述
  parentId: ObjectId,     // 父分类 ID
  level: Number           // 层级
}
```

## 权限控制

### 权限矩阵

| 功能模块 | 管理员 | 商家 | 用户 |
|---------|-------|------|------|
| 查看所有订单 | ✅ | ❌ | ❌ |
| 查看自己的订单 | ✅ | ✅ | ✅ |
| 创建订单 | ✅ | ❌ | ✅ |
| 更新订单状态 | ✅ | ✅* | ❌ |
| 查看所有商品 | ✅ | ✅ | ✅ |
| 创建商品 | ✅ | ✅ | ❌ |
| 编辑商品 | ✅ | ✅* | ❌ |
| 删除商品 | ✅ | ✅* | ❌ |
| 用户管理 | ✅ | ❌ | ❌ |
| 退款审核 | ✅ | ❌ | ❌ |
| 申请退款 | ❌ | ❌ | ✅ |
| 数据统计 | ✅ | ✅* | ❌ |

*注：商家只能操作自己的数据

### JWT 认证

所有业务接口需要 JWT 认证：

```javascript
// 请求头格式
Authorization: Bearer <token>
```

Token 包含信息：

- userId: 用户 ID
- role: 用户角色
- isAdmin: 是否管理员

### 权限验证中间件

```javascript
// 验证登录
authMiddleware

// 验证管理员
adminMiddleware

// 验证商家
merchantMiddleware

// 验证资源所有权
ownershipMiddleware
```

## 注意事项

### 业务逻辑

- 当前支付功能为模拟实现，未接入真实支付网关
- 物流追踪为状态流转模拟，未接入真实物流接口
- 下单采用"下单即扣库存"策略，高并发场景需要优化
- 退款成功且未发货时会自动回补库存
- 订单状态流转需遵循状态机规则，不可跳跃

### 安全建议

- 生产环境请修改默认管理员密码
- 建议使用环境变量管理敏感配置（数据库连接、JWT 密钥等）
- 上传文件需要做类型和大小限制
- API 接口建议添加请求频率限制

### 性能优化

- 商品列表和订单列表已支持分页
- 建议为常用查询字段添加数据库索引
- 图片建议使用 CDN 加速
- 考虑使用 Redis 缓存热点数据

## 常见问题

### 1. MongoDB 连接失败

确保 MongoDB 服务已启动：

```bash
# Windows
net start MongoDB

# 检查服务状态
mongosh
```

### 2. 端口被占用

修改对应项目的端口配置：

```javascript
// server/index.js
const PORT = 8088;

// react-oa/vite.config.ts
server: { port: 5173 }

// supermarks/vite.config.ts
server: { port: 5174 }
```

### 3. 图片上传失败

检查 `server/static` 目录是否存在且有写入权限：

```bash
mkdir -p server/static
chmod 755 server/static
```

### 4. 前端请求跨域

确保后端已配置 CORS：

```javascript
// server/index.js
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
```

### 5. JWT Token 过期

Token 默认有效期为 24 小时，过期后需要重新登录。可在后端配置中修改：

```javascript
// 生成 token 时设置过期时间
jwt.sign(payload, secret, { expiresIn: '24h' });
```

## 开发计划

### 已完成功能 ✅

- [x] 三角色用户系统（管理员、用户、商家）
- [x] 商品管理（CRUD、上下架、库存管理）
- [x] 订单管理（创建、状态流转、物流追踪）
- [x] 支付模拟（成功/失败场景）
- [x] 退款流程（申请、审核、处理）
- [x] 图片上传功能
- [x] 实时通知系统（Socket.io）
- [x] 数据统计仪表盘
- [x] JWT 身份认证
- [x] 权限控制中间件

### 待开发功能 🚧

- [ ] 接入真实支付网关（微信支付/支付宝）
- [ ] 集成真实物流追踪 API
- [ ] 完善 RBAC 权限控制系统
- [ ] 多租户财务结算与分账
- [ ] 移动端适配（响应式设计）
- [ ] 购物车功能
- [ ] 商品评价系统
- [ ] 优惠券和促销活动
- [ ] 订单导出功能（Excel/PDF）
- [ ] 数据备份与恢复
- [ ] 邮件/短信通知
- [ ] 多语言支持（i18n）
- [ ] 性能监控与日志系统
- [ ] 单元测试和集成测试
- [ ] Docker 容器化部署

### 优化计划 🎯

- [ ] 数据库查询优化（添加索引）
- [ ] 图片压缩和 CDN 集成
- [ ] Redis 缓存层
- [ ] API 请求频率限制
- [ ] 前端代码分割和懒加载
- [ ] SEO 优化
- [ ] 无障碍访问（Accessibility）

## 项目亮点

### 架构设计

- **前后端分离**：React + Node.js，职责清晰，易于维护
- **三端协同**：管理端、用户端、商家端独立部署，互不干扰
- **RESTful API**：统一的接口规范，易于扩展
- **模块化设计**：代码结构清晰，组件可复用

### 技术特色

- **TypeScript**：类型安全，减少运行时错误
- **Redux Toolkit**：现代化的状态管理方案
- **Socket.io**：实时通知推送，提升用户体验
- **JWT 认证**：无状态认证，支持分布式部署
- **Mongoose ODM**：优雅的 MongoDB 对象建模

### 业务完整性

- **完整的电商流程**：从商品上传到订单完成的全链路
- **状态机管理**：订单、支付、物流状态严格流转
- **权限控制**：基于角色的访问控制，安全可靠
- **数据一致性**：三端数据实时同步，MongoDB 统一存储

## 项目文档

- [三角色商城需求文档](doc/三角色商城需求文档.md) - 详细的业务需求和功能说明
- [认证系统设计文档](doc/2026-04-23-auth-split-stripe-payment-design.md) - 认证和支付系统设计
- [商家商品上传设计](doc/2026-04-23-merchant-product-image-upload-design.md) - 图片上传功能设计
- [Supermarks 认证重设计](doc/2026-04-23-supermarks-auth-redesign-design.md) - 用户端认证系统

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循 ESLint 配置
- 使用 TypeScript 类型注解
- 编写清晰的注释
- 保持代码简洁易读

### 提交规范

使用语义化的提交信息：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具链相关

## 联系方式

- 项目作者：luxiaoguo
- 问题反馈：通过 GitHub Issues 提交

## 致谢

感谢以下开源项目：

- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)

## 许可证

ISC

---

**注意**：本项目仅供学习交流使用，不建议直接用于生产环境。
