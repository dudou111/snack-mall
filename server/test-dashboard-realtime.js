const assert = require('assert');

const dashboardRouter = require('./router/dashboardRouter');
const { broadcastNotification, clients } = require('./utils/notificationHub');
const { __testables } = require('./controllers/dashboardCtrl');

function routePaths(router) {
    return router.stack
        .filter((layer) => layer.route)
        .map((layer) => {
            const methods = Object.keys(layer.route.methods).sort().join(',');
            return `${methods.toUpperCase()} ${layer.route.path}`;
        });
}

assert(routePaths(dashboardRouter).includes('GET /overview'));

const days = __testables.buildLastSevenDays();
assert.strictEqual(days.length, 7);
assert.match(__testables.formatDateKey(new Date('2026-04-23T12:00:00.000Z')), /^\d{4}-\d{2}-\d{2}$/);

let sentPayload = '';
const fakeClient = {
    readyState: 1,
    send(payload) {
        sentPayload = payload;
    }
};

clients.add(fakeClient);
broadcastNotification({
    type: 'order.created',
    title: '用户下单',
    description: '测试订单'
});
clients.delete(fakeClient);

const parsedPayload = JSON.parse(sentPayload);
assert.strictEqual(parsedPayload.type, 'notification');
assert.strictEqual(parsedPayload.data.type, 'order.created');
assert.strictEqual(parsedPayload.data.title, '用户下单');

console.log('dashboard realtime tests passed');
