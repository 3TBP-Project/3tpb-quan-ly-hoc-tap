// AI-assisted [AI-06]
// HT-07: tải lên ảnh đại diện. Ảnh là công khai nên lưu ở backend/uploads/avatars
// (khác backend/storage/lessons chứa PDF riêng tư).
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');
const AVATAR_DIR = path.join(UPLOAD_ROOT, 'avatars');
const AVATAR_URL_PREFIX = '/uploads/avatars/';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB

// Chỉ nhận ảnh raster phổ biến; không nhận SVG vì có thể chứa script
const ALLOWED_TYPES = {
  'image/jpeg': { ext: '.jpg', originalExts: ['.jpg', '.jpeg'] },
  'image/png': { ext: '.png', originalExts: ['.png'] },
  'image/webp': { ext: '.webp', originalExts: ['.webp'] }
};

fs.mkdirSync(AVATAR_DIR, { recursive: true });

const createUploadError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  // Tên tệp do server tự đặt, không dùng tên gốc để tránh trùng và ký tự nguy hiểm
  filename: (req, file, cb) => {
    const { ext } = ALLOWED_TYPES[file.mimetype];
    cb(null, `${req.user.id}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  }
});

const uploader = multer({
  storage,
  limits: { fileSize: MAX_AVATAR_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ALLOWED_TYPES[file.mimetype];
    const originalExt = path.extname(file.originalname || '').toLowerCase();
    if (!allowed || !allowed.originalExts.includes(originalExt)) {
      return cb(createUploadError('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.'));
    }
    return cb(null, true);
  }
}).single('avatar');

// Kiểm tra chữ ký tệp (magic bytes) để chặn tệp đổi đuôi giả làm ảnh
const matchesSignature = (filePath, mimetype) => {
  const fd = fs.openSync(filePath, 'r');
  const header = Buffer.alloc(12);
  try {
    fs.readSync(fd, header, 0, 12, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (mimetype === 'image/jpeg') return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  if (mimetype === 'image/png') {
    return header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimetype === 'image/webp') {
    return header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';
  }
  return false;
};

// Xóa tệp avatar theo đường dẫn lưu trong CSDL; chỉ xóa tệp nằm trong AVATAR_DIR
const removeAvatarFile = (avatarUrl) => {
  if (typeof avatarUrl !== 'string' || !avatarUrl.startsWith(AVATAR_URL_PREFIX)) return;
  const fileName = path.basename(avatarUrl);
  const filePath = path.join(AVATAR_DIR, fileName);
  if (path.dirname(filePath) !== AVATAR_DIR) return;
  fs.promises.unlink(filePath).catch(() => {});
};

const sendError = (res, message) => res.status(400).json({ status: 'error', message });

function uploadAvatar(req, res, next) {
  uploader(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return sendError(res, 'Ảnh vượt quá dung lượng tối đa 2 MB.');
      if (err instanceof multer.MulterError) return sendError(res, 'Chỉ được gửi một ảnh ở trường "avatar".');
      return sendError(res, err.statusCode === 400 ? err.message : 'Tải ảnh lên thất bại.');
    }
    if (!req.file) return sendError(res, 'Vui lòng chọn một ảnh.');

    let valid = false;
    try {
      valid = matchesSignature(req.file.path, req.file.mimetype);
    } catch {
      valid = false;
    }
    if (!valid) {
      fs.promises.unlink(req.file.path).catch(() => {});
      return sendError(res, 'Tệp không phải ảnh hợp lệ.');
    }

    req.avatarUrl = `${AVATAR_URL_PREFIX}${req.file.filename}`;
    return next();
  });
}

module.exports = {
  uploadAvatar,
  removeAvatarFile,
  matchesSignature,
  ALLOWED_TYPES,
  UPLOAD_ROOT,
  AVATAR_DIR,
  MAX_AVATAR_SIZE
};
