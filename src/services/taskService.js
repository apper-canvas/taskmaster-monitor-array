/**
 * Task service that handles all task-related operations with the Apper backend
 */

// Initialize ApperClient with our environment variables
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

// Table name from the provided JSON
const TABLE_NAME = 'task4';

// Fetch all tasks with optional filtering
export const fetchTasks = async (filters = {}) => {
  try {
    const { status, priority, search } = filters;
    
    // Build the where conditions based on filters
    const whereConditions = [];
    
    // Add status filter if provided
    if (status) {
      whereConditions.push({
        fieldName: 'status',
        operator: 'ExactMatch',
        values: [status]
      });
    }
    
    // Add priority filter if provided
    if (priority) {
      whereConditions.push({
        fieldName: 'priority',
        operator: 'ExactMatch',
        values: [priority]
      });
    }
    
    // Add search filter if provided
    if (search && search.trim()) {
      whereConditions.push({
        fieldName: 'title',
        operator: 'Contains',
        values: [search.trim()]
      });
    }
    
    // Basic params to fetch task records
    const params = {
      Fields: [
        { Field: { Name: 'Id' } },
        { Field: { Name: 'title' } },
        { Field: { Name: 'description' } },
        { Field: { Name: 'deadline' } },
        { Field: { Name: 'priority' } },
        { Field: { Name: 'status' } },
        { Field: { Name: 'CreatedOn' } }
      ],
      orderBy: [
        { field: 'CreatedOn', direction: 'DESC' }
      ],
      where: whereConditions,
      pagingInfo: {
        limit: 100, // Reasonable limit for tasks
        offset: 0
      }
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response || !response.data) {
      return [];
    }
    
    // Transform the response to match our application's expected format
    return response.data.map(task => ({
      id: task.Id.toString(),
      title: task.title || 'Untitled Task',
      description: task.description || '',
      deadline: task.deadline || '',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      createdAt: task.CreatedOn
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    // Prepare task record with the Apper data structure
    const record = {
      title: taskData.title,
      description: taskData.description || '',
      deadline: taskData.deadline || null,
      priority: taskData.priority || 'medium',
      status: 'pending'
    };
    
    const params = {
      records: [record]
    };
    
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error('Failed to create task');
    }
    
    // Return the created task with the ID assigned by Apper
    const createdTask = response.results[0].data;
    return {
      id: createdTask.Id.toString(),
      title: createdTask.title,
      description: createdTask.description || '',
      deadline: createdTask.deadline || '',
      priority: createdTask.priority,
      status: createdTask.status,
      createdAt: createdTask.CreatedOn
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update a task's status
export const updateTaskStatus = async (taskId, status) => {
  try {
    const params = {
      records: [
        {
          Id: parseInt(taskId),
          status: status
        }
      ]
    };
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error('Failed to update task status');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const params = {
      RecordIds: [parseInt(taskId)]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error('Failed to delete task');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get task statistics
export const getTaskStats = async () => {
  try {
    const tasks = await fetchTasks();
    
    // Calculate statistics
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = total - completed;
    
    return {
      total,
      completed,
      pending
    };
  } catch (error) {
    console.error('Error getting task statistics:', error);
    return {
      total: 0,
      completed: 0,
      pending: 0
    };
  }
};