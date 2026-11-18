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
    

    table.enu('role', ['student', 'teacher', 'admin']).defaultTo('student').notNullable();

    table.tinyint('is_locked').defaultTo(0).notNullable(); // 0: Bình thường, 1: Bị khóa
    
    // Trạng thái xét duyệt giảng viên (pending, active)
    table.enu('status', ['pending', 'active']).defaultTo('pending').notNullable();
    
    // Bổ sung created_at theo đúng thiết kế ERD
    table.timestamp('created_at').defaultTo(knex.fn.now());
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