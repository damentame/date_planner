#!/usr/bin/env node

import { 
  createTask, 
  updateTask, 
  updateTaskPriority,
  getAllTasks, 
  searchTasks, 
  updateTaskNotes, 
  appendTaskNotes, 
  getWorkspacePeople, 
  assignTask, 
  assignTaskByName,
  agentRequest
} from './index.js';

// CLI Interface for Cursor Agents
class NotionCLI {
  constructor() {
    this.commands = {
      'create-task': this.createTask,
      'update-task': this.updateTask,
      'update-priority': this.updateTaskPriority,
      'get-tasks': this.getAllTasks,
      'search-tasks': this.searchTasks,
      'update-notes': this.updateTaskNotes,
      'append-notes': this.appendTaskNotes,
      'get-people': this.getWorkspacePeople,
      'assign-task': this.assignTask,
      'assign-by-name': this.assignTaskByName,
      'agent-request': this.agentRequest,
      'help': this.showHelp
    };
  }

  async run() {
    const [,, command, ...args] = process.argv;
    
    if (!command || !this.commands[command]) {
      console.log('❌ Invalid command. Use "help" to see available commands.');
      process.exit(1);
    }

    try {
      await this.commands[command](args);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  async createTask(args) {
    if (args.length < 1) {
      console.log('Usage: create-task "Task Title" [assignedTo] [notes] [priority]');
      console.log('Priority options: Low, Medium, High, Critical');
      return;
    }

    const title = args[0];
    const assignedTo = args[1] || "Agent";
    const notes = args[2] || "";
    const priority = args[3] || "Medium";

    const taskId = await createTask(title, assignedTo, notes, priority);
    if (taskId) {
      console.log(`✅ Task created: ${taskId}`);
      console.log(`📋 Title: ${title}`);
      console.log(`👤 Assigned to: ${assignedTo}`);
      console.log(`⚡ Priority: ${priority}`);
    } else {
      console.log('❌ Failed to create task');
    }
  }

  async updateTask(args) {
    if (args.length < 2) {
      console.log('Usage: update-task <pageId> <status> [notes]');
      return;
    }

    const pageId = args[0];
    const status = args[1];
    const notes = args[2] || "";

    await updateTask(pageId, status, notes);
    console.log(`✅ Task ${pageId} updated to ${status}`);
  }

  async updateTaskPriority(args) {
    if (args.length < 2) {
      console.log('Usage: update-priority <pageId> <priority>');
      console.log('Priority options: Low, Medium, High, Critical');
      return;
    }

    const pageId = args[0];
    const priority = args[1];

    const success = await updateTaskPriority(pageId, priority);
    if (success) {
      console.log(`✅ Task ${pageId} priority updated to ${priority}`);
    } else {
      console.log(`❌ Failed to update priority for task ${pageId}`);
    }
  }

  async getAllTasks(args) {
    const filters = {};
    
    // Parse filter arguments
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];
      
      if (key === '--status') filters.status = value;
      else if (key === '--assigned-to') filters.assignedTo = value;
      else if (key === '--title-contains') filters.titleContains = value;
      else if (key === '--min-id') filters.minId = parseInt(value);
      else if (key === '--max-id') filters.maxId = parseInt(value);
      else if (key === '--priority') filters.priority = value;
      else if (key === '--sort-by') filters.sortBy = value;
      else if (key === '--sort-direction') filters.sortDirection = value;
    }

    const tasks = await getAllTasks(filters);
    
    console.log(`\n📋 Found ${tasks.length} tasks:`);
    tasks.forEach(task => {
      console.log(`  ${task.taskId || 'N/A'}. ${task.title}`);
      console.log(`     Status: ${task.status}`);
      console.log(`     Priority: ${task.priority}`);
      console.log(`     Assigned: ${task.assignedTo.map(p => p.name).join(', ') || 'None'}`);
      console.log(`     Notes: ${task.notes.substring(0, 50)}${task.notes.length > 50 ? '...' : ''}`);
      console.log(`     Created: ${new Date(task.createdTime).toLocaleDateString()}`);
      console.log(`     Last Edited: ${new Date(task.lastEditedTime).toLocaleDateString()}`);
      console.log(`     ID: ${task.id}`);
      console.log('');
    });
  }

  async searchTasks(args) {
    if (args.length < 1) {
      console.log('Usage: search-tasks <searchTerm> [searchIn]');
      console.log('  searchIn: "title" (default) or "notes"');
      return;
    }

    const searchTerm = args[0];
    const searchIn = args[1] || "title";

    const tasks = await searchTasks(searchTerm, searchIn);
    
    console.log(`\n🔍 Found ${tasks.length} tasks matching "${searchTerm}":`);
    tasks.forEach(task => {
      console.log(`  ${task.taskId || 'N/A'}. ${task.title}`);
      console.log(`     Status: ${task.status}`);
      console.log(`     ID: ${task.id}`);
      console.log('');
    });
  }

