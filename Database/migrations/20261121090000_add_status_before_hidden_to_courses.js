// HT-15: lưu trạng thái trước khi quản trị viên ẩn khóa học, để "Bỏ ẩn" khôi phục đúng (nháp / công khai)
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('courses', function(table) {
    table.enu('status_before_hidden', ['draft', 'public']).nullable().after('status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('courses', function(table) {
    table.dropColumn('status_before_hidden');
  });
};
//AI-assisted: Claude [AI-07]
