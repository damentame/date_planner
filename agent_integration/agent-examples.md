# Agent Examples for Date Planner Tasks

This document provides examples of how AI agents can use the Task Tracker integration to manage the Notion Date Planner Tasks database.

## Task Tracker Agent Examples

### Task Status Monitoring

```javascript
const { getAllTasks, TaskStatus, updateTask } = require('./index');

/**
 * Monitor tasks and update their status based on criteria
 */
async function monitorTaskStatus() {
  // Get all tasks
  const tasks = await getAllTasks();
  
  // Check for overdue tasks
  const today = new Date();
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === TaskStatus.COMPLETED) return false;
    
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== TaskStatus.BLOCKED;
  });
  
  // Update status of overdue tasks
  for (const task of overdueTasks) {
    await updateTask(task.id, {
      status: TaskStatus.BLOCKED,
      description: `${task.description}\n\nNote: This task is overdue. Original due date: ${task.dueDate}`
    });
    console.log(`Marked task "${task.title}" as blocked because it's overdue.`);
  }
  
  console.log(`Found ${overdueTasks.length} overdue tasks and updated their status.`);
}

// Run the monitoring function once per day
monitorTaskStatus().catch(console.error);
```

### Task Prioritization

```javascript
const { getAllTasks, updateTask, TaskPriority } = require('./index');

/**
 * Analyze and prioritize tasks based on due dates and descriptions
 */
async function prioritizeTasks() {
  const tasks = await getAllTasks();
  const today = new Date();
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
  
  for (const task of tasks) {
    // Skip completed tasks
    if (task.status === TaskStatus.COMPLETED) continue;
    
    let priority = TaskPriority.MEDIUM; // Default priority
    
    // Check due date proximity
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const timeUntilDue = dueDate.getTime() - today.getTime();
      
      if (timeUntilDue < 0) {
        // Overdue task
        priority = TaskPriority.HIGH;
      } else if (timeUntilDue < oneWeek) {
        // Due within a week
        priority = TaskPriority.HIGH;
      }
    }
    
    // Check for keywords indicating high priority
    const highPriorityKeywords = ['urgent', 'critical', 'blocker', 'blocking', 'immediately'];
    const containsHighPriorityKeyword = highPriorityKeywords.some(keyword => 
      task.title.toLowerCase().includes(keyword) || 
      (task.description && task.description.toLowerCase().includes(keyword))
    );
    
    if (containsHighPriorityKeyword) {
      priority = TaskPriority.HIGH;
    }
    
    // Update task if priority differs
    if (task.priority !== priority) {
      await updateTask(task.id, { priority });
      console.log(`Updated priority of "${task.title}" to ${priority}`);
    }
  }
}

// Run the prioritization function
prioritizeTasks().catch(console.error);
```

### Task Assignment

```javascript
const { getAllTasks, updateTask, TaskStatus } = require('./index');

/**
 * Assign unassigned tasks to team members based on workload
 */
async function assignTasks() {
  // Team members and their specialties
  const team = [
    { name: 'Alice', specialties: ['frontend', 'ui', 'design'], currentTasks: 0 },
    { name: 'Bob', specialties: ['backend', 'database', 'api'], currentTasks: 0 },
    { name: 'Charlie', specialties: ['testing', 'qa', 'documentation'], currentTasks: 0 }
  ];
  
  // Get all tasks
  const tasks = await getAllTasks();
  
  // Update team member current task count
  for (const task of tasks) {
    if (task.status !== TaskStatus.COMPLETED) {
      for (const assignee of task.assignedTo || []) {
        const teamMember = team.find(member => member.name === assignee);
        if (teamMember) {
          teamMember.currentTasks++;
        }
      }
    }
  }
  
  // Find unassigned tasks
  const unassignedTasks = tasks.filter(task => 
    (task.assignedTo || []).length === 0 && 
    task.status !== TaskStatus.COMPLETED
  );
  
  // Assign tasks
  for (const task of unassignedTasks) {
    // Find the best team member for this task
    let bestMatch = null;
    let bestScore = -1;
    
    for (const member of team) {
      // Calculate a score based on specialties and current workload
      let score = 0;
      
      // Check for specialty matches in title and description
      for (const specialty of member.specialties) {
        if (task.title.toLowerCase().includes(specialty) || 
            (task.description && task.description.toLowerCase().includes(specialty))) {
          score += 2;
        }
      }
      
      // Adjust score based on current workload (fewer tasks = higher score)
      score -= member.currentTasks * 0.5;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = member;
      }
    }
    
    if (bestMatch) {
      // Assign the task to the best match
      await updateTask(task.id, {
        assignedTo: [bestMatch.name]
      });
      
      bestMatch.currentTasks++;
      console.log(`Assigned task "${task.title}" to ${bestMatch.name}`);
    }
  }
}