  async updateTaskNotes(args) {
    if (args.length < 2) {
      console.log('Usage: update-notes <pageId> <notes>');
      return;
    }

    const pageId = args[0];
    const notes = args.slice(1).join(' ');

    const success = await updateTaskNotes(pageId, notes);
    if (success) {
      console.log(`✅ Notes updated for task ${pageId}`);
    } else {
      console.log('❌ Failed to update notes');
    }
  }

  async appendTaskNotes(args) {
    if (args.length < 2) {
      console.log('Usage: append-notes <pageId> <additionalNotes>');
      return;
    }

    const pageId = args[0];
    const additionalNotes = args.slice(1).join(' ');

    const success = await appendTaskNotes(pageId, additionalNotes);
    if (success) {
      console.log(`✅ Notes appended to task ${pageId}`);
    } else {
      console.log('❌ Failed to append notes');
    }
  }

  async getWorkspacePeople(args) {
    const people = await getWorkspacePeople();
    
    console.log(`\n👥 Found ${people.length} people in workspace:`);
    people.forEach(person => {
      console.log(`  - ${person.name} (${person.email || 'no email'})`);
      console.log(`    ID: ${person.id}`);
      console.log('');
    });
  }

  async assignTask(args) {
    if (args.length < 2) {
      console.log('Usage: assign-task <pageId> <personId1> [personId2] ...');
      return;
    }

    const pageId = args[0];
    const peopleIds = args.slice(1);

    const success = await assignTask(pageId, peopleIds);
    if (success) {
      console.log(`✅ Task ${pageId} assigned to ${peopleIds.length} people`);
    } else {
      console.log('❌ Failed to assign task');
    }
  }

  async assignTaskByName(args) {
    if (args.length < 2) {
      console.log('Usage: assign-by-name <pageId> <personName>');
      return;
    }

    const pageId = args[0];
    const personName = args[1];

    const success = await assignTaskByName(pageId, personName);
    if (success) {
      console.log(`✅ Task ${pageId} assigned to ${personName}`);
    } else {
      console.log(`❌ Failed to assign task to ${personName}`);
    }
  }

  async agentRequest(args) {
    if (args.length < 2) {
      console.log('Usage: agent-request <requestType> "description" [requirements] [priority]');
      console.log('');
      console.log('Request Types: New Feature, Bug Fix, Enhancement, Integration, Documentation, Configuration, Troubleshooting, Other');
      console.log('Priority: Low, Medium (default), High, Critical');
      console.log('');
      console.log('Examples:');
      console.log('  agent-request "New Feature" "Add email notifications" "Need to send emails when tasks are completed" "High"');
      console.log('  agent-request "Bug Fix" "Fix authentication error" "Users cannot log in" "Critical"');
      return;
    }

    const requestType = args[0];
    const description = args[1];
    const requirements = args[2] || "";
    const priority = args[3] || "Medium";

    const result = await agentRequest(requestType, description, requirements, priority);
    
    if (result.success) {
      console.log(`✅ Agent request created: ${result.taskId}`);
      console.log(`📋 Type: ${requestType}`);
      console.log(`📝 Description: ${description}`);
      console.log(`⚡ Priority: ${priority}`);
      console.log(`👤 Assigned to Dumi: ${result.assigned ? 'Yes' : 'No'}`);
    } else {
      console.log(`❌ Failed to create agent request: ${result.message}`);
    }
  }

  showHelp() {
    console.log(`
🤖 Notion Task Manager CLI for Cursor Agents

USAGE:
  node cli.js <command> [arguments]

COMMANDS:
  create-task "Title" [assignedTo] [notes] [priority]
    Create a new task

  update-task <pageId> <status> [notes]
    Update task status and notes

  update-priority <pageId> <priority>
    Update task priority level

  get-tasks [--status STATUS] [--assigned-to PERSON] [--title-contains TEXT] [--priority PRIORITY] [--min-id N] [--max-id N] [--sort-by FIELD] [--sort-direction DIR]                                                                                                                                   
    Get all tasks with optional filters

  search-tasks <searchTerm> [searchIn]
    Search tasks by title or notes

  update-notes <pageId> <notes>
    Replace task notes completely

  append-notes <pageId> <additionalNotes>
    Add to existing task notes

  get-people
    List all people in workspace

  assign-task <pageId> <personId1> [personId2] ...
    Assign task to specific people by ID

  assign-by-name <pageId> <personName>
    Assign task to person by name

  agent-request <requestType> "description" [requirements] [priority]
    Create agent request for functionality extensions

  help
    Show this help message

EXAMPLES:
  node cli.js create-task "Fix bug" "Dumi" "Critical issue needs attention" "High"
  node cli.js get-tasks --status "To-do" --priority "High" --sort-by "ID"
  node cli.js update-priority abc123 "Critical"
  node cli.js search-tasks "bug" "title"
  node cli.js assign-by-name abc123 "Dumi"
  node cli.js append-notes abc123 "Additional context here"
  node cli.js agent-request "New Feature" "Add email notifications" "Need to send emails when tasks are completed" "High"
    `);
  }
}

// Run CLI
const cli = new NotionCLI();
cli.run();
