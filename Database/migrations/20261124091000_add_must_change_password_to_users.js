// Giang vien do quan tri vien tao phai doi mat khau tam truoc khi quan ly khoa hoc.
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
