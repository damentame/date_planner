# 🤖 Cursor Agent Toolbelt Guide

This guide provides Cursor agents with everything they need to effectively use the Notion Task Manager integration as a comprehensive toolbelt.

## 🎯 Quick Reference

### Essential Commands
```bash
# Create a task
node cli.js create-task "Task Title" "AssignedTo" "Notes"

# Get all tasks
node cli.js get-tasks

# Search tasks
node cli.js search-tasks "search term" "title"

# Create agent request
node cli.js agent-request "Request Type" "Description" "Requirements" "Priority"

# Get help
node cli.js help
```

### Essential Functions (Direct Import)
```javascript
import { createTask, getAllTasks, searchTasks, agentRequest } from './index.js';

// Create task
const taskId = await createTask("Title", "AssignedTo", "Notes");

// Get tasks with filters
const tasks = await getAllTasks({ status: "To-do" });

// Search tasks
const results = await searchTasks("bug", "title");

// Request functionality
const request = await agentRequest("New Feature", "Description", "Requirements", "High");
```

## 🛠️ Function Reference

### 1. Task Creation & Management

#### `createTask(title, assignedTo, notes)`
**Purpose:** Create a new task in Notion
**Parameters:**
- `title` (string) - Task title
- `assignedTo` (string) - Person to assign to (default: "Agent")
- `notes` (string) - Initial notes (default: "")

**Returns:** Task ID (string) or null if failed

**Examples:**
```javascript
// Basic task creation
const taskId = await createTask("Fix login bug", "Dumi", "Users cannot log in");

// Agent-created task
const taskId = await createTask("Agent discovered issue", "Agent", "Found during code review");
```

#### `getAllTasks(filters)`
**Purpose:** Retrieve tasks with optional filtering
**Parameters:**
- `filters` (object) - Optional filter object

**Filter Options:**
```javascript
{
  status: "To-do",           // Filter by status
  assignedTo: "Dumi",        // Filter by assigned person
  titleContains: "bug",      // Filter by title containing text
  minId: 10,                 // Minimum ID number
  maxId: 50,                 // Maximum ID number
  sortBy: "ID",              // Sort by property
  sortDirection: "descending" // Sort direction
}
```

**Returns:** Array of task objects

**Examples:**
```javascript
// Get all tasks
const allTasks = await getAllTasks();

// Get high-priority tasks
const urgentTasks = await getAllTasks({
  status: "To-do",
  sortBy: "ID",
  sortDirection: "descending"
});

// Get tasks assigned to specific person
const dumiTasks = await getAllTasks({ assignedTo: "Dumi" });
```

#### `searchTasks(searchTerm, searchIn)`
**Purpose:** Search tasks by title or notes
**Parameters:**
- `searchTerm` (string) - Text to search for
- `searchIn` (string) - Where to search: "title" or "notes" (default: "title")

**Returns:** Array of matching task objects

**Examples:**
```javascript
// Search by title
const bugTasks = await searchTasks("bug", "title");

// Search by notes
const contextTasks = await searchTasks("payment", "notes");
```

#### `updateTask(pageId, status, notes)`
**Purpose:** Update task status and notes
**Parameters:**
- `pageId` (string) - Notion page ID
- `status` (string) - New status
- `notes` (string) - New notes (optional)

**Returns:** void

**Examples:**
```javascript
// Update status only
await updateTask(taskId, "In Progress");

// Update status and notes
await updateTask(taskId, "Done", "Task completed successfully");
```

### 2. Notes Management

#### `updateTaskNotes(pageId, notes)`
**Purpose:** Replace task notes completely
**Parameters:**
- `pageId` (string) - Notion page ID
- `notes` (string) - New notes content

**Returns:** boolean (success/failure)

**Examples:**
```javascript
// Replace notes
await updateTaskNotes(taskId, "New notes content");

// Clear notes
await updateTaskNotes(taskId, "");
```

#### `appendTaskNotes(pageId, additionalNotes)`
**Purpose:** Add to existing task notes
**Parameters:**
- `pageId` (string) - Notion page ID
- `additionalNotes` (string) - Notes to append

**Returns:** boolean (success/failure)

**Examples:**
```javascript
// Add progress update
await appendTaskNotes(taskId, "Progress: 50% complete");

// Add context
await appendTaskNotes(taskId, "Additional context: Found related issue in payment module");
```

### 3. People Management

#### `getWorkspacePeople()`
**Purpose:** Get all people in the Notion workspace
**Returns:** Array of people objects

**People Object Structure:**
```javascript
{
  id: "user-id",
  name: "User Name",
  email: "user@example.com",
  type: "person"
}
```

**Examples:**
```javascript
// Get all people
const people = await getWorkspacePeople();

// Find specific person
const dumi = people.find(p => p.name.includes("Dumi"));
```

