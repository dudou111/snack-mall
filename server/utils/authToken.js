const JWT = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'QW';

function signAuthToken(user) {
    const payload = {
        _id: String(user._id),
        username: user.username,
        role: user.role,
        authScope: user.authScope
    };

    return JWT.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyAuthToken(token) {
    return JWT.verify(token, JWT_SECRET);
}

function normalizeBearerToken(headerValue) {
    if (!headerValue) return '';
    return String(headerValue).replace('Bearer ', '').replace(/"/g, '').trim();
}

module.exports = {
    JWT_SECRET,
    signAuthToken,
    verifyAuthToken,
    normalizeBearerToken
};
