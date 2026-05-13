'use client';

import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [activeBookingTab, setActiveBookingTab] = useState('calendar');
  const [selectedVenue, setSelectedVenue] = useState('main-tennis');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', section: 'Main' },
    { id: 'bookings', label: 'Booking Management', icon: 'fa-calendar-check', section: 'Main' },
    { id: 'financials', label: 'Financial Management', icon: 'fa-wallet', section: 'Main' },
    { id: 'inventory', label: 'Inventory', icon: 'fa-box-open', section: 'Operations' },
    { id: 'contracts', label: 'Contracts', icon: 'fa-file-signature', section: 'Operations' },
    { id: 'clients', label: 'Clients', icon: 'fa-users', section: 'Operations' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line', section: 'Insights & Support' },
    { id: 'reviews', label: 'Reviews', icon: 'fa-star', section: 'Insights & Support' },
    { id: 'users', label: 'Users & Staff', icon: 'fa-user-shield', section: 'Insights & Support' },
    { id: 'tickets', label: 'Tickets', icon: 'fa-ticket', section: 'Insights & Support' },
  ];

  const renderBookingContent = () => {
    return (
      <div className="view active booking-layout">
        <div className="view-header" style={{ marginBottom: '1rem' }}>
          <h1>Booking Management</h1>
          <button className="btn-primary"><i className="fa-solid fa-plus"></i> New Booking</button>
        </div>

        <div className="venue-selector">
          <label style={{color: 'var(--text-secondary)', fontWeight: 500}}>Select Venue:</label>
          <select 
            className="venue-dropdown" 
            value={selectedVenue} 
            onChange={(e) => setSelectedVenue(e.target.value)}
          >
            <option value="main-tennis">Main Tennis Courts</option>
            <option value="indoor-badminton">Indoor Badminton Arena</option>
            <option value="cricket-nets">Cricket Nets Complex</option>
            <option value="swimming-pool">Olympic Swimming Pool</option>
          </select>
          <button className="btn-text" style={{marginLeft: 'auto'}}><i className="fa-solid fa-gear"></i> Manage Venues</button>
        </div>

        <div className="inner-tabs">
          {[
            { id: 'calendar', label: 'Calendar/Slots' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'documents', label: 'Documents' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'reviews', label: 'Reviews' },
          ].map(tab => (
            <button 
              key={tab.id}
              className={`inner-tab ${activeBookingTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveBookingTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="booking-content">
          {activeBookingTab === 'calendar' && (
            <div>
              <div className="calendar-header">
                <h3>Today's Schedule</h3>
                <div className="date-filter">
                  <span>Wed, May 13</span>
                  <i className="fa-solid fa-calendar"></i>
                </div>
              </div>
              <div className="calendar-grid">
                <div className="calendar-cell header">Time</div>
                <div className="calendar-cell header">Court 1</div>
                <div className="calendar-cell header">Court 2</div>
                <div className="calendar-cell header">Court 3</div>
                <div className="calendar-cell header">Court 4</div>
                <div className="calendar-cell header">Court 5</div>
                <div className="calendar-cell header">Court 6</div>

                <div className="calendar-cell time">16:00</div>
                <div className="calendar-cell"><div className="slot booked">Amit Sharma</div></div>
                <div className="calendar-cell"><div className="slot">Available</div></div>
                <div className="calendar-cell"><div className="slot booked">Coaching</div></div>
                <div className="calendar-cell"><div className="slot blocked">Maintenance</div></div>
                <div className="calendar-cell"><div className="slot">Available</div></div>
                <div className="calendar-cell"><div className="slot">Available</div></div>

                <div className="calendar-cell time">17:00</div>
                <div className="calendar-cell"><div className="slot">Available</div></div>
                <div className="calendar-cell"><div className="slot booked">Rahul V.</div></div>
                <div className="calendar-cell"><div className="slot booked">Coaching</div></div>
                <div className="calendar-cell"><div className="slot blocked">Maintenance</div></div>
                <div className="calendar-cell"><div className="slot booked">Tournament</div></div>
                <div className="calendar-cell"><div className="slot booked">Tournament</div></div>
              </div>
            </div>
          )}

          {activeBookingTab === 'inventory' && (
            <div>
              <div className="calendar-header">
                <h3>Venue Inventory</h3>
                <button className="btn-primary"><i className="fa-solid fa-plus"></i> Add Product</button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Wilson Pro Tennis Balls (Can)</td>
                      <td>Consumables</td>
                      <td>
                        <div className="qty-control">
                          <button className="qty-btn"><i className="fa-solid fa-minus"></i></button>
                          <span className="qty-value">42</span>
                          <button className="qty-btn"><i className="fa-solid fa-plus"></i></button>
                        </div>
                      </td>
                      <td><span className="status-badge success">In Stock</span></td>
                    </tr>
                    <tr>
                      <td>Babolat Pure Drive Rackets (Rentals)</td>
                      <td>Equipment</td>
                      <td>
                        <div className="qty-control">
                          <button className="qty-btn"><i className="fa-solid fa-minus"></i></button>
                          <span className="qty-value">12</span>
                          <button className="qty-btn"><i className="fa-solid fa-plus"></i></button>
                        </div>
                      </td>
                      <td><span className="status-badge success">In Stock</span></td>
                    </tr>
                    <tr>
                      <td>Grip Tapes</td>
                      <td>Accessories</td>
                      <td>
                        <div className="qty-control">
                          <button className="qty-btn"><i className="fa-solid fa-minus"></i></button>
                          <span className="qty-value">5</span>
                          <button className="qty-btn"><i className="fa-solid fa-plus"></i></button>
                        </div>
                      </td>
                      <td><span className="status-badge warning">Low Stock</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeBookingTab === 'documents' && (
            <div>
              <div className="calendar-header">
                <h3>Agreements & Contracts</h3>
                <button className="btn-primary"><i className="fa-solid fa-upload"></i> Upload</button>
              </div>
              <div className="document-list">
                <div className="document-item">
                  <div className="doc-info">
                    <i className="fa-solid fa-file-pdf doc-icon"></i>
                    <div>
                      <h4 style={{marginBottom: '0.25rem'}}>Annual Maintenance Contract 2026</h4>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Expires in 45 days • Added Jan 1, 2026</p>
                    </div>
                  </div>
                  <button className="btn-text"><i className="fa-solid fa-bell"></i> Trigger Notification</button>
                </div>
                <div className="document-item">
                  <div className="doc-info">
                    <i className="fa-solid fa-file-contract doc-icon" style={{color: 'var(--accent-blue)'}}></i>
                    <div>
                      <h4 style={{marginBottom: '0.25rem'}}>Head Coach Agreement - Vikram S.</h4>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Active • Added Mar 15, 2025</p>
                    </div>
                  </div>
                  <button className="btn-text"><i className="fa-solid fa-bell"></i> Trigger Notification</button>
                </div>
                <div className="document-item">
                  <div className="doc-info">
                    <i className="fa-solid fa-file-image doc-icon" style={{color: 'var(--accent-green)'}}></i>
                    <div>
                      <h4 style={{marginBottom: '0.25rem'}}>Venue Liability Insurance</h4>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Expires in 8 months • Added Dec 10, 2025</p>
                    </div>
                  </div>
                  <button className="btn-text"><i className="fa-solid fa-bell"></i> Trigger Notification</button>
                </div>
              </div>
            </div>
          )}

          {activeBookingTab === 'transactions' && (
            <div>
               <div className="calendar-header">
                <h3>Venue Transactions</h3>
                <button className="btn-text"><i className="fa-solid fa-download"></i> Export</button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>May 13, 2026</td>
                      <td>Court 1 Booking - Amit S.</td>
                      <td><span className="status-badge success">Credit (CR)</span></td>
                      <td style={{color: 'var(--accent-green)', fontWeight: 600}}>+₹800</td>
                    </tr>
                    <tr>
                      <td>May 12, 2026</td>
                      <td>Weekly Net Replacement</td>
                      <td><span className="status-badge warning">Debit (DR)</span></td>
                      <td style={{color: 'var(--text-secondary)'}}>-₹2,500</td>
                    </tr>
                    <tr>
                      <td>May 12, 2026</td>
                      <td>Corporate Event - TechCorp</td>
                      <td><span className="status-badge success">Credit (CR)</span></td>
                      <td style={{color: 'var(--accent-green)', fontWeight: 600}}>+₹15,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeBookingTab === 'reviews' && (
            <div>
              <div className="calendar-header">
                <h3>Consolidated Reviews</h3>
                <div className="date-filter">
                  <span>Rating: All</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
              </div>
              <div className="document-list">
                <div className="review-item">
                  <div className="review-header">
                    <div style={{fontWeight: 600}}>Priya Patel</div>
                    <div className="stars">
                      <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star-half-stroke"></i>
                    </div>
                  </div>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Booking: Badminton Court 3</p>
                  <p style={{fontSize: '0.95rem'}}>Great courts, well maintained. The lighting is perfect for evening games.</p>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <div style={{fontWeight: 600}}>Vikram Singh</div>
                    <div className="stars">
                      <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-regular fa-star"></i>
                    </div>
                  </div>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Booking: Cricket Nets</p>
                  <p style={{fontSize: '0.95rem'}}>Good nets but the bowling machine was slightly misaligned. Staff fixed it quickly though.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="view active" id="dashboard-view">
            <div className="view-header">
                <div>
                    <h1>Overview</h1>
                    <p className="subtitle">Welcome back, here's what's happening at your academy today.</p>
                </div>
                <div className="date-filter">
                    <span>Today</span>
                    <i className="fa-solid fa-chevron-down"></i>
                </div>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon blue">
                        <i className="fa-solid fa-indian-rupee-sign"></i>
                    </div>
                    <div className="metric-info">
                        <h3>Total Revenue</h3>
                        <div className="metric-value">₹45,200</div>
                        <div className="metric-trend positive">
                            <i className="fa-solid fa-arrow-trend-up"></i>
                            <span>+12.5%</span> from last week
                        </div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon purple">
                        <i className="fa-solid fa-calendar-day"></i>
                    </div>
                    <div className="metric-info">
                        <h3>Active Bookings</h3>
                        <div className="metric-value">24</div>
                        <div className="metric-trend positive">
                            <i className="fa-solid fa-arrow-trend-up"></i>
                            <span>+4</span> from yesterday
                        </div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon orange">
                        <i className="fa-solid fa-user-plus"></i>
                    </div>
                    <div className="metric-info">
                        <h3>New Clients</h3>
                        <div className="metric-value">12</div>
                        <div className="metric-trend neutral">
                            <i className="fa-solid fa-minus"></i>
                            <span>Same</span> as last week
                        </div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon red">
                        <i className="fa-solid fa-box"></i>
                    </div>
                    <div className="metric-info">
                        <h3>Low Inventory</h3>
                        <div className="metric-value">5 Items</div>
                        <div className="metric-trend negative">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>Action Required</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-widgets">
                <div className="widget">
                    <div className="widget-header">
                        <h2>Upcoming Bookings</h2>
                        <button className="btn-text">View All</button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Venue/Court</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="client-cell">
                                            <div className="avatar">A</div>
                                            <span>Amit Sharma</span>
                                        </div>
                                    </td>
                                    <td>Tennis Court 1</td>
                                    <td>16:00 - 17:00</td>
                                    <td><span className="status-badge success">Confirmed</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="client-cell">
                                            <div className="avatar">P</div>
                                            <span>Priya Patel</span>
                                        </div>
                                    </td>
                                    <td>Badminton Court 3</td>
                                    <td>17:30 - 18:30</td>
                                    <td><span className="status-badge warning">Pending</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="client-cell">
                                            <div className="avatar">V</div>
                                            <span>Vikram Singh</span>
                                        </div>
                                    </td>
                                    <td>Cricket Nets - Fast</td>
                                    <td>18:00 - 20:00</td>
                                    <td><span className="status-badge success">Confirmed</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="client-cell">
                                            <div className="avatar">N</div>
                                            <span>Neha Gupta</span>
                                        </div>
                                    </td>
                                    <td>Swimming Pool</td>
                                    <td>19:00 - 20:00</td>
                                    <td><span className="status-badge success">Confirmed</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="widget">
                    <div className="widget-header">
                        <h2>Revenue Inflow Breakdown</h2>
                        <button className="btn-text"><i className="fa-solid fa-ellipsis"></i></button>
                    </div>
                    <div className="chart-mockup">
                        <div className="progress-bar-group">
                            <div className="progress-label">
                                <span>Book & Play</span>
                                <span>₹20,000</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{width: '60%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'}}></div>
                            </div>
                        </div>
                        <div className="progress-bar-group">
                            <div className="progress-label">
                                <span>Coaching & Training</span>
                                <span>₹12,500</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{width: '40%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)'}}></div>
                            </div>
                        </div>
                        <div className="progress-bar-group">
                            <div className="progress-label">
                                <span>Corporate Schemes</span>
                                <span>₹8,200</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{width: '25%', background: 'linear-gradient(90deg, #10b981, #34d399)'}}></div>
                            </div>
                        </div>
                        <div className="progress-bar-group">
                            <div className="progress-label">
                                <span>Walk-ins</span>
                                <span>₹4,500</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{width: '15%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'bookings':
        return renderBookingContent();
      default:
        const currentItem = navItems.find(item => item.id === activeTab);
        return (
          <div className="view active">
              <div className="view-header">
                  <h1>{currentItem?.label}</h1>
                  {activeTab === 'financials' && <button className="btn-primary"><i className="fa-solid fa-download"></i> Export Report</button>}
              </div>
              <div className="placeholder-content">
                  <i className={`fa-solid ${currentItem?.icon} icon-large`}></i>
                  <h2>{currentItem?.label} Area</h2>
                  <p>This module is currently under development. Content will be available here soon.</p>
              </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
          <div className="brand">
              <div className="logo">
                  <i className="fa-solid fa-bolt"></i>
              </div>
              <h2>Play<span className="highlight">Metric</span></h2>
          </div>

          <nav className="nav-menu">
            {['Main', 'Operations', 'Insights & Support'].map((sectionName) => (
                <div key={sectionName}>
                    <div className="nav-section">{sectionName}</div>
                    {navItems.filter(item => item.section === sectionName).map((item) => (
                        <button 
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`} 
                            onClick={() => setActiveTab(item.id)}
                        >
                            <i className={`fa-solid ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            ))}
          </nav>
      </aside>

      <main className="main-content">
          <header className="top-header">
              <div className="search-bar">
                  <i className="fa-solid fa-search"></i>
                  <input type="text" placeholder="Search bookings, clients, or inventory..." />
              </div>
              <div className="header-actions">
                  <button className="icon-btn">
                      <i className="fa-solid fa-bell"></i>
                      <span className="badge">3</span>
                  </button>
                  <div className="user-profile">
                      <img src="https://i.pravatar.cc/150?img=11" alt="Admin User" />
                      <div className="user-info">
                          <span className="name">Rohan Mehta</span>
                          <span className="role">Academy Owner</span>
                      </div>
                  </div>
              </div>
          </header>

          <div className="views-container">
              {renderContent()}
          </div>
      </main>
    </div>
  );
}
