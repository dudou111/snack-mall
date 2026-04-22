# Auth Split Stripe Payment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `supermarks` user/merchant authentication from `react-oa` administrator authentication while keeping shared commerce data visible across both apps, then replace local mock payment with Stripe test-mode payment.

**Architecture:** Add separate shop and admin account models plus scoped auth routes, then let shared business routes authenticate either scope and continue using role-based access. Stripe payment is handled by backend PaymentIntent endpoints, while `supermarks` confirms payment from the browser and syncs the resulting order state back to the shared `orders` collection.

**Tech Stack:** Express, Mongoose, JWT, MD5, Stripe Node SDK, React 18, Vite, Axios, Stripe.js.

---

## File Structure

- Create `server/model/shopUser.js`: frontend user and merchant account schema, collection `supermarks_users`.
- Create `server/model/adminUser.js`: backend administrator account schema, collection `admin_users`.
- Create `server/utils/authToken.js`: shared JWT signing and token parsing helpers with `authScope`.
- Create `server/controllers/shopAuthCtrl.js`: register/login/check handlers for `supermarks`.
- Create `server/controllers/adminAuthCtrl.js`: login/check handlers for `react-oa`.
- Create `server/router/shopAuthRouter.js`: `/api/shop-auth/*` validation and routes.
- Create `server/router/adminAuthRouter.js`: `/api/admin-auth/*` validation and routes.
- Modify `server/middleware/auth.js`: shared business-route auth that resolves both `shop` and `admin` tokens.
- Create `server/middleware/shopAuth.js`: strict shop-only route auth.
- Create `server/middleware/adminAuth.js`: strict admin-only route auth.
- Modify `server/controllers/orderCtrl.js`: keep role filtering working with split identities and add Stripe PaymentIntent/confirmation handlers.
- Modify `server/model/Order.js`: add Stripe payment fields and allow `Stripe测试支付` in payment method enum.
- Modify `server/model/Product.js`: ensure merchant IDs can still be compared as ObjectId strings without depending on old `User` populate.
- Modify `server/router/orderRouter.js`: add Stripe pay endpoints.
- Modify `server/index.js`: mount shop/admin auth routers and initialize default admin account.
- Modify `server/package.json`: add `stripe` dependency and focused test scripts.
- Modify `supermarks/src/api/auth.ts`: point auth calls to `/api/shop-auth/*`.
- Modify `supermarks/src/api/order.ts`: add Stripe payment API methods.
- Modify `supermarks/src/types/index.ts`: add Stripe fields to order types.
- Modify `supermarks/src/pages/UserOrdersPage.tsx`: replace mock pay buttons with Stripe test payment entry.
- Create `supermarks/src/api/stripeClient.ts`: lazy-load Stripe publishable key.
- Modify `supermarks/package.json`: add `@stripe/stripe-js`.
- Modify `react-oa/src/store/modules/user.ts`: point admin auth calls to `/api/admin-auth/*`.
- Modify `react-oa/src/views/Login/index.tsx`: remove or disable backend registration behavior for admin portal.
- Modify `react-oa/src/api/order.ts`: surface Stripe payment fields in order types.
- Modify `react-oa/src/views/Orders/List.tsx`: show Stripe payment provider/intent in order detail.

## Task 1: Account Models And Token Helper

**Files:**
- Create: `server/model/shopUser.js`
- Create: `server/model/adminUser.js`
- Create: `server/utils/authToken.js`
- Create: `server/test-auth-models.js`
- Modify: `server/package.json`

- [ ] **Step 1: Write the failing model/token test**

Create `server/test-auth-models.js`:

```js
const assert = require('assert');
const ShopUser = require('./model/shopUser');
const AdminUser = require('./model/adminUser');
const { signAuthToken, verifyAuthToken } = require('./utils/authToken');

const shopCollection = ShopUser.collection.name;
const adminCollection = AdminUser.collection.name;

assert.strictEqual(shopCollection, 'supermarks_users');
assert.strictEqual(adminCollection, 'admin_users');

const shopUser = new ShopUser({ username: 'buyer01', password: '123456', role: 'user' });
assert.strictEqual(shopUser.role, 'user');
assert.strictEqual(shopUser.status, '启用');

const merchant = new ShopUser({ username: 'merchant01', password: '123456', role: 'merchant' });
assert.strictEqual(merchant.role, 'merchant');

assert.throws(
  () => new ShopUser({ username: 'badadmin', password: '123456', role: 'admin' }).validateSync(),
  /`admin` is not a valid enum value/
);

const admin = new AdminUser({ username: 'root', password: '123456' });
assert.strictEqual(admin.role, 'admin');
assert.strictEqual(admin.status, '启用');

const token = signAuthToken({ _id: '507f1f77bcf86cd799439011', username: 'root', role: 'admin', authScope: 'admin' });
const decoded = verifyAuthToken(token);
assert.strictEqual(decoded.authScope, 'admin');
assert.strictEqual(decoded.role, 'admin');

console.log('auth model tests passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server; node test-auth-models.js`

