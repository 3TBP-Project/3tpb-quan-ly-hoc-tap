const { pool } = require('../config/db');

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