const assert = require('assert');
const Order = require('./model/Order');
const orderRouter = require('./router/orderRouter');
const orderCtrl = require('./controllers/orderCtrl');

const paymentMethodEnum = Order.schema.path('paymentMethod').enumValues;
assert(paymentMethodEnum.includes('Stripe测试支付'));

assert(Order.schema.path('stripePaymentIntentId'));
assert(Order.schema.path('paymentProvider'));
assert(Order.schema.path('stripePaymentStatus'));

const routes = orderRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => `${Object.keys(layer.route.methods).sort().join(',').toUpperCase()} ${layer.route.path}`);

assert(routes.includes('POST /pay/stripe-intent'));
assert(routes.includes('POST /pay/stripe-confirm'));
assert.strictEqual(typeof orderCtrl.createStripePaymentIntent, 'function');
assert.strictEqual(typeof orderCtrl.confirmStripePayment, 'function');

console.log('stripe payment shape tests passed');
