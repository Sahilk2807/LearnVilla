import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import CourseCard from '../components/courses/CourseCard';
import Seo from '../components/Seo';

interface EnrolledCourse {
  id: number;
  title: string;
  poster_url: string;
  category: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/user/dashboard');
        setEnrolledCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <>
      <Seo title="My Dashboard - Learn Villa" description="View your enrolled courses." />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome, {user?.email}!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Here are the courses you're enrolled in.</p>
        
        <h2 className="text-2xl font-bold mb-6">My Courses</h2>
        {loading ? (
          <p>Loading your courses...</p>
        ) : (
          enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {enrolledCourses.map(course => <CourseCard key={course.id} {...course} />)}
            </div>
          ) : (
            <p className="text-center bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">You haven't enrolled in any courses yet. <a href="/courses" className="text-blue-500 hover:underline">Explore courses now!</a></p>
          )
        )}
      </div>
    </>
  );
};

export default DashboardPage;