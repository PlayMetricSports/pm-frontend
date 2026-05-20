export default function FinancialsPage() {
  return (
      <div className="view active financial-layout">
        <div className="view-header" style={{ marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{textTransform: 'uppercase', fontSize: '1.5rem'}}>Financial Management</h1>
            <p className="subtitle">Aggregated at Business Level</p>
          </div>
          <button className="btn-primary"><i className="fa-solid fa-download"></i> Export Report</button>
        </div>

        <div className="financial-grid">
          {/* Inflow Column */}
          <div className="financial-column">
            <div className="financial-header inflow">
              <h2>Inflow (Revenue)</h2>
              <i className="fa-solid fa-arrow-trend-up" style={{color: 'var(--accent-green)', fontSize: '1.2rem'}}></i>
            </div>
            <div className="financial-list">
              <div className="financial-row">
                <span className="financial-category">Book & Play earning</span>
                <span className="financial-amount inflow-amount">+₹45,000</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Coaching & Training earning</span>
                <span className="financial-amount inflow-amount">+₹28,500</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Corporate schemes</span>
                <span className="financial-amount inflow-amount">+₹15,000</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Walkins</span>
                <span className="financial-amount inflow-amount">+₹8,200</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Tournaments</span>
                <span className="financial-amount inflow-amount">+₹35,000</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Offsites</span>
                <span className="financial-amount inflow-amount">+₹12,000</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Sports Camps</span>
                <span className="financial-amount inflow-amount">+₹22,000</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Special Events</span>
                <span className="financial-amount inflow-amount">+₹18,500</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Sports Parties</span>
                <span className="financial-amount inflow-amount">+₹9,000</span>
              </div>
            </div>
          </div>

          {/* Outflow Column */}
          <div className="financial-column">
            <div className="financial-header outflow">
              <h2>Outflow (Expenses)</h2>
              <i className="fa-solid fa-arrow-trend-down" style={{color: 'var(--accent-orange)', fontSize: '1.2rem'}}></i>
            </div>
            <div className="financial-list">
              <div className="financial-row">
                <span className="financial-category">Commissions</span>
                <span className="financial-amount outflow-amount">-₹12,500</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Salaries</span>
                <span className="financial-amount outflow-amount">-₹45,000</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Property Related (maintenance & leases)</span>
                <span className="financial-amount outflow-amount">-₹28,000</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Admin Expenses (Adhoc)</span>
                <span className="financial-amount outflow-amount">-₹5,200</span>
              </div>
              <div className="financial-row">
                <span className="financial-category">Marketing & Branding</span>
                <span className="financial-amount outflow-amount">-₹8,500</span>
              </div>
            </div>
            
            {/* Manual Entry Section */}
            <div className="manual-entry-section">
              <div className="manual-entry-text">
                <i className="fa-solid fa-circle-info" style={{marginRight: '0.5rem'}}></i>
                Admin can build and manually input headers if needed, or upload data directly through their CA.
              </div>
              <div className="upload-actions">
                <button className="btn-primary" style={{backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)'}}>
                  <i className="fa-solid fa-plus"></i> Add Custom Expense
                </button>
                <button className="btn-primary">
                  <i className="fa-solid fa-cloud-arrow-up"></i> Upload CA Data (.csv)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="indemnification-footer">
          <i className="fa-solid fa-shield-halved" style={{marginRight: '0.5rem'}}></i>
          Indemnification of data availability & authenticity
        </div>
      </div>
  );
}
