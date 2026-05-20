export default function AnalyticsPage() {
  return (
      <div className="view active">
        <div className="view-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1>Business Analytics</h1>
            <p className="subtitle">Data-driven insights for venue performance</p>
          </div>
          <div className="date-filter">
              <span>This Month</span>
              <i className="fa-solid fa-calendar"></i>
          </div>
        </div>

        <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="metric-card">
                <div className="metric-icon purple"><i className="fa-solid fa-percent"></i></div>
                <div className="metric-info">
                    <h3>Overall Utilization</h3>
                    <div className="metric-value">68%</div>
                    <div className="metric-trend positive"><i className="fa-solid fa-arrow-trend-up"></i><span>+5% vs last month</span></div>
                </div>
            </div>
            <div className="metric-card">
                <div className="metric-icon green"><i className="fa-solid fa-users-viewfinder"></i></div>
                <div className="metric-info">
                    <h3>Retention Rate</h3>
                    <div className="metric-value">82%</div>
                    <div className="metric-trend positive"><i className="fa-solid fa-arrow-trend-up"></i><span>+2% vs last month</span></div>
                </div>
            </div>
            <div className="metric-card">
                <div className="metric-icon orange"><i className="fa-solid fa-clock"></i></div>
                <div className="metric-info">
                    <h3>Avg Booking Duration</h3>
                    <div className="metric-value">1.5 hrs</div>
                    <div className="metric-trend neutral"><i className="fa-solid fa-minus"></i><span>Same</span></div>
                </div>
            </div>
            <div className="metric-card">
                <div className="metric-icon blue"><i className="fa-solid fa-indian-rupee-sign"></i></div>
                <div className="metric-info">
                    <h3>RevPAR (Per Available Resource)</h3>
                    <div className="metric-value">₹450/hr</div>
                    <div className="metric-trend positive"><i className="fa-solid fa-arrow-trend-up"></i><span>+₹25 vs last month</span></div>
                </div>
            </div>
        </div>

        <div className="dashboard-widgets">
            <div className="widget">
                <div className="widget-header">
                    <h2>Peak Hours Analysis</h2>
                    <button className="btn-text"><i className="fa-solid fa-ellipsis"></i></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '8px', padding: '1rem 0' }}>
                    {/* Mock Bar Chart */}
                    {[40, 30, 20, 15, 20, 35, 60, 85, 95, 90, 75, 50].map((height, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '100%', height: `${height}%`, background: height > 70 ? 'var(--accent-purple)' : 'var(--accent-blue)', borderRadius: '4px 4px 0 0', opacity: height > 70 ? 1 : 0.7 }}></div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{i + 8}:00</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="widget">
                <div className="widget-header">
                    <h2>Venue Popularity</h2>
                    <button className="btn-text"><i className="fa-solid fa-ellipsis"></i></button>
                </div>
                <div className="chart-mockup">
                    <div className="progress-bar-group">
                        <div className="progress-label">
                            <span>Main Tennis Courts</span>
                            <span>42%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{width: '42%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'}}></div>
                        </div>
                    </div>
                    <div className="progress-bar-group">
                        <div className="progress-label">
                            <span>Indoor Badminton</span>
                            <span>35%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{width: '35%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)'}}></div>
                        </div>
                    </div>
                    <div className="progress-bar-group">
                        <div className="progress-label">
                            <span>Cricket Nets</span>
                            <span>15%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{width: '15%', background: 'linear-gradient(90deg, #10b981, #34d399)'}}></div>
                        </div>
                    </div>
                    <div className="progress-bar-group">
                        <div className="progress-label">
                            <span>Swimming Pool</span>
                            <span>8%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{width: '8%', background: 'linear-gradient(90deg, #06b6d4, #22d3ee)'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
  );
}