Expected: FAIL with `Cannot find module './model/shopUser'`.

- [ ] **Step 3: Add package script**

Modify `server/package.json` scripts:

```json
"test:auth-models": "node test-auth-models.js"
```

- [ ] **Step 4: Implement `server/model/shopUser.js`**

```js
const mongoose = require('mongoose');

const shopUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    plainPassword: {
        type: String,
        default: undefined,
        select: false
    },
    avatar: {
        type: String,
        default: 'http://127.0.0.1:8088/default-avatar.jpg'
    },
    tel: {
        type: String,
        validate: {
            validator: function (value) {
                return !value || /^1[3-9]\d{9}$/.test(value);
            },
            message: '手机号格式不正确'
        }
    },
    email: {
        type: String,
        validate: {
            validator: function (value) {
                return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: '邮箱格式不正确'
        }
    },
    role: {
        type: String,
        enum: ['user', 'merchant'],
        default: 'user'
    },
    merchantProfile: {
        shopName: { type: String, default: '' },
        contactName: { type: String, default: '' },
        contactPhone: { type: String, default: '' }
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    lastLoginTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['启用', '禁用', '封禁'],
        default: '启用'
    }
}, {
    timestamps: true,
    collection: 'supermarks_users'
});

module.exports = mongoose.model('ShopUser', shopUserSchema);
```

- [ ] **Step 5: Implement `server/model/adminUser.js`**

```js
const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    plainPassword: {
        type: String,
        default: undefined,
        select: false
    },
    avatar: {
        type: String,
        default: 'http://127.0.0.1:8088/default-avatar.jpg'
    },
    tel: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    },
    isAdmin: {
        type: Boolean,
        default: true
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    lastLoginTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['启用', '禁用', '封禁'],
        default: '启用'
    }
}, {
    timestamps: true,
    collection: 'admin_users'
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
```

- [ ] **Step 6: Implement `server/utils/authToken.js`**

```js
const JWT = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'QW';

function signAuthToken(user) {
    const payload = {
        _id: String(user._id),
        username: user.username,
        role: user.role,
        authScope: user.authScope
    };

    return JWT.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyAuthToken(token) {
    return JWT.verify(token, JWT_SECRET);
}

function normalizeBearerToken(headerValue) {
    if (!headerValue) return '';
    return String(headerValue).replace('Bearer ', '').replace(/"/g, '').trim();
}

module.exports = {
    JWT_SECRET,
    signAuthToken,
    verifyAuthToken,
    normalizeBearerToken
};
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd server; npm run test:auth-models`

Expected: PASS with `auth model tests passed`.

- [ ] **Step 8: Commit**

```bash
git add server/model/shopUser.js server/model/adminUser.js server/utils/authToken.js server/test-auth-models.js server/package.json
git commit -m "feat: add split auth account models"
```

## Task 2: Shop And Admin Auth Routes

**Files:**
- Create: `server/controllers/shopAuthCtrl.js`
- Create: `server/controllers/adminAuthCtrl.js`
- Create: `server/router/shopAuthRouter.js`
- Create: `server/router/adminAuthRouter.js`
- Create: `server/test-auth-routes.js`
- Modify: `server/package.json`
- Modify: `server/index.js`

- [ ] **Step 1: Write the failing route-shape test**

Create `server/test-auth-routes.js`:

```js
const assert = require('assert');

const shopAuthRouter = require('./router/shopAuthRouter');
const adminAuthRouter = require('./router/adminAuthRouter');

function routePaths(router) {
    return router.stack
        .filter((layer) => layer.route)
        .map((layer) => {
            const methods = Object.keys(layer.route.methods).sort().join(',');
            return `${methods.toUpperCase()} ${layer.route.path}`;
        });
}

assert.deepStrictEqual(routePaths(shopAuthRouter), [
    'POST /register',
    'POST /login',
    'GET /check_login'
]);

assert.deepStrictEqual(routePaths(adminAuthRouter), [
    'POST /login',
    'GET /check_login'
]);

console.log('auth route tests passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server; node test-auth-routes.js`

Expected: FAIL with `Cannot find module './router/shopAuthRouter'`.

- [ ] **Step 3: Add package script**

Modify `server/package.json` scripts:

```json
"test:auth-routes": "node test-auth-routes.js"
```

- [ ] **Step 4: Implement `server/controllers/shopAuthCtrl.js`**

Use the existing `authCtrl` response shape and create handlers named `register`, `login`, and `checkLogin`.

Key implementation details:

