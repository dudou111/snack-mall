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
