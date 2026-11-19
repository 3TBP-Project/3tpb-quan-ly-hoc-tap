const lessonService = require('../services/lessonService');

class LessonController {
  async createLesson(req, res) {
    try {
      const userId = req.user ? req.user.id : req.userId;
      const userRole = req.user ? req.user.role : 'teacher';
      const lesson = await lessonService.createLesson(userId, userRole, req.body);
      return res.status(201).json({
        success: true,
        message: 'Tạo bài học thành công.',
        data: lesson,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getLessonsByCourse(req, res) {
    try {
      const lessons = await lessonService.getLessonsByCourse(req.params.courseId);
      return res.status(200).json({ success: true, data: lessons });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async getLessonDetail(req, res) {
    try {
      const lesson = await lessonService.getLessonById(req.params.id);
      return res.status(200).json({ success: true, data: lesson });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateLesson(req, res) {
    try {
      const userId = req.user ? req.user.id : req.userId;
      const userRole = req.user ? req.user.role : 'teacher';
      const updated = await lessonService.updateLesson(userId, userRole, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Cập nhật bài học thành công.',
        data: updated,
      });
    } catch (error) {
      return res.status(403).json({ success: false, message: error.message });
    }
  }

  async reorderLessons(req, res) {
    try {
      const userId = req.user ? req.user.id : req.userId;
      const userRole = req.user ? req.user.role : 'teacher';
      const { course_id, lesson_ids } = req.body;
      const lessons = await lessonService.reorderLessons(userId, userRole, course_id, lesson_ids);
      return res.status(200).json({
        success: true,
        message: 'Cập nhật thứ tự bài học thành công.',
        data: lessons,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteLesson(req, res) {
    try {
      const userId = req.user ? req.user.id : req.userId;
      const userRole = req.user ? req.user.role : 'teacher';
      await lessonService.deleteLesson(userId, userRole, req.params.id);
      return res.status(200).json({ success: true, message: 'Xóa bài học thành công.' });
    } catch (error) {
      return res.status(403).json({ success: false, message: error.message });
    }
  }
}

module.exports = new LessonController();
//AI-assisted: <Gemini> [AI-04]