```js
const ShopUser = require('../model/shopUser');
const MD5 = require('md5');
const { signAuthToken } = require('../utils/authToken');

function publicUser(user) {
    const data = user.toObject ? user.toObject() : { ...user };
    delete data.password;
    delete data.plainPassword;
    data.authScope = 'shop';
    data.isAdmin = false;
    return data;
}

exports.register = async (req, res) => {
    const { username, password, tel, email, role } = req.body;
    const safeRole = role === 'merchant' ? 'merchant' : 'user';

    const existingUser = await ShopUser.findOne({ username: username.trim() });
    if (existingUser) return res.json({ code: 1, message: '用户名已存在，请选择其他用户名' });

    if (tel && await ShopUser.findOne({ tel })) return res.json({ code: 1, message: '手机号已被注册' });
    if (email && await ShopUser.findOne({ email })) return res.json({ code: 1, message: '邮箱已被注册' });

    const newUser = await ShopUser.create({
        username: username.trim(),
        password: MD5(password),
        plainPassword: process.env.NODE_ENV !== 'production' ? password : undefined,
        tel: tel || undefined,
        email: email || undefined,
        role: safeRole
    });

    return res.json({ code: 0, message: '注册成功', data: { userInfo: publicUser(newUser) } });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await ShopUser.findOne({ username, password: MD5(password), status: '启用' });

    if (!user) {
        const existingUser = await ShopUser.findOne({ username });
        if (!existingUser) return res.json({ code: 1, message: '用户不存在' });
        if (existingUser.status !== '启用') return res.json({ code: 1, message: '账户已被禁用，请联系管理员' });
        return res.json({ code: 1, message: '密码不正确' });
    }

    await ShopUser.findByIdAndUpdate(user._id, { lastLoginTime: new Date() });
    const userInfo = publicUser(user);
    const token = signAuthToken({ ...userInfo, authScope: 'shop' });
    return res.json({ code: 0, message: '登录成功', data: { userInfo, token } });
};

exports.checkLogin = async (req, res) => {
    return res.json({ code: 0, message: '验证成功', data: publicUser(req.userInfo) });
};
```

- [ ] **Step 5: Implement `server/controllers/adminAuthCtrl.js`**

Use no public register handler.

Key implementation details:

```js
const AdminUser = require('../model/adminUser');
const MD5 = require('md5');
const { signAuthToken } = require('../utils/authToken');

function publicAdmin(user) {
    const data = user.toObject ? user.toObject() : { ...user };
    delete data.password;
    delete data.plainPassword;
    data.role = 'admin';
    data.isAdmin = true;
    data.authScope = 'admin';
    return data;
}

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const admin = await AdminUser.findOne({ username, password: MD5(password), status: '启用' });

    if (!admin) {
        const existingAdmin = await AdminUser.findOne({ username });
        if (!existingAdmin) return res.json({ code: 1, message: '管理员不存在' });
        if (existingAdmin.status !== '启用') return res.json({ code: 1, message: '管理员账号已被禁用' });
        return res.json({ code: 1, message: '密码不正确' });
    }

    await AdminUser.findByIdAndUpdate(admin._id, { lastLoginTime: new Date() });
    const userInfo = publicAdmin(admin);
    const token = signAuthToken({ ...userInfo, authScope: 'admin' });
    return res.json({ code: 0, message: '登录成功', data: { userInfo, token } });
};

exports.checkLogin = async (req, res) => {
    return res.json({ code: 0, message: '验证成功', data: publicAdmin(req.userInfo) });
};
```

- [ ] **Step 6: Implement auth routers**

`server/router/shopAuthRouter.js`:

```js
const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const shopAuthCtrl = require('../controllers/shopAuthCtrl');
const shopAuth = require('../middleware/shopAuth');

const router = new Router();

function validate(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    return res.json({ code: 1, message: result.array().map((err) => err.msg).join(', ') });
}

router.post('/register', [
    body('username').notEmpty().withMessage('用户名不能为空').isLength({ min: 2, max: 20 }).withMessage('用户名长度必须在2-20个字符之间').matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/).withMessage('用户名只能包含字母、数字、下划线和中文'),
    body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6, max: 20 }).withMessage('密码长度必须在6-20个字符之间'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('两次输入的密码不一致');
        return true;
    }),
    body('role').optional().isIn(['user', 'merchant']).withMessage('身份只能是用户或商家'),
    body('tel').optional({ checkFalsy: true }).matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('邮箱格式不正确')
], validate, shopAuthCtrl.register);

router.post('/login', [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
], validate, shopAuthCtrl.login);

router.get('/check_login', shopAuth, shopAuthCtrl.checkLogin);

module.exports = router;
```

`server/router/adminAuthRouter.js`:

```js
const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const adminAuthCtrl = require('../controllers/adminAuthCtrl');
const adminAuth = require('../middleware/adminAuth');

const router = new Router();

function validate(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    return res.json({ code: 1, message: result.array().map((err) => err.msg).join(', ') });
}

router.post('/login', [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
], validate, adminAuthCtrl.login);

router.get('/check_login', adminAuth, adminAuthCtrl.checkLogin);

module.exports = router;
```

- [ ] **Step 7: Mount routers and seed admin**

Modify `server/index.js`:

```js
const shopAuthRouter = require('./router/shopAuthRouter');
const adminAuthRouter = require('./router/adminAuthRouter');
const AdminUser = require('./model/adminUser');
const MD5 = require('md5');
```

