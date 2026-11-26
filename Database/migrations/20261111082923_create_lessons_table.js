//lessons table
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('lessons', function(table) {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('content');
    

    table.enu('status', ['draft', 'public', 'hidden']).defaultTo('draft').notNullable();
    // Đã sửa từ longtext thành varchar để lưu link nhúng video và đường dẫn tệp
    table.string('video_path', 255).nullable();
    table.string('file_path', 255).nullable();
    
    // Thêm cột position kiểu integer để sắp xếp thứ tự bài học theo yêu cầu
    table.integer('position').defaultTo(1).notNullable();

    // Thêm chỉ mục tối ưu hiệu suất truy vấn bài học theo khóa học và thứ tự
    table.index(['course_id', 'position']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('lessons');
};
//AI-assisted: <Gemini> [AI-05]