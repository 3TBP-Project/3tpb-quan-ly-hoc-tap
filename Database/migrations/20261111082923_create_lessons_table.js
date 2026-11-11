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
    table.specificType('video_path', 'longtext');
    table.specificType('file_path', 'longtext');
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