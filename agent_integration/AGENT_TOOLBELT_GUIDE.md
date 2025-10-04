# Agent Toolbelt Guide

This document serves as a comprehensive guide for agents working with the Date Planner Task Tracker system. It outlines how to effectively manage the Notion Date Planner Tasks database using the provided integration tools.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Task Management](#task-management)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)
6. [API Reference](#api-reference)

## Introduction

The Task Tracker agent integration provides a seamless interface between AI agents and the Notion Date Planner Tasks database. This integration allows agents to manage tasks programmatically, track progress, and coordinate development activities across teams.

### Purpose

This toolbelt is designed to:

- Streamline task management within the Notion workspace
- Provide a consistent interface for agents to interact with the task database
- Automate common task management workflows
- Ensure proper synchronization between development work and task status

## Getting Started

### Prerequisites

Before using the Agent Toolbelt, ensure you have:

1. Node.js (v14 or later) installed
2. Access to the Notion API token
3. The Notion Database ID for the Date Planner Tasks

### Installation

To install and configure the Agent Toolbelt:

1. Navigate to the agent_integration directory:
   ```bash
   cd agent_integration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the directory with the following variables:
   ```
   NOTION_API_KEY=your_notion_api_key
   NOTION_DATABASE_ID=your_notion_database_id
   ```

### Configuration

The Agent Toolbelt uses environment variables for configuration. You can also programmatically configure the integration by modifying the constants in the `index.js` file.

## Task Management

### Task Lifecycle

A task in the Date Planner system typically follows this lifecycle:

1. **Creation**: New task added to the database with "To Do" status
2. **Assignment**: Task is assigned to a specific agent/developer
3. **In Progress**: Work begins on the task
4. **Review**: Task implementation is reviewed (optional)
5. **Completion**: Task is marked as completed
6. **Verification**: Results are verified against requirements

### Managing Tasks

#### Viewing Tasks

```javascript
// Get all tasks
const tasks = await getAllTasks();

// Get tasks by status
const todoTasks = await getTasksByStatus(TaskStatus.TODO);
const inProgressTasks = await getTasksByStatus(TaskStatus.IN_PROGRESS);
const completedTasks = await getTasksByStatus(TaskStatus.COMPLETED);
```

#### Creating Tasks

```javascript
const newTask = await createTask({
  title: "Implement user authentication",
  status: TaskStatus.TODO,
  priority: TaskPriority.HIGH,
  dueDate: "2025-11-01",
  description: "Add user login and registration functionality"
});
```

#### Updating Tasks

```javascript
// Update specific properties
await updateTask(taskId, {
  status: TaskStatus.IN_PROGRESS,
  description: "Updated task description with new requirements"
});

// Mark task as complete
await markTaskComplete(taskId);

// Start working on a task
await startTask(taskId);
```

#### Deleting Tasks

```javascript
await deleteTask(taskId);
```

### Task Properties

Each task in the system has the following properties:

| Property    | Description                                    | Type             |
|-------------|------------------------------------------------|------------------|
| id          | Unique identifier                              | String           |
| title       | Task title/name                                | String           |
| status      | Current status                                 | TaskStatus enum  |
| priority    | Task priority                                  | TaskPriority enum|
| dueDate     | Deadline for completion                        | String (ISO date)|
| description | Detailed description of requirements           | String           |
| assignedTo  | Team members assigned to the task              | Array of Strings |
| lastEdited  | Timestamp of last modification                 | String (ISO date)|

## Best Practices

### Task Descriptions

Write clear and concise task descriptions that include:

1. What needs to be done
2. Acceptance criteria
3. Dependencies on other tasks
4. Resources or references needed

### Status Updates

- Update task status in real-time as progress is made
- Add comments to document key decisions or challenges
- Keep the assignee field accurate to reflect current ownership

### Task Dependencies

When tasks depend on each other:

1. Note dependencies in the task description
2. Create tasks in logical order
3. Update dependent tasks when status changes

### Documentation

- Document architectural decisions within task descriptions
- Link to relevant resources in the task description
- Document any unusual workarounds or solutions

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify your Notion API key is correct
   - Check API token permissions and expiration

2. **Rate Limiting**:
   - Implement backoff strategies
   - Batch updates when possible

3. **Database Structure Changes**:
   - If Notion database structure changes, update the property mapping in the `parseNotionTask` function

### Error Handling

The toolbelt includes comprehensive error handling. Most functions will throw descriptive errors that can help identify issues. Always wrap API calls in try/catch blocks to handle potential failures gracefully.

## API Reference

### Core Functions

| Function | Description | Parameters | Return Value |
|----------|-------------|------------|--------------|
| `getAllTasks()` | Retrieves all tasks from the database | None | Array of task objects |
| `getTask(taskId)` | Gets a specific task by ID | `taskId`: String | Task object |
| `createTask(taskData)` | Creates a new task | `taskData`: Object | Created task object |
| `updateTask(taskId, updates)` | Updates task properties | `taskId`: String, `updates`: Object | Updated task object |
| `deleteTask(taskId)` | Deletes a task | `taskId`: String | None |
| `getTasksByStatus(status)` | Gets all tasks with specific status | `status`: String | Array of task objects |
| `markTaskComplete(taskId)` | Marks task as completed | `taskId`: String | Updated task object |
| `startTask(taskId)` | Marks task as in progress | `taskId`: String | Updated task object |

### Enums

#### TaskStatus

- `TaskStatus.TODO`: "To Do"
- `TaskStatus.IN_PROGRESS`: "In Progress"
- `TaskStatus.COMPLETED`: "Completed"
- `TaskStatus.BLOCKED`: "Blocked"

#### TaskPriority

- `TaskPriority.HIGH`: "High"
- `TaskPriority.MEDIUM`: "Medium"
- `TaskPriority.LOW`: "Low"