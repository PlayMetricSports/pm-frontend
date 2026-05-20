export default function UsersPage() {
  return (
      <div className="view active">
        <div className="view-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1>Users & Staff</h1>
            <p className="subtitle">Manage roles, permissions, and internal team access</p>
          </div>
          <button className="btn-primary"><i className="fa-solid fa-user-shield"></i> Invite Staff</button>
        </div>

        <div className="widget">
          <div className="widget-header">
            <div className="inner-tabs" style={{ padding: 0 }}>
                <button className="inner-tab active">All Staff</button>
                <button className="inner-tab">Administrators</button>
                <button className="inner-tab">Coaches</button>
                <button className="inner-tab">Operations</button>
            </div>
            <div className="search-bar" style={{ width: '250px' }}>
                <i className="fa-solid fa-search"></i>
                <input type="text" placeholder="Search staff..." />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Last Active</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="client-cell">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Rohan" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{fontWeight: 600}}>Rohan Mehta</span>
                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>rohan@playmetric.in</span>
                        </div>
                    </div>
                  </td>
                  <td><span className="status-badge" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)'}}><i className="fa-solid fa-shield-halved" style={{marginRight: '4px'}}></i> Owner/Admin</span></td>
                  <td>Management</td>
                  <td>Online now</td>
                  <td><span className="status-badge success">Active</span></td>
                  <td><button className="btn-text"><i className="fa-solid fa-gear"></i></button></td>
                </tr>
                <tr>
                  <td>
                    <div className="client-cell">
                        <div className="avatar" style={{background: 'var(--accent-purple)'}}>A</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{fontWeight: 600}}>Anjali Desai</span>
                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>anjali.d@playmetric.in</span>
                        </div>
                    </div>
                  </td>
                  <td><span className="status-badge" style={{background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)'}}>Venue Manager</span></td>
                  <td>Operations</td>
                  <td>2 hours ago</td>
                  <td><span className="status-badge success">Active</span></td>
                  <td><button className="btn-text"><i className="fa-solid fa-gear"></i></button></td>
                </tr>
                <tr>
                  <td>
                    <div className="client-cell">
                        <div className="avatar" style={{background: 'var(--accent-green)'}}>V</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{fontWeight: 600}}>Vikram Singh</span>
                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>vikram.coach@playmetric.in</span>
                        </div>
                    </div>
                  </td>
                  <td><span className="status-badge" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)'}}>Head Coach</span></td>
                  <td>Coaching</td>
                  <td>1 day ago</td>
                  <td><span className="status-badge success">Active</span></td>
                  <td><button className="btn-text"><i className="fa-solid fa-gear"></i></button></td>
                </tr>
                <tr>
                  <td>
                    <div className="client-cell">
                        <div className="avatar" style={{background: 'var(--text-secondary)'}}>S</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{fontWeight: 600}}>Suresh Kumar</span>
                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>suresh.m@playmetric.in</span>
                        </div>
                    </div>
                  </td>
                  <td><span className="status-badge" style={{background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)'}}>Maintenance Lead</span></td>
                  <td>Facilities</td>
                  <td>3 days ago</td>
                  <td><span className="status-badge warning">On Leave</span></td>
                  <td><button className="btn-text"><i className="fa-solid fa-gear"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
