import { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import MainFeature from '../components/MainFeature';
import TaskList from '../components/TaskList';
import getIcon from '../utils/iconUtils';
import { getTaskStats } from '../services/taskService';
import { AuthContext } from '../App';

// Icons
const ListTodoIcon = getIcon('ListTodo');
const LayoutDashboardIcon = getIcon('LayoutDashboard');
const ClockIcon = getIcon('Clock');
const LogOutIcon = getIcon('LogOut');

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const { logout, user } = useContext(AuthContext);

  // Fetch task statistics
  const loadTaskStats = async () => {
    try {
      const stats = await getTaskStats();
      setStats(stats);
    } catch (error) {
      console.error('Failed to load task statistics', error);
      toast.error('Failed to load task statistics');
    }
  };

  useEffect(() => {
    loadTaskStats();
  }, []);

  const handleTaskChange = () => {
    // Refresh statistics when tasks change
    loadTaskStats();
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-secondary-dark text-white">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center">
                <ListTodoIcon className="mr-2 h-8 w-8" />
                TaskMaster
              </h1>
              <p className="mt-2 text-white/80 max-w-md">
                Organize your daily tasks efficiently
              </p>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-sm sm:text-base font-medium text-white/80">Total Tasks</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-sm sm:text-base font-medium text-white/80">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.completed}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-sm sm:text-base font-medium text-white/80">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.pending}</p>
                </div>
              </div>
              <button onClick={logout} className="bg-white/10 hover:bg-white/20 transition-colors rounded-full p-2" aria-label="Log out">
                <LogOutIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <TaskList onTaskChange={handleTaskChange} />
      </main>
    </div>
  );
}