After DB connection succeeds, before mounting routes:

```js
const rootAdmin = await AdminUser.findOne({ username: 'root' });
if (!rootAdmin) {
    await AdminUser.create({
        username: 'root',
        password: MD5('123456'),
        plainPassword: process.env.NODE_ENV !== 'production' ? '123456' : undefined,
        tel: '13812345678',
        role: 'admin',
        isAdmin: true,
        avatar: 'http://127.0.0.1:8088/default-avatar.jpg'
    });
    console.log('✅ 初始后台管理员账号创建成功');
}
```

Route mounting:

```js
app.use('/api/shop-auth', shopAuthRouter);
app.use('/api/admin-auth', adminAuthRouter);
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd server; npm run test:auth-routes`

Expected: PASS with `auth route tests passed`.

- [ ] **Step 9: Commit**

```bash
git add server/controllers/shopAuthCtrl.js server/controllers/adminAuthCtrl.js server/router/shopAuthRouter.js server/router/adminAuthRouter.js server/test-auth-routes.js server/package.json server/index.js
git commit -m "feat: split shop and admin auth routes"
```

## Task 3: Scoped Auth Middleware For Shared Business Routes

**Files:**
- Create: `server/middleware/shopAuth.js`
- Create: `server/middleware/adminAuth.js`
- Modify: `server/middleware/auth.js`
- Create: `server/test-auth-middleware.js`
- Modify: `server/package.json`

- [ ] **Step 1: Write the failing middleware export test**

Create `server/test-auth-middleware.js`:

```js
const assert = require('assert');
const sharedAuth = require('./middleware/auth');
const shopAuth = require('./middleware/shopAuth');
const adminAuth = require('./middleware/adminAuth');

assert.strictEqual(typeof sharedAuth, 'function');
assert.strictEqual(typeof shopAuth, 'function');
assert.strictEqual(typeof adminAuth, 'function');

assert.strictEqual(sharedAuth.allowedScopes.join(','), 'shop,admin');
assert.strictEqual(shopAuth.allowedScopes.join(','), 'shop');
assert.strictEqual(adminAuth.allowedScopes.join(','), 'admin');

console.log('auth middleware tests passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server; node test-auth-middleware.js`

Expected: FAIL with `Cannot find module './middleware/shopAuth'`.

- [ ] **Step 3: Add package script**

Modify `server/package.json` scripts:

```json
"test:auth-middleware": "node test-auth-middleware.js"
```

- [ ] **Step 4: Implement a scoped middleware factory inside `server/middleware/auth.js`**

Replace the existing implementation with:

```js
const ShopUser = require('../model/shopUser');
const AdminUser = require('../model/adminUser');
const { normalizeBearerToken, verifyAuthToken } = require('../utils/authToken');

const modelByScope = {
    shop: ShopUser,
    admin: AdminUser
};

function createAuthMiddleware(allowedScopes) {
    const middleware = async (req, res, next) => {
        try {
            const token = normalizeBearerToken(req.headers.authorization);
            if (!token) return res.json({ code: 1, message: '缺少认证令牌，请先登录' });

            const decoded = verifyAuthToken(token);
            const authScope = decoded.authScope;

            if (!allowedScopes.includes(authScope)) {
                return res.json({ code: 1, message: '当前账号无权访问该入口' });
            }

            const Model = modelByScope[authScope];
            const user = Model ? await Model.findById(decoded._id, { password: 0 }) : null;

            if (!user) return res.json({ code: 1, message: '用户不存在，请重新登录' });
            if (user.status !== '启用') return res.json({ code: 1, message: '账户已被禁用，请联系管理员' });

            const role = authScope === 'admin' ? 'admin' : user.role;
            req.userInfo = user;
            req.userInfo.role = role;
            req.userInfo.authScope = authScope;
            req.userInfo.isAdmin = authScope === 'admin';
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') return res.json({ code: 1, message: '登录已过期，请重新登录' });
            if (error.name === 'JsonWebTokenError') return res.json({ code: 1, message: '认证令牌无效，请重新登录' });
            return res.json({ code: 1, message: '认证失败，请重新登录' });
        }
    };

    middleware.allowedScopes = allowedScopes;
    return middleware;
}

const sharedAuth = createAuthMiddleware(['shop', 'admin']);
sharedAuth.createAuthMiddleware = createAuthMiddleware;

module.exports = sharedAuth;
```

- [ ] **Step 5: Implement strict shop/admin middleware files**

`server/middleware/shopAuth.js`:

```js
const sharedAuth = require('./auth');

module.exports = sharedAuth.createAuthMiddleware(['shop']);
```

`server/middleware/adminAuth.js`:

```js
const sharedAuth = require('./auth');

module.exports = sharedAuth.createAuthMiddleware(['admin']);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd server; npm run test:auth-middleware`

Expected: PASS with `auth middleware tests passed`.

