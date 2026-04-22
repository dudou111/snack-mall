const { validateStripeSecretKey } = require('./stripeConfig');

function getStartupDiagnostics(env = process.env) {
    const stripeSecretKey = validateStripeSecretKey(env.STRIPE_SECRET_KEY);

    return {
        stripeSecretKeyLoaded: stripeSecretKey.loaded,
        stripeSecretKeyValid: stripeSecretKey.valid,
        stripeSecretKeyStatus: stripeSecretKey.status
    };
}

module.exports = {
    getStartupDiagnostics
};
