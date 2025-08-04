import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Seo from '../components/Seo';
import { Lock, Unlock, PlayCircle, FileText } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  content_type: 'video' | 'pdf';
  is_premium: boolean;
  content_url: string | null; // URL is null if locked
}

interface CourseDetail {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  category: string;
  is_enrolled: boolean;
  lessons: Lesson[];
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [courseId]);

  if (loading) return <div className="text-center p-10">Loading...</div>; // Skeleton Screen
  if (!course) return <div className="text-center p-10">Course not found.</div>;

  return (
    <>
      <Seo title={`${course.title} - Learn Villa`} description={course.description.substring(0, 160)} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
            <span className="text-sm font-semibold text-blue-500 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full">{course.category}</span>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{course.description}</p>
          </div>
          <div>
            <img src={course.poster_url || 'https://placehold.co/600x400'} alt={course.title} className="rounded-lg shadow-lg w-full" />
            <button disabled={course.is_enrolled} className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              {course.is_enrolled ? 'You are Enrolled' : 'Enroll Now'}
            </button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Course Content</h2>
          <div className="space-y-3">
            {course.lessons.map(lesson => (
              <div key={lesson.id} className={`flex items-center justify-between p-4 rounded-lg ${lesson.content_url ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800/50'}`}>
                <div className="flex items-center">
                  {lesson.content_type === 'video' ? <PlayCircle className="mr-3 text-blue-500" /> : <FileText className="mr-3 text-green-500" />}
                  <span className={`font-medium ${!lesson.content_url && 'text-gray-500'}`}>{lesson.title}</span>
                </div>
                <div>
                  {lesson.is_premium ? (
                    lesson.content_url ? <Unlock size={20} className="text-green-500" /> : <Lock size={20} className="text-red-500" />
                  ) : (
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">FREE</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;