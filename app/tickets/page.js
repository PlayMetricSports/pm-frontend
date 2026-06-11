export default function TicketsPage() {
  return (
      <div className="view active">
        <div className="view-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1>Support Tickets</h1>
            <p className="subtitle">Client inquiries, issue tracking, and maintenance requests</p>
          </div>
          <button className="btn-primary"><i className="fa-solid fa-ticket"></i> Create Ticket</button>
        </div>

        <div className="dashboard-widgets" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
            {/* Kanban Columns */}
            <div className="widget" style={{ background: 'var(--bg-main)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    Open <span style={{ background: 'var(--bg-surface-hover)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>2</span>
                </h3>
                
                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="status-badge" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>High Priority</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>#TCK-089</span>
                    </div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Floodlights flickering on Court 2</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Reported by Venue Manager. Needs immediate electrical check before evening bookings.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem', background: 'var(--text-secondary)' }}>S</div>
                        <i className="fa-regular fa-comment-dots" style={{ color: 'var(--text-secondary)' }}></i>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="status-badge" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}>Medium</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>#TCK-092</span>
                    </div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Billing inquiry - Corporate Event</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>TechCorp requesting split invoice for last week&apos;s offsite event.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>A</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <i className="fa-regular fa-comment-dots"></i> 2
                        </div>
                    </div>
                </div>
            </div>

            <div className="widget" style={{ background: 'var(--bg-main)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    In Progress <span style={{ background: 'var(--bg-surface-hover)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>1</span>
                </h3>
                
                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="status-badge" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>Maintenance</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>#TCK-085</span>
                    </div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Resurface Tennis Court 3</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Scheduled resurfacing. Court blocked out on calendar.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem', background: 'var(--accent-purple)' }}>A</div>
                    </div>
                </div>
            </div>

            <div className="widget" style={{ background: 'var(--bg-main)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    Resolved <span style={{ background: 'var(--bg-surface-hover)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Recent</span>
                </h3>
                
                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: 0.7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="status-badge" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>Low</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>#TCK-081</span>
                    </div>
                    <h4 style={{ marginBottom: '0.5rem', textDecoration: 'line-through' }}>Restock Grip Tapes</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Order placed and delivered. Inventory updated.</p>
                </div>
            </div>
        </div>
      </div>
  );
}