#### `assignTask(pageId, peopleIds)`
**Purpose:** Assign task to specific people by ID
**Parameters:**
- `pageId` (string) - Notion page ID
- `peopleIds` (array) - Array of person IDs

**Returns:** boolean (success/failure)

**Examples:**
```javascript
// Assign to single person
await assignTask(taskId, ["person-id-1"]);

// Assign to multiple people
await assignTask(taskId, ["person-id-1", "person-id-2"]);
```

#### `assignTaskByName(pageId, personName)`
**Purpose:** Assign task to person by name (searches first)
**Parameters:**
- `pageId` (string) - Notion page ID
- `personName` (string) - Person's name (partial match)

**Returns:** boolean (success/failure)

**Examples:**
```javascript
// Assign by name
await assignTaskByName(taskId, "Dumi");

// Assign by partial name
await assignTaskByName(taskId, "Dumi Khumalo");
```

### 4. Agent Request System

#### `agentRequest(requestType, description, requirements, priority, context)`
**Purpose:** Create a request for functionality extensions and assign it to Dumi

**Parameters:**
- `requestType` (string) - Type of request (see valid types below)
- `description` (string) - Brief description of what's needed
- `requirements` (string) - Detailed requirements (optional)
- `priority` (string) - Priority level (optional, default: "Medium")
- `context` (object) - Additional context (optional)

**Valid Request Types:**
- `"New Feature"` - Request new functionality
- `"Bug Fix"` - Report and request bug fixes
- `"Enhancement"` - Improve existing features
- `"Integration"` - Add new integrations
- `"Documentation"` - Request documentation
- `"Configuration"` - Configuration changes
- `"Troubleshooting"` - Help with issues
- `"Other"` - Other requests

**Priority Levels:**
- `"Low"` - Nice to have
- `"Medium"` - Standard priority (default)
- `"High"` - Important
- `"Critical"` - Urgent

**Returns:** Object with success status and details

**Examples:**
```javascript
// Basic feature request
const result = await agentRequest(
  "New Feature",
  "Add email notifications",
  "Need to send emails when tasks are completed"
);

// Detailed request with context
const result = await agentRequest(
  "Bug Fix",
  "Fix authentication error",
  "Users cannot log in after recent update",
  "Critical",
  {
    currentTask: "Payment system integration",
    deadline: "2024-01-15",
    impact: "Blocks all user access",
    stepsToReproduce: "1. Try to log in 2. Get error 500"
  }
);
```

## 🎮 Common Agent Workflows

### Workflow 1: Handle User Request
```javascript
import { createTask, assignTaskByName, updateTaskNotes } from './index.js';

async function handleUserRequest(userRequest) {
  try {
    // Create task from user request
    const taskId = await createTask(
      `User Request: ${userRequest.title}`,
      "Agent",
      `Original request: ${userRequest.description}`
    );
    
    if (!taskId) {
      throw new Error("Failed to create task");
    }
    
    // Assign to appropriate person
    const assigned = await assignTaskByName(taskId, "Dumi");
    
    // Add context and priority
    await updateTaskNotes(taskId, 
      `Priority: ${userRequest.priority}\n` +
      `Deadline: ${userRequest.deadline}\n` +
      `Category: ${userRequest.category}`
    );
    
    console.log(`✅ Task created and assigned: ${taskId}`);
    return { success: true, taskId };
    
  } catch (error) {
    console.error(`❌ Failed to handle user request: ${error.message}`);
    return { success: false, error: error.message };
  }
}
```

### Workflow 2: Monitor and Update Tasks
```javascript
import { getAllTasks, searchTasks, updateTask, appendTaskNotes } from './index.js';

async function monitorTasks() {
  try {
    // Get all active tasks
    const activeTasks = await getAllTasks({ status: "In Progress" });
    
    // Search for specific tasks
    const bugTasks = await searchTasks("bug", "title");
    const urgentTasks = await searchTasks("urgent", "title");
    
    // Update task progress
    for (const task of activeTasks) {
      await appendTaskNotes(task.id, 
        `🤖 Agent checked at ${new Date().toISOString()}\n` +
        `Status: Monitoring in progress`
      );
    }
    
    return {
      activeTasks: activeTasks.length,
      bugTasks: bugTasks.length,
      urgentTasks: urgentTasks.length,
      lastChecked: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Failed to monitor tasks: ${error.message}`);
    return { error: error.message };
  }
}
```

### Workflow 3: Request Missing Functionality
```javascript
import { agentRequest, getAllTasks, searchTasks } from './index.js';

