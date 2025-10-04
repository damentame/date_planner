/**
 * Script to set up the development environment
 * This starts the API server and fetches initial tasks
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'agent_integration', '.env') });

// Check if we have the required environment variables
const requiredEnvVars = ['NOTION_API_KEY', 'NOTION_DATABASE_ID'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  console.error(missingEnvVars.join(', '));
  console.error('\nPlease create a .env file in the agent_integration directory with these variables.');
  console.error('You can copy the .env.example file and fill in your Notion credentials.');
  process.exit(1);
}

console.log('🔧 Setting up development environment...');

// Start the API server
console.log('🚀 Starting Task Tracker API server...');
const apiServer = spawn('node', [path.join(__dirname, 'agent_integration', 'api-server.js')], {
  stdio: 'inherit'
});

apiServer.on('close', code => {
  if (code !== 0) {
    console.error(`❌ API server process exited with code ${code}`);
  }
});

// Keep the script running to maintain the API server
console.log('✅ Development environment setup complete!');
console.log('📝 Task Tracker API server is running at http://localhost:3000');
console.log('\n🛑 Press Ctrl+C to stop the server');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  apiServer.kill();
  process.exit(0);
});

// Helper function to ensure the server stays running
function keepAlive() {
  setTimeout(keepAlive, 60000);
}

keepAlive();