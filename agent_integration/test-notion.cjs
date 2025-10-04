// CommonJS version
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

// Manually read the .env file
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse the .env file
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    envVars[key] = value;
  }
});

console.log("API Key:", envVars.NOTION_API_KEY);
console.log("Database ID:", envVars.NOTION_DATABASE_ID);

// Initialize the client
const notion = new Client({ auth: envVars.NOTION_API_KEY });

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
