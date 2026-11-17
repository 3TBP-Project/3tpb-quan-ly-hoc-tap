// AI-assisted [AI-01]
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quan_ly_hoc_tap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Hàm kiểm tra kết nối CSDL
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('>>> Kết nối CSDL MySQL thành công!');
    connection.release();
  } catch (error) {
    console.error('>>> Lỗi kết nối CSDL:', error.message);
  }
};

module.exports = { pool, testConnection };