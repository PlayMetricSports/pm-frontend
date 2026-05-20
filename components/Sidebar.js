'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', section: 'Main', href: '/' },
    { id: 'bookings', label: 'Booking Management', icon: 'fa-calendar-check', section: 'Main', href: '/bookings' },
    { id: 'financials', label: 'Financial Management', icon: 'fa-wallet', section: 'Main', href: '/financials' },
    { id: 'contracts', label: 'Contracts', icon: 'fa-file-signature', section: 'Operations', href: '/contracts' },
    { id: 'clients', label: 'Clients', icon: 'fa-users', section: 'Operations', href: '/clients' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line', section: 'Insights & Support', href: '/analytics' },
    { id: 'reviews', label: 'Reviews', icon: 'fa-star', section: 'Insights & Support', href: '/reviews' },
    { id: 'users', label: 'Users & Staff', icon: 'fa-user-shield', section: 'Insights & Support', href: '/users' },
    { id: 'tickets', label: 'Tickets', icon: 'fa-ticket', section: 'Insights & Support', href: '/tickets' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/logo.png" alt="PlayMetric Logo" style={{ width: '48px', height: '48px' }} />
        <h2 style={{ fontFamily: 'var(--font-logo)', margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>PLAYMETRIC</h2>
      </div>

      <nav className="nav-menu">
        {['Main', 'Operations', 'Insights & Support'].map((sectionName) => (
          <div key={sectionName}>
            <div className="nav-section">{sectionName}</div>
            {navItems.filter(item => item.section === sectionName).map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
