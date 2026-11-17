/**
 * Migration tạo bảng discussions (Chuyên cho Thảo luận / Hỏi đáp trong bài học - HT-08)
 */
exports.up = function(knex) {
  return knex.schema.createTable('discussions', function(table) {
    table.increments('id').primary();
    
    // Liên kết với bài học và người dùng
    table.integer('lesson_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    
    // Đã chỉnh sửa thành nullable để hỗ trợ câu hỏi gốc (không có parent)
    table.integer('parent_id').unsigned().nullable();
    
    // Nội dung câu hỏi hoặc thảo luận
    table.text('content').notNullable();
    
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Thiết lập các khóa ngoại với CASCADE delete
    table.foreign('lesson_id').references('id').inTable('lessons').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('parent_id').references('id').inTable('discussions').onDelete('CASCADE');

    // Đánh chỉ mục tối ưu hiệu suất truy vấn
    table.index(['lesson_id']);
    table.index(['user_id']);
    table.index(['parent_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('discussions');
};
//AI-assisted: <Gemini> [AI-10]