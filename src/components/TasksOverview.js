import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format, parseISO } from 'date-fns';

// Import TaskStatus from mock data
import { TaskStatus, TaskPriority } from '../data/mockData';

const TasksContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const TasksHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    font-size: 1.5rem;
    margin: 0;
  }
  
  .controls {
    display: flex;
    gap: 16px;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
`;

const Tab = styled.button`
  background-color: transparent;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  position: relative;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  
  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  }
  
  &:hover {
    color: var(--primary-color);
  }
  
  .count {
    display: inline-block;
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
    color: ${props => props.active ? 'white' : 'var(--text-color)'};
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 0.8rem;
    margin-left: 8px;
  }
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TaskCard = styled.div`
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TaskCheckbox = styled.div`
  input {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid ${props => {
      switch(props.priority) {
        case TaskPriority.HIGH: return 'var(--danger-color)';
        case TaskPriority.MEDIUM: return 'var(--warning-color)';
        default: return 'var(--success-color)';
      }
    }};
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    position: relative;
    
    &:checked {
      background-color: ${props => {
        switch(props.priority) {
          case TaskPriority.HIGH: return 'var(--danger-color)';
          case TaskPriority.MEDIUM: return 'var(--warning-color)';
          default: return 'var(--success-color)';
        }
      }};
    }
    
    &:checked:after {
      content: '✓';
      position: absolute;
      color: white;
      font-size: 12px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
`;

const TaskContent = styled.div`
  flex: 1;
`;

const TaskTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .status-badge {
    font-size: 0.8rem;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: normal;
    
    &.todo {
      background-color: rgba(108, 117, 125, 0.1);
      color: var(--disabled-color);
    }
    
    &.in-progress {
      background-color: rgba(67, 97, 238, 0.1);
      color: var(--primary-color);
    }
    
    &.completed {
      background-color: rgba(40, 167, 69, 0.1);
      color: var(--success-color);
    }
    
    &.blocked {
      background-color: rgba(220, 53, 69, 0.1);
      color: var(--danger-color);
    }
  }
`;

const TaskMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--disabled-color);
`;

const TaskDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-color);
`;

const TaskActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  
  button {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 4px 8px;
    font-size: 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: var(--bg-color);
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
  }
`;

const NoTasksMessage = styled.div`
  text-align: center;
  padding: 48px 0;
  color: var(--disabled-color);
  
  p {
    margin-bottom: 16px;
  }
`;

const CreateTaskModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  padding: 24px;
  
  h2 {
    margin-bottom: 24px;
  }
  
  .form-group {
    margin-bottom: 16px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    input, textarea, select {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-color);
      color: var(--text-color);
    }
    
    textarea {
      min-height: 100px;
      resize: vertical;
    }
  }
  
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 24px;
  }
`;

const SearchAndFilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  input {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-color);
    color: var(--text-color);
  }
  
  select {
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-color);
    color: var(--text-color);
  }
`;

const TasksOverview = ({ tasks }) => {
  const [activeTab, setActiveTab] = useState(TaskStatus.TODO);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    dueDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Filter and sort tasks when tab, search, or sort changes
  useEffect(() => {
    let result = tasks.filter(task => task.status === activeTab);
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      switch(sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { 
            [TaskPriority.HIGH]: 1, 
            [TaskPriority.MEDIUM]: 2, 
            [TaskPriority.LOW]: 3 
          };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'lastEdited':
          return new Date(b.lastEdited) - new Date(a.lastEdited);
        default:
          return 0;
      }
    });
    
    setFilteredTasks(result);
  }, [tasks, activeTab, searchQuery, sortBy]);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateTask = (e) => {
    e.preventDefault();
    // In a real app, this would save to the database
    console.log('Creating new task:', newTask);
    alert('Task has been created! In a real application, this would be saved to the database.');
    
    // Reset form and close modal
    setNewTask({
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      dueDate: format(new Date(), 'yyyy-MM-dd')
    });
    setIsModalOpen(false);
  };
  
  const getTaskStatusClass = (status) => {
    switch(status) {
      case TaskStatus.TODO:
        return 'todo';
      case TaskStatus.IN_PROGRESS:
        return 'in-progress';
      case TaskStatus.COMPLETED:
        return 'completed';
      case TaskStatus.BLOCKED:
        return 'blocked';
      default:
        return '';
    }
  };
  
  // Count tasks by status
  const taskCounts = Object.values(TaskStatus).reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status).length;
    return acc;
  }, {});
  
  return (
    <>
      <TasksContainer>
        <TasksHeader>
          <h2>Tasks</h2>
          <div className="controls">
            <button onClick={() => setIsModalOpen(true)}>Create Task</button>
          </div>
        </TasksHeader>
        
        <TabsContainer>
          {Object.values(TaskStatus).map(status => (
            <Tab
              key={status}
              active={activeTab === status}
              onClick={() => setActiveTab(status)}
            >
              {status}
              <span className="count">{taskCounts[status]}</span>
            </Tab>
          ))}
        </TabsContainer>
        
        <SearchAndFilterBar>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          
          <select value={sortBy} onChange={handleSortChange}>
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
            <option value="lastEdited">Sort by Last Edited</option>
          </select>
        </SearchAndFilterBar>
        
        <TasksList>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard key={task.id}>
                <TaskCheckbox priority={task.priority}>
                  <input
                    type="checkbox"
                    checked={task.status === TaskStatus.COMPLETED}
                    readOnly
                  />
                </TaskCheckbox>
                <TaskContent>
                  <TaskTitle>
                    {task.title}
                    <span className={`status-badge ${getTaskStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                  </TaskTitle>
                  <TaskMeta>
                    <div>
                      <span role="img" aria-label="priority">🔥</span> Priority: {task.priority}
                    </div>
                    {task.dueDate && (
                      <div>
                        <span role="img" aria-label="due date">📅</span> Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                      </div>
                    )}
                    {task.assignedTo?.length > 0 && (
                      <div>
                        <span role="img" aria-label="assigned to">👤</span> Assigned to: {task.assignedTo.join(', ')}
                      </div>
                    )}
                  </TaskMeta>
                  <TaskDescription>
                    {task.description}
                  </TaskDescription>
                  <TaskActions>
                    <button>Edit</button>
                    {task.status === TaskStatus.TODO && (
                      <button>Start</button>
                    )}
                    {task.status === TaskStatus.IN_PROGRESS && (
                      <button>Complete</button>
                    )}
                  </TaskActions>
                </TaskContent>
              </TaskCard>
            ))
          ) : (
            <NoTasksMessage>
              <p>No {activeTab.toLowerCase()} tasks found.</p>
              <button onClick={() => setIsModalOpen(true)}>Create a Task</button>
            </NoTasksMessage>
          )}
        </TasksList>
      </TasksContainer>
      
      {isModalOpen && (
        <CreateTaskModal>
          <ModalContent>
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newTask.title}
                  onChange={handleNewTaskChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newTask.description}
                  onChange={handleNewTaskChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={newTask.priority}
                  onChange={handleNewTaskChange}
                >
                  <option value={TaskPriority.LOW}>Low</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.HIGH}>High</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={newTask.dueDate}
                  onChange={handleNewTaskChange}
                />
              </div>
              
              <div className="button-group">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit">Create Task</button>
              </div>
            </form>
          </ModalContent>
        </CreateTaskModal>
      )}
    </>
  );
};

export default TasksOverview;
