# 🤖 Notion Task Manager - Cursor Agent Toolbelt

A comprehensive Notion integration designed specifically for Cursor agents to manage tasks, track progress, and request functionality extensions.

## 🎯 Overview

This toolbelt provides Cursor agents with powerful task management capabilities through Notion, including:
- ✅ Create, update, and manage tasks
- ✅ Search and filter tasks
- ✅ Assign tasks to team members
- ✅ Update and append notes
- ✅ Request functionality extensions from Dumi
- ✅ Multiple access methods (CLI, API, Direct Import)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Notion API key
- Notion database with specific properties

### Installation
```bash
cd agent_integrations/notion-task-manager
npm install
```

### Environment Setup
Create a `.env` file:
```env
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_database_id_here
```

## 📋 Database Schema Required

Your Notion database must have these properties:
- **Task** (Title) - The main task name
- **Assigned To** (People) - Who the task is assigned to
- **Status** (Status) - Task status (To-do, In Progress, Done, etc.)
- **Notes** (Rich Text) - Additional notes and context
- **ID** (Number) - Auto-incrementing ID

## 🛠️ Available Functions

### Core Task Management

#### `createTask(title, assignedTo, notes)`
Creates a new task in Notion.
```javascript
const taskId = await createTask(
  "Fix critical bug in payment system",
  "Dumi", 
  "This bug is causing payment failures"
);
```

#### `getAllTasks(filters)`
Retrieves all tasks with optional filtering.
```javascript
// Get all tasks
const allTasks = await getAllTasks();

// Get filtered tasks
const todoTasks = await getAllTasks({
  status: "To-do",
  assignedTo: "Dumi",
  sortBy: "ID",
  sortDirection: "descending"
});
```

**Filter Options:**
- `status` - Filter by task status
- `assignedTo` - Filter by assigned person
- `titleContains` - Filter by title containing text
- `minId` / `maxId` - Filter by ID range
- `sortBy` - Sort by property (ID, Task, Status, etc.)
- `sortDirection` - "ascending" or "descending"

#### `searchTasks(searchTerm, searchIn)`
Searches tasks by title or notes.
```javascript
const bugTasks = await searchTasks("bug", "title");
const contextTasks = await searchTasks("payment", "notes");
```

#### `updateTask(pageId, status, notes)`
Updates task status and notes.
```javascript
await updateTask(taskId, "In Progress", "Started working on this");
```

### Notes Management

#### `updateTaskNotes(pageId, notes)`
Replaces task notes completely.
```javascript
await updateTaskNotes(taskId, "New notes here");
```

#### `appendTaskNotes(pageId, additionalNotes)`
Adds to existing task notes.
```javascript
await appendTaskNotes(taskId, "Additional context added");
```

### People Management

#### `getWorkspacePeople()`
Gets all people in the Notion workspace.
```javascript
const people = await getWorkspacePeople();
// Returns: [{ id, name, email, type }, ...]
```

#### `assignTask(pageId, peopleIds)`
Assigns task to specific people by ID.
```javascript
await assignTask(taskId, ["person-id-1", "person-id-2"]);
```

#### `assignTaskByName(pageId, personName)`
Assigns task to person by name (searches first).
```javascript
await assignTaskByName(taskId, "Dumi");
```

### Agent Request System

#### `agentRequest(requestType, description, requirements, priority, context)`
Creates a request for functionality extensions and assigns it to Dumi.

```javascript
const result = await agentRequest(
  "New Feature",
  "Add email notifications",
  "Need to send emails when tasks are completed",
  "High",
  { 
    currentTask: "Payment system integration",
    deadline: "2024-01-15",
    impact: "Critical for user experience"
  }
);
```

**Request Types:**
- `New Feature` - Request new functionality
- `Bug Fix` - Report and request bug fixes
- `Enhancement` - Improve existing features
- `Integration` - Add new integrations
- `Documentation` - Request documentation
- `Configuration` - Configuration changes
- `Troubleshooting` - Help with issues
- `Other` - Other requests

**Priority Levels:**
- `Low` - Nice to have
- `Medium` - Standard priority (default)
- `High` - Important
- `Critical` - Urgent

## 🎮 Usage Methods

### Method 1: Direct Import (Recommended)
```javascript
import { createTask, getAllTasks, agentRequest } from './agent_integrations/notion-task-manager/index.js';

// Use functions directly
const taskId = await createTask("Agent Task", "Dumi", "Created by agent");
```

### Method 2: CLI Commands
```bash
# Create task
node cli.js create-task "Fix bug" "Dumi" "Critical issue"

# Get all tasks
node cli.js get-tasks

# Search tasks
node cli.js search-tasks "bug" "title"

# Create agent request
node cli.js agent-request "New Feature" "Add email notifications" "Need to send emails when tasks are completed" "High"

# Get help
node cli.js help
```

