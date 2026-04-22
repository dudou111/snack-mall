const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const shopAuthCtrl = require('../controllers/shopAuthCtrl');
const shopAuth = require('../middleware/shopAuth');

const router = new Router();

function validate(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    return res.json({
        code: 1,
        message: result.array().map((err) => err.msg).join(', ')
    });
}

router.post('/register', [
    body('username')
        .notEmpty()
        .withMessage('用户名不能为空')
        .isLength({ min: 2, max: 20 })
        .withMessage('用户名长度必须在2-20个字符之间')
        .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
        .withMessage('用户名只能包含字母、数字、下划线和中文'),
    body('password')
        .notEmpty()
        .withMessage('密码不能为空')
        .isLength({ min: 6, max: 20 })
        .withMessage('密码长度必须在6-20个字符之间'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('两次输入的密码不一致');
        }
        return true;
    }),
    body('role')
        .optional()
        .isIn(['user', 'merchant'])
        .withMessage('身份只能是用户或商家'),
    body('tel')
        .optional({ checkFalsy: true })
        .matches(/^1[3-9]\d{9}$/)
        .withMessage('手机号格式不正确'),
    body('email')
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage('邮箱格式不正确')
], validate, shopAuthCtrl.register);

router.post('/login', [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
], validate, shopAuthCtrl.login);

router.get('/check_login', shopAuth, shopAuthCtrl.checkLogin);

module.exports = router;
