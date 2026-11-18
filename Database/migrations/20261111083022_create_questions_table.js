//questions table
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('questions', function(table) {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.text('content').notNullable();
    table.string('correct_answer', 255).notNullable();
    
    // Tách đủ 4 đáp án sai theo chuẩn ERD đã thống nhất
    table.string('false_answer', 255).nullable();
    table.string('false_answer_2', 255).nullable();
    table.string('false_answer_3', 255).nullable();
    table.string('false_answer_4', 255).nullable();

    // Thêm chỉ mục tối ưu hiệu suất truy vấn theo khóa học
    table.index(['course_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('questions');
};
//AI-assisted: <Gemini> [AI-06]