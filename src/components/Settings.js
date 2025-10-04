import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Import mock data functions
import { getUserPreferences } from '../data/mockData';

const SettingsContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SettingsHeader = styled.div`
  margin-bottom: 24px;
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
  
  p {
    color: var(--disabled-color);
  }
`;

const SettingsSection = styled.section`
  margin-bottom: 32px;
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-color);
    color: var(--text-color);
  }
  
  .hint {
    font-size: 0.8rem;
    color: var(--disabled-color);
    margin-top: 4px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 8px;
    width: auto;
  }
`;

const TimeRangeGroup = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  
  .day-label {
    font-weight: 500;
    width: 100px;
  }
  
  .time-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  input[type="time"] {
    width: 120px;
  }
  
  input[type="checkbox"] {
    width: auto;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const Tag = styled.div`
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  
  .remove-btn {
    cursor: pointer;
    color: var(--disabled-color);
    
    &:hover {
      color: var(--danger-color);
    }
  }
`;

const TagInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  input {
    flex: 1;
  }
  
  button {
    white-space: nowrap;
  }
`;

const ThemeToggleContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const ThemeOption = styled.div`
  flex: 1;
  background-color: ${props => props.isDark ? '#121212' : '#f8f9fa'};
  color: ${props => props.isDark ? '#e0e0e0' : '#212529'};
  border: 2px solid ${props => props.isActive ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-color);
  }
  
  .theme-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }
