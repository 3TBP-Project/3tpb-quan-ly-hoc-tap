const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', 'backend', '.env') });

/** @type { Object.<string, import("knex").Knex.Config> } */
module.exports = {
  development: {
    client: 'mysql2', // <-- Đảm bảo là mysql2
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '2632006a',
      database: process.env.DB_NAME || 'db_quanlyhoctap'
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations' // Thư mục chứa các file migration ở cùng cấp
    }
  }
};