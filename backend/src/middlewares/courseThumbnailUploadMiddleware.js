// AI-assisted [AI-17]
// HT-09: tải lên ảnh bìa khóa học. Ảnh công khai nên lưu ở backend/uploads/courses,
// dùng chung quy tắc kiểm tra định dạng (JPG/PNG/WEBP + magic bytes) với ảnh đại diện.
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { UPLOAD_ROOT, ALLOWED_TYPES, matchesSignature } = require('./avatarUploadMiddleware');

const COURSE_THUMBNAIL_DIR = path.join(UPLOAD_ROOT, 'courses');
const COURSE_THUMBNAIL_URL_PREFIX = '/uploads/courses/';
const MAX_COURSE_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2 MB

fs.mkdirSync(COURSE_THUMBNAIL_DIR, { recursive: true });

const createUploadError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const parseCourseId = (value) => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, COURSE_THUMBNAIL_DIR),
  // Tên tệp bắt đầu bằng id khóa học để chỉ xóa được ảnh của đúng khóa học đó
  filename: (req, file, cb) => {
    const { ext } = ALLOWED_TYPES[file.mimetype];
    const courseId = parseCourseId(req.params.id);
    cb(null, `${courseId}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  }
});

const uploader = multer({
  storage,
  limits: { fileSize: MAX_COURSE_THUMBNAIL_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ALLOWED_TYPES[file.mimetype];
    const originalExt = path.extname(file.originalname || '').toLowerCase();
    if (!allowed || !allowed.originalExts.includes(originalExt)) {
      return cb(createUploadError('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.'));
    }
    return cb(null, true);
  }
}).single('thumbnail');

// Xóa tệp ảnh bìa đã lưu; chỉ xóa tệp nằm trong COURSE_THUMBNAIL_DIR và thuộc đúng khóa học
const removeCourseThumbnailFile = (thumbnailUrl, courseId) => {
  if (typeof thumbnailUrl !== 'string' || !thumbnailUrl.startsWith(COURSE_THUMBNAIL_URL_PREFIX)) return;
  const fileName = path.basename(thumbnailUrl);
  if (courseId != null && !fileName.startsWith(`${courseId}-`)) return;
  const filePath = path.join(COURSE_THUMBNAIL_DIR, fileName);
  if (path.dirname(filePath) !== COURSE_THUMBNAIL_DIR) return;
  fs.promises.unlink(filePath).catch(() => {});
};

const sendError = (res, message) => res.status(400).json({ success: false, message });

function uploadCourseThumbnail(req, res, next) {
  if (!parseCourseId(req.params.id)) return sendError(res, 'ID khóa học không hợp lệ.');

  uploader(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return sendError(res, 'Ảnh vượt quá dung lượng tối đa 2 MB.');
      if (err instanceof multer.MulterError) return sendError(res, 'Chỉ được gửi một ảnh ở trường "thumbnail".');
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

    req.thumbnailUrl = `${COURSE_THUMBNAIL_URL_PREFIX}${req.file.filename}`;
    return next();
  });
}

module.exports = {
  uploadCourseThumbnail,
  removeCourseThumbnailFile,
  COURSE_THUMBNAIL_DIR,
  COURSE_THUMBNAIL_URL_PREFIX,
  MAX_COURSE_THUMBNAIL_SIZE
};