`;

const RangeSlider = styled.div`
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [newInterest, setNewInterest] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const preferences = await getUserPreferences();
        setSettings(preferences);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setIsLoading(false);
      }
    };
    
    fetchPreferences();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prev => {
      // For handling nested objects like budget
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'number' ? Number(value) : value
          }
        };
      }
      
      // For handling arrays like dateTypes
      if (type === 'checkbox' && Array.isArray(prev[name])) {
        if (checked) {
          return { ...prev, [name]: [...prev[name], value] };
        } else {
          return { ...prev, [name]: prev[name].filter(item => item !== value) };
        }
      }
      
      // For handling availability
      if (name.startsWith('availability.')) {
        const [_, day, prop] = name.split('.');
        return {
          ...prev,
          availability: {
            ...prev.availability,
            [day]: {
              ...prev.availability[day],
              [prop]: prop === 'available' ? checked : value
            }
          }
        };
      }
      
      // For normal values
      return { ...prev, [name]: type === 'checkbox' ? checked : value };
    });
  };
  
  const handleAddInterest = () => {
    if (newInterest.trim() && !settings.interests.includes(newInterest.trim())) {
      setSettings(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };
  
  const handleRemoveInterest = (interest) => {
    setSettings(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };
  
  const handleSaveSettings = () => {
    // In a real application, this would save to the database
    console.log('Saving settings:', settings);
    alert('Settings have been saved! In a real application, this would be saved to the database.');
  };
  
  const handleThemeChange = (theme) => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  };
  
  if (isLoading) {
    return <div className="loading">Loading settings...</div>;
  }
  
  return (
    <SettingsContainer>
      <SettingsHeader>
        <h2>Settings</h2>
        <p>Customize your Date Planner experience</p>
      </SettingsHeader>
      
      <SettingsSection>
        <h3>Appearance</h3>
        <FormGroup>
          <label>Theme</label>
          <ThemeToggleContainer>
            <ThemeOption 
              isDark={false} 
              isActive={settings.theme === 'light'}
              onClick={() => handleThemeChange('light')}
            >
              <div className="theme-icon">☀️</div>
              Light Mode
            </ThemeOption>
            <ThemeOption 
              isDark={true} 
              isActive={settings.theme === 'dark'}
              onClick={() => handleThemeChange('dark')}
            >
              <div className="theme-icon">🌙</div>
              Dark Mode
            </ThemeOption>
          </ThemeToggleContainer>
        </FormGroup>
      </SettingsSection>
      
      <SettingsSection>
        <h3>Date Preferences</h3>
        <FormGroup>
          <label>Preferred Date Types</label>
          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="dateTypes"
                value="Outdoor"
                checked={settings.dateTypes.includes('Outdoor')}
                onChange={handleInputChange}
              />
              Outdoor
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="dateTypes"
                value="Dining"
                checked={settings.dateTypes.includes('Dining')}
                onChange={handleInputChange}
              />
              Dining
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="dateTypes"
                value="Cultural"
                checked={settings.dateTypes.includes('Cultural')}
                onChange={handleInputChange}
              />
              Cultural
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="dateTypes"
                value="Entertainment"
                checked={settings.dateTypes.includes('Entertainment')}
                onChange={handleInputChange}
              />
              Entertainment
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="dateTypes"
                value="Casual"
                checked={settings.dateTypes.includes('Casual')}
                onChange={handleInputChange}
              />
              Casual
            </CheckboxLabel>
          </CheckboxGroup>
        </FormGroup>
        
        <FormGroup>
          <label>Budget Range</label>
          <RangeSlider>
            <div className="slider-container">
              <div className="value">${settings.budget.min}</div>
              <input
                type="range"
                name="budget.min"
                min="0"
                max="100"
                step="5"
                value={settings.budget.min}
                onChange={handleInputChange}
              />
              <div className="value">${settings.budget.min}</div>
            </div>
            <div className="slider-container">
              <div className="value">${settings.budget.max}</div>
              <input
                type="range"
                name="budget.max"
                min="0"
                max="500"
                step="10"
                value={settings.budget.max}
                onChange={handleInputChange}
              />
              <div className="value">${settings.budget.max}</div>
            </div>
          </RangeSlider>
        </FormGroup>
        
        <FormGroup>
          <label>Preferred Locations</label>
          <CheckboxGroup>
            {settings.locations.map(location => (
              <CheckboxLabel key={location}>
                <input
                  type="checkbox"
                  name="locations"
                  value={location}
                  checked={settings.locations.includes(location)}
                  onChange={handleInputChange}
                />
                {location}
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </FormGroup>
      </SettingsSection>
      
      <SettingsSection>
        <h3>Availability</h3>
        <p className="hint">Set your typical availability for planning dates</p>
        
        {Object.entries(settings.availability).map(([day, daySettings]) => (
          <TimeRangeGroup key={day}>
            <div className="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
            <CheckboxLabel>
              <input
                type="checkbox"
                name={`availability.${day}.available`}
                checked={daySettings.available}
                onChange={handleInputChange}
              />
              Available
            </CheckboxLabel>
            {daySettings.available && (
              <div className="time-inputs">
                <input
                  type="time"
                  name={`availability.${day}.startTime`}
                  value={daySettings.startTime}
                  onChange={handleInputChange}
                />
                to
                <input
                  type="time"
                  name={`availability.${day}.endTime`}
                  value={daySettings.endTime}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </TimeRangeGroup>
        ))}
      </SettingsSection>
      
      <SettingsSection>
        <h3>Interests</h3>
        <FormGroup>
          <label>Your Interests</label>
          <p className="hint">Add interests to get better date recommendations</p>
          
          <TagInput>
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add a new interest..."
            />
            <button onClick={handleAddInterest}>Add</button>
          </TagInput>
          
          <TagsContainer>
            {settings.interests.map((interest) => (
              <Tag key={interest}>
                {interest}
                <span 
                  className="remove-btn" 
                  onClick={() => handleRemoveInterest(interest)}
                >
                  ✕
                </span>
              </Tag>
            ))}
          </TagsContainer>
        </FormGroup>
      </SettingsSection>
      
      <SettingsSection>
        <h3>Notifications</h3>
        <FormGroup>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications || false}
              onChange={handleInputChange}
            />
            Email notifications for upcoming dates
          </CheckboxLabel>
        </FormGroup>
        <FormGroup>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="reminderNotifications"
              checked={settings.reminderNotifications || false}
              onChange={handleInputChange}
            />
            Reminder notifications 24 hours before dates
          </CheckboxLabel>
        </FormGroup>
      </SettingsSection>
      
      <ButtonGroup>
        <button className="secondary">Cancel</button>
        <button onClick={handleSaveSettings}>Save Settings</button>
      </ButtonGroup>
    </SettingsContainer>
  );
};

export default Settings;
