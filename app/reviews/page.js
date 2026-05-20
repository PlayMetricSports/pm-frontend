export default function ReviewsPage() {
  return (
      <div className="view active">
        <div className="view-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1>Consolidated Reviews</h1>
            <p className="subtitle">Monitor client feedback and venue ratings</p>
          </div>
          <div className="venue-selector" style={{ padding: 0, background: 'transparent' }}>
              <select className="venue-dropdown">
                <option>All Venues</option>
                <option>Main Tennis Courts</option>
                <option>Indoor Badminton</option>
              </select>
          </div>
        </div>

        <div className="dashboard-widgets" style={{ gridTemplateColumns: '1fr 2fr', marginBottom: '1.5rem' }}>
            <div className="widget" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>4.6</div>
                <div className="stars" style={{ fontSize: '1.5rem' }}>
                    <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star-half-stroke"></i>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Based on 428 reviews</div>
            </div>
            
            <div className="widget">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {[
                        { stars: 5, pct: 70 },
                        { stars: 4, pct: 20 },
                        { stars: 3, pct: 7 },
                        { stars: 2, pct: 2 },
                        { stars: 1, pct: 1 },
                    ].map(row => (
                        <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <span>{row.stars}</span> <i className="fa-solid fa-star" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>
                            </div>
                            <div className="progress-track" style={{ flex: 1, height: '8px' }}>
                                <div className="progress-fill" style={{ width: `${row.pct}%`, background: '#f59e0b', borderRadius: '4px' }}></div>
                            </div>
                            <div style={{ width: '30px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.pct}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="document-list">
            <div className="review-item" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar">P</div>
                        <div>
                            <div style={{fontWeight: 600}}>Priya Patel</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2 days ago • Badminton Court 3</div>
                        </div>
                    </div>
                    <div className="stars">
                        <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star-half-stroke"></i>
                    </div>
                </div>
                <p style={{fontSize: '1rem', lineHeight: 1.5, marginBottom: '1rem'}}>Great courts, well maintained. The lighting is perfect for evening games. The staff at the reception was very helpful in finding us some extra shuttles.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem' }}>
                        <i className="fa-solid fa-reply"></i> Reply
                    </button>
                </div>
            </div>
            
            <div className="review-item" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar" style={{background: 'var(--accent-orange)'}}>V</div>
                        <div>
                            <div style={{fontWeight: 600}}>Vikram Singh</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1 week ago • Cricket Nets</div>
                        </div>
                    </div>
                    <div className="stars">
                        <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-regular fa-star"></i><i className="fa-regular fa-star"></i>
                    </div>
                </div>
                <p style={{fontSize: '1rem', lineHeight: 1.5, marginBottom: '1rem'}}>Good nets but the bowling machine was slightly misaligned. Also, the run-up area was a bit slippery.</p>
                
                {/* Admin Reply */}
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
                        <i className="fa-solid fa-reply"></i> Response from PlayMetric
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>Hi Vikram, thank you for the feedback. We've had our maintenance team recalibrate the bowling machine and clean the run-up area. Hope to see you back soon!</p>
                </div>
            </div>
        </div>
      </div>
  );
}
