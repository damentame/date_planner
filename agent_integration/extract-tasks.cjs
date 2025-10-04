const { Client } = require('@notionhq/client');

// Use environment variables or placeholder values for testing
const apiKey = process.env.NOTION_API_KEY || 'your_notion_api_key';
const databaseId = process.env.NOTION_DATABASE_ID || 'your_notion_database_id';

// Initialize the client
const notion = new Client({ auth: apiKey });

// Extract the title from a title property
function extractTitle(titleProperty) {
  if (titleProperty && titleProperty.title && titleProperty.title.length > 0) {
    return titleProperty.title[0].plain_text;
  }
  return '';
}

// Extract text from a rich text property
function extractRichText(richTextProperty) {
  if (richTextProperty && richTextProperty.rich_text && richTextProperty.rich_text.length > 0) {
    return richTextProperty.rich_text.map(text => text.plain_text).join('\\n');
  }
  return '';
}

// Extract status from a status property
function extractStatus(statusProperty) {
  if (statusProperty && statusProperty.status) {
    return statusProperty.status.name;
  }
  return '';
}

// Extract priority from a select property
function extractPriority(selectProperty) {
  if (selectProperty && selectProperty.select) {
    return selectProperty.select.name;
  }
  return '';
}

// Extract ID from a unique_id property
function extractId(uniqueIdProperty) {
  if (uniqueIdProperty && uniqueIdProperty.unique_id) {
    return `${uniqueIdProperty.unique_id.prefix}-${uniqueIdProperty.unique_id.number}`;
  }
  return '';
}

// Extract assigned people
function extractAssignedTo(peopleProperty) {
  if (peopleProperty && peopleProperty.people) {
    return peopleProperty.people.map(person => person.name);
  }
  return [];
}

async function getAllTasks() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId
    });
    
    console.log("Tasks fetched successfully!");
    console.log("Total tasks:", response.results.length);
    
    // Format the response for easier use
    const tasks = response.results.map(page => {
      const properties = page.properties;
      
      return {
        id: page.id,
        taskId: extractId(properties.ID),
        title: extractTitle(properties.Task),
        status: extractStatus(properties.Status),
        priority: extractPriority(properties["Priority Level"]),
        notes: extractRichText(properties.Notes),
        assignedTo: extractAssignedTo(properties["Assigned To"]),
        createdTime: properties["Created time"]?.created_time,
        lastEditedTime: properties["Last edited time"]?.last_edited_time,
        dependencies: extractRichText(properties.Dependencies)
      };
    });
    
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error.body || error);
    return [];
  }
}

async function main() {
  const tasks = await getAllTasks();
  
  // Print tasks in a more readable format
  console.log("\n=== Date Planner Tasks ===\n");
  
  tasks.forEach(task => {
    console.log(`ID: ${task.taskId}`);
    console.log(`Title: ${task.title}`);
    console.log(`Status: ${task.status}`);
    console.log(`Priority: ${task.priority || 'Not set'}`);
    console.log(`Assigned To: ${task.assignedTo.join(', ') || 'Unassigned'}`);
    console.log(`Notes: ${task.notes}`);
    console.log(`Dependencies: ${task.dependencies || 'None'}`);
    console.log('-'.repeat(50));
  });
  
  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = acc[task.status] || [];
    acc[task.status].push(task);
    return acc;
  }, {});
  
  console.log("\n=== Tasks by Status ===\n");
  Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
    console.log(`${status} (${statusTasks.length}):`);
    statusTasks.forEach(task => {
      console.log(`  - ${task.taskId}: ${task.title}`);
    });
    console.log();
  });
  
  // Return tasks for further processing
  return tasks;
}

main();
