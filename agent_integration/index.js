import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

/**
 * Create a task in Notion
 */
async function createTask(title, assignedTo = "Agent", notes = "", priority = "Medium") {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Task: {
          title: [
            {
              text: { content: title },
            },
          ],
        },
        "Assigned To": {
          people: [],
        },
        Status: {
          status: { name: "To-do" },
        },
        Notes: {
          rich_text: [{ text: { content: notes } }],
        },
        ID: {
          number: null, // This will be auto-incremented by Notion
        },
        "Priority Level": {
          select: { name: priority },
        },
        // Note: Automated fields (Last edited by, Last edited time, Created by, Created time) 
        // are handled automatically by Notion and don't need to be set
      },
    });

    console.log("Task created:", response.id);
    return response.id;
  } catch (error) {
    console.error("Error creating task:", error.body || error);
  }
}

/**
 * Update a task's status
 */
async function updateTask(pageId, status, notes = "") {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: {
          status: { name: status },
        },
        Notes: {
          rich_text: [{ text: { content: notes } }],
        },
      },
    });

    console.log(`Task ${pageId} updated to ${status}`);
  } catch (error) {
    console.error("Error updating task:", error.body || error);
  }
}

/**
 * Update a task's priority level
 */
async function updateTaskPriority(pageId, priority) {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        "Priority Level": {
          select: { name: priority },
        },
      },
    });

    console.log(`Task ${pageId} priority updated to ${priority}`);
    return true;
  } catch (error) {
    console.error("Error updating task priority:", error.body || error);
    return false;
  }
}

/**
 * Get all tasks with optional filtering
 */
async function getAllTasks(filters = {}) {
  try {
    let query = {
      database_id: databaseId,
    };

    // Add filters if provided
    if (Object.keys(filters).length > 0) {
      query.filter = {
        and: []
      };

      // Filter by status
      if (filters.status) {
        query.filter.and.push({
          property: "Status",
          status: { equals: filters.status }
        });
      }

      // Filter by assigned person
      if (filters.assignedTo) {
        query.filter.and.push({
          property: "Assigned To",
          people: { contains: filters.assignedTo }
        });
      }

      // Filter by task title (contains)
      if (filters.titleContains) {
        query.filter.and.push({
          property: "Task",
          title: { contains: filters.titleContains }
        });
      }

      // Filter by ID range
      if (filters.minId) {
        query.filter.and.push({
          property: "ID",
          number: { greater_than_or_equal_to: filters.minId }
        });
      }

      if (filters.maxId) {
        query.filter.and.push({
          property: "ID",
          number: { less_than_or_equal_to: filters.maxId }
        });
      }

      // Filter by priority
      if (filters.priority) {
        query.filter.and.push({
          property: "Priority Level",
          select: { equals: filters.priority }
        });
      }
    }

    // Add sorting
    if (filters.sortBy) {
      query.sorts = [{
        property: filters.sortBy,
        direction: filters.sortDirection || "ascending"
      }];
    }

    const response = await notion.databases.query(query);
    
    // Format the response for easier use
    const tasks = response.results.map(page => ({
      id: page.id,
      taskId: page.properties.ID?.number || null,
      title: page.properties.Task?.title?.[0]?.text?.content || "",
      status: page.properties.Status?.status?.name || "",
      assignedTo: page.properties["Assigned To"]?.people || [],
      notes: page.properties.Notes?.rich_text?.[0]?.text?.content || "",
      priority: page.properties["Priority Level"]?.select?.name || "Medium",
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
      createdBy: page.properties["Created by"]?.created_by || null,
      lastEditedBy: page.properties["Last edited by"]?.last_edited_by || null
    }));

    console.log(`Found ${tasks.length} tasks`);
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error.body || error);
    return [];
  }
}

/**
 * Search tasks by title or other criteria
 */
async function searchTasks(searchTerm, searchIn = "title") {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: searchIn === "title" ? "Task" : "Notes",
        [searchIn === "title" ? "title" : "rich_text"]: {
          contains: searchTerm
        }
      }
    });

    const tasks = response.results.map(page => ({
      id: page.id,
      taskId: page.properties.ID?.number || null,
      title: page.properties.Task?.title?.[0]?.text?.content || "",
      status: page.properties.Status?.status?.name || "",
      assignedTo: page.properties["Assigned To"]?.people || [],
      notes: page.properties.Notes?.rich_text?.[0]?.text?.content || "",
      priority: page.properties["Priority Level"]?.select?.name || "Medium",
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
      createdBy: page.properties["Created by"]?.created_by || null,
      lastEditedBy: page.properties["Last edited by"]?.last_edited_by || null
    }));

    console.log(`Found ${tasks.length} tasks matching "${searchTerm}"`);
    return tasks;
  } catch (error) {
    console.error("Error searching tasks:", error.body || error);
    return [];
  }
}

