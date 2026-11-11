require('dotenv').config();

/** @type { Object.<string, import("knex").Knex.Config> } */
module.exports = {
  development: {
    client: 'mysql2', // <-- Đảm bảo là mysql2
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'mat_khau_cua_ban',
      database: process.env.DB_NAME || 'ten_database_cua_ban'
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations' // Thư mục chứa các file migration ở cùng cấp
    }
  }
};