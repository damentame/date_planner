import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

// Import mock data functions
import { getDateIdeas, getUserPreferences } from '../data/mockData';

const DatePlannerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const MainContent = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
`;

const FilterSection = styled.div`
  margin-bottom: 24px;
`;

const FilterGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--text-color);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const RadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.checked ? 'var(--primary-color)' : 'var(--bg-color)'};
  color: ${props => props.checked ? 'white' : 'var(--text-color)'};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  input {
    display: none;
  }
  
  &:hover {
    background-color: ${props => props.checked ? 'var(--primary-color)' : 'var(--border-color)'};
  }
`;

const CheckboxContainer = styled.div`
  margin-bottom: 8px;
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  input {
    margin-right: 8px;
  }
  
  label {
    font-weight: normal;
    margin-bottom: 0;
  }
`;

const RangeSlider = styled.div`
  width: 100%;
  
  .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
  }
  
  input[type="range"] {
    flex-grow: 1;
    -webkit-appearance: none;
    height: 6px;
    border-radius: 3px;
    background: var(--border-color);
    outline: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--primary-color);
      cursor: pointer;
    }
  }
  
  .value {
    min-width: 48px;
    text-align: center;
    background-color: var(--bg-color);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9rem;
  }
`;

const DateIdeaList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const DateIdeaCard = styled.div`
  background-color: var(--bg-color);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DateIdeaContent = styled.div`
  padding: 16px;
`;

const DateIdeaCategory = styled.div`
  display: inline-block;
  background-color: var(--border-color);
  color: var(--text-color);
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 0.8rem;
  margin-bottom: 8px;
`;

const DateIdeaTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 8px;
`;

const DateIdeaDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  
  .detail {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    
    .label {
      color: var(--disabled-color);
    }
    
    .value {
      font-weight: 500;
    }
  }
`;

const DateIdeaDescription = styled.p`
  color: var(--text-color);
  font-size: 0.9rem;
  margin-bottom: 12px;
`;

const DateIdeaTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const DateIdeaTag = styled.span`
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const CreateDateButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 12px;
  width: 100%;
  cursor: pointer;
  
  &:hover {
    background-color: #e20e6c;
  }
`;

const NewDateForm = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  
  h2 {
    margin-bottom: 24px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
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

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 0;
  
  h3 {
    margin-bottom: 16px;
  }
  
  p {
    color: var(--disabled-color);
    margin-bottom: 24px;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 24px;
  
  input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-color);
    color: var(--text-color);
    font-size: 1rem;
    
    &::placeholder {
      color: var(--disabled-color);
    }
  }
`;

