import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: var(--card-bg);
  padding: 16px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 8px;
`;

const NavLink = styled(Link)`
  padding: 8px 12px;
  border-radius: 4px;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  text-decoration: none;
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(67, 97, 238, 0.1)' : 'var(--border-color)'};
    color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  }
`;

const ThemeToggle = styled.button`
  background-color: transparent;
  border: none;
  color: var(--text-color);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: var(--border-color);
  }
`;

const Header = ({ toggleTheme, theme }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <Link to="/">
            <span role="img" aria-label="calendar">📅</span> Date Planner
          </Link>
        </Logo>
        
        <Nav>
          <NavLink to="/" active={isActive('/') ? 1 : 0}>Dashboard</NavLink>
          <NavLink to="/calendar" active={isActive('/calendar') ? 1 : 0}>Calendar</NavLink>
          <NavLink to="/date-planner" active={isActive('/date-planner') ? 1 : 0}>Plan Dates</NavLink>
          <NavLink to="/tasks" active={isActive('/tasks') ? 1 : 0}>Tasks</NavLink>
          <NavLink to="/game-center" active={isActive('/game-center') ? 1 : 0}>Game Center</NavLink>
          <NavLink to="/settings" active={isActive('/settings') ? 1 : 0}>Settings</NavLink>
          
          <ThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </ThemeToggle>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
