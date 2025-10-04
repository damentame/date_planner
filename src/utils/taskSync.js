import { getAllTasks, getTasksByStatus, TaskStatus, updateTask, startTask, completeTask } from './notionClient';

/**
 * Task synchronization module for Date Planner
 * This module handles synchronizing tasks between the Date Planner app and Notion
 */

/**
 * Fetch all tasks from Notion
 * @returns {Promise<Array>} Array of tasks
 */
export const syncAllTasks = async () => {
  try {
    const tasks = await getAllTasks();
    console.log(`Synced ${tasks.length} tasks from Notion`);
    return tasks;
  } catch (error) {
    console.error('Error syncing tasks:', error);
    throw error;
  }
};

/**
 * Fetch tasks by status from Notion
 * @param {string} status - Task status to filter by
 * @returns {Promise<Array>} Array of filtered tasks
 */
export const syncTasksByStatus = async (status) => {
  try {
    const tasks = await getTasksByStatus(status);
    console.log(`Synced ${tasks.length} ${status} tasks from Notion`);
    return tasks;
  } catch (error) {
    console.error(`Error syncing ${status} tasks:`, error);
    throw error;
  }
};

/**
 * Update task implementation status
 * @param {string} taskId - Task ID
 * @param {string} status - New status
 * @param {Object} additionalUpdates - Additional properties to update
 * @returns {Promise<Object>} Updated task
 */
export const updateImplementationStatus = async (taskId, status, additionalUpdates = {}) => {
  try {
    let updatedTask;
    
    // Use the appropriate API method based on the status
    if (status === TaskStatus.IN_PROGRESS) {
      updatedTask = await startTask(taskId);
    } else if (status === TaskStatus.COMPLETED) {
      updatedTask = await completeTask(taskId);
    } else {
      updatedTask = await updateTask(taskId, { status, ...additionalUpdates });
    }
    
    console.log(`Updated task ${taskId} status to ${status}`);
    return updatedTask;
  } catch (error) {
    console.error(`Error updating task ${taskId} status:`, error);
    throw error;
  }
};

/**
 * Add implementation notes to a task
 * @param {string} taskId - Task ID
 * @param {string} note - Note to add
 * @returns {Promise<Object>} Updated task
 */
export const addImplementationNote = async (taskId, note) => {
  try {
    // First get the current task to preserve existing description
    const tasks = await getAllTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    const currentDescription = task.description || '';
    const timestamp = new Date().toISOString();
    const formattedNote = `\n\n--- Implementation Note (${timestamp}) ---\n${note}`;
    
    const updatedTask = await updateTask(taskId, {
      description: currentDescription + formattedNote
    });
    
    console.log(`Added implementation note to task ${taskId}`);
    return updatedTask;
  } catch (error) {
    console.error(`Error adding note to task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Mark a feature as implemented
 * @param {string} taskId - Task ID
 * @param {string} implementationDetails - Details about the implementation
 * @returns {Promise<Object>} Updated task
 */
export const markFeatureImplemented = async (taskId, implementationDetails) => {
  try {
    // Add implementation details
    await addImplementationNote(taskId, implementationDetails);
    
    // Mark as completed
    const updatedTask = await completeTask(taskId);
    
    console.log(`Marked task ${taskId} as implemented`);
    return updatedTask;
  } catch (error) {
    console.error(`Error marking task ${taskId} as implemented:`, error);
    throw error;
  }
};

export default {
  syncAllTasks,
  syncTasksByStatus,
  updateImplementationStatus,
  addImplementationNote,
  markFeatureImplemented
};