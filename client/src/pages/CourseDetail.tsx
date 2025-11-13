import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { BookOpen, Clock, Users, Play, CheckCircle, Lock, ArrowLeft } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.course);
      setIsEnrolled(response.data.isEnrolled);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post('/courses/enroll', { courseId: id });
      setIsEnrolled(true);
      alert('Successfully enrolled in course!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Courses
      </button>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {course.level}
            </span>
            <h1 className="text-3xl font-bold mt-4 mb-3">{course.title}</h1>
            <p className="text-indigo-100 text-lg mb-6">{course.description}</p>
            
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {Math.floor((course.duration || 0) / 60)} hours
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {course._count?.enrollments || 0} students
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {course._count?.lessons || 0} lessons
              </span>
            </div>
          </div>

          {user?.role === 'STUDENT' && (
            <div className="ml-6">
              {isEnrolled ? (
                <div className="bg-green-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Enrolled
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Course Content</h2>
          
          {course.lessons && course.lessons.length > 0 ? (
            <div className="space-y-3">
              {course.lessons.map((lesson: any, index: number) => (
                <div
                  key={lesson.id}
                  className={`p-4 border rounded-lg ${
                    isEnrolled
                      ? 'hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'
                      : 'opacity-60'
                  }`}
                  onClick={() => isEnrolled && navigate(`/lessons/${lesson.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        {isEnrolled ? (
                          <Play className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {index + 1}. {lesson.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="capitalize">{lesson.type.toLowerCase()}</span>
                          <span>•</span>
                          <span>{lesson.duration} min</span>
                        </div>
                      </div>
                    </div>
                    {lesson.status === 'PUBLISHED' ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        Published
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No lessons available yet</p>
          )}
        </div>

        {/* Course Info Sidebar */}
        <div className="space-y-6">
          {/* Teacher Info */}
          {course.teacher && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">
                    {course.teacher.firstName[0]}{course.teacher.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {course.teacher.firstName} {course.teacher.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{course.teacher.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Course Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What You'll Learn */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">What You'll Learn</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                Master core concepts and fundamentals
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                Practice with interactive exercises
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                Get personalized AI tutoring support
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                Earn achievements and certificates
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
