// This component can be very similar to LoginPage.tsx, but redirects to the admin dashboard.
// For simplicity, you can reuse the same logic, as the backend token already contains the admin status.
// A dedicated page ensures a clear separation of user flows.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo';

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
      // IMPORTANT: Check for admin status before proceeding
      const token = response.data.access_token;
      auth.login(token); // AuthContext will decode and set the user

      // Manually decode here to check for admin status before redirecting
      // Note: useAuth effect will also set the user, this is for immediate check
      const { jwtDecode } = await import('jwt-decode');
      const decoded: { identity: { is_admin: boolean } } = jwtDecode(token);

      if (decoded.identity.is_admin) {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Administrator privileges required.');
        auth.logout(); // Log out the non-admin user
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Admin Login - Learn Villa" />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">Admin Panel Login</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-center text-red-500">{error}</p>}
            <div>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:bg-red-400">
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;