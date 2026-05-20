export default function ClientsPage() {
  return (
      <div className="view active">
        <div className="view-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1>Client Directory</h1>
            <p className="subtitle">Manage individual players, teams, and corporate accounts</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                <i className="fa-solid fa-file-export"></i> Export CSV
            </button>
            <button className="btn-primary"><i className="fa-solid fa-user-plus"></i> Add Client</button>
          </div>
        </div>

        <div className="widget">
          <div className="widget-header">
            <div className="venue-selector" style={{ padding: 0, background: 'transparent' }}>
              <select className="venue-dropdown">
                <option>All Client Types</option>
                <option>Individual (Pay & Play)</option>
                <option>Members</option>
                <option>Corporate</option>
              </select>
            </div>
            <div className="search-bar" style={{ width: '300px' }}>
                <i className="fa-solid fa-search"></i>
                <input type="text" placeholder="Search name, phone, email..." />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Contact Info</th>
                  <th>Type</th>
                  <th>Last Visit</th>
                  <th>Total Spend (LTV)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="client-cell">
                        <div className="avatar">A</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{fontWeight: 600}}>Amit Sharma</span>
                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>ID: CLI-00142</span>
                        </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>+91 98765 43210</span>
                        <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>amit.s@email.com</span>
                    </div>
                  </td>
                  <td><span className="status-badge" style={{background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)'}}>Pro Member</span></td>
                  <td>Today, 16:00</td>
                  <td style={{fontWeight: 600}}>₹45,200</td>
                  <td><span className="status-badge success">Active</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="client-cell">
                        <div className="avatar" style={{background: 'var(--accent-orange)'}}>P</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{fontWeight: 600}}>Priya Patel</span>
                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>ID: CLI-00891</span>
                        </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>+91 98765 11223</span>
                        <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>priya.p@email.com</span>
                    </div>
                  </td>
                  <td><span className="status-badge" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)'}}>Pay & Play</span></td>
                  <td>May 10, 2026</td>
                  <td style={{fontWeight: 600}}>₹8,400</td>
                  <td><span className="status-badge success">Active</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="client-cell">
                        <div className="avatar" style={{background: '#10b981', borderRadius: '4px'}}>T</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{fontWeight: 600}}>TechCorp Solutions</span>
                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>ID: CORP-005</span>
                        </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>Rahul (HR Head)</span>
                        <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>hr@techcorp.in</span>
                    </div>
                  </td>
                  <td><span className="status-badge" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)'}}>Corporate</span></td>
                  <td>May 12, 2026</td>
                  <td style={{fontWeight: 600}}>₹1,25,000</td>
                  <td><span className="status-badge success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
