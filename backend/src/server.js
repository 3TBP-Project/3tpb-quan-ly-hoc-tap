const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint kiểm tra
app.get('/', (req, res) => {
  res.json({ message: 'Backend Quản lý học tập đã sẵn sàng!' });
});

// Bắt buộc phải có app.listen để giữ cho Server luôn chạy
app.listen(PORT, () => {
  console.log(`>>> Server đang chạy tại http://localhost:${PORT}`);
});