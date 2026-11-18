import { useFetch } from '../hooks/useFetch';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import PageHeader from '../components/common/PageHeader';
import CourseCard from '../components/course/CourseCard';
import { getMyEnrolledCourses } from '../services/courseService';

function MyCoursesPage() {
  const { data, loading, error } = useFetch(getMyEnrolledCourses);
  const courses = data ?? [];

  return (
    <>
      <PageHeader
        title="Khóa học của tôi"
        subtitle="Danh sách các khóa học bạn đã ghi danh thành công."
      />
      {error ? <ErrorMessage message={error} /> : null}
      {loading && !data ? <Loading /> : null}
      {!loading && !error && courses.length === 0 ? (
        <EmptyState message="Bạn chưa ghi danh khóa học nào." />
      ) : null}
      {courses.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
          {courses.map((course) => (
            <div className="col" key={course.enrollmentId}>
              <CourseCard
                course={{
                  ...course,
                  coverImage: course.thumbnail,
                  teacherName: course.teacherName,
                  categoryName: course.categoryName,
                }}
                to={null}
                showCta={false}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default MyCoursesPage;
