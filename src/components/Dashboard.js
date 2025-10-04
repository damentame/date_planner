import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { format, isToday, isFuture, isPast, parseISO } from 'date-fns';

// Import mock data functions
import { getDateIdeas, getPlannedDates, getAchievements, TaskStatus } from '../data/mockData';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.section`
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h2 {
    font-size: 1.5rem;
    color: var(--text-color);
    margin: 0;
  }
  
  a {
    font-size: 0.9rem;
  }
`;

const Welcome = styled.div`
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 24px;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 24px;
    opacity: 0.9;
  }
  
  button {
    background-color: white;
    color: var(--primary-color);
    font-weight: bold;
    padding: 12px 24px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.9);
    }
  }
`;

const DateCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  background-color: ${props => props.isToday ? 'rgba(67, 97, 238, 0.1)' : 'var(--bg-color)'};
  border-left: 4px solid ${props => {
    if (props.isToday) return 'var(--primary-color)';
    if (props.isPast) return 'var(--danger-color)';
    return 'var(--success-color)';
  }};
`;

const DateInfo = styled.div`
  flex: 1;
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
  
  p {
    color: var(--disabled-color);
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  
  .details {
    display: flex;
    gap: 16px;
    font-size: 0.9rem;
    
    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const DateBadge = styled.div`
  background-color: ${props => {
    if (props.isToday) return 'var(--primary-color)';
    if (props.isPast) return 'var(--danger-color)';
    return 'var(--success-color)';
  }};
  color: white;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TaskStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
`;

const StatCard = styled.div`
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  
  h3 {
    font-size: 2rem;
    margin-bottom: 8px;
    color: ${props => props.color || 'var(--text-color)'};
  }
  
  p {
    font-size: 0.9rem;
    color: var(--disabled-color);
  }
`;

const AchievementCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--bg-color);
  border-radius: 8px;
  margin-bottom: 16px;
  
  .achievement-icon {
    font-size: 2rem;
    color: ${props => props.completed ? 'var(--accent-color)' : 'var(--disabled-color)'};
  }
`;

const AchievementInfo = styled.div`
  flex: 1;
  
  h4 {
    margin-bottom: 4px;
  }
  
  p {
    color: var(--disabled-color);
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
  
  .progress {
    height: 100%;
    background-color: ${props => props.completed ? 'var(--accent-color)' : 'var(--primary-color)'};
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
  }
`;

const IdeasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const IdeaCard = styled.div`
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
  
  h4 {
    margin-bottom: 8px;
  }
  
  p {
    color: var(--disabled-color);
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
`;

const Tag = styled.span`
  background-color: var(--border-color);
  color: var(--text-color);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const Dashboard = ({ tasks }) => {
  const [dateIdeas, setDateIdeas] = useState([]);
  const [plannedDates, setPlannedDates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [fetchedDateIdeas, fetchedPlannedDates, fetchedAchievements] = await Promise.all([
          getDateIdeas(),
          getPlannedDates(),
          getAchievements()
        ]);
        
        setDateIdeas(fetchedDateIdeas);
        setPlannedDates(fetchedPlannedDates);
        setAchievements(fetchedAchievements);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Calculate task statistics
  const todoCount = tasks.filter(task => task.status === TaskStatus.TODO).length;
  const inProgressCount = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
  const completedCount = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  
  // Get upcoming dates
  const upcomingDates = plannedDates
    .filter(date => !date.isComplete)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
  
  if (isLoading) {
    return <div className="loading">Loading dashboard data...</div>;
  }
  
  return (
    <>
      <Welcome>
        <h1>Welcome to Your Date Planner</h1>
        <p>Plan, organize, and enjoy perfect dates with your special someone</p>
        <Link to="/date-planner">
          <button>Plan a New Date</button>
        </Link>
      </Welcome>
      
      <DashboardContainer>
        <MainContent>
          <Section>
            <SectionHeader>
              <h2>Upcoming Dates</h2>
              <Link to="/calendar">View All</Link>
            </SectionHeader>
            
            {upcomingDates.length > 0 ? (
              upcomingDates.map(date => {
                const dateObj = parseISO(date.date);
                const isDateToday = isToday(dateObj);
                const isDatePast = isPast(dateObj) && !isDateToday;
                const isDateFuture = isFuture(dateObj);
                
                return (
                  <DateCard 
                    key={date.id} 
                    isToday={isDateToday}
                    isPast={isDatePast}
                  >
                    <DateInfo>
                      <h3>{date.title}</h3>
                      <p>{format(dateObj, 'EEEE, MMMM d, yyyy')}</p>
                      <div className="details">
                        <span>
                          <span role="img" aria-label="time">⏰</span>
                          {date.startTime} - {date.endTime}
                        </span>
                        <span>
                          <span role="img" aria-label="location">📍</span>
                          {date.location}
                        </span>
                      </div>
                    </DateInfo>
                    <DateBadge 
                      isToday={isDateToday}
                      isPast={isDatePast}
                    >
                      {isDateToday ? 'Today' : isDatePast ? 'Past' : 'Upcoming'}
                    </DateBadge>
                  </DateCard>
                );
              })
            ) : (
              <p>No upcoming dates scheduled. Time to plan one!</p>
            )}
          </Section>
          
          <Section>
            <SectionHeader>
              <h2>Date Ideas</h2>
              <Link to="/date-planner">View All</Link>
            </SectionHeader>
            
            <IdeasGrid>
              {dateIdeas.slice(0, 4).map(idea => (
                <IdeaCard key={idea.id}>
                  <h4>{idea.title}</h4>
                  <p>{idea.category}</p>
                  <div>
                    <span role="img" aria-label="cost">💰</span> ${idea.estimatedCost}
                  </div>
                  <div className="tags">
                    {idea.tags.slice(0, 2).map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </div>
                </IdeaCard>
              ))}
            </IdeasGrid>
          </Section>
        </MainContent>
        
        <Sidebar>
          <Section>
            <SectionHeader>
              <h2>Task Overview</h2>
              <Link to="/tasks">View All</Link>
            </SectionHeader>
            
            <TaskStats>
              <StatCard color="var(--warning-color)">
                <h3>{todoCount}</h3>
                <p>To Do</p>
              </StatCard>
              <StatCard color="var(--primary-color)">
                <h3>{inProgressCount}</h3>
                <p>In Progress</p>
              </StatCard>
              <StatCard color="var(--success-color)">
                <h3>{completedCount}</h3>
                <p>Completed</p>
              </StatCard>
            </TaskStats>
          </Section>
          
          <Section>
            <SectionHeader>
              <h2>Achievements</h2>
              <Link to="/game-center">View All</Link>
            </SectionHeader>
            
            {achievements.slice(0, 3).map(achievement => (
              <AchievementCard key={achievement.id} completed={achievement.completed}>
                <div className="achievement-icon">
                  {achievement.completed ? '🏆' : '🔶'}
                </div>
                <AchievementInfo>
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <ProgressBar 
                    progress={(achievement.progress / achievement.total) * 100}
                    completed={achievement.completed}
                  >
                    <div className="progress"></div>
                  </ProgressBar>
                </AchievementInfo>
              </AchievementCard>
            ))}
          </Section>
        </Sidebar>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;
