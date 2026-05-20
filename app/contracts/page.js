export default function ContractsPage() {
  return (
      <div className="view active">
        <div className="view-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1>Contracts & Agreements</h1>
            <p className="subtitle">Manage all legal documents, leases, and service agreements</p>
          </div>
          <button className="btn-primary"><i className="fa-solid fa-file-signature"></i> New Contract</button>
        </div>

        <div className="inner-tabs" style={{ marginBottom: '1.5rem' }}>
            <button className="inner-tab active">All Contracts</button>
            <button className="inner-tab">Active</button>
            <button className="inner-tab">Expiring Soon (2)</button>
            <button className="inner-tab">Archived</button>
        </div>

        <div className="document-list">
            <div className="document-item" style={{ padding: '1.2rem', alignItems: 'flex-start' }}>
                <div className="doc-info">
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '1rem', borderRadius: '8px', marginRight: '1rem' }}>
                        <i className="fa-solid fa-file-contract fa-2x"></i>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ margin: 0 }}>Property Lease Agreement - Main Campus</h3>
                            <span className="status-badge success">Active</span>
                        </div>
                        <p style={{color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Vendor: RealEstate Corp Ltd. • Type: Lease</p>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                            <span><i className="fa-regular fa-calendar" style={{marginRight: '0.3rem'}}></i> Start: Jan 1, 2024</span>
                            <span><i className="fa-solid fa-clock-rotate-left" style={{marginRight: '0.3rem'}}></i> Renews: Dec 31, 2028</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                        <i className="fa-solid fa-eye"></i> View
                    </button>
                </div>
            </div>

            <div className="document-item" style={{ padding: '1.2rem', alignItems: 'flex-start', borderLeft: '4px solid var(--accent-orange)' }}>
                <div className="doc-info">
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-orange)', padding: '1rem', borderRadius: '8px', marginRight: '1rem' }}>
                        <i className="fa-solid fa-file-shield fa-2x"></i>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ margin: 0 }}>Annual Maintenance Contract - Floodlights</h3>
                            <span className="status-badge warning">Expiring Soon</span>
                        </div>
                        <p style={{color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Vendor: LumenTech Services • Type: Maintenance</p>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                            <span><i className="fa-regular fa-calendar" style={{marginRight: '0.3rem'}}></i> Start: Jun 1, 2025</span>
                            <span style={{color: 'var(--accent-orange)', fontWeight: 500}}><i className="fa-solid fa-triangle-exclamation" style={{marginRight: '0.3rem'}}></i> Expires: Jun 1, 2026 (18 days left)</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ background: 'var(--accent-orange)', color: '#fff' }}>
                        <i className="fa-solid fa-arrows-rotate"></i> Renew Now
                    </button>
                    <button className="btn-text">View Details</button>
                </div>
            </div>

            <div className="document-item" style={{ padding: '1.2rem', alignItems: 'flex-start' }}>
                <div className="doc-info">
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', padding: '1rem', borderRadius: '8px', marginRight: '1rem' }}>
                        <i className="fa-solid fa-file-invoice fa-2x"></i>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ margin: 0 }}>Head Coach Agreement - Vikram Singh</h3>
                            <span className="status-badge success">Active</span>
                        </div>
                        <p style={{color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>Employee: Vikram Singh • Type: Employment</p>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                            <span><i className="fa-regular fa-calendar" style={{marginRight: '0.3rem'}}></i> Start: Mar 15, 2025</span>
                            <span><i className="fa-solid fa-clock-rotate-left" style={{marginRight: '0.3rem'}}></i> Auto-renews: Mar 15, 2027</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                        <i className="fa-solid fa-eye"></i> View
                    </button>
                </div>
            </div>
        </div>
      </div>
  );
}