async function checkAndRequestFunctionality() {
  try {
    // Check current capabilities
    const allTasks = await getAllTasks();
    const bugTasks = await searchTasks("bug", "title");
    
    // Analyze what we need
    const needs = [];
    
    if (allTasks.length > 100) {
      needs.push("bulk operations for large task lists");
    }
    
    if (bugTasks.length > 10) {
      needs.push("bug tracking and categorization");
    }
    
    // Request functionality if needed
    if (needs.length > 0) {
      const result = await agentRequest(
        "New Feature",
        "Enhanced task management capabilities",
        `Need: ${needs.join(", ")}`,
        "High",
        {
          currentTaskCount: allTasks.length,
          bugCount: bugTasks.length,
          useCase: "Managing large-scale task operations",
          suggestedFeatures: needs
        }
      );
      
      if (result.success) {
        console.log(`✅ Functionality request created: ${result.taskId}`);
      }
    }
    
    return { needs, requested: needs.length > 0 };
    
  } catch (error) {
    console.error(`❌ Failed to check functionality: ${error.message}`);
    return { error: error.message };
  }
}
```

### Workflow 4: Task Analysis and Reporting
```javascript
import { getAllTasks, searchTasks, getWorkspacePeople } from './index.js';

async function generateTaskReport() {
  try {
    // Gather data
    const allTasks = await getAllTasks();
    const people = await getWorkspacePeople();
    
    // Analyze tasks
    const analysis = {
      total: allTasks.length,
      byStatus: {},
      byAssignee: {},
      byPriority: {},
      recentTasks: [],
      overdueTasks: []
    };
    
    // Group by status
    allTasks.forEach(task => {
      analysis.byStatus[task.status] = (analysis.byStatus[task.status] || 0) + 1;
    });
    
    // Group by assignee
    allTasks.forEach(task => {
      const assignee = task.assignedTo.map(p => p.name).join(', ') || 'Unassigned';
      analysis.byAssignee[assignee] = (analysis.byAssignee[assignee] || 0) + 1;
    });
    
    // Find recent tasks (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    analysis.recentTasks = allTasks.filter(task => 
      new Date(task.createdTime) > oneDayAgo
    );
    
    return analysis;
    
  } catch (error) {
    console.error(`❌ Failed to generate report: ${error.message}`);
    return { error: error.message };
  }
}
```

## 🚨 Error Handling Best Practices

### Always Check Return Values
```javascript
// ❌ Bad - doesn't check if task was created
await createTask("Task", "Dumi", "Notes");

// ✅ Good - checks return value
const taskId = await createTask("Task", "Dumi", "Notes");
if (!taskId) {
  console.error("Failed to create task");
  return;
}
```

### Handle API Errors Gracefully
```javascript
async function safeTaskCreation(title, assignedTo, notes) {
  try {
    const taskId = await createTask(title, assignedTo, notes);
    
    if (taskId) {
      console.log(`✅ Task created: ${taskId}`);
      return { success: true, taskId };
    } else {
      console.error("❌ Task creation failed");
      return { success: false, error: "Task creation failed" };
    }
    
  } catch (error) {
    console.error(`❌ Error creating task: ${error.message}`);
    return { success: false, error: error.message };
  }
}
```

### Use Agent Requests for Missing Functionality
```javascript
async function handleMissingFunctionality(requiredFunction, context) {
  const result = await agentRequest(
    "New Feature",
    `Need ${requiredFunction} functionality`,
    `Required for: ${context.reason}`,
    context.priority || "Medium",
    context
  );
  
  if (result.success) {
    console.log(`✅ Requested ${requiredFunction}: ${result.taskId}`);
  } else {
    console.error(`❌ Failed to request ${requiredFunction}: ${result.message}`);
  }
}
```

## 📊 Task Data Structure Reference

Every task object returned by the functions has this structure:

```javascript
{
  id: "page-id",                    // Notion page ID (use for updates)
  taskId: 123,                      // Auto-incremented ID (for display)
  title: "Task Title",              // Task name
  status: "To-do",                  // Current status
  assignedTo: [                     // Array of assigned people
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

## 🎯 Quick Decision Tree

**Need to create a task?**
→ Use `createTask()`

**Need to find tasks?**
→ Use `getAllTasks()` with filters or `searchTasks()`

**Need to update a task?**
→ Use `updateTask()` for status, `updateTaskNotes()` for notes, `appendTaskNotes()` to add

**Need to assign a task?**
→ Use `assignTaskByName()` for name-based assignment

**Need functionality that doesn't exist?**
→ Use `agentRequest()` to ask Dumi

**Need to see who's available?**
→ Use `getWorkspacePeople()`

## 🔧 Troubleshooting Quick Fixes

**"Person not found" error:**
```javascript
// Check available people first
const people = await getWorkspacePeople();
console.log("Available people:", people.map(p => p.name));
```

**"Task creation failed" error:**
```javascript
// Check if database is accessible
const tasks = await getAllTasks();
if (tasks.length === 0) {
  console.log("Database might be empty or inaccessible");
}
```

**"Invalid request type" error:**
```javascript
// Use valid request types
const validTypes = ["New Feature", "Bug Fix", "Enhancement", "Integration", "Documentation", "Configuration", "Troubleshooting", "Other"];
```

---

**Remember: When in doubt, use `agentRequest()` to ask Dumi for help! 🤖✨**
