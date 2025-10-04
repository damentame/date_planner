import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  getDay
} from 'date-fns';

// Import mock data
import { getPlannedDates } from '../data/mockData';

const CalendarContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const CalendarHeader = styled.div`
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
    gap: 8px;
  }
  
  button {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
      background-color: var(--bg-color);
    }
  }
  
  .today-button {
    background-color: var(--primary-color);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    margin-right: 16px;
    
    &:hover {
      background-color: var(--secondary-color);
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const WeekdayHeader = styled.div`
  text-align: center;
  font-weight: 500;
  padding: 8px;
  color: var(--disabled-color);
  font-size: 0.9rem;
`;

const CalendarDay = styled.div`
  aspect-ratio: 1;
  padding: 8px;
  border-radius: 8px;
  background-color: ${props => {
    if (props.isSelected) return 'var(--primary-color)';
    if (props.isToday) return 'rgba(67, 97, 238, 0.1)';
    if (props.isCurrentMonth) return 'var(--bg-color)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.isSelected) return 'white';
    if (!props.isCurrentMonth) return 'var(--disabled-color)';
    return 'var(--text-color)';
  }};
  cursor: pointer;
  position: relative;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'var(--primary-color)' : 'var(--border-color)'};
  }
  
  .day-number {
    font-weight: ${props => (props.isToday || props.hasEvents) ? '700' : '400'};
    font-size: 1rem;
  }
  
  .events-indicator {
    display: flex;
    gap: 4px;
    margin-top: 4px;
    justify-content: center;
  }
`;

const EventDot = styled.div`
  height: 6px;
  width: 6px;
  border-radius: 50%;
  background-color: ${props => props.isSelected ? 'white' : 'var(--accent-color)'};
`;

const EventsPanel = styled.div`
  margin-top: 24px;
  
  h3 {
    margin-bottom: 16px;
    font-size: 1.2rem;
  }
`;

const EventCard = styled.div`
  padding: 16px;
  background-color: var(--bg-color);
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 4px solid var(--accent-color);
  
  h4 {
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
  
  .event-time {
    color: var(--disabled-color);
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  
  .event-location {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 0.9rem;
  }
  
  .event-notes {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
    font-size: 0.9rem;
    font-style: italic;
    color: var(--disabled-color);
  }
`;

const NoEventsMessage = styled.div`
  text-align: center;
  padding: 32px 0;
  color: var(--disabled-color);
`;

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plannedDates, setPlannedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const dates = await getPlannedDates();
        setPlannedDates(dates);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dates:', error);
        setIsLoading(false);
      }
    };
    
    fetchDates();
  }, []);
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  // Get days to display
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get start day of week (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = getDay(monthStart);
  
  // Create calendar days array with leading/trailing dates for a complete grid
  const calendarDays = [];
  
  // Add days from previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push({
      date: subMonths(monthStart, 1),
      isCurrentMonth: false
    });
  }
  
  // Add days from current month
  daysInMonth.forEach(day => {
    calendarDays.push({
      date: day,
      isCurrentMonth: true
    });
  });
  
  // Add days to complete the grid (6 rows x 7 days)
  const remaining = 42 - calendarDays.length;
  for (let i = 0; i < remaining; i++) {
    calendarDays.push({
      date: addMonths(monthEnd, 1),
      isCurrentMonth: false
    });
  }
  
  // Get events for the selected date
  const eventsForSelectedDate = plannedDates.filter(date => 
    isSameDay(parseISO(date.date), selectedDate)
  );
  
  // Get events for each day
  const getEventsForDay = (day) => {
    return plannedDates.filter(date => isSameDay(parseISO(date.date), day));
  };
  
  if (isLoading) {
    return <div className="loading">Loading calendar...</div>;
  }
  
  return (
    <div>
      <CalendarContainer>
        <CalendarHeader>
          <h2>{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="controls">
            <button className="today-button" onClick={goToToday}>Today</button>
            <button onClick={prevMonth}>&lt;</button>
            <button onClick={nextMonth}>&gt;</button>
          </div>
        </CalendarHeader>
        
        <CalendarGrid>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <WeekdayHeader key={day}>{day}</WeekdayHeader>
          ))}
          
          {calendarDays.map((day, index) => {
            const isToday = isSameDay(day.date, new Date());
            const isSelected = isSameDay(day.date, selectedDate);
            const eventsForDay = getEventsForDay(day.date);
            const hasEvents = eventsForDay.length > 0;
            
            return (
              <CalendarDay 
                key={index}
                isCurrentMonth={day.isCurrentMonth}
                isToday={isToday}
                isSelected={isSelected}
                hasEvents={hasEvents}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="day-number">{format(day.date, 'd')}</div>
                {hasEvents && (
                  <div className="events-indicator">
                    {eventsForDay.slice(0, 3).map((_, i) => (
                      <EventDot key={i} isSelected={isSelected} />
                    ))}
                  </div>
                )}
              </CalendarDay>
            );
          })}
        </CalendarGrid>
      </CalendarContainer>
      
      <EventsPanel>
        <h3>Events for {format(selectedDate, 'MMMM d, yyyy')}</h3>
        
        {eventsForSelectedDate.length > 0 ? (
          eventsForSelectedDate.map(event => (
            <EventCard key={event.id}>
              <h4>{event.title}</h4>
              <div className="event-time">
                {event.startTime} - {event.endTime}
              </div>
              <div className="event-location">
                <span role="img" aria-label="location">📍</span>
                {event.location}
              </div>
              {event.notes && (
                <div className="event-notes">
                  {event.notes}
                </div>
              )}
            </EventCard>
          ))
        ) : (
          <NoEventsMessage>
            No events scheduled for this day.
          </NoEventsMessage>
        )}
      </EventsPanel>
    </div>
  );
};

export default Calendar;
