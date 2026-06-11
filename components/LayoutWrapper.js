'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthProvider, AuthGuard } from './AuthContext';
import { ToastProvider } from './Toast';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <AuthProvider>
        <AuthGuard>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthGuard>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AuthGuard>
        <ToastProvider>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Header />
              <div className="views-container">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </AuthGuard>
    </AuthProvider>
  );
}

