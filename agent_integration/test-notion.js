import { Client } from "@notionhq/client";
import * as fs from 'fs';
import * as path from 'path';

// Manually read the .env file
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse the .env file
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

console.log("API Key:", envVars.NOTION_API_KEY);
console.log("Database ID:", envVars.NOTION_DATABASE_ID);

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