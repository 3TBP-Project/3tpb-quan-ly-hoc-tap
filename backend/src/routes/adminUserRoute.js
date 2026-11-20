const express = require('express');
const adminUserController = require('../controllers/adminUserController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(verifyToken, authorizeRoles(ROLES.ADMIN));

router.get('/', adminUserController.listUsers);
router.put('/:id', adminUserController.updateUser);
router.delete('/:id', adminUserController.deleteUser);

module.exports = router;
