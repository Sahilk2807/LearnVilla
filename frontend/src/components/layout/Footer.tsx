import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Learn Villa</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your premium, ad-free learning platform.
            </p>
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Quick Links</h3>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li><Link to="/courses" className="hover:underline">Courses</Link></li>
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Legal</h3>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              {/* You would create these pages next */}
              <li><Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms-of-use" className="hover:underline">Terms of Use</Link></li>
              <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {currentYear} Learn Villa. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;