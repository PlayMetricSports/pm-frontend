export default function DashboardOverviewPage() {
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
}
