const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '../static');

function createProductImageFilename(file = {}) {
    const ext = path.extname(file.originalname || '') || '.png';
    return `product-${Date.now()}${ext.toLowerCase()}`;
}

function imageFileFilter(req, file, cb) {
    if (file && typeof file.mimetype === 'string' && file.mimetype.startsWith('image/')) {
        cb(null, true);
        return;
    }

    cb(new Error('只能上传图片文件'));
}

function buildProductImageUrl(req, filename) {
    return `${req.protocol}://${req.get('host')}/${filename}`;
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename(req, file, cb) {
        cb(null, createProductImageFilename(file));
    }
});

const productImageUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: imageFileFilter
});

module.exports = {
    buildProductImageUrl,
    createProductImageFilename,
    imageFileFilter,
    productImageUpload
};