// Run the assignment function
assignTasks().catch(console.error);
```

### Task Progress Reporting

```javascript
const { getAllTasks, TaskStatus } = require('./index');

/**
 * Generate a progress report on task completion
 */
async function generateProgressReport() {
  const tasks = await getAllTasks();
  
  // Count tasks by status
  const statusCounts = {
    [TaskStatus.TODO]: 0,
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.COMPLETED]: 0,
    [TaskStatus.BLOCKED]: 0
  };
  
  for (const task of tasks) {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
  }
  
  // Calculate overall progress
  const totalTasks = tasks.length;
  const completedTasks = statusCounts[TaskStatus.COMPLETED] || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
  
  // Generate the report
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalTasks,
      completedTasks,
      progressPercentage: `${progressPercentage}%`,
      remainingTasks: totalTasks - completedTasks
    },
    breakdown: {
      [TaskStatus.TODO]: statusCounts[TaskStatus.TODO] || 0,
      [TaskStatus.IN_PROGRESS]: statusCounts[TaskStatus.IN_PROGRESS] || 0,
      [TaskStatus.COMPLETED]: statusCounts[TaskStatus.COMPLETED] || 0,
      [TaskStatus.BLOCKED]: statusCounts[TaskStatus.BLOCKED] || 0
    },
    recentlyCompleted: tasks
      .filter(task => task.status === TaskStatus.COMPLETED)
      .sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited))
      .slice(0, 5)
      .map(task => ({
        title: task.title,
        completedAt: task.lastEdited
      }))
  };
  
  // Log the report
  console.log('=== Date Planner Progress Report ===');
  console.log(`Generated: ${new Date().toLocaleString()}`);
  console.log(`Total Tasks: ${report.summary.totalTasks}`);
  console.log(`Progress: ${report.summary.progressPercentage} (${report.summary.completedTasks} completed)`);
  console.log('\nStatus Breakdown:');
  for (const [status, count] of Object.entries(report.breakdown)) {
    console.log(`- ${status}: ${count}`);
  }
  
  console.log('\nRecently Completed Tasks:');
  for (const task of report.recentlyCompleted) {
    console.log(`- ${task.title} (${new Date(task.completedAt).toLocaleDateString()})`);
  }
  
  return report;
}

// Generate and display a progress report
generateProgressReport().catch(console.error);
```

## Date Planner Development Agent Examples

### Feature Implementation Workflow

```javascript
const { getTasksByStatus, TaskStatus, startTask, updateTask, markTaskComplete } = require('./index');

/**
 * Implement a feature from the task database
 */
async function implementFeature() {
  // Get the next todo task
  const todoTasks = await getTasksByStatus(TaskStatus.TODO);
  if (todoTasks.length === 0) {
    console.log('No pending tasks found.');
    return;
  }
  
  // Select the first todo task
  const task = todoTasks[0];
  console.log(`Selected task: ${task.title}`);
  
  // Mark the task as in progress
  await startTask(task.id);
  console.log('Task marked as in progress');
  
  // Simulating feature implementation
  console.log('Implementing feature...');
  
  // Get task requirements from description
  const requirements = task.description || 'No specific requirements';
  console.log('Requirements:', requirements);
  
  // Simulate development work
  console.log('Writing code...');
  
  // Example code generation for a task
  const generatedCode = generateCodeForTask(task);
  console.log('Generated code:', generatedCode);
  
  // Mark the task as complete and add implementation notes
  await markTaskComplete(task.id);
  await updateTask(task.id, {
    description: `${task.description || ''}\n\n---\n\nImplementation Notes:\n- Feature implemented on ${new Date().toISOString()}\n- Code has been added to the codebase`
  });
  
  console.log('Task completed successfully');
}

// Helper function to simulate code generation for a task
function generateCodeForTask(task) {
  const title = task.title.toLowerCase();
  
  if (title.includes('login')) {
    return `
function login(username, password) {
  // Validate credentials
  if (!username || !password) {
    return { success: false, error: 'Missing credentials' };
  }
  
  // Authentication logic
  // ...
  
  return { success: true, user: { username } };
}
`;
  } else if (title.includes('calendar')) {
    return `
function renderCalendar(dates, events) {
  const calendar = document.getElementById('calendar');
  
  dates.forEach(date => {
    const dayElement = document.createElement('div');
    dayElement.classList.add('calendar-day');
    dayElement.textContent = date.getDate();
    
    // Add events for this day
    const dayEvents = events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
    
    dayEvents.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.classList.add('calendar-event');
      eventElement.textContent = event.title;
      dayElement.appendChild(eventElement);
    });
    
    calendar.appendChild(dayElement);
  });
}
`;
  } else {
    return `
// Generic implementation for: ${task.title}
function implement${task.title.replace(/[^a-zA-Z0-9]/g, '')}() {
  console.log('Implementing ${task.title}');
  // Implementation details...
  return { success: true };
}
`;
  }
}

