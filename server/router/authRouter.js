const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const MD5 = require("md5");
const User = require('../model/user');
// 路由中间件通过后的操作api
const authCtrl = require("../controllers/authCtrl");
const auth = require("../middleware/auth");

const router = new Router();

// 添加管理员账号
(async () => {
  const user = await User.findOne({ username: "root" });
  if (!user) {
    await User.create([
      {
        username: "root",
        password: MD5("123456"),
        plainPassword: process.env.NODE_ENV !== 'production' ? "123456" : undefined,
        tel: "13812345678",
        isAdmin: true,
        role: 'admin',
        avatar: "http://127.0.0.1:8088/default-avatar.jpg"
      },
      {
        username: 'admin',
        password: MD5("123456"),
        plainPassword: process.env.NODE_ENV !== 'production' ? "123456" : undefined,
        tel: "13987654321",
        isAdmin: false,
        role: 'merchant',
        avatar: "http://127.0.0.1:8088/default-avatar2.jpg"
      }
    ]);
    console.log('✅ 初始管理员账号创建成功');
  }
})();

/* 
注册请求：/api/auth/register
method: post
body参数：username, password, tel(optional), email(optional)
*/
router.post(
  "/register",
  [
    body("username")
      .notEmpty()
      .withMessage("用户名不能为空")
      .isLength({ min: 2, max: 20 })
      .withMessage("用户名长度必须在2-20个字符之间")
      .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
      .withMessage("用户名只能包含字母、数字、下划线和中文"),
    
    body("password")
      .notEmpty()
      .withMessage("密码不能为空")
      .isLength({ min: 6, max: 20 })
      .withMessage("密码长度必须在6-20个字符之间"),
    
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('两次输入的密码不一致');
        }
        return true;
      }),
    
    body("tel")
      .optional()
      .matches(/^1[3-9]\d{9}$/)
      .withMessage("手机号格式不正确"),
    
    body("email")
      .optional()
      .isEmail()
      .withMessage("邮箱格式不正确")
  ],
  (req, res, next) => {
    //获取验证的结果
    const result = validationResult(req);
    if (result.isEmpty()) {
      //参数没有问题
      next();
    } else {
      //参数有问题
      const errors = result.array().map(err => err.msg).join(', ');
      res.json({ 
        code: 1,
        message: errors 
      });
    }
  },
  authCtrl.register
);

/* 
登录请求：/api/auth/login
method: post
body参数：username, password
*/
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("用户名不能为空"),
    body("password").notEmpty().withMessage("密码不能为空")
  ],
  (req, res, next) => {
    console.log('登录请求:', req.body);

    //获取验证的结果
    const result = validationResult(req);
    if (result.isEmpty()) {
      //参数没有问题
      next();
    } else {
      //参数缺少了,参数格式不正确
      const errors = result.array().map(err => err.msg).join(', ');
      res.json({ 
        code: 1,
        message: errors 
      });
    }
  },
  authCtrl.login
);

/* 
验证登录：/api/auth/check_login
method: get
headers: {
  authorization: token
}
*/
router.get("/check_login", auth, authCtrl.checkLogin);

/* 
获取用户统计信息：/api/auth/user_stats
method: get
headers: {
  authorization: token
}
*/
router.get("/user_stats", auth, authCtrl.getUserStats);

// 开发专用：查看所有用户密码（仅开发环境）
router.get("/dev/users_with_passwords", (req, res) => {
    // 仅在开发环境中可用
    if (process.env.NODE_ENV === 'production') {
        return res.json({
            code: 1,
            message: '此接口仅在开发环境可用'
        });
    }
    
    authCtrl.getUsersWithPasswords(req, res);
});

let multer = require('multer');
let path = require('path');

let storage = multer.diskStorage({
  // 设置图片存储路径
  destination: path.join(__dirname, '../static'),

  // 设置图片存储时的名字
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    let userid = req.userInfo._id.toString();
    let filename = file.fieldname + '-' + userid + ext;
    cb(null, filename);
  }
});

let upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制文件大小为5MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传图片文件'));
    }
  }
});

/**
 * 修改个人信息 /api/auth/changedata
 * post
 * headers: { authorization: token }
 * body: 可选的文件上传
 */
router.post('/changedata', auth, upload.single('avatar'), authCtrl.changedata);

module.exports = router;
