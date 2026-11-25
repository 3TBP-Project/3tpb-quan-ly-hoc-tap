const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const seed01 = require('../seeds/01_seed_data');
const seed02 = require('../seeds/02_seed_demo');

/**
 * Tạo giả lập Knex + MySQL trong bộ nhớ (hỗ trợ transaction, auto_increment,
 * unique email, cascade delete khi xóa courses) để kiểm thử chạy lại nhiều lần.
 */
function createMockKnex() {
  const tables = {
    categories: [],
    users: [],
    courses: [],
    chapters: [],
    lessons: [],
    enrollments: [],
    lesson_progress: [],
    questions: [],
    quiz_attempts: [],
    quiz_attempt_answers: [],
    comments: [],
    discussions: []
  };

  const autoInc = Object.fromEntries(Object.keys(tables).map((t) => [t, 1]));

  const cascadeDeleteCourses = (deletedCourseIds) => {
    const idSet = new Set(deletedCourseIds);
    const deletedChapterIds = new Set(
      tables.chapters.filter((c) => idSet.has(c.course_id)).map((c) => c.id)
    );
    const deletedLessonIds = new Set(
      tables.lessons.filter((l) => idSet.has(l.course_id)).map((l) => l.id)
    );
    const deletedAttemptIds = new Set(
      tables.quiz_attempts.filter((a) => idSet.has(a.course_id)).map((a) => a.id)
    );

    tables.chapters = tables.chapters.filter((c) => !idSet.has(c.course_id));
    tables.lessons = tables.lessons.filter(
      (l) => !idSet.has(l.course_id) && !deletedChapterIds.has(l.chapter_id)
    );
    tables.questions = tables.questions.filter((q) => !idSet.has(q.course_id));
    tables.enrollments = tables.enrollments.filter((e) => !idSet.has(e.course_id));
    tables.comments = tables.comments.filter((c) => !idSet.has(c.course_id));
    tables.quiz_attempts = tables.quiz_attempts.filter((a) => !idSet.has(a.course_id));
    tables.quiz_attempt_answers = tables.quiz_attempt_answers.filter(
      (ans) => !deletedAttemptIds.has(ans.attempt_id)
    );
    tables.lesson_progress = tables.lesson_progress.filter(
      (lp) => !deletedLessonIds.has(lp.lesson_id)
    );
    tables.discussions = tables.discussions.filter(
      (d) => !deletedLessonIds.has(d.lesson_id)
    );
  };

  const queryBuilder = (tableName) => {
    if (!Object.prototype.hasOwnProperty.call(tables, tableName)) {
      throw new Error(`Bảng không tồn tại: ${tableName}`);
    }

    let filterFn = () => true;

    const builder = {
      where(cond) {
        filterFn = (row) =>
          Object.entries(cond).every(([k, v]) => row[k] === v);
        return builder;
      },
      whereIn(col, values) {
        const set = new Set(values);
        filterFn = (row) => set.has(row[col]);
        return builder;
      },
      async first() {
        return tables[tableName].find(filterFn);
      },
      async insert(payload) {
        const rows = Array.isArray(payload) ? payload : [payload];
        const insertedIds = [];

        for (const item of rows) {
          const row = { ...item };
          if (row.id == null) {
            row.id = autoInc[tableName]++;
          } else {
            autoInc[tableName] = Math.max(autoInc[tableName], row.id + 1);
          }

          if (tableName === 'users') {
            if (tables.users.some((u) => u.email === row.email)) {
              throw new Error(`ER_DUP_ENTRY: email trùng ${row.email}`);
            }
          }
          if (tableName === 'enrollments') {
            if (
              tables.enrollments.some(
                (e) => e.user_id === row.user_id && e.course_id === row.course_id
              )
            ) {
              throw new Error('ER_DUP_ENTRY: enrollments(user_id, course_id)');
            }
          }

          tables[tableName].push(row);
          insertedIds.push(row.id);
        }

        return insertedIds;
      },
      async update(fields) {
        let count = 0;
        tables[tableName] = tables[tableName].map((row) => {
          if (!filterFn(row)) return row;
          count += 1;
          return { ...row, ...fields };
        });
        return count;
      },
      async del() {
        const toDelete = tables[tableName].filter(filterFn);
        tables[tableName] = tables[tableName].filter((row) => !filterFn(row));
        if (tableName === 'courses' && toDelete.length > 0) {
          cascadeDeleteCourses(toDelete.map((c) => c.id));
        }
        return toDelete.length;
      }
    };

    return builder;
  };

  const knex = (tableName) => queryBuilder(tableName);
  knex.transaction = async (cb) => cb(knex);
  knex._tables = tables;
  return knex;
}

