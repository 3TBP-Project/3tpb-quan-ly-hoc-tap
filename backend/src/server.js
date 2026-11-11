const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Route mặc định kiểm tra server
app.get('/', (req, res) => {
  res.json({ message: 'Backend Quản lý học tập đã sẵn sàng!' });
});
testConnection();
app.listen(PORT, () => {
  console.log(`>>> Server đang chạy tại http://localhost:${PORT}`);
});