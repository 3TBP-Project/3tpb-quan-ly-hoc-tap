/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('avatar', 255).nullable();
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('role', 255).notNullable();
    table.tinyint('is_locked').defaultTo(0).notNullable();
    
    // Cột status kiểu ENUM theo yêu cầu xét duyệt giảng viên
    table.enu('status', ['pending', 'active']).defaultTo('pending').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
//AI-assisted: <Gemini> [AI-02]