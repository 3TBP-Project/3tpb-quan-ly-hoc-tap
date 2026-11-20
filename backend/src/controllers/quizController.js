// AI-assisted [AI-04]
const quizService = require('../services/quizService');
const { toPublicError } = require('../utils/errorResponse');

const parsePositiveIntId = (rawId) => {
    const parsed = Number(rawId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const isPlainObject = (value) => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const startQuiz = async (req, res) => {
    try {
        const courseId = parsePositiveIntId(req.params.courseId);
        if (!courseId) {
            return res.status(400).json({
                status: 'error',
                message: 'ID khóa học (courseId) không hợp lệ.'
            });
        }

        const userId = req.user.id;
        const data = await quizService.start(userId, courseId);

        return res.status(200).json({
            status: 'success',
            message: 'Bắt đầu làm bài trắc nghiệm thành công!',
            data
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi khởi tạo bài trắc nghiệm.'
        const { statusCode, message } = toPublicError(
            error,
            'Không thể khởi tạo bài trắc nghiệm lúc này.',
            'Lỗi khi khởi tạo bài trắc nghiệm:'
        );
        return res.status(statusCode).json({
            status: 'error',
            message
        });
    }
};

const submitQuiz = async (req, res) => {
    try {
        const attemptId = parsePositiveIntId(req.params.attemptId);
        if (!attemptId) {
            return res.status(400).json({
                status: 'error',
                message: 'ID lượt làm bài (attemptId) không hợp lệ.'
            });
        }

        // [FIX] Chặn lỗi TypeError khi req.body là undefined hoặc không phải JSON object
        if (!isPlainObject(req.body)) {
            return res.status(400).json({
                status: 'error',
                message: 'Dữ liệu bài nộp không hợp lệ. Vui lòng gửi body định dạng JSON.'
            });
        }

        // Cho phép bỏ trống câu trả lời ({}), nhưng báo lỗi 400 nếu answers sai kiểu dữ liệu
        const answers = req.body.answers === undefined ? {} : req.body.answers;
        if (!isPlainObject(answers)) {
            return res.status(400).json({
                status: 'error',
                message: 'Trường answers phải là một đối tượng (object) ánh xạ mã câu hỏi và đáp án.'
            });
        }
       
        const userId = req.user.id;
        const data = await quizService.submit(attemptId, userId, answers);

        return res.status(200).json({
            status: 'success',
            message: 'Nộp bài và chấm điểm thành công!',
            data
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Lỗi hệ thống khi nộp bài trắc nghiệm.'
        const { statusCode, message } = toPublicError(
            error,
            'Không thể nộp bài trắc nghiệm lúc này.',
            'Lỗi khi nộp bài trắc nghiệm:'
        );
        return res.status(statusCode).json({
            status: 'error',
            message
        });
    }
};

module.exports = { startQuiz, submitQuiz };