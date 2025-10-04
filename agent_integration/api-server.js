import express from 'express';
import cors from 'cors';
import { 
  createTask, 
  updateTask, 
  getAllTasks, 
  searchTasks, 
  updateTaskNotes, 
  appendTaskNotes, 
  getWorkspacePeople, 
  assignTask, 
  assignTaskByName,
  agentRequest
} from './index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes for Cursor Agents

// Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, assignedTo = "Agent", notes = "" } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const taskId = await createTask(title, assignedTo, notes);
    
    if (taskId) {
      res.json({ success: true, taskId, message: 'Task created successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create task' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all tasks with optional filtering
app.get('/api/tasks', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      assignedTo: req.query.assignedTo,
      titleContains: req.query.titleContains,
      minId: req.query.minId ? parseInt(req.query.minId) : undefined,
      maxId: req.query.maxId ? parseInt(req.query.maxId) : undefined,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const tasks = await getAllTasks(filters);
    res.json({ success: true, tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search tasks
app.get('/api/tasks/search', async (req, res) => {
  try {
    const { q: searchTerm, in: searchIn = "title" } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const tasks = await searchTasks(searchTerm, searchIn);
    res.json({ success: true, tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update task
app.put('/api/tasks/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { status, notes } = req.body;

    await updateTask(pageId, status, notes);
    res.json({ success: true, message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update task notes
app.put('/api/tasks/:pageId/notes', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    const success = await updateTaskNotes(pageId, notes);
    
    if (success) {
      res.json({ success: true, message: 'Notes updated successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update notes' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Append to task notes
app.post('/api/tasks/:pageId/notes', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    const success = await appendTaskNotes(pageId, notes);
    
    if (success) {
      res.json({ success: true, message: 'Notes appended successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to append notes' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get workspace people
app.get('/api/people', async (req, res) => {
  try {
    const people = await getWorkspacePeople();
    res.json({ success: true, people, count: people.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Assign task to people by ID
app.post('/api/tasks/:pageId/assign', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { peopleIds } = req.body;

    if (!peopleIds || !Array.isArray(peopleIds) || peopleIds.length === 0) {
      return res.status(400).json({ error: 'peopleIds array is required' });
    }

    const success = await assignTask(pageId, peopleIds);
    
    if (success) {
      res.json({ success: true, message: 'Task assigned successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to assign task' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Assign task by person name
app.post('/api/tasks/:pageId/assign-by-name', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { personName } = req.body;

    if (!personName) {
      return res.status(400).json({ error: 'personName is required' });
    }

    const success = await assignTaskByName(pageId, personName);
    
    if (success) {
      res.json({ success: true, message: `Task assigned to ${personName} successfully` });
    } else {
      res.status(500).json({ success: false, error: `Failed to assign task to ${personName}` });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Agent request endpoint
app.post('/api/agent-request', async (req, res) => {
  try {
    const { requestType, description, requirements = "", priority = "Medium", context = {} } = req.body;

    if (!requestType || !description) {
      return res.status(400).json({ error: 'requestType and description are required' });
    }

    const result = await agentRequest(requestType, description, requirements, priority, context);
    
    if (result.success) {
      res.json({
        success: true,
        taskId: result.taskId,
        assigned: result.assigned,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Notion Task Manager API is running' });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Notion Task Manager API',
    version: '1.0.0',
    endpoints: {
      'POST /api/tasks': 'Create a new task',
      'GET /api/tasks': 'Get all tasks with optional filtering',
      'GET /api/tasks/search': 'Search tasks by title or notes',
      'PUT /api/tasks/:pageId': 'Update task status and notes',
      'PUT /api/tasks/:pageId/notes': 'Update task notes',
      'POST /api/tasks/:pageId/notes': 'Append to task notes',
      'GET /api/people': 'Get workspace people',
      'POST /api/tasks/:pageId/assign': 'Assign task by people IDs',
      'POST /api/tasks/:pageId/assign-by-name': 'Assign task by person name',
      'POST /api/agent-request': 'Create agent request for functionality extensions',
      'GET /api/health': 'Health check'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notion Task Manager API running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
