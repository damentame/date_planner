#!/usr/bin/env node
const chalk = require('chalk');
const { program } = require('commander');
const inquirer = require('inquirer');
const { format } = require('date-fns');

// Import the task manager functions
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

// Configure the CLI
program
  .name('task-tracker')
  .description('Command line interface for managing Notion Date Planner Tasks')
  .version('1.0.0');

// Format task for display
const formatTaskForDisplay = (task) => {
  const statusColor = {
    [TaskStatus.TODO]: chalk.yellow,
    [TaskStatus.IN_PROGRESS]: chalk.blue,
    [TaskStatus.COMPLETED]: chalk.green,
    [TaskStatus.BLOCKED]: chalk.red
  };

  const prioritySymbol = {
    [TaskPriority.HIGH]: '🔴',
    [TaskPriority.MEDIUM]: '🟡',
    [TaskPriority.LOW]: '🟢'
  };

  const formattedDueDate = task.dueDate 
    ? format(new Date(task.dueDate), 'MMM d, yyyy')
    : 'No due date';

  return {
    id: task.id,
    title: task.title,
    status: statusColor[task.status](task.status),
    priority: `${prioritySymbol[task.priority]} ${task.priority}`,
    dueDate: formattedDueDate,
    assignedTo: task.assignedTo?.join(', ') || 'Unassigned',
    description: task.description
  };
};

// List all tasks
program
  .command('list')
  .description('List all tasks')
  .option('-s, --status <status>', 'Filter by status')
  .action(async (options) => {
    try {
      console.log(chalk.bold('Fetching tasks...'));
      
      const tasks = options.status
        ? await getTasksByStatus(options.status)
        : await getAllTasks();
      
      console.log(chalk.bold('\nDate Planner Tasks:'));
      
      if (tasks.length === 0) {
        console.log(chalk.italic('No tasks found.'));
        return;
      }
      
      tasks.forEach(task => {
        const formattedTask = formatTaskForDisplay(task);
        console.log('\n' + chalk.bold(formattedTask.title));
        console.log(`ID: ${chalk.dim(formattedTask.id)}`);
        console.log(`Status: ${formattedTask.status}`);
        console.log(`Priority: ${formattedTask.priority}`);
        console.log(`Due Date: ${formattedTask.dueDate}`);
        console.log(`Assigned To: ${formattedTask.assignedTo}`);
        
        if (formattedTask.description) {
          console.log(`\n${formattedTask.description}\n`);
        }
        
        console.log(chalk.dim('---'));
      });
    } catch (error) {
      console.error(chalk.red('Error listing tasks:'), error.message);
    }
  });

// Get a single task
program
  .command('get <taskId>')
  .description('Get a task by ID')
  .action(async (taskId) => {
    try {
      console.log(`Fetching task ${taskId}...`);
      const task = await getTask(taskId);
      const formattedTask = formatTaskForDisplay(task);
      
      console.log('\n' + chalk.bold(formattedTask.title));
      console.log(`ID: ${chalk.dim(formattedTask.id)}`);
      console.log(`Status: ${formattedTask.status}`);
      console.log(`Priority: ${formattedTask.priority}`);
      console.log(`Due Date: ${formattedTask.dueDate}`);
      console.log(`Assigned To: ${formattedTask.assignedTo}`);
      
      if (formattedTask.description) {
        console.log(`\n${formattedTask.description}\n`);
      }
    } catch (error) {
      console.error(chalk.red(`Error fetching task ${taskId}:`), error.message);
    }
  });

// Create a new task
program
  .command('create')
  .description('Create a new task')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Task title:',
          validate: input => input.trim() !== '' || 'Title cannot be empty'
        },
        {
          type: 'list',
          name: 'status',
          message: 'Status:',
          choices: Object.values(TaskStatus),
          default: TaskStatus.TODO
        },
        {
          type: 'list',
          name: 'priority',
          message: 'Priority:',
          choices: Object.values(TaskPriority),
          default: TaskPriority.MEDIUM
        },
        {
          type: 'input',
          name: 'dueDate',
          message: 'Due date (YYYY-MM-DD):',
          validate: input => {
            if (!input) return true;
            return /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Please use YYYY-MM-DD format';
          }
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description:'
        }
      ]);

      const newTask = await createTask(answers);
      console.log(chalk.green('\nTask created successfully!'));
      console.log('ID:', chalk.dim(newTask.id));
      console.log('Title:', newTask.title);
    } catch (error) {
      console.error(chalk.red('Error creating task:'), error.message);
    }
  });

// Update a task
program
  .command('update <taskId>')
  .description('Update an existing task')
  .action(async (taskId) => {
    try {
      // First get the existing task
      const existingTask = await getTask(taskId);
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Task title:',
          default: existingTask.title
        },
        {
          type: 'list',
          name: 'status',
          message: 'Status:',
          choices: Object.values(TaskStatus),
          default: existingTask.status
        },
        {
          type: 'list',
          name: 'priority',
          message: 'Priority:',
          choices: Object.values(TaskPriority),
          default: existingTask.priority
        },
        {
          type: 'input',
          name: 'dueDate',
          message: 'Due date (YYYY-MM-DD):',
          default: existingTask.dueDate,
          validate: input => {
            if (!input) return true;
            return /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Please use YYYY-MM-DD format';
          }
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
          default: existingTask.description
        }
      ]);

      const updatedTask = await updateTask(taskId, answers);
      console.log(chalk.green('\nTask updated successfully!'));
      console.log('ID:', chalk.dim(updatedTask.id));
      console.log('Title:', updatedTask.title);
    } catch (error) {
      console.error(chalk.red(`Error updating task ${taskId}:`), error.message);
    }
  });

// Delete a task
program
  .command('delete <taskId>')
  .description('Delete a task')
  .action(async (taskId) => {
    try {
      const confirmation = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete task ${taskId}?`,
          default: false
        }
      ]);
      
      if (!confirmation.confirm) {
        console.log(chalk.yellow('Operation cancelled.'));
        return;
      }
      
      await deleteTask(taskId);
      console.log(chalk.green(`Task ${taskId} deleted successfully!`));
    } catch (error) {
      console.error(chalk.red(`Error deleting task ${taskId}:`), error.message);
    }
  });

// Start a task (mark as in progress)
program
  .command('start <taskId>')
  .description('Mark a task as in progress')
  .action(async (taskId) => {
    try {
      await startTask(taskId);
      console.log(chalk.green(`Task ${taskId} marked as in progress!`));
    } catch (error) {
      console.error(chalk.red(`Error starting task ${taskId}:`), error.message);
    }
  });

// Complete a task
program
  .command('complete <taskId>')
  .description('Mark a task as completed')
  .action(async (taskId) => {
    try {
      await markTaskComplete(taskId);
      console.log(chalk.green(`Task ${taskId} marked as completed!`));
    } catch (error) {
      console.error(chalk.red(`Error completing task ${taskId}:`), error.message);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Display help if no command provided
if (process.argv.length <= 2) {
  program.help();
}