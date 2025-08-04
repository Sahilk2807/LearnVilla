import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CourseCard from '../components/courses/CourseCard';
import Seo from '../components/Seo';
import { Search } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  category: string;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get('/courses', { params: { q: searchTerm } });
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [searchTerm]);

  return (
    <>
      <Seo title="All Courses - Learn Villa" description="Browse all available courses on Learn Villa." />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Explore Our Courses</h1>
        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {loading ? (
          <div className="text-center">Loading courses...</div> // Replace with Skeleton Grid
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.length > 0 ? (
              courses.map(course => <CourseCard key={course.id} {...course} />)
            ) : (
              <p className="col-span-full text-center text-gray-500">No courses found matching your search.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CoursesPage;