function withMockedBcrypt(fn) {
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === 'bcrypt' || request.endsWith('/bcrypt')) {
      return {
        async hash(plain, rounds) {
          return `$2b$${rounds}$mocked_${plain}`;
        }
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      Module._load = originalLoad;
    });
}

test('01_seed_data.js tạo đủ dữ liệu mẫu và chạy lại được nhiều lần', async () => {
  await withMockedBcrypt(async () => {
    const knex = createMockKnex();

    await seed01.seed(knex);
    assert.equal(knex._tables.categories.length, 5);
    assert.equal(knex._tables.users.length, 19);
    assert.equal(knex._tables.courses.length, 8);
    assert.equal(knex._tables.chapters.length, 24);
    assert.equal(knex._tables.lessons.length, 40);
    assert.equal(knex._tables.questions.length, 80);
    assert.equal(knex._tables.enrollments.length, 17);
    assert.equal(knex._tables.quiz_attempts.length, 9);
    assert.equal(knex._tables.lesson_progress.length, 8);
    assert.equal(knex._tables.comments.length, 11);
    assert.equal(knex._tables.discussions.length, 10);

    // Giả lập có dữ liệu quiz_attempt_answers trước khi chạy seed lần 2
    knex._tables.quiz_attempt_answers.push({ id: 1, attempt_id: 1, question_id: 1 });

    await seed01.seed(knex);
    assert.equal(knex._tables.courses.length, 8);
    assert.equal(knex._tables.quiz_attempt_answers.length, 0);
  });
});

test('02_seed_demo.js tạo 3 tài khoản demo và 2 khóa học đầy đủ bài học + câu hỏi, chạy lại không lỗi', async () => {
  await withMockedBcrypt(async () => {
    const knex = createMockKnex();

    // Lần 1 trên DB trống
    await seed02.seed(knex);
    assert.equal(knex._tables.users.length, 3);
    assert.deepEqual(
      knex._tables.users.map((u) => u.role).sort(),
      ['admin', 'student', 'teacher']
    );
    assert.ok(knex._tables.users.every((u) => u.password.startsWith('$2b$10$')));
    assert.equal(knex._tables.courses.length, 2);
    assert.ok(knex._tables.courses.every((c) => c.status === 'public'));
    assert.equal(knex._tables.chapters.length, 4);
    assert.equal(knex._tables.lessons.length, 8);
    assert.ok(knex._tables.lessons.every((l) => l.status === 'public' && l.video_path.includes('youtube.com')));
    assert.equal(knex._tables.questions.length, 20);
    assert.equal(knex._tables.enrollments.length, 2);

    // Lần 2 (chạy lại để kiểm tra idempotent)
    await seed02.seed(knex);
    assert.equal(knex._tables.users.length, 3);
    assert.equal(knex._tables.courses.length, 2);
    assert.equal(knex._tables.chapters.length, 4);
    assert.equal(knex._tables.lessons.length, 8);
    assert.equal(knex._tables.questions.length, 20);
    assert.equal(knex._tables.enrollments.length, 2);
  });
});

test('Chạy cả bộ 01_seed_data.js + 02_seed_demo.js liên tiếp nhiều lần không xung đột', async () => {
  await withMockedBcrypt(async () => {
    const knex = createMockKnex();

    await seed01.seed(knex);
    await seed02.seed(knex);
    assert.equal(knex._tables.users.length, 22);
    assert.equal(knex._tables.courses.length, 10);
    assert.equal(knex._tables.chapters.length, 28);
    assert.equal(knex._tables.lessons.length, 48);
    assert.equal(knex._tables.questions.length, 100);

    // Chạy lại cả bộ lần 2
    await seed01.seed(knex);
    await seed02.seed(knex);
    assert.equal(knex._tables.users.length, 22);
    assert.equal(knex._tables.courses.length, 10);
    assert.equal(knex._tables.chapters.length, 28);
    assert.equal(knex._tables.lessons.length, 48);
    assert.equal(knex._tables.questions.length, 100);
  });
});
