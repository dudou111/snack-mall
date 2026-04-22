const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const adminAuthCtrl = require('../controllers/adminAuthCtrl');
const adminAuth = require('../middleware/adminAuth');

const router = new Router();

function validate(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    return res.json({
        code: 1,
        message: result.array().map((err) => err.msg).join(', ')
    });
}

router.post('/login', [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
], validate, adminAuthCtrl.login);

router.get('/check_login', adminAuth, adminAuthCtrl.checkLogin);

module.exports = router;
