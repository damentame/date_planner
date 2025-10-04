const { Client } = require('@notionhq/client');

// Use environment variables or placeholder values for testing
const apiKey = process.env.NOTION_API_KEY || 'your_notion_api_key';
const databaseId = process.env.NOTION_DATABASE_ID || 'your_notion_database_id';

console.log("API Key:", apiKey);
console.log("Database ID:", databaseId);

// Initialize the client
const notion = new Client({ auth: apiKey });

async function getAllTasks() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId
    });
    
    console.log("Tasks fetched successfully!");
    console.log("Total tasks:", response.results.length);
    
    // Format the response for easier use
    const tasks = response.results.map(page => {
      // Log the raw page to see its structure
      console.log("Raw page properties:", JSON.stringify(page.properties, null, 2));
      
      return {
        id: page.id,
        // Extract other properties based on the actual structure
      };
    });
    
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error.body || error);
    return [];
  }
}

getAllTasks();
