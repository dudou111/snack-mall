const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'src/pages/UserOrdersPage.tsx'), 'utf8');

assert(
  source.includes('const STRIPE_CNY_MAX_AMOUNT = 999999.99'),
  'user orders page should know the Stripe amount limit'
);

assert(
  source.includes('stripeAmountExceeded'),
  'user orders page should compute whether Stripe amount exceeds the limit'
);

assert(
  source.includes('当前订单请拆分后支付'),
  'user orders page should explain why Stripe payment is unavailable'
);

assert(
  source.includes('disabled={actionId === order._id + "stripe" || stripeAmountExceeded}'),
  'user orders page should disable Stripe pay button when amount exceeds limit'
);

assert(
  source.includes('paymentSuccess'),
  'user orders page should track successful Stripe payment dialog state'
);

assert(
  source.includes('payment-success-overlay'),
  'user orders page should render a payment success modal overlay'
);

assert(
  source.includes('canApplyRefund'),
  'user orders page should compute refund availability independent of payment and delivery status'
);

assert(
  !source.includes('order.paymentStatus === "已支付" &&'),
  'refund button should not be limited to paid orders only'
);

assert(
  source.includes('申请退款'),
  'every eligible order should expose an apply refund action'
);

assert(
  source.includes('订单已完成支付'),
  'payment success modal should confirm completed payment'
);

console.log('user orders stripe limit UI tests passed');
