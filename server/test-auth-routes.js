const assert = require('assert');

const shopAuthRouter = require('./router/shopAuthRouter');
const adminAuthRouter = require('./router/adminAuthRouter');

function routePaths(router) {
    return router.stack
        .filter((layer) => layer.route)
        .map((layer) => {
            const methods = Object.keys(layer.route.methods).sort().join(',');
            return `${methods.toUpperCase()} ${layer.route.path}`;
        });
}

assert.deepStrictEqual(routePaths(shopAuthRouter), [
    'POST /register',
    'POST /login',
    'GET /check_login'
]);

assert.deepStrictEqual(routePaths(adminAuthRouter), [
    'POST /login',
    'GET /check_login'
]);

console.log('auth route tests passed');
