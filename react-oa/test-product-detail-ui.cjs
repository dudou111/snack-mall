const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'src/views/Products/ProductManagement.tsx'), 'utf8');

assert(
  source.includes('productDetail.module.scss'),
  'product detail drawer should use its dedicated stylesheet'
);

assert(
  source.includes('productDetailHero'),
  'product detail drawer should use a hero section like order detail'
);

assert(
  source.includes('productDetailBody'),
  'product detail drawer should use the redesigned card layout'
);

assert(
  source.includes('productDetailImage'),
  'product detail drawer should render a prominent product image'
);

assert(
  !source.includes('<Descriptions title="基本信息"'),
  'product detail drawer should not use the old Descriptions basic info layout'
);

console.log('product detail UI tests passed');
