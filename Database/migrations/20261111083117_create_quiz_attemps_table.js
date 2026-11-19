//quiz_attempts table
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('quiz_attempts', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.float('score').nullable();
    table.string('status', 50).notNullable().defaultTo('doing');
    
    // Đã sửa cú pháp, sửa lỗi chính tả subbmitted_at -> submitted_at và đổi sang dateTime
    table.dateTime('started_at').nullable();
    table.dateTime('submitted_at').nullable();

    // Thêm chỉ mục tối ưu hiệu suất theo yêu cầu đề tài
    table.index(['user_id', 'course_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('quiz_attempts');
};
//AI-assisted: <Gemini> [AI-07]