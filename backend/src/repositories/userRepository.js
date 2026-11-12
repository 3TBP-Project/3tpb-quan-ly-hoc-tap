const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, password AS password_hash, role FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

const createUser = async ({ name, email, password_hash, role }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password_hash, role]
  );
  return {
    id: result.insertId,
    name,
    email,
    role
  };
};

module.exports = {
  findByEmail,
  createUser
};