- [ ] **Step 7: Commit**

```bash
git add server/middleware/auth.js server/middleware/shopAuth.js server/middleware/adminAuth.js server/test-auth-middleware.js server/package.json
git commit -m "feat: support scoped auth middleware"
```

## Task 4: Stripe Payment Backend

**Files:**
- Modify: `server/model/Order.js`
- Modify: `server/controllers/orderCtrl.js`
- Modify: `server/router/orderRouter.js`
- Create: `server/test-stripe-payment-shape.js`
- Modify: `server/package.json`

- [ ] **Step 1: Install backend Stripe dependency**

Run: `cd server; npm install stripe`

Expected: `stripe` appears in `server/package.json` dependencies.

- [ ] **Step 2: Write the failing Stripe route/model test**

Create `server/test-stripe-payment-shape.js`:

```js
const assert = require('assert');
const Order = require('./model/Order');
const orderRouter = require('./router/orderRouter');
const orderCtrl = require('./controllers/orderCtrl');

const paymentMethodEnum = Order.schema.path('paymentMethod').enumValues;
assert(paymentMethodEnum.includes('Stripe测试支付'));

assert(Order.schema.path('stripePaymentIntentId'));
assert(Order.schema.path('paymentProvider'));

const routes = orderRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => `${Object.keys(layer.route.methods).sort().join(',').toUpperCase()} ${layer.route.path}`);

assert(routes.includes('POST /pay/stripe-intent'));
assert(routes.includes('POST /pay/stripe-confirm'));
assert.strictEqual(typeof orderCtrl.createStripePaymentIntent, 'function');
assert.strictEqual(typeof orderCtrl.confirmStripePayment, 'function');

console.log('stripe payment shape tests passed');
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd server; node test-stripe-payment-shape.js`

Expected: FAIL because `Stripe测试支付` and Stripe route handlers are missing.

- [ ] **Step 4: Add package script**

Modify `server/package.json` scripts:

```json
"test:stripe-shape": "node test-stripe-payment-shape.js"
```

- [ ] **Step 5: Extend `server/model/Order.js`**

Update `paymentMethod.enum`:

```js
enum: ['微信支付', '支付宝', '现金', 'Stripe测试支付']
```

Add fields near payment metadata:

```js
paymentProvider: {
    type: String,
    enum: ['', 'mock', 'stripe_test'],
    default: ''
},
stripePaymentIntentId: {
    type: String,
    default: ''
},
stripePaymentStatus: {
    type: String,
    default: ''
}
```

- [ ] **Step 6: Add Stripe helpers and handlers in `server/controllers/orderCtrl.js`**

At the top:

```js
const Stripe = require('stripe');
```

Add helper:

```js
function getStripeClient() {
    if (!process.env.STRIPE_SECRET_KEY) {
        const error = new Error('Stripe 测试密钥未配置');
        error.code = 'STRIPE_NOT_CONFIGURED';
        throw error;
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function toStripeAmount(amount) {
    return Math.round(Number(amount) * 100);
}
```

Add controller:

```js
exports.createStripePaymentIntent = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.json({ code: 1, message: 'orderId不能为空' });

        const order = await Order.findById(orderId);
        if (!order) return res.json({ code: 1, message: '订单不存在' });
        if (!canAccessOrder(order, req.userInfo)) return res.json({ code: 1, message: '无权支付该订单' });
        if (getRole(req.userInfo) !== 'user') return res.json({ code: 1, message: '仅普通用户可以支付订单' });
        if (order.paymentStatus !== '未支付') return res.json({ code: 1, message: '该订单不是未支付状态' });

        const stripe = getStripeClient();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: toStripeAmount(order.actualAmount),
            currency: 'cny',
            metadata: {
                orderId: String(order._id),
                orderNumber: order.orderNumber
            },
            automatic_payment_methods: {
                enabled: true
            }
        });

        await Order.findByIdAndUpdate(order._id, {
            paymentProvider: 'stripe_test',
            paymentMethod: 'Stripe测试支付',
            stripePaymentIntentId: paymentIntent.id,
            stripePaymentStatus: paymentIntent.status,
            paymentFailReason: ''
        });

        return res.json({
            code: 0,
            message: 'Stripe支付意图创建成功',
            data: {
                orderId: String(order._id),
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret
            }
        });
    } catch (error) {
        const message = error.code === 'STRIPE_NOT_CONFIGURED' ? error.message : '创建Stripe支付失败';
        return res.json({ code: 1, message, error: error.message });
    }
};

exports.confirmStripePayment = async (req, res) => {
    try {
        const { orderId, paymentIntentId } = req.body;
        if (!orderId || !paymentIntentId) return res.json({ code: 1, message: 'orderId和paymentIntentId不能为空' });

        const order = await Order.findById(orderId);
        if (!order) return res.json({ code: 1, message: '订单不存在' });
        if (!canAccessOrder(order, req.userInfo)) return res.json({ code: 1, message: '无权确认该订单支付' });
        if (String(order.stripePaymentIntentId) !== String(paymentIntentId)) return res.json({ code: 1, message: '支付流水与订单不匹配' });

        const stripe = getStripeClient();
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        const updateData = {
            stripePaymentStatus: paymentIntent.status,
            paymentProvider: 'stripe_test',
            paymentMethod: 'Stripe测试支付'
        };

        if (paymentIntent.status === 'succeeded') {
            updateData.paymentStatus = '已支付';
            updateData.status = order.status === '待支付' ? '待发货' : order.status;
            updateData.paymentTime = order.paymentTime || new Date();
            updateData.paymentMockNo = paymentIntent.id;
            updateData.paymentFailReason = '';
        } else {
            updateData.paymentFailReason = `Stripe支付状态：${paymentIntent.status}`;
        }

        const updatedOrder = await Order.findByIdAndUpdate(order._id, updateData, { new: true });
        return res.json({
            code: paymentIntent.status === 'succeeded' ? 0 : 1,
            message: paymentIntent.status === 'succeeded' ? 'Stripe测试支付成功' : 'Stripe测试支付未完成',
            data: updatedOrder
        });
    } catch (error) {
        const message = error.code === 'STRIPE_NOT_CONFIGURED' ? error.message : '确认Stripe支付失败';
        return res.json({ code: 1, message, error: error.message });
    }
};
```