/**
 * Update notes for a specific task
 */
async function updateTaskNotes(pageId, notes) {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Notes: {
          rich_text: [{ text: { content: notes } }],
        },
      },
    });

    console.log(`Task ${pageId} notes updated`);
    return true;
  } catch (error) {
    console.error("Error updating task notes:", error.body || error);
    return false;
  }
}

/**
 * Append text to existing notes for a specific task
 */
async function appendTaskNotes(pageId, additionalNotes) {
  try {
    // First get the current task to read existing notes
    const currentTask = await notion.pages.retrieve({ page_id: pageId });
    const currentNotes = currentTask.properties.Notes?.rich_text?.[0]?.text?.content || "";
    
    // Combine existing notes with new notes
    const updatedNotes = currentNotes + (currentNotes ? "\n\n" : "") + additionalNotes;
    
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Notes: {
          rich_text: [{ text: { content: updatedNotes } }],
        },
      },
    });

    console.log(`Task ${pageId} notes appended`);
    return true;
  } catch (error) {
    console.error("Error appending task notes:", error.body || error);
    return false;
  }
}

/**
 * Get all people in the workspace
 */
async function getWorkspacePeople() {
  try {
    const response = await notion.users.list();
    
    const people = response.results.map(user => ({
      id: user.id,
      name: user.name,
      email: user.person?.email || null,
      type: user.type
    }));

    console.log(`Found ${people.length} people in workspace`);
    return people;
  } catch (error) {
    console.error("Error fetching workspace people:", error.body || error);
    return [];
  }
}

/**
 * Assign a task to specific people
 */
async function assignTask(pageId, peopleIds) {
  try {
    // Ensure peopleIds is an array
    if (!Array.isArray(peopleIds)) {
      peopleIds = [peopleIds];
    }

    await notion.pages.update({
      page_id: pageId,
      properties: {
        "Assigned To": {
          people: peopleIds.map(id => ({ id }))
        },
      },
    });

    console.log(`Task ${pageId} assigned to ${peopleIds.length} people`);
    return true;
  } catch (error) {
    console.error("Error assigning task:", error.body || error);
    return false;
  }
}

/**
 * Assign a task by person name (searches for person first)
 */
async function assignTaskByName(pageId, personName) {
  try {
    // Get all people in workspace
    const people = await getWorkspacePeople();
    
    // Find person by name (case insensitive)
    const person = people.find(p => 
      p.name.toLowerCase().includes(personName.toLowerCase())
    );

    if (!person) {
      console.error(`Person "${personName}" not found in workspace`);
      return false;
    }

    return await assignTask(pageId, [person.id]);
  } catch (error) {
    console.error("Error assigning task by name:", error.body || error);
    return false;
  }
}

/**
 * Agent Request Function - Assigns tasks to Dumi for functionality extensions
 * Use this when the agent needs additional functionality to complete a task
 */
