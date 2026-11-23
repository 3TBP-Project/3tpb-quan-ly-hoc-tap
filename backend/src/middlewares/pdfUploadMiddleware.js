const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Lưu ngoài thư mục công khai (ví dụ: backend/storage/lessons)
const PRIVATE_PDF_DIR = path.resolve(__dirname, '../../storage/lessons');
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5 MB

fs.mkdirSync(PRIVATE_PDF_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PRIVATE_PDF_DIR),
  filename: (_req, _file, cb) => {
    const randomName = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}.pdf`;
    cb(null, randomName);
  },
});

const uploader = multer({
  storage,
  limits: { fileSize: MAX_PDF_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isPdf = file.mimetype === 'application/pdf' && ext === '.pdf';
    if (!isPdf) {
      return cb(new Error('Chỉ cho phép tải lên tệp PDF hợp lệ.'));
    }
    return cb(null, true);
  },
}).single('pdf_file');

function uploadLessonPdf(req, res, next) {
  uploader(req, res, (err) => {
    if (!err) {
      if (req.file) {
        req.body.file_path = req.file.filename;
      }
      return next();
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Tệp PDF vượt quá dung lượng tối đa 5 MB.',
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Tải tệp PDF thất bại.',
    });
  });
}

module.exports = { uploadLessonPdf, PRIVATE_PDF_DIR };
//AI-assisted: <Gemini> [AI-06]