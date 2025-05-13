import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import MainFeature from '../components/MainFeature';
import getIcon from '../utils/iconUtils';

// Icons
const CheckCircleIcon = getIcon('CheckCircle');
const ClockIcon = getIcon('Clock');
const LayoutDashboardIcon = getIcon('LayoutDashboard');
const ListTodoIcon = getIcon('ListTodo');

export default function Home() {
  const [tasks, setTasks] = useState(() => {
    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    // Calculate task statistics
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    setStats({
      total: tasks.length,
      completed: completedTasks,
      pending: tasks.length - completedTasks
    });
    
    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
    toast.success('Task added successfully!');
  };

  const updateTaskStatus = (id, status) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
    toast.info('Task status updated');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Task deleted successfully');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
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
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
                <p className="text-sm sm:text-base font-medium text-white/80">Total Tasks</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
                <p className="text-sm sm:text-base font-medium text-white/80">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.completed}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center col-span-2 sm:col-span-1">
                <p className="text-sm sm:text-base font-medium text-white/80">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-16">
              <MainFeature onAddTask={addTask} />
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
              
              <AnimatePresence>
                {tasks.length === 0 ? (
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
                              onClick={() => updateTaskStatus(
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
                            onClick={() => deleteTask(task.id)}
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
      </main>
    </div>
  );
}