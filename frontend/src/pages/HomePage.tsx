import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CourseCard from '../components/courses/CourseCard';
import Seo from '../components/Seo';

interface Course {
  id: number;
  title: string;
  poster_url: string;
  category: string;
}

const HomePage: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await api.get('/courses/featured');
        setFeaturedCourses(response.data);
      } catch (error) {
        console.error("Error fetching featured courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedCourses();
  }, []);

  return (
    <>
      <Seo title="Learn Villa - Premium Digital Courses" description="Explore a world of knowledge with Learn Villa's premium digital courses." />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16 bg-blue-50 dark:bg-gray-800 rounded-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400">Welcome to Learn Villa</h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Your gateway to mastering new skills. No ads, just learning.</p>
        </section>

        {/* Featured Courses Section */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Featured Courses</h2>
          {loading ? (
            <p>Loading...</p> // Replace with Skeleton Screen component
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCourses.map(course => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default HomePage;