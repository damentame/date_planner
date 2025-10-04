// Agent Integration for Task Tracker
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Notion API Constants
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_API_URL = 'https://api.notion.com/v1';

/**
 * Task Status Enum
 */
const TaskStatus = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked'
};

/**
 * Task Priority Enum
 */
const TaskPriority = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

/**
 * Configure Notion API headers
 * @returns {Object} Headers for Notion API requests
 */
const getNotionHeaders = () => {
  return {
    Authorization: `Bearer ${NOTION_API_KEY}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };
};

/**
 * Fetch all tasks from Notion database
 * @returns {Promise<Array>} Array of task objects
 */
const getAllTasks = async () => {
  try {
    const response = await axios.post(
      `${NOTION_API_URL}/databases/${NOTION_DATABASE_ID}/query`,
      {},
      { headers: getNotionHeaders() }
    );
    
    return response.data.results.map(parseNotionTask);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    throw error;
  }
};

/**
 * Get a specific task by ID
 * @param {string} taskId - Notion page ID for the task
 * @returns {Promise<Object>} Task object
 */
const getTask = async (taskId) => {
  try {
    const response = await axios.get(
      `${NOTION_API_URL}/pages/${taskId}`,
      { headers: getNotionHeaders() }
    );
    
    return parseNotionTask(response.data);
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error.message);
    throw error;
  }
};

/**
 * Parse Notion API response into a simplified task object
 * @param {Object} notionPage - Raw Notion page object
 * @returns {Object} Simplified task object
 */
const parseNotionTask = (notionPage) => {
  const properties = notionPage.properties;
  
  return {
    id: notionPage.id,
    title: properties.Name?.title[0]?.plain_text || 'Untitled Task',
    status: properties.Status?.select?.name || TaskStatus.TODO,
    priority: properties.Priority?.select?.name || TaskPriority.MEDIUM,
    dueDate: properties['Due Date']?.date?.start || null,
    description: properties.Description?.rich_text[0]?.plain_text || '',
    assignedTo: properties['Assigned To']?.people.map(p => p.name) || [],
    lastEdited: notionPage.last_edited_time
  };
};

/**
 * Create a new task in Notion
 * @param {Object} taskData - Task data object
 * @returns {Promise<Object>} Created task
 */
const createTask = async (taskData) => {
  try {
    const notionTaskData = {
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: taskData.title
              }
            }
          ]
        },
        Status: {
          select: {
            name: taskData.status || TaskStatus.TODO
          }
        }
      }
    };
    
    // Add optional properties if they exist
    if (taskData.priority) {
      notionTaskData.properties.Priority = {
        select: {
          name: taskData.priority
        }
      };
    }
    
    if (taskData.dueDate) {
      notionTaskData.properties['Due Date'] = {
        date: {
          start: taskData.dueDate
        }
      };
    }
    
    if (taskData.description) {
      notionTaskData.properties.Description = {
        rich_text: [
          {
            text: {
              content: taskData.description
            }
          }
        ]
      };
    }
    
    const response = await axios.post(
      `${NOTION_API_URL}/pages`,
      notionTaskData,
      { headers: getNotionHeaders() }
    );
    
    return parseNotionTask(response.data);
  } catch (error) {
    console.error('Error creating task:', error.message);
    throw error;
  }
};

/**
 * Update an existing task in Notion
 * @param {string} taskId - Notion page ID for the task
 * @param {Object} updates - Object containing properties to update
 * @returns {Promise<Object>} Updated task
 */
const updateTask = async (taskId, updates) => {
  try {
    const notionUpdates = {
      properties: {}
    };
    
    // Build properties object based on provided updates
    if (updates.title !== undefined) {
      notionUpdates.properties.Name = {
        title: [
          {
            text: {
              content: updates.title
            }
          }
        ]
      };
    }
    
    if (updates.status !== undefined) {
      notionUpdates.properties.Status = {
        select: {
          name: updates.status
        }
      };
    }
    
    if (updates.priority !== undefined) {
      notionUpdates.properties.Priority = {
        select: {
          name: updates.priority
        }
      };
    }
    
    if (updates.dueDate !== undefined) {
      notionUpdates.properties['Due Date'] = {
        date: updates.dueDate ? { start: updates.dueDate } : null
      };
    }
    
    if (updates.description !== undefined) {
      notionUpdates.properties.Description = {
        rich_text: [
          {
            text: {
              content: updates.description
            }
          }
        ]
      };
    }
    
    const response = await axios.patch(
      `${NOTION_API_URL}/pages/${taskId}`,
      notionUpdates,
      { headers: getNotionHeaders() }
    );
    
    return parseNotionTask(response.data);
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error.message);
    throw error;
  }
};

/**
 * Delete a task (archive it in Notion)
 * @param {string} taskId - Notion page ID for the task
 * @returns {Promise<void>}
 */
const deleteTask = async (taskId) => {
  try {
    await axios.delete(
      `${NOTION_API_URL}/blocks/${taskId}`,
      { headers: getNotionHeaders() }
    );
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error.message);
    throw error;
  }
};

/**
 * Get all tasks with a specific status
 * @param {string} status - Task status to filter by
 * @returns {Promise<Array>} Array of matching task objects
 */
const getTasksByStatus = async (status) => {
  const allTasks = await getAllTasks();
  return allTasks.filter(task => task.status === status);
};

/**
 * Mark a task as complete
 * @param {string} taskId - Notion page ID for the task
 * @returns {Promise<Object>} Updated task
 */
const markTaskComplete = async (taskId) => {
  return updateTask(taskId, { status: TaskStatus.COMPLETED });
};

/**
 * Mark a task as in progress
 * @param {string} taskId - Notion page ID for the task
 * @returns {Promise<Object>} Updated task
 */
const startTask = async (taskId) => {
  return updateTask(taskId, { status: TaskStatus.IN_PROGRESS });
};

module.exports = {
  TaskStatus,
  TaskPriority,
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksByStatus,
  markTaskComplete,
  startTask
};