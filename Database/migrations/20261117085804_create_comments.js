/**
 * Migration tạo bảng comments (Hỗ trợ cả Đánh giá khóa học & Hỏi đáp bài học HT-08)
 */
exports.up = function(knex) {
  return knex.schema.createTable('comments', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.integer('lesson_id').unsigned().nullable();
    table.integer('parent_id').unsigned().nullable();
    table.integer('rating').nullable();
    table.text('content').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Thiết lập các khóa ngoại
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.foreign('lesson_id').references('id').inTable('lessons').onDelete('CASCADE');
    table.foreign('parent_id').references('id').inTable('comments').onDelete('CASCADE');

    // Đánh chỉ mục tối ưu tốc độ truy vấn
    table.index(['course_id']);
    table.index(['lesson_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('comments');
};
//AI-assisted: <Gemini> [AI-09]