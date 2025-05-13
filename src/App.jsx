import { createContext, useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import getIcon from './utils/iconUtils';
import { setUser, clearUser } from './store/userSlice';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Callback from './pages/Callback';
import ErrorPage from './pages/ErrorPage';
import NotFound from './pages/NotFound';

// Icons
const SunIcon = getIcon('Sun');
const MoonIcon = getIcon('Moon');

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply the theme to the document element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save the preference
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath === '/login' || currentPath === '/signup';
        if (user) {
          // User is authenticated
          dispatch(setUser(user));
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
        } else {
          // User is not authenticated
          dispatch(clearUser());
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                  ? `/login?redirect=${currentPath}`
                  : '/login'
            );
          } else if (redirectPath) {
            navigate(`/login?redirect=${redirectPath}`);
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
        // Optionally redirect to error page
        // Optionally redirect to error page
        navigate(`/error?message=${encodeURIComponent(error.message || 'Authentication failed')}`);
      }
    });
    
    setIsInitialized(true);
  }, [dispatch, navigate]);
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    isAuthenticated,
    user: userState?.user,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
        toast.info('You have been logged out');
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed");
      }
    }
  };
  
  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4 text-surface-700 dark:text-surface-300">Initializing application...</p>
        </div>
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen transition-colors duration-300">
        {/* Dark mode toggle button - only show on authenticated pages */}
        {isAuthenticated && (
          <div className="fixed top-4 right-4 z-50">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </motion.button>
          </div>
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          {/* Protected routes */}
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
          toastClassName="rounded-lg shadow-lg"
        />
      </div>
    </AuthContext.Provider>
  );
}

export default App;