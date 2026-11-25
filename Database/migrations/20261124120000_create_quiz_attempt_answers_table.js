// HT-07: Luu chi tiet tung cau cua moi luot lam bai de xem lai bai cu.
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (await knex.schema.hasTable('quiz_attempt_answers')) return;

  await knex.schema.createTable('quiz_attempt_answers', function(table) {
    table.increments('id').primary();

    table.integer('attempt_id').unsigned().notNullable();
    table.foreign('attempt_id')
      .references('id')
      .inTable('quiz_attempts')
      .onDelete('CASCADE');

    // Cau hoi goc co the bi xoa sau nay; giu ban ghi va bo lien ket.
    table.integer('question_id').unsigned().nullable();
    table.foreign('question_id')
      .references('id')
      .inTable('questions')
      .onDelete('SET NULL');

    table.integer('position').unsigned().notNullable();
    table.text('question_content').notNullable();
    table.text('options').notNullable();
    table.string('selected_answer', 255).nullable();
    table.string('correct_answer', 255).nullable();
    table.boolean('is_correct').notNullable().defaultTo(false);

    table.unique(['attempt_id', 'question_id']);
    table.index(['attempt_id', 'position']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('quiz_attempt_answers');
};
