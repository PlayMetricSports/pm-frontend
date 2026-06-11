'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [theme, setTheme] = useState('dark');

  // Load theme preference on mount
  useEffect(() => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(activeTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Dismiss dropdown on outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Derive display name
  const getDisplayName = () => {
    if (!user) return 'Admin User';
    const first = user.firstName || user.name?.firstName || user.userId?.name?.firstName;
    const last = user.lastName || user.name?.lastName || user.userId?.name?.lastName;
    if (first) {
      return `${first} ${last || ''}`.trim();
    }
    return user.email || 'Admin User';
  };

  // Derive role/designation
  const getRole = () => {
    if (!user) return 'Academy Owner';
    return user.designation || user.employeeDetails?.designation || user.userRole || user.userRoleName || 'Staff Member';
  };

  // Get initial for avatar
  const getInitial = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="top-header">
      <div className="search-bar">
        <i className="fa-solid fa-search"></i>
        <input type="text" placeholder="Search (coming soon)..." disabled style={{ cursor: 'not-allowed', opacity: 0.6 }} />
      </div>
      <div className="header-actions">
        <button 
          className="icon-btn theme-toggle" 
          onClick={toggleTheme} 
          aria-label="Toggle Theme"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <i className={theme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon'}></i>
        </button>
        <button className="icon-btn">
          <i className="fa-solid fa-bell"></i>
        </button>
        
        <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div 
            className="user-profile" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div className="avatar-header">
              {getInitial()}
            </div>
            <div className="user-info">
              <span className="name">{getDisplayName()}</span>
              <span className="role">{getRole()}</span>
            </div>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}></i>
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-user-card">
                <div className="dropdown-avatar" style={{ background: `linear-gradient(135deg, ${user?.userRole === 'admin' ? '#3b82f6, #60a5fa' : '#8b5cf6, #a78bfa'})` }}>
                  {getInitial()}
                </div>
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{getDisplayName()}</span>
                  <span className="dropdown-role">{getRole()}</span>
                  <span className="dropdown-email">{user?.email}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => { setDropdownOpen(false); }}>
                  <i className="fa-solid fa-user-gear"></i>
                  <span>Account Settings</span>
                </button>
                <button className="dropdown-item logout" onClick={() => { setDropdownOpen(false); logout(); }}>
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .avatar-header {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          margin-right: 8px;
        }

      `}</style>
    </header>
  );
}