const DatePlanner = () => {
  const [dateIdeas, setDateIdeas] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [isCreatingDate, setIsCreatingDate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: [],
    cost: 100,
    duration: 'any',
    weather: [],
    tags: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // New date form state
  const [newDate, setNewDate] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '18:00',
    endTime: '21:00',
    location: '',
    notes: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ideas, preferences] = await Promise.all([
          getDateIdeas(),
          getUserPreferences()
        ]);
        
        setDateIdeas(ideas);
        setFilteredIdeas(ideas);
        setUserPreferences(preferences);
        
        // Initialize filters based on user preferences
        setFilters({
          category: preferences.dateTypes,
          cost: preferences.budget.max,
          duration: 'any',
          weather: [],
          tags: preferences.interests
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading date planner data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    if (dateIdeas.length === 0) return;
    
    // Apply filters and search
    let results = dateIdeas;
    
    // Apply category filter
    if (filters.category.length > 0) {
      results = results.filter(idea => filters.category.includes(idea.category));
    }
    
    // Apply cost filter
    results = results.filter(idea => idea.estimatedCost <= filters.cost);
    
    // Apply duration filter
    if (filters.duration !== 'any') {
      const durationMap = {
        'short': '2 hours',
        'medium': '3 hours',
        'long': '4 hours'
      };
      results = results.filter(idea => idea.duration === durationMap[filters.duration]);
    }
    
    // Apply weather filter
    if (filters.weather.length > 0) {
      results = results.filter(idea => 
        idea.idealWeather.some(weather => filters.weather.includes(weather))
      );
    }
    
    // Apply tag filter
    if (filters.tags.length > 0) {
      results = results.filter(idea => 
        idea.tags.some(tag => filters.tags.includes(tag))
      );
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(idea => 
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query) ||
        idea.category.toLowerCase().includes(query) ||
        idea.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredIdeas(results);
  }, [filters, searchQuery, dateIdeas]);
  
  const handleCategoryChange = (category) => {
    setFilters(prev => {
      const existing = prev.category.includes(category);
      return {
        ...prev,
        category: existing
          ? prev.category.filter(c => c !== category)
          : [...prev.category, category]
      };
    });
  };
  
  const handleCostChange = (cost) => {
    setFilters(prev => ({
      ...prev,
      cost
    }));
  };
  
  const handleDurationChange = (duration) => {
    setFilters(prev => ({
      ...prev,
      duration
    }));
  };
  
  const handleWeatherChange = (weather) => {
    setFilters(prev => {
      const existing = prev.weather.includes(weather);
      return {
        ...prev,
        weather: existing
          ? prev.weather.filter(w => w !== weather)
          : [...prev.weather, weather]
      };
    });
  };
  
  const handleTagChange = (tag) => {
    setFilters(prev => {
      const existing = prev.tags.includes(tag);
      return {
        ...prev,
        tags: existing
          ? prev.tags.filter(t => t !== tag)
          : [...prev.tags, tag]
      };
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSelectIdea = (ideaId) => {
    const selectedIdea = dateIdeas.find(idea => idea.id === ideaId);
    setSelectedIdeaId(ideaId);
    
    // Pre-fill new date form with idea details
    setNewDate(prev => ({
      ...prev,
      title: selectedIdea.title,
      location: selectedIdea.location
    }));
    
    setIsCreatingDate(true);
  };
  
  const handleNewDateChange = (e) => {
    const { name, value } = e.target;
    setNewDate(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateDate = (e) => {
    e.preventDefault();
    // In a real application, this would save the date to the database
    console.log('Creating new date:', newDate);
    alert('Date has been created! In a real application, this would be saved to the database.');
    
    // Reset the form
    setNewDate({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '18:00',
      endTime: '21:00',
      location: '',
      notes: ''
    });
    
    setIsCreatingDate(false);
    setSelectedIdeaId(null);
  };
  
  const handleCancelDateCreation = () => {
    setIsCreatingDate(false);
    setSelectedIdeaId(null);
  };
  
  if (isLoading) {
    return <div className="loading">Loading date planner...</div>;
  }
  
  // All possible categories, weather conditions, and tags from data
  const categories = Array.from(new Set(dateIdeas.map(idea => idea.category)));
  const weatherConditions = Array.from(new Set(dateIdeas.flatMap(idea => idea.idealWeather)));
  const allTags = Array.from(new Set(dateIdeas.flatMap(idea => idea.tags)));
  
  return (
    <>
      {isCreatingDate && (
        <NewDateForm>
          <h2>Plan Your Date</h2>
          <form onSubmit={handleCreateDate}>
            <div className="form-group">
              <label htmlFor="title">Date Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newDate.title}
                onChange={handleNewDateChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newDate.date}
                  onChange={handleNewDateChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newDate.location}
                  onChange={handleNewDateChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={newDate.startTime}
                  onChange={handleNewDateChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={newDate.endTime}
                  onChange={handleNewDateChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={newDate.notes}
                onChange={handleNewDateChange}
                placeholder="Add any special instructions or details for your date..."
              />
            </div>
            
            <div className="button-group">
              <button type="button" className="secondary" onClick={handleCancelDateCreation}>
                Cancel
              </button>
              <button type="submit">
                Create Date
              </button>
            </div>
          </form>
        </NewDateForm>
      )}
      
      <DatePlannerContainer>
        <Sidebar>
          <SectionTitle>Find the Perfect Date</SectionTitle>
          
          <SearchBar>
            <input
              type="text"
              placeholder="Search date ideas..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </SearchBar>
          
          <FilterSection>
            <FilterGroup>
              <label>Category</label>
              <RadioGroup>
                {categories.map((category) => (
                  <RadioLabel key={category} checked={filters.category.includes(category)}>
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    />
                    {category}
                  </RadioLabel>
                ))}
              </RadioGroup>
            </FilterGroup>
            
            <FilterGroup>
              <label>Maximum Budget: ${filters.cost}</label>
              <RangeSlider>
                <div className="slider-container">
                  <div className="value">$0</div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={filters.cost}
                    onChange={(e) => handleCostChange(Number(e.target.value))}
                  />
                  <div className="value">${filters.cost}</div>
                </div>
              </RangeSlider>
            </FilterGroup>
            
            <FilterGroup>
              <label>Duration</label>
              <RadioGroup>
                <RadioLabel checked={filters.duration === 'any'}>
                  <input
                    type="radio"
                    name="duration"
                    checked={filters.duration === 'any'}
                    onChange={() => handleDurationChange('any')}
                  />
                  Any
                </RadioLabel>
                <RadioLabel checked={filters.duration === 'short'}>
                  <input
                    type="radio"
                    name="duration"
                    checked={filters.duration === 'short'}
                    onChange={() => handleDurationChange('short')}
                  />
                  Short (&lt;2h)
                </RadioLabel>
                <RadioLabel checked={filters.duration === 'medium'}>
                  <input
                    type="radio"
                    name="duration"
                    checked={filters.duration === 'medium'}
                    onChange={() => handleDurationChange('medium')}
                  />
                  Medium (2-3h)
                </RadioLabel>
                <RadioLabel checked={filters.duration === 'long'}>
                  <input
                    type="radio"
                    name="duration"
                    checked={filters.duration === 'long'}
                    onChange={() => handleDurationChange('long')}
                  />
                  Long (&gt;3h)
                </RadioLabel>
              </RadioGroup>
            </FilterGroup>
            
            <FilterGroup>
              <label>Weather</label>
              <CheckboxContainer>
                {weatherConditions.map((weather) => (
                  <Checkbox key={weather}>
                    <input
                      type="checkbox"
                      id={`weather-${weather}`}
                      checked={filters.weather.includes(weather)}
                      onChange={() => handleWeatherChange(weather)}
                    />
                    <label htmlFor={`weather-${weather}`}>{weather}</label>
                  </Checkbox>
                ))}
              </CheckboxContainer>
            </FilterGroup>
            
            <FilterGroup>
              <label>Tags</label>
              <RadioGroup>
                {allTags.map((tag) => (
                  <RadioLabel key={tag} checked={filters.tags.includes(tag)}>
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                    />
                    {tag}
                  </RadioLabel>
                ))}
              </RadioGroup>
            </FilterGroup>
          </FilterSection>
        </Sidebar>
        
        <MainContent>
          <SectionTitle>Date Ideas ({filteredIdeas.length})</SectionTitle>
          
          {filteredIdeas.length > 0 ? (
            <DateIdeaList>
              {filteredIdeas.map(idea => (
                <DateIdeaCard key={idea.id}>
                  <DateIdeaContent>
                    <DateIdeaCategory>{idea.category}</DateIdeaCategory>
                    <DateIdeaTitle>{idea.title}</DateIdeaTitle>
                    <DateIdeaDetails>
                      <div className="detail">
                        <span role="img" aria-label="cost">💰</span>
                        <span className="value">${idea.estimatedCost}</span>
                      </div>
                      <div className="detail">
                        <span role="img" aria-label="time">⏱️</span>
                        <span className="value">{idea.duration}</span>
                      </div>
                      <div className="detail">
                        <span role="img" aria-label="location">📍</span>
                        <span className="value">{idea.location}</span>
                      </div>
                      <div className="detail">
                        <span role="img" aria-label="weather">🌤️</span>
                        <span className="value">
                          {idea.idealWeather.includes('Any') 
                            ? 'Any Weather' 
                            : idea.idealWeather.join(', ')}
                        </span>
                      </div>
                    </DateIdeaDetails>
                    <DateIdeaDescription>
                      {idea.description}
                    </DateIdeaDescription>
                    <DateIdeaTags>
                      {idea.tags.map((tag, index) => (
                        <DateIdeaTag key={index}>{tag}</DateIdeaTag>
                      ))}
                    </DateIdeaTags>
                    <CreateDateButton onClick={() => handleSelectIdea(idea.id)}>
                      Plan This Date
                    </CreateDateButton>
                  </DateIdeaContent>
                </DateIdeaCard>
              ))}
            </DateIdeaList>
          ) : (
            <EmptyState>
              <h3>No matching date ideas</h3>
              <p>Try adjusting your filters to see more options</p>
              <button onClick={() => setFilters({
                category: [],
                cost: 100,
                duration: 'any',
                weather: [],
                tags: []
              })}>
                Reset Filters
              </button>
            </EmptyState>
          )}
        </MainContent>
      </DatePlannerContainer>
    </>
  );
};

export default DatePlanner;