### Method 3: HTTP API
```bash
# Start API server
npm run api

# Create task via API
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Agent Task", "assignedTo": "Dumi", "notes": "Created by agent"}'

# Create agent request via API
curl -X POST http://localhost:3001/api/agent-request \
  -H "Content-Type: application/json" \
  -d '{"requestType": "New Feature", "description": "Add email notifications", "requirements": "Need to send emails when tasks are completed", "priority": "High"}'
```

## 🤖 Cursor Agent Workflow Examples

### Example 1: Task Creation and Assignment
```javascript
import { createTask, assignTaskByName, updateTaskNotes } from './index.js';

async function handleUserRequest(userRequest) {
  // Create task
  const taskId = await createTask(
    `User Request: ${userRequest.title}`,
    "Agent",
    `Original request: ${userRequest.description}`
  );
  
  // Assign to appropriate person
  await assignTaskByName(taskId, "Dumi");
  
  // Add context
  await updateTaskNotes(taskId, `Priority: ${userRequest.priority}\nDeadline: ${userRequest.deadline}`);
  
  return taskId;
}
```

### Example 2: Task Monitoring and Updates
```javascript
import { getAllTasks, searchTasks, updateTask, appendTaskNotes } from './index.js';

async function monitorTasks() {
  // Get all active tasks
  const activeTasks = await getAllTasks({ status: "In Progress" });
  
  // Search for specific tasks
  const bugTasks = await searchTasks("bug", "title");
  
  // Update task progress
  for (const task of activeTasks) {
    await appendTaskNotes(task.id, `Agent checked at ${new Date().toISOString()}`);
  }
  
  return { activeTasks, bugTasks };
}
```

### Example 3: Agent Request for Missing Functionality
```javascript
import { agentRequest, getAllTasks } from './index.js';

async function checkAndRequestFunctionality() {
  // Check if we have the tools we need
  const tasks = await getAllTasks();
  
  // If we need functionality that doesn't exist
  if (tasks.length > 100 && !hasBulkOperations) {
    await agentRequest(
      "New Feature",
      "Bulk task operations",
      "Need to update multiple tasks at once, delete tasks in bulk, and export task data",
      "High",
      {
        currentTaskCount: tasks.length,
        useCase: "Managing large task lists",
        suggestedFeatures: ["bulk update", "bulk delete", "export to CSV"]
      }
    );
  }
}
```

## 📊 Task Data Structure

Each task returned by the functions has this structure:
```javascript
{
  id: "page-id",                    // Notion page ID
  taskId: 123,                      // Auto-incremented ID
  title: "Task Title",              // Task name
  status: "To-do",                  // Current status
  assignedTo: [                     // Assigned people
    { 
      id: "user-id", 
      name: "User Name" 
    }
  ],
  notes: "Task notes",              // Rich text notes
  createdTime: "2024-01-01T00:00:00.000Z",
  lastEditedTime: "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Configuration

### Environment Variables
- `NOTION_API_KEY` - Your Notion integration API key
- `NOTION_DATABASE_ID` - The ID of your Notion database
- `PORT` - API server port (default: 3001)

### Package Scripts
- `npm start` - Run the demo
- `npm run cli` - Run CLI interface
- `npm run api` - Start API server

## 🚨 Error Handling

All functions return structured responses:
```javascript
// Success
{ success: true, taskId: "abc123", message: "Task created" }

// Error
{ success: false, error: "Error message" }
```

## 📚 Best Practices for Cursor Agents

1. **Always check for existing functionality** before requesting new features
2. **Use descriptive task titles** that clearly indicate the purpose
3. **Provide detailed requirements** in agent requests
4. **Update task notes** as work progresses
5. **Use appropriate priority levels** for agent requests
6. **Include context information** when making requests

## 🆘 Troubleshooting

### Common Issues

**"Assigned To is expected to be people"**
- Ensure your Notion database has "Assigned To" as a People property

**"Status is expected to be status"**
- Ensure your Notion database has "Status" as a Status property

**"Module not found" errors**
- Run `npm install` to install dependencies
- Check that you're using the correct import paths

**API connection issues**
- Verify your `NOTION_API_KEY` is correct
- Check that your `NOTION_DATABASE_ID` is valid
- Ensure your Notion integration has access to the database

### Getting Help

1. Check the console output for detailed error messages
2. Verify your Notion database schema matches requirements
3. Test with the CLI first: `node cli.js help`
4. Use the agent request system to ask Dumi for help

## 🔄 Updates and Maintenance

This toolbelt is designed to be self-maintaining through the agent request system. When you need new functionality:

1. Use `agentRequest()` to describe what you need
2. Dumi will review and implement the requested features
3. Updated functions will be available immediately

## 📄 License

This project is part of the DatePlanner system and follows the same licensing terms.

---

**Happy task managing! 🤖✨**

For questions or issues, use the agent request system or check the troubleshooting section above.