const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'src/views/Products/Inventory.tsx'), 'utf8');

assert(
  source.includes('uploadRecord.module.scss'),
  'upload records page should use its image-aware stylesheet'
);

assert(
  source.includes('uploadRecordThumb'),
  'upload records table should render product thumbnails'
);

assert(
  source.includes('record.image'),
  'upload records table should read image from each record'
);

assert(
  !source.includes("title: 'SKU'"),
  'upload records table should not render a standalone SKU column'
);

assert(
  !source.includes('搜索商品名/SKU/品牌/分类'),
  'upload records search placeholder should not mention SKU'
);

console.log('upload record UI tests passed');
