import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { BookOpen, Trophy, Clock, TrendingUp, Play, Award } from 'lucide-react';

interface DashboardStats {
  overview: {
    enrolledCourses?: number;
    completedCourses?: number;
    averageScore?: number;
    totalTimeSpent?: number;
    totalStudents?: number;
    totalCourses?: number;
    totalEnrollments?: number;
  };
  recentProgress?: any[];
  achievements?: any[];
  upcomingLessons?: any[];
  recentEnrollments?: any[];
  courseStats?: any[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-indigo-100">
          {isStudent
            ? "Ready to continue your learning journey?"
            : "Here's what's happening in your courses"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isStudent ? (
          <>
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              label="Enrolled Courses"
              value={stats?.overview.enrolledCourses || 0}
              color="bg-blue-500"
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="Completed"
              value={stats?.overview.completedCourses || 0}
              color="bg-green-500"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Average Score"
              value={`${Math.round(stats?.overview.averageScore || 0)}%`}
              color="bg-purple-500"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Time Spent"
              value={formatTime(stats?.overview.totalTimeSpent || 0)}
              color="bg-orange-500"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              label="Total Courses"
              value={stats?.overview.totalCourses || 0}
              color="bg-blue-500"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Total Students"
              value={stats?.overview.totalStudents || 0}
              color="bg-green-500"
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="Enrollments"
              value={stats?.overview.totalEnrollments || 0}
              color="bg-purple-500"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Progress / Enrollments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isStudent ? 'Recent Progress' : 'Recent Enrollments'}
          </h2>
          <div className="space-y-3">
            {isStudent ? (
              stats?.recentProgress && stats.recentProgress.length > 0 ? (
                stats.recentProgress.map((progress: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="font-medium text-gray-900">{progress.lesson.title}</p>
                        <p className="text-sm text-gray-500">
                          {progress.completed ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    </div>
                    {progress.score && (
                      <span className="text-sm font-medium text-indigo-600">
                        {Math.round(progress.score)}%
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent progress</p>
              )
            ) : (
              stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                stats.recentEnrollments.slice(0, 5).map((enrollment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{enrollment.user.firstName} {enrollment.user.lastName}</p>
                      <p className="text-sm text-gray-500">{enrollment.course.title}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent enrollments</p>
              )
            )}
          </div>
        </div>

        {/* Achievements / Course Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isStudent ? 'Recent Achievements' : 'Course Statistics'}
          </h2>
          <div className="space-y-3">
            {isStudent ? (
              stats?.achievements && stats.achievements.length > 0 ? (
                stats.achievements.map((achievement: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{achievement.title}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No achievements yet</p>
              )
            ) : (
              stats?.courseStats && stats.courseStats.length > 0 ? (
                stats.courseStats.map((course: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>{course._count.enrollments} students</span>
                      <span>{course._count.lessons} lessons</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No courses yet</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isStudent && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/courses"
              className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center"
            >
              <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Browse Courses</p>
            </Link>
            <Link
              to="/ai-tutor"
              className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center"
            >
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Ask AI Tutor</p>
            </Link>
            <Link
              to="/my-courses"
              className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center"
            >
              <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">My Courses</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
