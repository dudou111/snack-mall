const assert = require('assert');
const ShopUser = require('./model/shopUser');
const AdminUser = require('./model/adminUser');
const { signAuthToken, verifyAuthToken } = require('./utils/authToken');

assert.strictEqual(ShopUser.collection.name, 'supermarks_users');
assert.strictEqual(AdminUser.collection.name, 'admin_users');

const shopUser = new ShopUser({ username: 'buyer01', password: '123456', role: 'user' });
assert.strictEqual(shopUser.role, 'user');
assert.strictEqual(shopUser.status, '启用');

const merchant = new ShopUser({ username: 'merchant01', password: '123456', role: 'merchant' });
assert.strictEqual(merchant.role, 'merchant');

const invalidAdmin = new ShopUser({ username: 'badadmin', password: '123456', role: 'admin' });
assert.match(invalidAdmin.validateSync().message, /`admin` is not a valid enum value/);

const admin = new AdminUser({ username: 'root', password: '123456' });
assert.strictEqual(admin.role, 'admin');
assert.strictEqual(admin.status, '启用');

const token = signAuthToken({
    _id: '507f1f77bcf86cd799439011',
    username: 'root',
    role: 'admin',
    authScope: 'admin'
});
const decoded = verifyAuthToken(token);
assert.strictEqual(decoded.authScope, 'admin');
assert.strictEqual(decoded.role, 'admin');

console.log('auth model tests passed');
