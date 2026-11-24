// Giảng viên do quản trị viên tạo phải đổi mật khẩu tạm trước khi tạo khóa học
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (await knex.schema.hasColumn('users', 'must_change_password')) return;
  await knex.schema.alterTable('users', function(table) {
    table.boolean('must_change_password').notNullable().defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  if (!(await knex.schema.hasColumn('users', 'must_change_password'))) return;
  await knex.schema.alterTable('users', function(table) {
    table.dropColumn('must_change_password');
  });
};