- [ ] **Step 7: Add routes in `server/router/orderRouter.js`**

```js
router.post('/pay/stripe-intent', auth, orderCtrl.createStripePaymentIntent);
router.post('/pay/stripe-confirm', auth, orderCtrl.confirmStripePayment);
```

Place them near `/pay/mock`.

- [ ] **Step 8: Run test to verify it passes**

Run: `cd server; npm run test:stripe-shape`

Expected: PASS with `stripe payment shape tests passed`.

- [ ] **Step 9: Commit**

```bash
git add server/model/Order.js server/controllers/orderCtrl.js server/router/orderRouter.js server/test-stripe-payment-shape.js server/package.json server/package-lock.json
git commit -m "feat: add stripe test payment endpoints"
```

## Task 5: Supermarks Auth And Stripe Frontend

**Files:**
- Create: `supermarks/src/api/stripeClient.ts`
- Modify: `supermarks/src/api/auth.ts`
- Modify: `supermarks/src/api/order.ts`
- Modify: `supermarks/src/types/index.ts`
- Modify: `supermarks/src/pages/UserOrdersPage.tsx`
- Modify: `supermarks/package.json`

- [ ] **Step 1: Install frontend Stripe dependency**

Run: `cd supermarks; npm install @stripe/stripe-js`

Expected: `@stripe/stripe-js` appears in `supermarks/package.json`.

- [ ] **Step 2: Switch auth endpoints in `supermarks/src/api/auth.ts`**

Replace URLs:

```ts
url: "/api/shop-auth/login"
url: "/api/shop-auth/register"
url: "/api/shop-auth/check_login"
```

- [ ] **Step 3: Add Stripe API methods in `supermarks/src/api/order.ts`**

Add interfaces:

```ts
export interface StripeIntentPayload {
  orderId: string;
}

export interface StripeIntentResponse {
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
}

export interface StripeConfirmPayload {
  orderId: string;
  paymentIntentId: string;
}
```

Add methods:

```ts
createStripePaymentIntent: (payload: StripeIntentPayload) =>
  request<StripeIntentResponse>({
    url: "/api/order/pay/stripe-intent",
    method: "POST",
    data: payload
  }),

confirmStripePayment: (payload: StripeConfirmPayload) =>
  request<OrderEntity>({
    url: "/api/order/pay/stripe-confirm",
    method: "POST",
    data: payload
  }),
```

- [ ] **Step 4: Add Stripe fields in `supermarks/src/types/index.ts`**

Add to `OrderEntity`:

```ts
paymentProvider?: "" | "mock" | "stripe_test";
stripePaymentIntentId?: string;
stripePaymentStatus?: string;
```

Update payment method comments/types if present to include `Stripe测试支付`.

- [ ] **Step 5: Add lazy Stripe client**

Create `supermarks/src/api/stripeClient.ts`:

```ts
import { loadStripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export function getStripePublishableKey(): string {
  if (!publishableKey) {
    throw new Error("Stripe 测试公钥未配置，请设置 VITE_STRIPE_PUBLISHABLE_KEY");
  }
  return publishableKey;
}

export const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);
```

- [ ] **Step 6: Replace mock pay actions in `UserOrdersPage.tsx`**

Replace `handlePay(orderId, mockResult)` with:

