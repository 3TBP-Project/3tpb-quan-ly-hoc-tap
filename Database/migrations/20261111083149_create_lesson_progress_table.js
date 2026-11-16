//lesson_progress table
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('lesson_progress', function(table) {
  table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('lesson_id').unsigned().notNullable();
    table.foreign('lesson_id').references('id').inTable('lessons').onDelete('CASCADE');
    table.boolean('is_completed');
    table.unique(['user_id','lesson_id']);

  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('lesson_progress');
};
//AI-assisted: <Gemini> [AI-08]