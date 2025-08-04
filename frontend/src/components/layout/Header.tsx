import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // We will create this
import { useTheme } from '../../context/ThemeContext'; // This now exists
import { Sun, Moon, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-gray-900 dark:bg-gray-700 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Learn Villa
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <NavLink to="/" className={navLinkClasses} end>Home</NavLink>
                <NavLink to="/courses" className={navLinkClasses}>Courses</NavLink>
                <NavLink to="/about" className={navLinkClasses}>About</NavLink>
                <NavLink to="/contact" className={navLinkClasses}>Contact</NavLink>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="ml-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                   <NavLink to="/dashboard" className={navLinkClasses}>
                     <User size={20} className="inline-block" />
                     <span className="ml-2 hidden sm:inline">Dashboard</span>
                   </NavLink>
                   <button onClick={logout} className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
                     <LogOut size={20} />
                   </button>
                </div>
              ) : (
                <NavLink to="/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;