```tsx
async function handleStripePay(order: OrderEntity) {
  setActionId(order._id + "stripe");
  setError("");
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      getStripePublishableKey();
      return;
    }

    const intent = await orderApi.createStripePaymentIntent({ orderId: order._id });
    const result = await stripe.confirmPayment({
      clientSecret: intent.clientSecret,
      confirmParams: {
        return_url: window.location.href
      },
      redirect: "if_required"
    });

    if (result.error) {
      throw new Error(result.error.message || "Stripe 测试支付失败");
    }

    const paymentIntentId = result.paymentIntent?.id || intent.paymentIntentId;
    await orderApi.confirmStripePayment({
      orderId: order._id,
      paymentIntentId
    });
    await loadOrders();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Stripe 支付操作失败");
  } finally {
    setActionId("");
  }
}
```

Add imports:

```tsx
import { getStripePublishableKey, stripePromise } from "../api/stripeClient";
```

Replace pay buttons with one button and helper text:

```tsx
<button
  className="primary-btn"
  disabled={actionId === order._id + "stripe"}
  onClick={() => handleStripePay(order)}
>
  {actionId === order._id + "stripe" ? "支付处理中..." : "Stripe 测试支付"}
</button>
<span className="muted">测试卡：4242 4242 4242 4242</span>
```

- [ ] **Step 7: Build supermarks**

Run: `cd supermarks; npm run build`

Expected: TypeScript and Vite build succeed.

- [ ] **Step 8: Commit**

```bash
git add supermarks/src/api/stripeClient.ts supermarks/src/api/auth.ts supermarks/src/api/order.ts supermarks/src/types/index.ts supermarks/src/pages/UserOrdersPage.tsx supermarks/package.json supermarks/package-lock.json
git commit -m "feat: connect supermarks to shop auth and stripe"
```

## Task 6: React-OA Admin Auth And Order Visibility

**Files:**
- Modify: `react-oa/src/store/modules/user.ts`
- Modify: `react-oa/src/views/Login/index.tsx`
- Modify: `react-oa/src/api/order.ts`
- Modify: `react-oa/src/views/Orders/List.tsx`

- [ ] **Step 1: Switch admin auth endpoints**

In `react-oa/src/store/modules/user.ts`, replace:

```ts
request.post('/api/auth/login', payload)
request.post('/api/auth/register', payload, { uptoken: false })
request.get('/api/auth/check_login')
```

With:

```ts
request.post('/api/admin-auth/login', payload)
Promise.resolve({ data: { code: 1, message: '后台管理端不开放注册，请使用管理员账号登录' }, status: 200 })
request.get('/api/admin-auth/check_login')
```

- [ ] **Step 2: Disable backend registration in login page**

In `react-oa/src/views/Login/index.tsx`, keep the tab if preserving UI is safer, but change submit behavior to show:

```ts
messageApi.warning('后台管理端不开放注册，请使用管理员账号登录');
```

Do not dispatch `toRegisterAction` from the admin login page.

- [ ] **Step 3: Add Stripe fields to admin order type**

In `react-oa/src/api/order.ts`, add to `Order`:

```ts
paymentProvider?: '' | 'mock' | 'stripe_test';
stripePaymentIntentId?: string;
stripePaymentStatus?: string;
paymentMockNo?: string;
paymentFailReason?: string;
```

Update `paymentMethod` type:

```ts
paymentMethod: '微信支付' | '支付宝' | '现金' | 'Stripe测试支付';
```

- [ ] **Step 4: Show Stripe payment information in order detail**

In `react-oa/src/views/Orders/List.tsx`, inside the drawer after amount information:

```tsx
<h3>支付信息</h3>
<p><strong>支付方式：</strong>{currentOrder.paymentMethod || '-'}</p>
<p><strong>支付状态：</strong>{currentOrder.paymentStatus}</p>
{currentOrder.paymentProvider ? <p><strong>支付通道：</strong>{currentOrder.paymentProvider}</p> : null}
{currentOrder.stripePaymentIntentId ? <p><strong>Stripe流水：</strong>{currentOrder.stripePaymentIntentId}</p> : null}
{currentOrder.paymentMockNo ? <p><strong>支付流水：</strong>{currentOrder.paymentMockNo}</p> : null}
{currentOrder.paymentFailReason ? <p><strong>失败原因：</strong>{currentOrder.paymentFailReason}</p> : null}
```

- [ ] **Step 5: Build react-oa**

Run: `cd react-oa; npm run build`

Expected: TypeScript and Vite build succeed.

- [ ] **Step 6: Commit**

```bash
git add react-oa/src/store/modules/user.ts react-oa/src/views/Login/index.tsx react-oa/src/api/order.ts react-oa/src/views/Orders/List.tsx
git commit -m "feat: connect react oa to admin auth"
```

## Task 7: Product And Order Role Compatibility

**Files:**
- Modify: `server/controllers/productCtrl.js`
- Modify: `server/model/Product.js`
- Modify: `server/controllers/orderCtrl.js`
- Create: `server/test-role-compat.js`
- Modify: `server/package.json`

- [ ] **Step 1: Write role compatibility test**

Create `server/test-role-compat.js`:

