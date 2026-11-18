//courses table
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('courses', function(table) {
    table.increments('id').primary();
    table.string('thumbnail', 255).nullable();
    table.string('title', 255).notNullable();
    table.text('description');
    table.integer('category_id').unsigned().notNullable();
    table.foreign('category_id').references('id').inTable('categories').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.float('price_course').defaultTo(0);
    table.integer('quiz_minutes').nullable();
    
    table.enu('status', ['draft', 'public', 'hidden']).defaultTo('draft').notNullable();

    // Bổ sung created_at để sắp xếp khóa học mới nhất (HT-01)
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Thêm các chỉ mục (indexes) tối ưu hiệu suất theo yêu cầu
    table.index(['category_id']);
    table.index(['user_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('courses');
};
//AI-assisted: <Gemini> [AI-03]