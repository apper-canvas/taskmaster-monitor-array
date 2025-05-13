import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import MainFeature from './MainFeature';
import getIcon from '../utils/iconUtils';
import { fetchTasks, updateTaskStatus, deleteTask } from '../services/taskService';

// Icons
const CheckCircleIcon = getIcon('CheckCircle');
const ClockIcon = getIcon('Clock');
const LayoutDashboardIcon = getIcon('LayoutDashboard');
const ListTodoIcon = getIcon('ListTodo');
const SearchIcon = getIcon('Search');
const FilterIcon = getIcon('Filter');

export default function TaskList({ onTaskChange }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });

  // Fetch tasks from the backend
  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await fetchTasks(filters);
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateTaskStatus(id, status);
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, status } : task
      ));
      
      toast.info('Task status updated');
      
      // Notify parent component about the change
      if (onTaskChange) onTaskChange();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== id));
      
      toast.success('Task deleted successfully');
      
      // Notify parent component about the change
      if (onTaskChange) onTaskChange();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleAddTask = (newTask) => {
    // New task is added in MainFeature component and we'll refresh the task list
    loadTasks();
    
    // Notify parent component about the change
    if (onTaskChange) onTaskChange();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="sticky top-16">
          <MainFeature onAddTask={handleAddTask} />
        </div>
      </div>
      
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center">
              <LayoutDashboardIcon className="mr-2 h-6 w-6 text-primary" />
              Your Tasks
            </h2>
            <div className="text-sm text-surface-500 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {format(new Date(), 'MMMM dd, yyyy')}
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-surface-400" />
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search tasks..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <AnimatePresence>
            {loading ? (
              <div className="py-10 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                <p className="mt-2 text-surface-500">Loading tasks...</p>
              </div>
            ) : error ? (
              <div className="py-10 text-center text-red-500">
                <p>{error}</p>
                <button 
                  onClick={loadTasks}
                  className="mt-2 btn btn-secondary text-sm"
                >
                  Retry
                </button>
              </div>
            ) : tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-surface-500 dark:text-surface-400"
              >
                <ListTodoIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No tasks yet. Add your first task!</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`border rounded-lg p-4 ${
                      task.status === 'completed' 
                        ? 'bg-surface-100/50 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700'
                        : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => handleStatusChange(
                            task.id, 
                            task.status === 'completed' ? 'pending' : 'completed'
                          )}
                          className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full border ${
                            task.status === 'completed'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-surface-300 dark:border-surface-600'
                          }`}
                          aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {task.status === 'completed' && (
                            <CheckCircleIcon className="h-5 w-5" />
                          )}
                        </button>
                        
                        <div>
                          <h3 className={`font-medium text-base sm:text-lg ${
                            task.status === 'completed' ? 'line-through text-surface-500 dark:text-surface-400' : ''
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="mt-1 text-surface-600 dark:text-surface-400 text-sm">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {task.deadline && (
                              <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                {formatDate(task.deadline)}
                              </span>
                            )}
                            
                            {task.priority && (
                              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                                task.priority === 'high' ? 'task-priority-high' : 
                                task.priority === 'medium' ? 'task-priority-medium' : 
                                'task-priority-low'
                              }`}>
                                {task.priority} priority
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-surface-400 hover:text-red-500 transition-colors"
                        aria-label="Delete task"
                      >
                        <span className="text-xs sm:text-sm">Delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}