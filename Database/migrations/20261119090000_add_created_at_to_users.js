// AI-assisted [AI-08]
// HT-14: thêm cột ngày đăng ký cho bảng users (bỏ qua nếu CSDL đã có sẵn cột này)
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (await knex.schema.hasColumn('users', 'created_at')) return;
  await knex.schema.alterTable('users', function(table) {
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  if (!(await knex.schema.hasColumn('users', 'created_at'))) return;
  await knex.schema.alterTable('users', function(table) {
    table.dropColumn('created_at');
  });
};
