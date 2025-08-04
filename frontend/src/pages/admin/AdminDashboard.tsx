import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Seo from '../../components/Seo';
import { Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats {
  total_users: number;
  total_courses: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then(response => setStats(response.data))
      .catch(error => console.error("Error fetching admin stats:", error));
  }, []);

  return (
    <>
      <Seo title="Admin Dashboard - Learn Villa" />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
            <Users className="text-blue-500 mr-4" size={40} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold">{stats ? stats.total_users : '...'}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
            <BookOpen className="text-green-500 mr-4" size={40} />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold">{stats ? stats.total_courses : '...'}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Management</h2>
          <div className="flex space-x-4">
             <Link to="/admin/courses" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                Manage Courses
             </Link>
             {/* Add links to other management pages here */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;