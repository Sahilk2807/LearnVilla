import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface CourseCardProps {
  id: number;
  title: string;
  poster_url: string;
  category: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ id, title, poster_url, category }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      <Link to={`/courses/${id}`}>
        <img src={poster_url || 'https://placehold.co/600x400'} alt={title} className="w-full h-48 object-cover" />
        <div className="p-4">
          <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full mb-2">
            {category}
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{title}</h3>
          <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
             <BookOpen size={16} className="mr-2" />
             <span>View Course</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;