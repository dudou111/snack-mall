// 业务接口共享认证：支持 supermarks 前台账号和 react-oa 后台管理员账号。
const ShopUser = require('../model/shopUser');
const AdminUser = require('../model/adminUser');
const User = require('../model/user');
const { normalizeBearerToken, verifyAuthToken } = require('../utils/authToken');

const modelByScope = {
    shop: ShopUser,
    admin: AdminUser
};

function attachRuntimeAuthFields(user, authScope, role) {
    user.role = role;
    user.authScope = authScope;
    user.isAdmin = authScope === 'admin';
    return user;
}

function createAuthMiddleware(allowedScopes) {
    const middleware = async (req, res, next) => {
        try {
            const token = normalizeBearerToken(req.headers.authorization);
            if (!token) {
                return res.json({
                    code: 1,
                    message: '缺少认证令牌，请先登录'
                });
            }

            const decoded = verifyAuthToken(token);
            const authScope = decoded.authScope;

            if (!authScope) {
                if (!allowedScopes.includes('shop')) {
                    return res.json({
                        code: 1,
                        message: '当前账号无权访问该入口'
                    });
                }

                const legacyUser = await User.findById(decoded._id, { password: 0 });
                if (!legacyUser) {
                    return res.json({
                        code: 1,
                        message: '用户不存在，请重新登录'
                    });
                }
                if (legacyUser.status !== '启用') {
                    return res.json({
                        code: 1,
                        message: '账户已被禁用，请联系管理员'
                    });
                }

                req.userInfo = attachRuntimeAuthFields(
                    legacyUser,
                    legacyUser.isAdmin ? 'admin' : 'shop',
                    legacyUser.role || (legacyUser.isAdmin ? 'admin' : 'user')
                );
                return next();
            }

            if (!allowedScopes.includes(authScope)) {
                return res.json({
                    code: 1,
                    message: '当前账号无权访问该入口'
                });
            }

            const Model = modelByScope[authScope];
            const user = Model ? await Model.findById(decoded._id, { password: 0 }) : null;

            if (!user) {
                return res.json({
                    code: 1,
                    message: '用户不存在，请重新登录'
                });
            }
            if (user.status !== '启用') {
                return res.json({
                    code: 1,
                    message: '账户已被禁用，请联系管理员'
                });
            }

            req.userInfo = attachRuntimeAuthFields(
                user,
                authScope,
                authScope === 'admin' ? 'admin' : user.role
            );
            return next();
        } catch (error) {
            console.error('JWT验证错误:', error.message);

            if (error.name === 'TokenExpiredError') {
                return res.json({
                    code: 1,
                    message: '登录已过期，请重新登录'
                });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.json({
                    code: 1,
                    message: '认证令牌无效，请重新登录'
                });
            }
            if (error.name === 'NotBeforeError') {
                return res.json({
                    code: 1,
                    message: '认证令牌尚未生效'
                });
            }
            return res.json({
                code: 1,
                message: '认证失败，请重新登录'
            });
        }
    };

    middleware.allowedScopes = allowedScopes;
    return middleware;
}

const sharedAuth = createAuthMiddleware(['shop', 'admin']);
sharedAuth.createAuthMiddleware = createAuthMiddleware;

module.exports = sharedAuth;
