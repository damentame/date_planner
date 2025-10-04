import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';

// Import components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import DatePlanner from './components/DatePlanner';
import TasksOverview from './components/TasksOverview';
import GameCenter from './components/GameCenter';
import Settings from './components/Settings';

// Import mock data functions
import { getAllTasks } from './data/mockData';

// Global styles
import './styles/global.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
`;

const ContentContainer = styled.main`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');

  // Load tasks from mock data
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const fetchedTasks = await getAllTasks();
        setTasks(fetchedTasks);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load tasks.');
        setIsLoading(false);
        console.error('Error loading tasks:', err);
      }
    };

    loadTasks();
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Update document body with theme class
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Router>
      <AppContainer className={theme}>
        <Header toggleTheme={toggleTheme} theme={theme} />
        <ContentContainer>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="loading">Loading tasks from Notion...</div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard tasks={tasks} />} />
              <Route path="/calendar" element={<Calendar tasks={tasks} />} />
              <Route path="/date-planner" element={<DatePlanner tasks={tasks} />} />
              <Route path="/tasks" element={<TasksOverview tasks={tasks} />} />
              <Route path="/game-center" element={<GameCenter tasks={tasks} />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </ContentContainer>
      </AppContainer>
    </Router>
  );
}

export default App;
