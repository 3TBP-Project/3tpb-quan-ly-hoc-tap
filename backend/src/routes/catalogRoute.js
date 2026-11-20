const express = require('express');
const catalogController = require('../controllers/catalogController');

const router = express.Router();

router.get('/categories', catalogController.listCategories);
router.get('/teachers', catalogController.listTeachers);

module.exports = router;
