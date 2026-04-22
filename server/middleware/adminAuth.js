const sharedAuth = require('./auth');

module.exports = sharedAuth.createAuthMiddleware(['admin']);
