import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Import mock data functions
import { getAchievements } from '../data/mockData';

const GameCenterContainer = styled.div`
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
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    font-size: 1.5rem;
    margin: 0;
  }
`;

const AchievementCard = styled.div`
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  gap: 20px;
  align-items: center;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &.completed {
    border: 1px solid var(--accent-color);
  }
`;

const AchievementIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${props => props.completed ? 'var(--accent-color)' : 'var(--border-color)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: ${props => props.completed ? 'white' : 'var(--disabled-color)'};
`;

const AchievementContent = styled.div`
  flex: 1;
`;

const AchievementTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 4px;
`;

const AchievementDescription = styled.p`
  color: var(--text-color);
  margin-bottom: 12px;
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  
  .progress {
    height: 100%;
    background-color: ${props => props.completed ? 'var(--accent-color)' : 'var(--primary-color)'};
    width: ${props => props.progress}%;
  }
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--disabled-color);
  font-size: 0.8rem;
`;

const RewardText = styled.div`
  margin-top: 12px;
  font-size: 0.9rem;
  
  span {
    color: ${props => props.completed ? 'var(--accent-color)' : 'var(--primary-color)'};
    font-weight: 500;
  }
`;

const StatsCard = styled.div`
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: var(--disabled-color);
  font-size: 0.9rem;
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const BadgeCard = styled.div`
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  opacity: ${props => props.unlocked ? '1' : '0.5'};
`;

const BadgeIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 8px;
`;

const BadgeName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 0.9rem;
`;

const BadgeDescription = styled.div`
  color: var(--disabled-color);
  font-size: 0.8rem;
`;

const DailyChallenge = styled.div`
  background-color: var(--primary-color);
  border-radius: 8px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 8px;
  }
  
  p {
    opacity: 0.9;
    margin-bottom: 16px;
  }
  
  button {
    background-color: white;
    color: var(--primary-color);
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.9);
    }
  }
`;

const LeaderboardEntry = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
  
  .rank {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${props => {
      if (props.rank === 1) return 'gold';
      if (props.rank === 2) return 'silver';
      if (props.rank === 3) return '#cd7f32';
      return 'var(--border-color)';
    }};
    color: ${props => props.rank <= 3 ? 'white' : 'var(--text-color)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 12px;
  }
  
  .name {
    flex: 1;
  }
  
  .points {
    font-weight: bold;
    color: var(--primary-color);
  }
`;

const GameCenter = () => {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const fetchedAchievements = await getAchievements();
        setAchievements(fetchedAchievements);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading achievements:', error);
        setIsLoading(false);
      }
    };
    
    fetchAchievements();
  }, []);
  
  // Calculate game stats
  const totalAchievements = achievements.length;
  const completedAchievements = achievements.filter(a => a.completed).length;
  const completionPercentage = totalAchievements > 0 
    ? Math.round((completedAchievements / totalAchievements) * 100) 
    : 0;
  
  // Mock badges data
  const badges = [
    {
      id: 1,
      name: 'Date Master',
      description: 'Plan 5 successful dates',
      icon: '🏆',
      unlocked: true
    },
    {
      id: 2,
      name: 'Romantic',
      description: 'Complete 3 romantic dates',
      icon: '❤️',
      unlocked: true
    },
    {
      id: 3,
      name: 'Adventurer',
      description: 'Complete 3 outdoor activities',
      icon: '🏕️',
      unlocked: false
    },
    {
      id: 4,
      name: 'Foodie',
      description: 'Visit 5 different restaurants',
      icon: '🍽️',
      unlocked: false
    }
  ];
  
  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Alex', points: 720 },
    { rank: 2, name: 'Jordan', points: 645 },
    { rank: 3, name: 'Taylor', points: 590 },
    { rank: 4, name: 'Casey', points: 510 },
    { rank: 5, name: 'Morgan', points: 485 }
  ];
  
  if (isLoading) {
    return <div className="loading">Loading game center...</div>;
  }
  
  return (
    <GameCenterContainer>
      <MainContent>
        <DailyChallenge>
          <h3>Daily Challenge</h3>
          <p>Plan a surprise date for your special someone within the next 24 hours</p>
          <button>Accept Challenge</button>
        </DailyChallenge>
        
        <Section>
          <SectionHeader>
            <h2>Achievements</h2>
          </SectionHeader>
          
          {achievements.map(achievement => {
            const progressPercentage = (achievement.progress / achievement.total) * 100;
            
            return (
              <AchievementCard
                key={achievement.id}
                className={achievement.completed ? 'completed' : ''}
              >
                <AchievementIcon completed={achievement.completed}>
                  {achievement.completed ? '🏆' : '🔶'}
                </AchievementIcon>
                <AchievementContent>
                  <AchievementTitle>{achievement.title}</AchievementTitle>
                  <AchievementDescription>
                    {achievement.description}
                  </AchievementDescription>
                  <ProgressBar
                    progress={progressPercentage}
                    completed={achievement.completed}
                  >
                    <div className="progress"></div>
                  </ProgressBar>
                  <ProgressText>
                    <span>Progress</span>
                    <span>
                      {achievement.progress} / {achievement.total}
                    </span>
                  </ProgressText>
                  <RewardText completed={achievement.completed}>
                    Reward: <span>{achievement.reward}</span>
                  </RewardText>
                </AchievementContent>
              </AchievementCard>
            );
          })}
        </Section>
      </MainContent>
      
      <Sidebar>
        <Section>
          <SectionHeader>
            <h2>Your Stats</h2>
          </SectionHeader>
          
          <StatsCard>
            <StatValue>{completedAchievements}</StatValue>
            <StatLabel>Achievements Completed</StatLabel>
          </StatsCard>
          
          <StatsCard>
            <StatValue>{completionPercentage}%</StatValue>
            <StatLabel>Completion Rate</StatLabel>
          </StatsCard>
          
          <StatsCard>
            <StatValue>3</StatValue>
            <StatLabel>Date Streaks</StatLabel>
          </StatsCard>
        </Section>
        
        <Section>
          <SectionHeader>
            <h2>Your Badges</h2>
          </SectionHeader>
          
          <BadgeGrid>
            {badges.map(badge => (
              <BadgeCard key={badge.id} unlocked={badge.unlocked}>
                <BadgeIcon>{badge.icon}</BadgeIcon>
                <BadgeName>{badge.name}</BadgeName>
                <BadgeDescription>{badge.description}</BadgeDescription>
              </BadgeCard>
            ))}
          </BadgeGrid>
        </Section>
        
        <Section>
          <SectionHeader>
            <h2>Leaderboard</h2>
          </SectionHeader>
          
          {leaderboard.map(entry => (
            <LeaderboardEntry key={entry.rank} rank={entry.rank}>
              <div className="rank">{entry.rank}</div>
              <div className="name">{entry.name}</div>
              <div className="points">{entry.points} pts</div>
            </LeaderboardEntry>
          ))}
        </Section>
      </Sidebar>
    </GameCenterContainer>
  );
};

export default GameCenter;
