//discussions table
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('discussions', function(table) {
    table.increments('id').primary();
    table.integer('lesson_id').unsigned().notNullable();
    table.foreign('lesson_id').references('id').inTable('lessons').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // parent_id cho phép NULL để làm câu hỏi gốc
    table.integer('parent_id').unsigned().nullable();
    table.foreign('parent_id').references('id').inTable('discussions').onDelete('CASCADE');
    
    table.text('content').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Chỉ mục tối ưu
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