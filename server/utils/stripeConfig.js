const STRIPE_SECRET_KEY_INVALID_MESSAGE = '请配置 Stripe Dashboard 中完整的 sk_test_ 测试密钥';

function validateStripeSecretKey(secretKey) {
    const normalizedKey = String(secretKey || '').trim();

    if (!normalizedKey) {
        return {
            loaded: false,
            valid: false,
            status: '未加载',
            message: 'Stripe 测试密钥未配置'
        };
    }

    const isValidTestKey = /^sk_test_[A-Za-z0-9]{16,}$/.test(normalizedKey);
    if (!isValidTestKey) {
        return {
            loaded: true,
            valid: false,
            status: `无效：${STRIPE_SECRET_KEY_INVALID_MESSAGE}`,
            message: STRIPE_SECRET_KEY_INVALID_MESSAGE
        };
    }

    return {
        loaded: true,
        valid: true,
        status: '已加载',
        message: ''
    };
}

function assertStripeSecretKey(secretKey) {
    const validation = validateStripeSecretKey(secretKey);

    if (!validation.loaded) {
        const error = new Error(validation.message);
        error.code = 'STRIPE_NOT_CONFIGURED';
        throw error;
    }

    if (!validation.valid) {
        const error = new Error(validation.message);
        error.code = 'STRIPE_INVALID_SECRET_KEY';
        throw error;
    }

    return String(secretKey).trim();
}

module.exports = {
    STRIPE_SECRET_KEY_INVALID_MESSAGE,
    validateStripeSecretKey,
    assertStripeSecretKey
};
