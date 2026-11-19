const fs = require('fs');
const path = require('path');
const lessonRepository = require('../repositories/lessonRepository');
const courseRepository = require('../repositories/courseRepository');
const { PRIVATE_PDF_DIR } = require('../middlewares/pdfUploadMiddleware');

class LessonService {
  async verifyCourseAccess(courseId, userId, userRole) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Không tìm thấy khóa học.');
    }
    if (course.user_id !== userId && userRole !== 'admin') {
      throw new Error('Bạn không có quyền thao tác bài học trên khóa học này.');
    }
    return course;
  }

  removeStoredFile(fileName) {
    if (!fileName) return;
    const fullPath = path.join(PRIVATE_PDF_DIR, path.basename(fileName));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async createLesson(userId, userRole, data) {
    if (!data.course_id || !data.title || !String(data.title).trim()) {
      throw new Error('Thiếu khóa học hoặc tiêu đề bài học.');
    }

    const courseId = Number(data.course_id);
    await this.verifyCourseAccess(courseId, userId, userRole);

    const maxPos = await lessonRepository.getMaxPosition(courseId);
    const position = data.position !== undefined ? Number(data.position) : maxPos + 1;

    const payload = {
      course_id: courseId,
      title: String(data.title).trim(),
      content: data.content !== undefined ? data.content : null,
      video_path: data.video_path || null,
      file_path: data.file_path || null,
      position,
    };

    const id = await lessonRepository.create(payload);
    return { id, ...payload };
  }

  async getLessonsByCourse(courseId) {
    const course = await courseRepository.findById(Number(courseId));
    if (!course) {
      throw new Error('Không tìm thấy khóa học.');
    }
    return lessonRepository.findByCourseId(Number(courseId));
  }

  async getLessonById(id) {
    const lesson = await lessonRepository.findById(Number(id));
    if (!lesson) {
      throw new Error('Không tìm thấy bài học.');
    }
    return lesson;
  }

  async updateLesson(userId, userRole, lessonId, updateData) {
    const lesson = await lessonRepository.findById(Number(lessonId));
    if (!lesson) {
      throw new Error('Không tìm thấy bài học.');
    }

    await this.verifyCourseAccess(lesson.course_id, userId, userRole);

    if (updateData.file_path && lesson.file_path && updateData.file_path !== lesson.file_path) {
      this.removeStoredFile(lesson.file_path);
    }

    const merged = {
      title: updateData.title !== undefined ? String(updateData.title).trim() : lesson.title,
      content: updateData.content !== undefined ? updateData.content : lesson.content,
      video_path: updateData.video_path !== undefined ? updateData.video_path : lesson.video_path,
      file_path: updateData.file_path !== undefined ? updateData.file_path : lesson.file_path,
      position: updateData.position !== undefined ? Number(updateData.position) : lesson.position,
    };

    await lessonRepository.update(Number(lessonId), merged);
    return lessonRepository.findById(Number(lessonId));
  }

  async reorderLessons(userId, userRole, courseId, orderedIds) {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new Error('Danh sách thứ tự bài học không hợp lệ.');
    }

    await this.verifyCourseAccess(Number(courseId), userId, userRole);

    for (let i = 0; i < orderedIds.length; i += 1) {
      await lessonRepository.updatePosition(Number(orderedIds[i]), i + 1);
    }

    return lessonRepository.findByCourseId(Number(courseId));
  }

  async deleteLesson(userId, userRole, lessonId) {
    const lesson = await lessonRepository.findById(Number(lessonId));
    if (!lesson) {
      throw new Error('Không tìm thấy bài học.');
    }

    await this.verifyCourseAccess(lesson.course_id, userId, userRole);

    const deleted = await lessonRepository.remove(Number(lessonId));
    if (deleted > 0) {
      this.removeStoredFile(lesson.file_path);
    }
    return deleted > 0;
  }
}

module.exports = new LessonService();
//AI-assisted: <Gemini> [AI-03]