```js
const assert = require('assert');
const Product = require('./model/Product');
const orderCtrl = require('./controllers/orderCtrl');

assert(Product.schema.path('merchantId'));
assert.strictEqual(typeof orderCtrl.__testables.getRole({ role: 'merchant' }), 'string');
assert.strictEqual(orderCtrl.__testables.getRole({ role: 'merchant' }), 'merchant');
assert.strictEqual(orderCtrl.__testables.getRole({ role: 'admin', isAdmin: true }), 'admin');
assert.strictEqual(orderCtrl.__testables.getRole({ authScope: 'admin' }), 'admin');

console.log('role compatibility tests passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server; node test-role-compat.js`

Expected: FAIL because `orderCtrl.__testables` does not exist.

- [ ] **Step 3: Add package script**

Modify `server/package.json` scripts:

```json
"test:role-compat": "node test-role-compat.js"
```

- [ ] **Step 4: Export order role helpers for tests**

At the end of `server/controllers/orderCtrl.js`:

```js
exports.__testables = {
    getRole,
    isAdmin,
    isMerchant,
    canAccessOrder
};
```

Update `getRole` if needed:

```js
const getRole = (userInfo) => {
    if (!userInfo) return 'guest';
    if (userInfo.authScope === 'admin') return 'admin';
    if (userInfo.role) return userInfo.role;
    return userInfo.isAdmin ? 'admin' : 'user';
};
```

- [ ] **Step 5: Ensure products store merchant IDs from shop users**

In `server/controllers/productCtrl.js`, wherever product creation sets merchant identity, use:

```js
merchantId: req.userInfo?._id || null
```

Do not import or populate the old `User` model for merchant permission checks.

- [ ] **Step 6: Run test to verify it passes**

Run: `cd server; npm run test:role-compat`

Expected: PASS with `role compatibility tests passed`.

- [ ] **Step 7: Commit**

```bash
git add server/controllers/productCtrl.js server/model/Product.js server/controllers/orderCtrl.js server/test-role-compat.js server/package.json
git commit -m "fix: keep business role checks compatible with split auth"
```

## Task 8: Full Verification

**Files:**
- No production files unless verification exposes a defect.

- [ ] **Step 1: Run focused backend tests**

Run:

```bash
cd server
npm run test:auth-models
npm run test:auth-routes
npm run test:auth-middleware
npm run test:stripe-shape
npm run test:role-compat
```

Expected: all pass.

- [ ] **Step 2: Run backend startup smoke check**

Run: `cd server; npm run start`

Expected:

- MongoDB connects to `mongodb://127.0.0.1:27017/snack-mall`.
- Server listens on `http://127.0.0.1:8088`.
- Log shows `/api/shop-auth` and `/api/admin-auth` routes are mounted by successful startup, with no route errors.

- [ ] **Step 3: Run frontend builds**

Run:

```bash
cd supermarks
npm run build
cd ../react-oa
npm run build
```

Expected: both builds succeed.

- [ ] **Step 4: Manual flow verification**

Use MongoDB running and server running:

- Register a `supermarks` user from `/register`.
- Register a `supermarks` merchant from `/register`.
- Verify both can log into `supermarks`.
- Verify those credentials cannot log into `react-oa`.
- Log into `react-oa` with `root / 123456`.
- As merchant, upload a product.
- As user, create an order.
- Confirm the order appears in user orders, merchant dashboard, and `react-oa` order list.
- Configure `VITE_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` with test keys.
- Use Stripe test card `4242 4242 4242 4242` to pay the order.
- Verify order state becomes `已支付 / 待发货`.
- Apply refund from `supermarks`.
- Approve or reject refund in `react-oa`.
- Verify user sees the final refund status.

- [ ] **Step 5: Commit verification-only fixes if needed**

If verification exposes fixes:

```bash
git add <changed-files>
git commit -m "fix: stabilize auth split stripe flow"
```

If no fixes are needed, do not create an empty commit.

## Self-Review

- Spec coverage: the plan covers split shop/admin accounts, shared business auth, Stripe test PaymentIntent flow, frontend endpoint switching, admin order visibility, and verification of orders/logistics/refunds.
- Placeholder scan: the plan contains no unresolved markers or incomplete implementation notes. Environment keys are intentionally represented as `<your_stripe_test_secret_key>` and `<your_stripe_test_publishable_key>` in the design, not as code placeholders in this plan.
- Type consistency: account scopes use `shop` and `admin`; roles use `user`, `merchant`, and `admin`; Stripe order fields use `paymentProvider`, `stripePaymentIntentId`, and `stripePaymentStatus` consistently.

## Execution Options

Plan complete and saved to `doc/2026-04-23-auth-split-stripe-payment-plan.md`.

1. **Subagent-Driven (recommended)** - Dispatch a fresh worker per task, review between tasks, fastest for independent backend/frontend slices.
2. **Inline Execution** - Execute tasks in this session using checkpoints, better if you want one continuous thread with fewer moving parts.

Recommended for this repo: **Inline Execution**, because the workspace is already dirty and several touched files have existing user changes that need careful preservation.
