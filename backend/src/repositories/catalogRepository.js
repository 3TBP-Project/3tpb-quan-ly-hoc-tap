const { pool } = require('../config/db');

const findCategories = async () => {
  const [rows] = await pool.query(
    'SELECT id, name FROM categories ORDER BY name ASC'
  );
  return rows.map((row) => ({ id: Number(row.id), name: row.name }));
};

const findTeachers = async () => {
  const [rows] = await pool.query(
    "SELECT id, name FROM users WHERE role = 'teacher' ORDER BY name ASC"
  );
  return rows.map((row) => ({ id: Number(row.id), name: row.name }));
};

module.exports = {
  findCategories,
  findTeachers
};
