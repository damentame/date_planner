# Date Planner Task Tracker

This package provides integration tools for managing the Notion Date Planner Tasks database. It's designed to be used by agents to track and update task status during the development of the Date Planner application.

## Overview

The Task Tracker provides a simple interface to Notion's API, allowing agents to:

- List all tasks in the Date Planner Tasks database
- Filter tasks by status
- Create new tasks
- Update task properties
- Mark tasks as complete
- Delete tasks

## Installation

```bash
cd agent_integration
npm install
```

## Configuration

Before using the Task Tracker, you need to set up your Notion API credentials. Create a `.env` file in the project root with the following variables:

```
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
```

To obtain these credentials:

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Copy the API key from your integration
3. Share your Date Planner Tasks database with the integration
4. Get the database ID from the URL (the part after notion.so/ and before the ?)

## Usage

### Command Line Interface

The package includes a command-line interface for managing tasks:

```bash
# Make the CLI executable
chmod +x cli.js

# List all tasks
./cli.js list

# List tasks with a specific status
./cli.js list --status "In Progress"

# Get a specific task
./cli.js get <task-id>

# Create a new task (interactive)
./cli.js create

# Update a task (interactive)
./cli.js update <task-id>

# Delete a task
./cli.js delete <task-id>

# Mark a task as in progress
./cli.js start <task-id>

# Mark a task as completed
./cli.js complete <task-id>
```

### Programmatic Usage

You can also use the Task Tracker programmatically in your agent code:

```javascript
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
} = require('./agent_integration');

// Example: Get all to-do tasks
async function getTodoTasks() {
  const todoTasks = await getTasksByStatus(TaskStatus.TODO);
  return todoTasks;
}

// Example: Mark a task as in progress
async function beginWork(taskId) {
  await startTask(taskId);
  console.log(`Started work on task ${taskId}`);
}

// Example: Create a new task
async function createNewFeatureTask(featureName) {
  const task = await createTask({
    title: `Implement ${featureName}`,
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    description: `Add the ${featureName} feature to the Date Planner application`
  });
  
  console.log(`Created task: ${task.id}`);
  return task;
}
```

## Task Properties

Each task has the following properties:

| Property    | Description                                 |
|-------------|---------------------------------------------|
| id          | Unique identifier for the task              |
| title       | The name or title of the task               |
| status      | Current status (To Do, In Progress, etc.)   |
| priority    | Task priority (High, Medium, Low)           |
| dueDate     | Due date for the task (if set)              |
| description | Detailed description of the task            |
| assignedTo  | Array of people assigned to the task        |
| lastEdited  | Timestamp when the task was last modified   |

## Status Enums

The following status values are available:

```javascript
TaskStatus.TODO         // "To Do"
TaskStatus.IN_PROGRESS  // "In Progress"
TaskStatus.COMPLETED    // "Completed"
TaskStatus.BLOCKED      // "Blocked"
```

## Priority Enums

The following priority values are available:

```javascript
TaskPriority.HIGH    // "High"
TaskPriority.MEDIUM  // "Medium"
TaskPriority.LOW     // "Low"
```

## Task Development Workflow

When developing the Date Planner application, follow this workflow:

1. Get the next task to implement:
   ```javascript
   const todoTasks = await getTasksByStatus(TaskStatus.TODO);
   const nextTask = todoTasks[0]; // Choose the first task or prioritize
   ```

2. Mark it as in progress:
   ```javascript
   await startTask(nextTask.id);
   ```

3. Implement the feature

4. Mark the task as complete when done:
   ```javascript
   await markTaskComplete(nextTask.id);
   ```

5. Update task with implementation details:
   ```javascript
   await updateTask(nextTask.id, {
     description: nextTask.description + "\n\nImplemented in PR #123"
   });
   ```

## Best Practices

- Always update task status before and after working on it
- Add implementation details and relevant links to the task description
- Use consistent naming conventions for tasks
- Break down complex features into multiple tasks
- Regularly check for new tasks and update task statuses

## For More Information

See the [Agent Toolbelt Guide](./AGENT_TOOLBELT_GUIDE.md) for a comprehensive reference on using the Task Tracker.