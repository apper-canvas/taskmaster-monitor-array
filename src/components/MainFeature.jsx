import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import getIcon from '../utils/iconUtils';

// Icons
const PlusIcon = getIcon('Plus');
const CalendarIcon = getIcon('Calendar');
const AlertCircleIcon = getIcon('AlertCircle');
const XIcon = getIcon('X');
const CheckIcon = getIcon('Check');
const ClockIcon = getIcon('Clock');
const ArrowUpCircleIcon = getIcon('ArrowUpCircle');
const ArrowRightCircleIcon = getIcon('ArrowRightCircle');
const ArrowDownCircleIcon = getIcon('ArrowDownCircle');

export default function MainFeature({ onAddTask }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline,
      priority: formData.priority,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    onAddTask(newTask);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium'
    });
    
    setIsExpanded(false);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ArrowUpCircleIcon className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <ArrowRightCircleIcon className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <ArrowDownCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ArrowRightCircleIcon className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="card overflow-hidden transition-all duration-300 border border-surface-200 dark:border-surface-700">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <PlusIcon className="w-5 h-5 mr-2 text-primary" />
            Add New Task
          </h2>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              h-8 w-8 rounded-full flex items-center justify-center
              ${isExpanded 
                ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-light'
              }
            `}
            aria-label={isExpanded ? "Close form" : "Expand form"}
          >
            {isExpanded ? <XIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-surface-600 dark:text-surface-400 text-sm">
                Click the plus button to add a new task with details like priority and deadline.
              </p>
              
              <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-lg p-3 flex-1">
                  <div className="rounded-full bg-primary/10 dark:bg-primary-dark/20 p-2 mr-3">
                    <ArrowUpCircleIcon className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">High Priority</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Urgent tasks</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-lg p-3 flex-1">
                  <div className="rounded-full bg-primary/10 dark:bg-primary-dark/20 p-2 mr-3">
                    <ClockIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Set Deadlines</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Never miss a due date</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {isExpanded && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleSubmit}
              className="space-y-4 pt-2"
            >
              <div>
                <label htmlFor="title" className="block mb-1 text-sm font-medium">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="What do you need to do?"
                  className={`input ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                  autoFocus
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block mb-1 text-sm font-medium">
                  Description <span className="text-surface-400">(optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add details about your task..."
                  rows="3"
                  className={`input resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  {formData.description.length}/500 characters
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="deadline" className="block mb-1 text-sm font-medium">
                    Deadline <span className="text-surface-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <CalendarIcon className="h-4 w-4 text-surface-400" />
                    </div>
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className="input pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block mb-1 text-sm font-medium">
                    Priority
                  </label>
                  <div className="flex space-x-2">
                    {['high', 'medium', 'low'].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority }))}
                        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center text-sm border transition-all
                          ${formData.priority === priority
                            ? 'bg-primary/10 border-primary dark:bg-primary-dark/20 dark:border-primary-light text-primary dark:text-primary-light'
                            : 'border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800'
                          }`}
                      >
                        {getPriorityIcon(priority)}
                        <span className="ml-2 capitalize">{priority}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3 border-t border-surface-200 dark:border-surface-700">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-primary flex items-center"
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Add Task
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        
        {/* Feature highlight section - only visible when form is not expanded */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700"
            >
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-lg p-4">
                <h3 className="font-medium text-base">TaskMaster Features</h3>
                <ul className="mt-2 space-y-2 text-sm text-surface-600 dark:text-surface-400">
                  <li className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Simple task creation with priorities
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Track task completion status
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Set deadlines to stay on track
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}