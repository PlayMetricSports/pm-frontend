'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, getAuthToken, setAuthToken } from '@/lib/api';
import { isUserAdmin } from '@/lib/helpers';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  loginWithToken: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Verify auth session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = getAuthToken();
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        let userData = null;
        try {
          // Call the authentication verification endpoint
          const response = await api.verifyAuth();
          userData = response?.user || response?.data?.user || response?.data;
        } catch (e) {
          console.warn('Session verifyAuth API failed, using cached session fallback:', e);
        }

        // Merge with stored login details (like permissions and actionMenu)
        if (typeof window !== 'undefined') {
          const cachedLogin = window.localStorage.getItem('pm_login_response');
          if (cachedLogin) {
            try {
              const loginData = JSON.parse(cachedLogin);
              const loginUser = loginData?.data || loginData?.user;
              if (loginUser) {
                userData = {
                  ...loginUser,
                  ...userData
                };
              }
            } catch (e) {
              console.warn('Could not parse cached login response', e);
            }
          }
        }

        // If verification failed and no cached data available, clear token and force re-login
        if (!userData) {
          setAuthToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(userData);
      } catch (err) {
        console.error('Session verification critical failed:', err);
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      
      let userData = null;
      try {
        const authData = await api.verifyAuth();
        userData = authData?.user || authData?.data?.user || authData?.data;
      } catch (e) {
        console.warn('verifyAuth API failed after login, using response data fallback:', e);
      }

      if (!userData) {
        userData = response?.user || response?.data || { email };
      } else {
        userData = {
          ...response?.data,
          ...userData
        };
      }
      setUser(userData);
      router.push('/');
      return userData;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = async (token) => {
    setLoading(true);
    try {
      setAuthToken(token);
      
      let userData = null;
      try {
        const authData = await api.verifyAuth();
        userData = authData?.user || authData?.data?.user || authData?.data;
      } catch (e) {
        console.warn('verifyAuth API failed for pasted token, using fallback session:', e);
      }

      // Merge with stored login details (like permissions and actionMenu)
      if (typeof window !== 'undefined') {
        const cachedLogin = window.localStorage.getItem('pm_login_response');
        if (cachedLogin) {
          try {
            const loginData = JSON.parse(cachedLogin);
            const loginUser = loginData?.data || loginData?.user;
            if (loginUser) {
              userData = {
                ...loginUser,
                ...userData
              };
            }
          } catch (e) {
            console.warn('Could not parse cached login response', e);
          }
        }
      }

      if (!userData) {
        // Token was accepted but no user data — set minimal session
        userData = { email: 'unknown', userRole: 'unknown' };
      }
      setUser(userData);
      router.push('/');
      return userData;
    } catch (err) {
      setAuthToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, logout, isAuthenticated: !!user, isAdmin: isUserAdmin(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const routePermissions = {
    '/': 'ac-104',                      // Dashboard (main-dashboard)
    '/bookings': 'ac-105',               // Booking Management (booking-management)
    '/financials': 'ac-106',             // Financial Management (financial-management)
    '/users/roles': 'ac-103',            // User Roles (user-role) - check roles first so /users prefix doesn't match first
    '/users': 'ac-102',                  // Users (users)
    '/sports': 'ac-107',                 // Sports configuration
    '/venues': 'ac-108',                 // Venues configuration
    '/organisation': 'ac-109',           // Organisations configuration
    '/actions': 'ac-101'                 // Actions configuration
  };

  const isAllowed = () => {
    if (!user) return false;
    
    // Admins have access to everything
    if (isUserAdmin(user)) {
      return true;
    }
    
    // Find if the route has a permission mapping
    const matchedPath = Object.keys(routePermissions).find(path => {
      if (path === '/') return pathname === '/';
      return pathname?.startsWith(path);
    });
    
    if (matchedPath) {
      const requiredAction = routePermissions[matchedPath];
      const hasPermission = user.permissions?.includes(requiredAction);
      return !!hasPermission;
    }
    
    return true; // allow other unmapped pages
  };

  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === '/login';
      if (!user && !isLoginPage) {
        router.push('/login');
      } else if (user && isLoginPage) {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  // Render a beautiful premium loading indicator while checking auth state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#090a0f',
        color: '#ffffff',
        fontFamily: 'var(--font-main), sans-serif'
      }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid rgba(59, 130, 246, 0.1)',
          borderTopColor: '#3b82f6',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', fontSize: '0.9rem' }}>Loading PlayMetric...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Prevent flash of guarded content before redirection
  const isLoginPage = pathname === '/login';
  if (!user && !isLoginPage) {
    return null;
  }
  if (user && isLoginPage) {
    return null;
  }

  // Enforce access control guard with premium Access Denied page
  if (user && !isLoginPage && !isAllowed()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#090a0f',
        color: '#ffffff',
        fontFamily: 'var(--font-main), sans-serif',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          maxWidth: '480px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            marginBottom: '1.5rem',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <i className="fa-solid fa-ban"></i>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>Access Denied</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your account ({user.email}) does not have permissions to access the <strong>{pathname}</strong> section. Please contact your academy administrator to request access.
          </p>
          <button 
            onClick={() => router.push('/')}
            style={{
              background: '#3b82f6',
              border: 'none',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
