//enrollments table
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('enrollments', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.unique(['user_id','course_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('enrollments');
};
//AI-assisted: <Gemini> [AI-04]