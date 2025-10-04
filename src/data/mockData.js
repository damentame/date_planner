/**
 * Mock data for the Date Planner application
 * This file provides sample data for development purposes
 */

import { format, addDays, subDays } from 'date-fns';

// Task Status Constants
export const TaskStatus = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked'
};

// Task Priority Constants
export const TaskPriority = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

// Generate a random ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Format date to ISO string
const formatDate = (date) => {
  return date.toISOString();
};

// Sample tasks
export const mockTasks = [
  {
    id: generateId(),
    title: 'Create user profile page',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: formatDate(subDays(new Date(), 3)),
    description: 'Implement user profile page with editing capabilities',
    assignedTo: ['John Doe'],
    lastEdited: formatDate(subDays(new Date(), 1))
  },
  {
    id: generateId(),
    title: 'Implement date planning UI',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: formatDate(addDays(new Date(), 1)),
    description: 'Create a user-friendly interface for planning dates with drag-and-drop functionality',
    assignedTo: ['Jane Smith'],
    lastEdited: formatDate(new Date())
  },
  {
    id: generateId(),
    title: 'Set up gamification system',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: formatDate(addDays(new Date(), 5)),
    description: 'Create a points and rewards system for completing date planning activities',
    assignedTo: [],
    lastEdited: formatDate(subDays(new Date(), 2))
  },
  {
    id: generateId(),
    title: 'Design location suggestion algorithm',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: formatDate(addDays(new Date(), 7)),
    description: 'Create an algorithm that suggests date locations based on user preferences',
    assignedTo: ['Alex Johnson'],
    lastEdited: formatDate(subDays(new Date(), 4))
  },
  {
    id: generateId(),
    title: 'Implement weather integration',
    status: TaskStatus.BLOCKED,
    priority: TaskPriority.LOW,
    dueDate: formatDate(addDays(new Date(), 3)),
    description: 'Integrate with a weather API to show forecasts for planned dates',
    assignedTo: ['John Doe'],
    lastEdited: formatDate(subDays(new Date(), 1))
  }
];

// Sample date ideas
export const mockDateIdeas = [
  {
    id: generateId(),
    title: 'Dinner at Italian Restaurant',
    category: 'Dining',
    description: 'Enjoy authentic Italian cuisine at a local restaurant',
    estimatedCost: 50,
    location: 'Downtown',
    duration: '2 hours',
    idealWeather: ['Clear', 'Cloudy'],
    tags: ['Food', 'Romantic', 'Evening']
  },
  {
    id: generateId(),
    title: 'Hiking Adventure',
    category: 'Outdoor',
    description: 'Hike the scenic mountain trails with beautiful views',
    estimatedCost: 10,
    location: 'Mountain Range',
    duration: '4 hours',
    idealWeather: ['Clear', 'Partly Cloudy'],
    tags: ['Nature', 'Active', 'Daytime']
  },
  {
    id: generateId(),
    title: 'Museum Visit',
    category: 'Cultural',
    description: 'Explore the art and history exhibits at the local museum',
    estimatedCost: 25,
    location: 'Art District',
    duration: '3 hours',
    idealWeather: ['Any'],
    tags: ['Educational', 'Indoor', 'Afternoon']
  },
  {
    id: generateId(),
    title: 'Coffee Shop Chat',
    category: 'Casual',
    description: 'Relaxed conversation over specialty coffees',
    estimatedCost: 15,
    location: 'Downtown',
    duration: '1.5 hours',
    idealWeather: ['Any'],
    tags: ['Beverages', 'Relaxed', 'Morning']
  },
  {
    id: generateId(),
    title: 'Stargazing Picnic',
    category: 'Outdoor',
    description: 'Evening picnic under the stars with telescope',
    estimatedCost: 30,
    location: 'Park',
    duration: '3 hours',
    idealWeather: ['Clear'],
    tags: ['Romantic', 'Evening', 'Food']
  }
];

