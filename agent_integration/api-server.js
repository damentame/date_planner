/**
 * API Server for Date Planner Task Tracker
 * 
 * This server provides a REST API for the Date Planner Task Tracker,
 * allowing other agents to interact with the Notion database without
 * directly using the task tracker library.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load task tracker functions
const {
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
} = require('./index');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Routes

// Get all tasks
app.get('/api/tasks', async (req, res, next) => {
  try {
    const { status } = req.query;
    let tasks;
    
    if (status) {
      tasks = await getTasksByStatus(status);
    } else {
      tasks = await getAllTasks();
    }
    
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

// Get a specific task by ID
app.get('/api/tasks/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await getTask(taskId);
    
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

// Create a new task
app.post('/api/tasks', async (req, res, next) => {
  try {
    const taskData = req.body;
    const task = await createTask(taskData);
    
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
});

// Update a task
app.patch('/api/tasks/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    const task = await updateTask(taskId, updates);
    
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

// Delete a task
app.delete('/api/tasks/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    await deleteTask(taskId);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Mark a task as complete
app.post('/api/tasks/:taskId/complete', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await markTaskComplete(taskId);
    
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

// Start working on a task
app.post('/api/tasks/:taskId/start', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await startTask(taskId);
    
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

// Get task statuses (enum values)
app.get('/api/statuses', (req, res) => {
  res.json({
    statuses: Object.values(TaskStatus)
  });
});

// Get task priorities (enum values)
app.get('/api/priorities', (req, res) => {
  res.json({
    priorities: Object.values(TaskPriority)
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Task Tracker API server listening at http://localhost:${port}`);
  });
}

module.exports = app;