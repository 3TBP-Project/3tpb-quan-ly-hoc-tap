// HT-07: Lưu chi tiết từng câu của mỗi lượt làm bài để học viên xem lại bài cũ
// (vì sao được bấy nhiêu điểm). Lưu "ảnh chụp" nội dung câu hỏi, thứ tự 4 lựa chọn
// đúng như lúc học viên làm bài và đáp án đúng tại thời điểm nộp, nên dù giảng viên
// sửa / xóa câu hỏi sau này thì bài làm cũ vẫn xem lại được nguyên vẹn.
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (await knex.schema.hasTable('quiz_attempt_answers')) return;
  await knex.schema.createTable('quiz_attempt_answers', function(table) {
    table.increments('id').primary();
    table.integer('attempt_id').unsigned().notNullable();
    table.foreign('attempt_id').references('id').inTable('quiz_attempts').onDelete('CASCADE');
    // Câu hỏi gốc có thể bị xóa sau này -> giữ lại bản ghi, chỉ bỏ liên kết
    table.integer('question_id').unsigned().nullable();
    table.foreign('question_id').references('id').inTable('questions').onDelete('SET NULL');
    table.integer('position').unsigned().notNullable();
    table.text('question_content').notNullable();
    // Mảng JSON 4 lựa chọn theo đúng thứ tự hiển thị cho học viên (A, B, C, D)
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
