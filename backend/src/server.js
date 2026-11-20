const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool, testConnection } = require('./config/db');
const { ROLES } = require('./config/constants');
const { verifyToken, authorizeRoles } = require('./middlewares/authMiddleware');
const authRoutes = require('./routes/authRoute');
const quizRoutes = require('./routes/quizRoute');
const courseRoutes = require('./routes/courseRoute');

const questionRoutes = require('./routes/questionRoute');

const catalogRoutes = require('./routes/catalogRoute');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/quizzes', quizRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', catalogRoutes);

// Route xác thực công khai (Đăng ký & Đăng nhập)
app.use('/api/auth', authRoutes);

app.use('/api/teacher', questionRoutes);

// Các route kiểm chứng phân quyền 3 vai trò
app.get('/student/dashboard', verifyToken, authorizeRoles(ROLES.STUDENT), (req, res) => {
  res.json({ status: 'success', message: 'Chào mừng Học viên!', user: req.user });
});

app.get('/teacher/dashboard', verifyToken, authorizeRoles(ROLES.TEACHER), (req, res) => {
  res.json({ status: 'success', message: 'Chào mừng Giảng viên!', user: req.user });
});

app.get('/admin/dashboard', verifyToken, authorizeRoles(ROLES.ADMIN), (req, res) => {
  res.json({ status: 'success', message: 'Chào mừng Quản trị viên!', user: req.user });
});

const startServer = async () => {
  try {
    await testConnection();
  } catch (error) {
    console.error('>>> Không thể kết nối CSDL; server không được khởi động:', error.message);
    await pool.end().catch((shutdownError) => {
      console.error('>>> Lỗi khi đóng pool CSDL:', shutdownError.message);
    });
    process.exitCode = 1;
    return;
  }

  app.listen(PORT, () => {
    console.log(`>>> Server đang chạy tại http://localhost:${PORT}`);
  });
};

startServer();
