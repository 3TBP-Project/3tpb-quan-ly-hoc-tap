// AI-assisted
// Chương học (chapters) và cột lessons.chapter_id.
// CSDL hiện tại đã có sẵn bảng/cột này (tạo ngoài migration) nên mỗi bước đều kiểm tra
// trước: chạy trên CSDL cũ thì bỏ qua, chạy trên CSDL trống thì tạo đúng cấu trúc.
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (!(await knex.schema.hasTable('chapters'))) {
    await knex.schema.createTable('chapters', function(table) {
      table.increments('id').primary();
      table.integer('course_id').unsigned().notNullable();
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.string('title', 255).notNullable();
      // Thứ tự chương trong khóa học
      table.integer('position').defaultTo(1).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index(['course_id', 'position']);
    });
  }

  if (!(await knex.schema.hasColumn('lessons', 'chapter_id'))) {
    await knex.schema.alterTable('lessons', function(table) {
      // NULL = bài học chưa thuộc chương nào
      table.integer('chapter_id').unsigned().nullable().after('course_id');
      table.foreign('chapter_id').references('id').inTable('chapters').onDelete('CASCADE');
      table.index(['chapter_id']);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  if (await knex.schema.hasColumn('lessons', 'chapter_id')) {
    await knex.schema.alterTable('lessons', function(table) {
      table.dropForeign(['chapter_id']);
      table.dropIndex(['chapter_id']);
      table.dropColumn('chapter_id');
    });
  }
  await knex.schema.dropTableIfExists('chapters');
};
