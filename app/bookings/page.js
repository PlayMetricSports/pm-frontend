'use client';
import { useState } from 'react';

export default function BookingsPage() {
  const [activeBookingTab, setActiveBookingTab] = useState('calendar');
  const [selectedVenue, setSelectedVenue] = useState('main-tennis');

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
                <h3>Today&apos;s Schedule</h3>
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
}
