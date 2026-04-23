const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'controllers/orderCtrl.js'), 'utf8');

assert(
  !source.includes("message: '仅已支付订单可申请退款'"),
  'refund application should not be limited to paid orders only'
);

assert(
  !source.includes("message: '已送达订单暂不支持退款'"),
  'refund application should not be blocked only because an order was delivered'
);

assert(
  source.includes("order.refund?.reviewStatus === '待处理' || order.refund?.reviewStatus === '已通过'"),
  'refund application should still block duplicate pending or approved refunds'
);

console.log('refund availability tests passed');
