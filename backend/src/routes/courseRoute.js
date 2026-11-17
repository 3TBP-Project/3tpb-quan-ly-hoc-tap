// AI-assisted [AI-05]
const express = require('express');
const courseController = require('../controllers/courseController');

const router = express.Router();

router.get('/', courseController.listCourses);

module.exports = router;
