const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');
const { ROLES } = require('./config/constants');
const { verifyToken, authorizeRoles } = require('./middlewares/authMiddleware');
const authRoutes = require('./routes/authRoute');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

testConnection();// Kiểm tra kết nối cơ sở dữ liệu khi khởi động server

// Route xác thực công khai (Đăng ký & Đăng nhập)
app.use('/api/auth', authRoutes);

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

app.listen(PORT, () => {
  console.log(`>>> Server đang chạy tại http://localhost:${PORT}`);
});