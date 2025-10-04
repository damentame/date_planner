const { Client } = require('@notionhq/client');

// Use environment variables or placeholder values for testing
const apiKey = process.env.NOTION_API_KEY || 'your_notion_api_key';
const databaseId = process.env.NOTION_DATABASE_ID || 'your_notion_database_id';

console.log("API Key:", apiKey);
console.log("Database ID:", databaseId);

// Initialize the client
const notion = new Client({ auth: apiKey });

async function testConnection() {
  try {
    // Try to list all users to test the connection
    const response = await notion.users.list();
    console.log("Connection successful!");
    console.log("Users:", response.results.length);
  } catch (error) {
    console.error("Error connecting to Notion API:", error.body || error);
  }
}

testConnection();