// Run the implementation workflow
implementFeature().catch(console.error);
```

### Bug Fixing Workflow

```javascript
const { getTasksByStatus, TaskStatus, startTask, markTaskComplete, updateTask } = require('./index');

/**
 * Fix a bug from the task database
 */
async function fixBug() {
  // Get blocked tasks (potential bugs)
  const blockedTasks = await getTasksByStatus(TaskStatus.BLOCKED);
  
  // Filter for tasks that are likely bugs
  const bugTasks = blockedTasks.filter(task => 
    task.title.toLowerCase().includes('bug') || 
    task.title.toLowerCase().includes('fix') ||
    (task.description && task.description.toLowerCase().includes('not working'))
  );
  
  if (bugTasks.length === 0) {
    console.log('No bugs found to fix.');
    return;
  }
  
  // Select the first bug
  const bug = bugTasks[0];
  console.log(`Selected bug: ${bug.title}`);
  
  // Mark the bug as in progress
  await startTask(bug.id);
  console.log('Bug marked as in progress');
  
  // Analyze the bug
  console.log('Analyzing bug...');
  const bugAnalysis = analyzeBug(bug);
  console.log('Bug analysis:', bugAnalysis);
  
  // Fix the bug
  console.log('Implementing fix...');
  const bugFix = fixBugCode(bug, bugAnalysis);
  console.log('Bug fix:', bugFix);
  
  // Mark the bug as fixed
  await markTaskComplete(bug.id);
  await updateTask(bug.id, {
    description: `${bug.description || ''}\n\n---\n\nFix Notes:\n- Bug fixed on ${new Date().toISOString()}\n- Root cause: ${bugAnalysis.rootCause}\n- Fix details: ${bugAnalysis.fixDetails}`
  });
  
  console.log('Bug fixed successfully');
}

// Helper function to analyze a bug
function analyzeBug(bug) {
  const title = bug.title.toLowerCase();
  const description = (bug.description || '').toLowerCase();
  
  let rootCause = 'Unknown';
  let fixDetails = 'General fix applied';
  
  if (title.includes('crash') || description.includes('crash')) {
    rootCause = 'Null reference exception in the application logic';
    fixDetails = 'Added null checks to prevent crashes';
  } else if (title.includes('display') || description.includes('display')) {
    rootCause = 'CSS styling issue causing elements to be hidden';
    fixDetails = 'Updated CSS to ensure proper element visibility';
  } else if (title.includes('performance') || description.includes('slow')) {
    rootCause = 'Inefficient data processing in the main thread';
    fixDetails = 'Optimized algorithm and moved processing to a worker thread';
  }
  
  return {
    rootCause,
    fixDetails,
    severity: description.includes('critical') ? 'High' : 'Medium'
  };
}

// Helper function to generate bug fix code
function fixBugCode(bug, analysis) {
  const title = bug.title.toLowerCase();
  
  if (title.includes('crash') || analysis.rootCause.includes('null')) {
    return `
// Fix for null reference bug
function safeGetUserData(userId) {
  // Before: const user = users[userId];
  // After: Add null check
  const user = userId && users[userId] ? users[userId] : null;
  
  if (!user) {
    console.warn('User data not found for ID:', userId);
    return { error: 'User not found' };
  }
  
  return user;
}
`;
  } else if (title.includes('display') || analysis.rootCause.includes('CSS')) {
    return `
/* Fix for display issue */
.date-item {
  /* Before: display: none; */
  /* After: Make items visible */
  display: flex;
  visibility: visible;
  opacity: 1;
  
  /* Fix z-index issues */
  z-index: 10;
  position: relative;
}
`;
  } else {
    return `
// Generic fix for: ${bug.title}
function improved${bug.title.replace(/[^a-zA-Z0-9]/g, '')}() {
  // Before:
  // const result = performExpensiveOperation(data);
  
  // After:
  // Use memoization to cache results
  const memoizedOperation = memoize(performExpensiveOperation);
  const result = memoizedOperation(data);
  
  return result;
}

// Add caching to improve performance
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
`;
  }
}

// Run the bug fixing workflow
fixBug().catch(console.error);
```

### Task Testing Workflow

```javascript
const { getTask, getTasksByStatus, TaskStatus, updateTask } = require('./index');

/**
 * Test a completed task implementation
 */