async function agentRequest(requestType, description, requirements = "", priority = "Medium", context = {}) {
  try {
    // Validate request type
    const validTypes = [
      "New Feature",
      "Bug Fix", 
      "Enhancement",
      "Integration",
      "Documentation",
      "Configuration",
      "Troubleshooting",
      "Other"
    ];

    if (!validTypes.includes(requestType)) {
      console.error(`Invalid request type. Must be one of: ${validTypes.join(", ")}`);
      return false;
    }

    // Create detailed task description
    const taskTitle = `[AGENT REQUEST] ${requestType}: ${description}`;
    
    const taskNotes = `🤖 **Agent Request Details**

**Request Type:** ${requestType}
**Priority:** ${priority}
**Description:** ${description}

**Requirements:**
${requirements || "No specific requirements provided"}

**Context Information:**
${Object.keys(context).length > 0 ? 
  Object.entries(context).map(([key, value]) => `- **${key}:** ${value}`).join('\n') : 
  "No additional context provided"}

**Agent Instructions:**
This task was created by a Cursor agent that needs additional functionality to complete its assigned work. Please review the requirements and implement the necessary changes to help the agent succeed.

**Status:** Awaiting Review
**Created:** ${new Date().toISOString()}
**Source:** Cursor Agent Request System`;

    // Create the task
    const taskId = await createTask(taskTitle, "Agent", taskNotes);

    if (taskId) {
      // Assign to Dumi
      const assigned = await assignTaskByName(taskId, "Dumi");
      
      if (assigned) {
        console.log(`✅ Agent request created and assigned to Dumi: ${taskId}`);
        console.log(`📋 Request Type: ${requestType}`);
        console.log(`📝 Description: ${description}`);
        console.log(`⚡ Priority: ${priority}`);
        
        return {
          success: true,
          taskId: taskId,
          assigned: true,
          message: "Agent request successfully created and assigned to Dumi"
        };
      } else {
        console.log(`⚠️ Agent request created but failed to assign to Dumi: ${taskId}`);
        return {
          success: true,
          taskId: taskId,
          assigned: false,
          message: "Agent request created but assignment to Dumi failed"
        };
      }
    } else {
      console.error("❌ Failed to create agent request");
      return {
        success: false,
        taskId: null,
        assigned: false,
        message: "Failed to create agent request"
      };
    }
  } catch (error) {
    console.error("Error creating agent request:", error.body || error);
    return {
      success: false,
      taskId: null,
      assigned: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Example usage — Demonstrate all functionality
 */
async function main() {
  console.log("🚀 Notion Task Manager - Full Demo\n");

  try {
    // Step 1: Get workspace people
    console.log("1. Getting workspace people...");
    const people = await getWorkspacePeople();
    console.log("Available people:", people.map(p => p.name).join(", "));
    console.log("");

    // Step 2: Create a test task
    console.log("2. Creating a test task...");
    const taskId = await createTask(
      "Agent Demo Task: Advanced Notion Integration",
      "Agent",
      "This task demonstrates all the new functionality."
    );

    if (taskId) {
      console.log(`✅ Task created with ID: ${taskId}\n`);

      // Step 3: Get all tasks
      console.log("3. Fetching all tasks...");
      const allTasks = await getAllTasks();
      console.log(`Found ${allTasks.length} total tasks\n`);

      // Step 4: Filter tasks by status
      console.log("4. Filtering tasks by status 'To-do'...");
      const todoTasks = await getAllTasks({ status: "To-do" });
      console.log(`Found ${todoTasks.length} 'To-do' tasks\n`);

      // Step 5: Search tasks
      console.log("5. Searching for tasks containing 'Agent'...");
      const agentTasks = await searchTasks("Agent");
      console.log(`Found ${agentTasks.length} tasks containing 'Agent'\n`);

      // Step 6: Update task notes
      console.log("6. Updating task notes...");
      await updateTaskNotes(taskId, "Updated notes: Agent is working on this task.");
      console.log("✅ Notes updated\n");

      // Step 7: Append to task notes
      console.log("7. Appending additional notes...");
      await appendTaskNotes(taskId, "Additional note: This demonstrates note appending functionality.");
      console.log("✅ Notes appended\n");

      // Step 8: Assign task to a person (if people exist)
      if (people.length > 0) {
        console.log("8. Assigning task to first available person...");
        const success = await assignTaskByName(taskId, people[0].name);
        if (success) {
          console.log(`✅ Task assigned to ${people[0].name}\n`);
        }
      }

      // Step 9: Get tasks with complex filtering
      console.log("9. Complex filtering example...");
      const filteredTasks = await getAllTasks({
        status: "To-do",
        sortBy: "ID",
        sortDirection: "descending"
      });
      console.log(`Found ${filteredTasks.length} 'To-do' tasks sorted by ID (descending)\n`);

      // Step 10: Update task status
      console.log("10. Updating task status to 'In Progress'...");
      await updateTask(taskId, "In Progress", "Agent is actively working on this task.");
      console.log("✅ Task status updated\n");

      // Step 11: Final task list
      console.log("11. Final task list:");
      const finalTasks = await getAllTasks();
      finalTasks.forEach(task => {
        console.log(`  - ID: ${task.taskId}, Title: "${task.title}", Status: ${task.status}, Assigned: ${task.assignedTo.map(p => p.name || 'Unknown').join(', ') || 'None'}`);
      });

    } else {
      console.log("❌ Failed to create task");
    }

  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// Export all functions for use by Cursor agents
export {
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
};

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
