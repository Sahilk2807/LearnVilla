import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is a dependency

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  
  // If an admin is already logged in, redirect them
  useEffect(() => {
    if(auth.user?.is_admin) {
      navigate('/admin/dashboard');
    }
  }, [auth.user, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.access_token;
      
      // Manually decode here to check for admin status before redirecting
      const decoded: { identity: { is_admin: boolean } } = jwtDecode(token);

      if (decoded.identity.is_admin) {
        auth.login(token); // AuthContext will set the user
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Administrator privileges required.');
        // Do not log in the non-admin user
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Admin Login - Learn Villa" description="Login page for site administrators." />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Admin Panel Login</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-center p-3 rounded-lg text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;