async function testCompletedTask(taskId) {
  // If no specific task ID provided, get the most recently completed task
  let task;
  if (!taskId) {
    const completedTasks = await getTasksByStatus(TaskStatus.COMPLETED);
    if (completedTasks.length === 0) {
      console.log('No completed tasks found to test.');
      return;
    }
    
    // Sort by most recently edited
    completedTasks.sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited));
    task = completedTasks[0];
  } else {
    task = await getTask(taskId);
    if (task.status !== TaskStatus.COMPLETED) {
      console.log(`Task ${taskId} is not marked as completed yet.`);
      return;
    }
  }
  
  console.log(`Testing task: ${task.title}`);
  
  // Extract test cases from the task description
  const testCases = extractTestCases(task);
  console.log(`Found ${testCases.length} test cases`);
  
  // Run the tests
  const testResults = [];
  for (const testCase of testCases) {
    console.log(`Running test: ${testCase.name}`);
    
    try {
      // Simulate test execution
      const result = simulateTestExecution(task, testCase);
      
      testResults.push({
        name: testCase.name,
        passed: result.passed,
        message: result.message
      });
      
      console.log(`Test ${result.passed ? 'passed' : 'failed'}: ${result.message}`);
    } catch (error) {
      testResults.push({
        name: testCase.name,
        passed: false,
        message: `Test threw an exception: ${error.message}`
      });
      console.log(`Test error: ${error.message}`);
    }
  }
  
  // Calculate test summary
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passPercentage = Math.round((passedTests / totalTests) * 100);
  
  // Update task with test results
  const testReport = `
## Test Results for "${task.title}"
- Date: ${new Date().toISOString()}
- Pass rate: ${passPercentage}% (${passedTests}/${totalTests})

### Detailed Results
${testResults.map(r => `- ${r.passed ? '✅' : '❌'} ${r.name}: ${r.message}`).join('\n')}
`;

  await updateTask(task.id, {
    description: `${task.description || ''}\n\n${testReport}`
  });
  
  console.log('\nTest Summary:');
  console.log(`Passed: ${passedTests}/${totalTests} (${passPercentage}%)`);
  
  return {
    taskId: task.id,
    taskTitle: task.title,
    passRate: passPercentage,
    testResults
  };
}

// Helper function to extract test cases from a task description
function extractTestCases(task) {
  const description = task.description || '';
  const title = task.title;
  
  // First, look for explicit test cases in the description
  const testCaseRegex = /test case:?\s*(.*?)(?:\n|$)/gi;
  const explicitTests = [];
  let match;
  
  while ((match = testCaseRegex.exec(description)) !== null) {
    explicitTests.push({
      name: match[1].trim(),
      description: match[1].trim()
    });
  }
  
  if (explicitTests.length > 0) {
    return explicitTests;
  }
  
  // If no explicit test cases, generate some based on the task title/description
  const defaultTests = [];
  
  if (title.toLowerCase().includes('login')) {
    defaultTests.push(
      { name: 'Valid login', description: 'Test login with valid credentials' },
      { name: 'Invalid password', description: 'Test login with invalid password' },
      { name: 'Empty fields', description: 'Test login with empty fields' }
    );
  } else if (title.toLowerCase().includes('calendar')) {
    defaultTests.push(
      { name: 'Display calendar', description: 'Test calendar display' },
      { name: 'Add event', description: 'Test adding an event to the calendar' },
      { name: 'Remove event', description: 'Test removing an event from the calendar' }
    );
  } else if (title.toLowerCase().includes('search')) {
    defaultTests.push(
      { name: 'Basic search', description: 'Test basic search functionality' },
      { name: 'Empty search', description: 'Test search with empty query' },
      { name: 'Advanced filters', description: 'Test search with advanced filters' }
    );
  } else {
    // Generic tests
    defaultTests.push(
      { name: 'Basic functionality', description: `Test basic ${title} functionality` },
      { name: 'Edge cases', description: `Test edge cases for ${title}` },
      { name: 'Error handling', description: `Test error handling for ${title}` }
    );
  }
  
  return defaultTests;
}

// Helper function to simulate test execution
function simulateTestExecution(task, testCase) {
  const title = task.title.toLowerCase();
  const testName = testCase.name.toLowerCase();
  
  // Simulate test success/failure based on test name and task
  // In a real implementation, this would execute actual test code
  
  // Some tests are set to fail for demonstration purposes
  if (testName.includes('invalid') || testName.includes('empty')) {
    if (Math.random() < 0.3) {
      return {
        passed: false,
        message: `Failed: ${testCase.name} did not handle the case correctly`
      };
    }
  }
  
  if (testName.includes('edge cases')) {
    if (Math.random() < 0.4) {
      return {
        passed: false,
        message: `Failed: Edge case handling is incomplete`
      };
    }
  }
  
  // Most tests pass
  return {
    passed: true,
    message: `Passed: ${testCase.name} works as expected`
  };
}

// Run the testing workflow
testCompletedTask().catch(console.error);
```

These examples demonstrate how AI agents can interact with the Task Tracker integration to manage and update the Date Planner Tasks database in Notion.