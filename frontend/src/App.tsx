import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout and Core Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

// Core Pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

// Static Pages
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
// ... import other static pages

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
// ... import other admin pages like CourseManagement

function App() {
  // A layout for the main site (with Header/Footer)
  const SiteLayout = () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow"><Outlet /></main>
      <Footer />
    </div>
  );
  
  // A layout for the admin panel (could have a different header/sidebar)
  const AdminLayout = () => (
    // For now, it's just a simple outlet, but you could add an AdminSidebar here
    <div><Outlet /></div>
  );

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                {/* <Route path="courses" element={<CourseManagementPage />} /> */}
              </Route>
            </Route>

            {/* Main Site Routes */}
            <Route path="/" element={<SiteLayout />}>
              <Route index element={<HomePage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="courses/:courseId" element={<CourseDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="about" element={<AboutUsPage />} />
              <Route path="contact" element={<ContactPage />} />
              
              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;