const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'src/components/NotificationCenter.tsx'), 'utf8');

assert(
  source.includes('notification'),
  'NotificationCenter should use Ant Design notification popup for realtime events'
);

assert(
  source.includes('unreadCount'),
  'NotificationCenter should track unreadCount separately from history list length'
);

assert(
  source.includes('onOpenChange'),
  'NotificationCenter should reset unread count when the popover is opened'
);

assert(
  source.includes('setUnreadCount((count) => count + 1)'),
  'NotificationCenter should increment unread count when a realtime notification arrives'
);

console.log('notification center realtime popup tests passed');
