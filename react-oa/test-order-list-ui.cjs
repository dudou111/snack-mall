const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'src/views/Orders/List.tsx'), 'utf8');

assert(
  !source.includes('title: "订单号"'),
  'order list should not render a dedicated order number column'
);

assert(
  source.includes('getOrderItemImage'),
  'order list should resolve product images from populated order items'
);

assert(
  source.includes('orderProductThumb'),
  'order list should render product thumbnails'
);

assert(
  source.includes('orderDetailHero'),
  'order detail drawer should use the redesigned card layout'
);

console.log('order list UI tests passed');
