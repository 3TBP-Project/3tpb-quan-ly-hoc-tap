// AI-assisted [AI-07]
// HT-15: API Danh mục và duyệt khóa học – chỉ quản trị viên
const express = require('express');
const adminCatalogController = require('../controllers/adminCatalogController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
const adminOnly = [verifyToken, authorizeRoles(ROLES.ADMIN)];

router.get('/categories', adminOnly, adminCatalogController.listCategories);
router.post('/categories', adminOnly, adminCatalogController.createCategory);
router.put('/categories/:id', adminOnly, adminCatalogController.updateCategory);
router.delete('/categories/:id', adminOnly, adminCatalogController.deleteCategory);

router.get('/courses', adminOnly, adminCatalogController.listCourses);
router.patch('/courses/:id/hide', adminOnly, adminCatalogController.hideCourse);
router.patch('/courses/:id/unhide', adminOnly, adminCatalogController.unhideCourse);

module.exports = router;