// Sample planned dates
export const mockPlannedDates = [
  {
    id: generateId(),
    title: 'Anniversary Dinner',
    dateIdea: mockDateIdeas[0].id,
    date: formatDate(addDays(new Date(), 10)),
    startTime: '19:00',
    endTime: '21:30',
    location: 'La Trattoria Restaurant',
    notes: 'Made reservations for 7:00 PM. Remember to bring the gift!',
    isComplete: false,
    rating: null
  },
  {
    id: generateId(),
    title: 'Weekend Hike',
    dateIdea: mockDateIdeas[1].id,
    date: formatDate(addDays(new Date(), 5)),
    startTime: '10:00',
    endTime: '14:00',
    location: 'Blue Ridge Trail',
    notes: 'Pack water, snacks, and sunscreen',
    isComplete: false,
    rating: null
  },
  {
    id: generateId(),
    title: 'Coffee Meetup',
    dateIdea: mockDateIdeas[3].id,
    date: formatDate(subDays(new Date(), 2)),
    startTime: '10:30',
    endTime: '12:00',
    location: 'Bean & Brew Coffee Shop',
    notes: 'Try their new seasonal latte',
    isComplete: true,
    rating: 4
  }
];

// Sample user preferences
export const mockUserPreferences = {
  dateTypes: ['Outdoor', 'Dining', 'Cultural'],
  budget: {
    min: 0,
    max: 100
  },
  locations: ['Downtown', 'Park', 'Beachside'],
  availability: {
    monday: { available: true, startTime: '18:00', endTime: '22:00' },
    tuesday: { available: true, startTime: '18:00', endTime: '22:00' },
    wednesday: { available: false, startTime: '', endTime: '' },
    thursday: { available: true, startTime: '18:00', endTime: '22:00' },
    friday: { available: true, startTime: '17:00', endTime: '23:00' },
    saturday: { available: true, startTime: '10:00', endTime: '23:00' },
    sunday: { available: true, startTime: '10:00', endTime: '20:00' }
  },
  interests: ['Food', 'Movies', 'Hiking', 'Art', 'Music'],
  theme: 'light'
};

// Sample game achievements
export const mockAchievements = [
  {
    id: generateId(),
    title: 'Date Master',
    description: 'Plan 5 successful dates',
    progress: 3,
    total: 5,
    reward: 'Golden Calendar badge',
    completed: false
  },
  {
    id: generateId(),
    title: 'Adventure Seeker',
    description: 'Complete 3 outdoor date activities',
    progress: 1,
    total: 3,
    reward: 'Unlock special outdoor date ideas',
    completed: false
  },
  {
    id: generateId(),
    title: 'First Date',
    description: 'Plan and complete your first date',
    progress: 1,
    total: 1,
    reward: 'Date Planning Pro badge',
    completed: true
  },
  {
    id: generateId(),
    title: 'Perfect Rating',
    description: 'Receive a 5-star rating on a date',
    progress: 0,
    total: 1,
    reward: 'Unlock premium date ideas',
    completed: false
  }
];

// Export functions to simulate API calls

/**
 * Get all tasks
 * @returns {Promise<Array>} Array of tasks
 */
export const getAllTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTasks);
    }, 300);
  });
};

/**
 * Get tasks by status
 * @param {string} status - Task status to filter by
 * @returns {Promise<Array>} Array of filtered tasks
 */
export const getTasksByStatus = (status) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredTasks = mockTasks.filter(task => task.status === status);
      resolve(filteredTasks);
    }, 300);
  });
};

/**
 * Get all date ideas
 * @returns {Promise<Array>} Array of date ideas
 */
export const getDateIdeas = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDateIdeas);
    }, 300);
  });
};

/**
 * Get all planned dates
 * @returns {Promise<Array>} Array of planned dates
 */
export const getPlannedDates = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPlannedDates);
    }, 300);
  });
};

/**
 * Get user preferences
 * @returns {Promise<Object>} User preferences
 */
export const getUserPreferences = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUserPreferences);
    }, 300);
  });
};

/**
 * Get achievements
 * @returns {Promise<Array>} Array of achievements
 */
export const getAchievements = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAchievements);
    }, 300);
  });
};

export default {
  mockTasks,
  mockDateIdeas,
  mockPlannedDates,
  mockUserPreferences,
  mockAchievements,
  getAllTasks,
  getTasksByStatus,
  getDateIdeas,
  getPlannedDates,
  getUserPreferences,
  getAchievements,
  TaskStatus,
  TaskPriority
};
