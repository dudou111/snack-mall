const assert = require('assert');
const { getStartupDiagnostics } = require('./utils/startupDiagnostics');
const { assertStripeSecretKey } = require('./utils/stripeConfig');

const configured = getStartupDiagnostics({
    STRIPE_SECRET_KEY: 'sk_test_EXAMPLE_KEY_FOR_TESTING_ONLY'
});

assert.deepStrictEqual(configured, {
    stripeSecretKeyLoaded: true,
    stripeSecretKeyValid: true,
    stripeSecretKeyStatus: '已加载'
});

const placeholder = getStartupDiagnostics({
    STRIPE_SECRET_KEY: 'sk_test_123456'
});

assert.deepStrictEqual(placeholder, {
    stripeSecretKeyLoaded: true,
    stripeSecretKeyValid: false,
    stripeSecretKeyStatus: '无效：请配置 Stripe Dashboard 中完整的 sk_test_ 测试密钥'
});

const missing = getStartupDiagnostics({});

assert.deepStrictEqual(missing, {
    stripeSecretKeyLoaded: false,
    stripeSecretKeyValid: false,
    stripeSecretKeyStatus: '未加载'
});

assert.strictEqual(
    assertStripeSecretKey(' sk_test_EXAMPLE_KEY_FOR_TESTING_ONLY '),
    'sk_test_EXAMPLE_KEY_FOR_TESTING_ONLY'
);
assert.throws(
    () => assertStripeSecretKey('sk_test_123456'),
    (error) => error.code === 'STRIPE_INVALID_SECRET_KEY'
);
assert.throws(
    () => assertStripeSecretKey(''),
    (error) => error.code === 'STRIPE_NOT_CONFIGURED'
);

console.log('startup diagnostics tests passed');
