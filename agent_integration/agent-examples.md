# 🤖 Cursor Agent Usage Examples

This document shows how Cursor agents can interact with the Notion Task Manager integration.

## Method 1: Direct Import (Recommended)

The agent can import and use functions directly in code:

```javascript
import { 
  createTask, 
  getAllTasks, 
  searchTasks, 
  updateTaskNotes, 
  assignTaskByName 
} from './agent_integrations/notion-task-manager/index.js';

// Create a task
const taskId = await createTask(
  "Fix critical bug in payment system",
  "Agent",
  "This bug is causing payment failures for customers"
);

// Search for tasks
const bugTasks = await searchTasks("bug", "title");

// Update notes
await updateTaskNotes(taskId, "Investigation complete. Root cause identified.");

// Assign to someone
await assignTaskByName(taskId, "Dumi");
```

## Method 2: CLI Commands

The agent can execute terminal commands to interact with Notion:

### Basic Commands

```bash
# Create a task
node agent_integrations/notion-task-manager/cli.js create-task "Review code changes" "Dumi" "Please review the recent PR"

# Get all tasks
node agent_integrations/notion-task-manager/cli.js get-tasks

# Get tasks with filters
node agent_integrations/notion-task-manager/cli.js get-tasks --status "To-do" --sort-by "ID"

# Search tasks
node agent_integrations/notion-task-manager/cli.js search-tasks "bug" "title"

# Update task status
node agent_integrations/notion-task-manager/cli.js update-task abc123 "In Progress" "Started working on this"

# Update notes
node agent_integrations/notion-task-manager/cli.js update-notes abc123 "New notes here"

# Append to notes
node agent_integrations/notion-task-manager/cli.js append-notes abc123 "Additional context"

# Get workspace people
node agent_integrations/notion-task-manager/cli.js get-people

# Assign task by name
node agent_integrations/notion-task-manager/cli.js assign-by-name abc123 "Dumi"

# Assign task by ID
node agent_integrations/notion-task-manager/cli.js assign-task abc123 person-id-1 person-id-2
```

### Advanced Filtering

```bash
# Get tasks with complex filters
node agent_integrations/notion-task-manager/cli.js get-tasks \
  --status "To-do" \
  --assigned-to "Dumi" \
  --title-contains "urgent" \
  --min-id 10 \
  --max-id 50 \
  --sort-by "ID" \
  --sort-direction "descending"
```

## Method 3: HTTP API Server

Start the API server and make HTTP requests:

### Start the Server

```bash
# Start the API server
node agent_integrations/notion-task-manager/api-server.js

# Server runs on http://localhost:3001
```

### API Examples

```bash
# Create a task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Deploy to production", "assignedTo": "Dumi", "notes": "Ready for deployment"}'

# Get all tasks
curl http://localhost:3001/api/tasks

# Get tasks with filters
curl "http://localhost:3001/api/tasks?status=To-do&sortBy=ID&sortDirection=descending"

# Search tasks
curl "http://localhost:3001/api/tasks/search?q=bug&in=title"

# Update task
curl -X PUT http://localhost:3001/api/tasks/abc123 \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress", "notes": "Working on this now"}'

# Update notes
curl -X PUT http://localhost:3001/api/tasks/abc123/notes \
  -H "Content-Type: application/json" \
  -d '{"notes": "Updated notes here"}'

# Append to notes
curl -X POST http://localhost:3001/api/tasks/abc123/notes \
  -H "Content-Type: application/json" \
  -d '{"notes": "Additional context"}'

# Get people
curl http://localhost:3001/api/people

# Assign by name
curl -X POST http://localhost:3001/api/tasks/abc123/assign-by-name \
  -H "Content-Type: application/json" \
  -d '{"personName": "Dumi"}'

# Assign by ID
curl -X POST http://localhost:3001/api/tasks/abc123/assign \
  -H "Content-Type: application/json" \
  -d '{"peopleIds": ["person-id-1", "person-id-2"]}'
```

## Method 4: JavaScript/Node.js Integration

For more complex agent workflows:

```javascript
// agent-workflow.js
import { 
  createTask, 
  getAllTasks, 
  searchTasks, 
  updateTaskNotes, 
  assignTaskByName,
  getWorkspacePeople 
} from './agent_integrations/notion-task-manager/index.js';

class NotionAgent {
  async createAndAssignTask(title, personName, notes = "") {
    // Create task
    const taskId = await createTask(title, "Agent", notes);
    
    if (taskId) {
      // Assign to person
      const assigned = await assignTaskByName(taskId, personName);
      
      if (assigned) {
        console.log(`✅ Task "${title}" created and assigned to ${personName}`);
        return taskId;
      } else {
        console.log(`⚠️ Task created but failed to assign to ${personName}`);
        return taskId;
      }
    }
    
    return null;
  }

  async findAndUpdateTask(searchTerm, newNotes) {
    // Search for tasks
    const tasks = await searchTasks(searchTerm, "title");
    
    if (tasks.length > 0) {
      const task = tasks[0]; // Get first match
      
      // Update notes
      await updateTaskNotes(task.id, newNotes);
      console.log(`✅ Updated notes for task: ${task.title}`);
      
      return task;
    }
    
    console.log(`❌ No tasks found matching "${searchTerm}"`);
    return null;
  }

  async getTaskSummary() {
    const tasks = await getAllTasks();
    const people = await getWorkspacePeople();
    
    const summary = {
      totalTasks: tasks.length,
      byStatus: {},
      byAssignee: {},
      people: people.map(p => p.name)
    };
    
    // Group by status
    tasks.forEach(task => {
      summary.byStatus[task.status] = (summary.byStatus[task.status] || 0) + 1;
    });
    
    // Group by assignee
    tasks.forEach(task => {
      const assignee = task.assignedTo.map(p => p.name).join(', ') || 'Unassigned';
      summary.byAssignee[assignee] = (summary.byAssignee[assignee] || 0) + 1;
    });
    
    return summary;
  }
}

// Usage
const agent = new NotionAgent();

// Example workflow
async function exampleWorkflow() {
  // Get summary
  const summary = await agent.getTaskSummary();
  console.log('Task Summary:', summary);
  
  // Create and assign task
  const taskId = await agent.createAndAssignTask(
    "Review agent integration code",
    "Dumi",
    "Please review the new Notion integration features"
  );
  
  // Find and update existing task
  await agent.findAndUpdateTask(
    "bug",
    "Agent investigated and found the root cause"
  );
}

// Run example
exampleWorkflow();
```

## Recommended Approach for Cursor Agents

**For most use cases, I recommend Method 1 (Direct Import)** because:

1. ✅ **Type Safety**: Better IDE support and error checking
2. ✅ **Performance**: No subprocess overhead
3. ✅ **Integration**: Seamless integration with agent code
4. ✅ **Debugging**: Easier to debug and trace issues
5. ✅ **Flexibility**: Can combine multiple operations easily

**Use Method 2 (CLI) when:**
- The agent needs to run commands in a shell environment
- You want to integrate with existing shell-based workflows
- The agent is running in a restricted environment

**Use Method 3 (HTTP API) when:**
- Multiple agents need to share the same Notion integration
- You want to run the integration as a service
- You need to integrate with non-Node.js applications

## Environment Setup

Make sure your `.env` file contains:

```env
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_database_id_here
```

The agent will automatically load these environment variables when using any of the methods above.
