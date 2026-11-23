// AI-assisted [AI-07]
// HT-15: Danh mục và duyệt khóa học (chỉ quản trị viên)
const catalogRepository = require('../repositories/catalogRepository');

const MAX_NAME_LENGTH = 255;

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseId = (value, label) => {
  const raw = String(value ?? '');
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
    throw createHttpError(`Mã ${label} không hợp lệ.`, 400);
  }
  return Number(raw);
};

const validateName = (name) => {
  if (typeof name !== 'string' || name.trim() === '') {
    throw createHttpError('Tên danh mục không được để trống.', 400);
  }
  const clean = name.trim().replace(/\s+/g, ' ');
  if (clean.length > MAX_NAME_LENGTH) {
    throw createHttpError(`Tên danh mục tối đa ${MAX_NAME_LENGTH} ký tự.`, 400);
  }
  return clean;
};

const ensureUniqueName = async (name, ignoreId = null) => {
  const same = await catalogRepository.findCategoryByName(name);
  if (same && same.id !== ignoreId) {
    throw createHttpError(`Danh mục "${same.name}" đã tồn tại.`, 409);
  }
};

const listCategories = () => catalogRepository.findCategoriesWithCourseCount();

const createCategory = async (input = {}) => {
  const name = validateName(input.name);
  await ensureUniqueName(name);
  return catalogRepository.createCategory(name);
};

const updateCategory = async (rawId, input = {}) => {
  const id = parseId(rawId, 'danh mục');
  const name = validateName(input.name);
  const current = await catalogRepository.findCategoryById(id);
  if (!current) throw createHttpError('Không tìm thấy danh mục.', 404);
  await ensureUniqueName(name, id);
  await catalogRepository.updateCategory(id, name);
  return { id, name, courseCount: await catalogRepository.countCoursesInCategory(id) };
};

// Chặn xóa danh mục đang có khóa học
const deleteCategory = async (rawId) => {
  const id = parseId(rawId, 'danh mục');
  const current = await catalogRepository.findCategoryById(id);
  if (!current) throw createHttpError('Không tìm thấy danh mục.', 404);

  const courseCount = await catalogRepository.countCoursesInCategory(id);
  if (courseCount > 0) {
    throw createHttpError(
      `Danh mục "${current.name}" đang có ${courseCount} khóa học. Hãy chuyển các khóa sang danh mục khác trước.`,
      409
    );
  }

  const deleted = await catalogRepository.deleteEmptyCategory(id);
  if (!deleted) {
    // Có khóa học vừa được thêm vào giữa lúc kiểm tra và xóa
    throw createHttpError(`Danh mục "${current.name}" đang có khóa học, không thể xóa.`, 409);
  }
  return current;
};

const listCourses = () => catalogRepository.findAllCoursesForAdmin();

// Giảng viên tự đặt nháp/công khai; quản trị viên chỉ ẩn hoặc bỏ ẩn
const setCourseHidden = async (rawId, hidden) => {
  const id = parseId(rawId, 'khóa học');
  const course = await catalogRepository.findCourseStatusById(id);
  if (!course) throw createHttpError('Không tìm thấy khóa học.', 404);

  if (hidden) {
    if (course.status === 'hidden') throw createHttpError('Khóa học này đã bị ẩn.', 409);
    await catalogRepository.hideCourse(id);
  } else {
    if (course.status !== 'hidden') throw createHttpError('Khóa học này đang không bị ẩn.', 409);
    await catalogRepository.unhideCourse(id);
  }

  return catalogRepository.findCourseStatusById(id);
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listCourses,
  setCourseHidden
};
