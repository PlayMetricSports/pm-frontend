'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  // Mapping from API submodule key to route details
  const routeMappings = {
    'main-dashboard': { label: 'Dashboard', icon: 'fa-chart-pie', href: '/' },
    'booking-management': { label: 'Booking Management', icon: 'fa-calendar-check', href: '/bookings' },
    'financial-management': { label: 'Financial Management', icon: 'fa-wallet', href: '/financials' },
    'users': { label: 'Users & Staff', icon: 'fa-user-shield', href: '/users' },
    'user-role': { label: 'User Roles', icon: 'fa-users-gear', href: '/users/roles' },
    'venues': { label: 'Venues', icon: 'fa-map-pin', href: '/venues' },
    'sports': { label: 'Sports', icon: 'fa-volleyball', href: '/sports' },
    'organisation': { label: 'Organisations', icon: 'fa-sitemap', href: '/organisation' },
    'actions': { label: 'Actions Config', icon: 'fa-key', href: '/actions' }
  };

  // Compile sections dynamically if actionMenu exists
  let sections = [];

  if (user && user.actionMenu && user.actionMenu.length > 0) {
    // Collect all modules from the actionMenu
    const modulesMap = {};
    user.actionMenu.forEach(subsystem => {
      if (subsystem.modules) {
        subsystem.modules.forEach(module => {
          const sectionName = module.moduleName; // e.g. "Main", "Permissions", "Configuration"
          if (!modulesMap[sectionName]) {
            modulesMap[sectionName] = [];
          }
          if (module.subModules) {
            module.subModules.forEach(sub => {
              const mapping = routeMappings[sub.subModuleKey] || {
                label: sub.subModuleName,
                icon: sub.subModuleIcon && sub.subModuleIcon !== 'test' ? sub.subModuleIcon : 'fa-circle-dot',
                href: `/${sub.subModuleKey}`
              };
              
              modulesMap[sectionName].push({
                id: sub.subModuleKey,
                label: sub.subModuleName || mapping.label,
                icon: sub.subModuleIcon && sub.subModuleIcon !== 'test' ? sub.subModuleIcon : mapping.icon,
                href: mapping.href
              });
            });
          }
        });
      }
    });

    sections = Object.keys(modulesMap).map(name => ({
      name,
      items: modulesMap[name]
    }));

    // For presentation and completion, add other mock sections if admin/staff
    if (isAdmin) {
      sections.push({
        name: 'Operations (Mock)',
        items: [
          { id: 'contracts', label: 'Contracts', icon: 'fa-file-signature', href: '/contracts' },
          { id: 'clients', label: 'Clients', icon: 'fa-users', href: '/clients' },
        ]
      });
      sections.push({
        name: 'Insights & Support (Mock)',
        items: [
          { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line', href: '/analytics' },
          { id: 'reviews', label: 'Reviews', icon: 'fa-star', href: '/reviews' },
          { id: 'tickets', label: 'Tickets', icon: 'fa-ticket', href: '/tickets' },
        ]
      });
    }
  } else {
    // Legacy hardcoded fallback if actionMenu not loaded/defined
    sections = [
      {
        name: 'Main',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', href: '/' },
          { id: 'bookings', label: 'Booking Management', icon: 'fa-calendar-check', href: '/bookings' },
          { id: 'financials', label: 'Financial Management', icon: 'fa-wallet', href: '/financials' },
        ]
      },
      {
        name: 'Operations',
        items: [
          { id: 'contracts', label: 'Contracts', icon: 'fa-file-signature', href: '/contracts' },
          { id: 'clients', label: 'Clients', icon: 'fa-users', href: '/clients' },
        ]
      },
      {
        name: 'Insights & Support',
        items: [
          { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line', href: '/analytics' },
          { id: 'reviews', label: 'Reviews', icon: 'fa-star', href: '/reviews' },
          { id: 'users', label: 'Users & Staff', icon: 'fa-user-shield', href: '/users' },
          { id: 'tickets', label: 'Tickets', icon: 'fa-ticket', href: '/tickets' },
        ]
      }
    ];
  }

  // Find the active item across all sections by picking the longest matching route
  const activeItem = sections
    .flatMap((section) => section.items)
    .reduce((best, item) => {
      const isMatch = item.href === '/'
        ? pathname === '/'
        : pathname === item.href || pathname?.startsWith(item.href + '/');
      if (isMatch && (!best || item.href.length > best.href.length)) {
        return item;
      }
      return best;
    }, null);

  return (
    <aside className="sidebar">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/logo.png" alt="PlayMetric Logo" style={{ width: '48px', height: '48px' }} />
        <h2 style={{ fontFamily: 'var(--font-logo)', margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>PLAYMETRIC</h2>
      </div>

      <nav className="nav-menu">
        {sections.map((section) => (
          <div key={section.name}>
            <div className="nav-section">{section.name}</div>
            {section.items.map((item) => {
              const isActive = activeItem && activeItem.id === item.id;
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
