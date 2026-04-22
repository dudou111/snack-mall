const assert = require('assert');
const Product = require('./model/Product');
const orderCtrl = require('./controllers/orderCtrl');

assert(Product.schema.path('merchantId'));
assert.strictEqual(typeof orderCtrl.__testables.getRole({ role: 'merchant' }), 'string');
assert.strictEqual(orderCtrl.__testables.getRole({ role: 'merchant' }), 'merchant');
assert.strictEqual(orderCtrl.__testables.getRole({ role: 'admin', isAdmin: true }), 'admin');
assert.strictEqual(orderCtrl.__testables.getRole({ authScope: 'admin' }), 'admin');

console.log('role compatibility tests passed');
