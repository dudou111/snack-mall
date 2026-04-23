const assert = require('assert');

const productRouter = require('./router/productRouter');
const { buildProductImageUrl, imageFileFilter } = require('./utils/productImageUpload');

function routePaths(router) {
    return router.stack
        .filter((layer) => layer.route)
        .map((layer) => {
            const methods = Object.keys(layer.route.methods).sort().join(',');
            return `${methods.toUpperCase()} ${layer.route.path}`;
        });
}

const routes = routePaths(productRouter);

assert(
    routes.includes('POST /upload-image'),
    'product router should expose POST /upload-image'
);

assert.strictEqual(
    buildProductImageUrl(
        {
            protocol: 'http',
            get(headerName) {
                return headerName === 'host' ? '127.0.0.1:8088' : '';
            }
        },
        'product-123.png'
    ),
    'http://127.0.0.1:8088/product-123.png'
);

let accepted = null;
imageFileFilter({}, { mimetype: 'image/png' }, (error, allow) => {
    accepted = { error, allow };
});
assert.deepStrictEqual(accepted, { error: null, allow: true });

let rejected = null;
imageFileFilter({}, { mimetype: 'text/plain' }, (error, allow) => {
    rejected = { error, allow };
});
assert(rejected.error instanceof Error, 'non-image file should be rejected');
assert.strictEqual(rejected.error.message, '只能上传图片文件');
assert.strictEqual(rejected.allow, undefined);

console.log('product image upload tests passed');
