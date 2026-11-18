// AI-assisted [AI-01]
const { pool } = require('../config/db');
// Lớp cơ sở cho các repository khác, cung cấp các phương thức chung để truy vấn cơ sở dữ liệu.
class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = pool;
  }

  async findAll() {
    const [rows] = await this.db.query(`SELECT * FROM ${this.tableName}`);
    return rows;
  }

  async findById(id) {
    const [rows] = await this.db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return rows[0];
  }
}

module.exports = BaseRepository;