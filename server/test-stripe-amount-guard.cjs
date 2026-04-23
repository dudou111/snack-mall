const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'controllers/orderCtrl.js'), 'utf8');

assert(
  source.includes('const STRIPE_CNY_MAX_AMOUNT = 999999.99'),
  'stripe payment should define a max CNY amount guard'
);

assert(
  source.includes('validateStripeAmount(order.actualAmount)'),
  'stripe payment should validate order amount before creating payment intent'
);

assert(
  source.includes('Stripe单笔支付金额不能超过'),
  'stripe payment guard should return a clear business message'
);

console.log('stripe amount guard tests passed');
