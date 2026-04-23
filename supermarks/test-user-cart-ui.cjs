const assert = require('assert');
const fs = require('fs');
const path = require('path');

const pageSource = fs.readFileSync(path.join(__dirname, 'src/pages/UserHomePage.tsx'), 'utf8');
const styleSource = fs.readFileSync(path.join(__dirname, 'src/styles.css'), 'utf8');

assert(
  pageSource.includes('launchCartBezierFlight'),
  'user home should include bezier cart flight animation'
);

assert(
  pageSource.includes('handleAddToCart'),
  'user home should support adding products to cart'
);

assert(
  pageSource.includes('handleCheckoutCart'),
  'user home should support checkout from cart'
);

assert(
  pageSource.includes('加入购物车'),
  'product cards should render an add-to-cart button'
);

assert(
  pageSource.includes('一起支付'),
  'floating cart should expose combined payment action'
);

assert(
  pageSource.includes('当前购物车金额超过 Stripe 单笔上限'),
  'cart checkout should block orders that exceed Stripe amount limit'
);

assert(
  pageSource.includes('当前商品订单金额超过 Stripe 单笔上限'),
  'single product checkout should block orders that exceed Stripe amount limit'
);

assert(
  styleSource.includes('.floating-cart'),
  'styles should include the fixed floating cart'
);

assert(
  styleSource.includes('.cart-flight-dot'),
  'styles should include the animated cart flight dot'
);

assert(
  styleSource.includes('scrollbar-width: none'),
  'cart item list should hide the native scrollbar'
);

assert(
  styleSource.includes('html::-webkit-scrollbar'),
  'global page scrollbar should be hidden without disabling scroll'
);

assert(
  styleSource.includes('cart-flight-pulse'),
  'cart flight dot should include a visible pulse effect'
);

assert(
  styleSource.includes('.cart-limit-note'),
  'cart should style the Stripe amount limit warning'
);

console.log('user cart UI tests passed');
