import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

// Icons
const AlertTriangleIcon = getIcon('AlertTriangle');
const HomeIcon = getIcon('Home');

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto text-center bg-white dark:bg-surface-800 p-8 rounded-xl shadow-lg"
      >
        <AlertTriangleIcon className="h-20 w-20 mx-auto text-amber-500 mb-6" />
        
        <h1 className="text-3xl font-bold mb-4 text-surface-800 dark:text-surface-100">Page Not Found</h1>
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/" className="btn btn-primary inline-flex items-center">
          <HomeIcon className="h-5 w-5 mr-2" /> Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;