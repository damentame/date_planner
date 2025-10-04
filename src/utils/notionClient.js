import axios from 'axios';

// Notion API wrapper for the Date Planner application
// This client connects to our local agent_integration API server
// which interacts with the Notion API

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Task status constants
export const TaskStatus = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked'
};

// Task priority constants
export const TaskPriority = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

/**
 * Get all tasks from the Notion database
 * @returns {Promise<Array>} Array of tasks
 */
export const getAllTasks = async () => {
  try {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Get tasks with a specific status
 * @param {string} status - Task status to filter by
 * @returns {Promise<Array>} Array of filtered tasks
 */
export const getTasksByStatus = async (status) => {
  try {
    const response = await axios.get(`${API_URL}/tasks`, {
      params: { status }
    });
    return response.data.tasks;
  } catch (error) {
    console.error(`Error fetching ${status} tasks:`, error);
    throw error;
  }
};

/**
 * Get a specific task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task object
 */
export const getTask = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`);
    return response.data.task;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, taskData);
    return response.data.task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update a task
 * @param {string} taskId - Task ID
 * @param {Object} updates - Task updates
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (taskId, updates) => {
  try {
    const response = await axios.patch(`${API_URL}/tasks/${taskId}`, updates);
    return response.data.task;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Mark a task as complete
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Updated task
 */
export const completeTask = async (taskId) => {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/complete`);
    return response.data.task;
  } catch (error) {
    console.error(`Error completing task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Start working on a task
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Updated task
 */
export const startTask = async (taskId) => {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/start`);
    return response.data.task;
  } catch (error) {
    console.error(`Error starting task ${taskId}:`, error);
    throw error;
  }
};

export default {
  getAllTasks,
  getTasksByStatus,
  getTask,
  createTask,
  updateTask,
  completeTask,
  startTask,
  TaskStatus,
  TaskPriority
};