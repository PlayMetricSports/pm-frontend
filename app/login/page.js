'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setIsSubmitting(false);
        return;
      }
      await login(email, password);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('aritra.naharay@gmail.com');
    setPassword('PMetrix@123');
  };

  return (
    <div className="login-container">
      <div className="glow-effect glowing-1"></div>
      <div className="glow-effect glowing-2"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo-badge">
            <img src="/logo.png" alt="PlayMetric Logo" className="logo" />
          </div>
          <h1>PLAYMETRIC</h1>
          <p className="subtitle">Academy Console Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-alert">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-envelope"></i>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock"></i>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner-small"></span>
            ) : (
              <span>Sign In <i className="fa-solid fa-arrow-right-to-bracket" style={{marginLeft: '6px'}}></i></span>
            )}
          </button>
        </form>

        {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
          <div className="demo-credentials-card" onClick={handleFillDemoCredentials}>
            <div className="demo-header">
              <i className="fa-solid fa-key"></i>
              <span>Click to fill demo credentials</span>
            </div>
            <div className="demo-body">
              <div><strong>Email:</strong> aritra.naharay@gmail.com</div>
              <div><strong>Password:</strong> PMetrix@123</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #090a0f;
          position: relative;
          overflow: hidden;
          font-family: var(--font-main), sans-serif;
          padding: 1.5rem;
        }

        .glow-effect {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }

        .glowing-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          top: -100px;
          left: -100px;
        }

        .glowing-2 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          bottom: -150px;
          right: -150px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: rgba(17, 18, 25, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          z-index: 10;
          position: relative;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-badge {
          width: 72px;
          height: 72px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .logo {
          width: 48px;
          height: 48px;
        }

        h1 {
          font-family: var(--font-logo), sans-serif;
          color: #ffffff;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0 0 0.5rem;
          background: linear-gradient(135deg, #ffffff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0;
        }

        .auth-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 1.5rem;
        }

        .auth-tab {
          flex: 1;
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .auth-tab:hover {
          color: #ffffff;
        }

        .auth-tab.active {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #f87171;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper i {
          position: absolute;
          left: 14px;
          color: #64748b;
          font-size: 1rem;
          pointer-events: none;
          transition: color 0.2s;
        }

        input {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.8rem 1rem 0.8rem 2.5rem;
          color: #ffffff;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.02);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        input:focus + i, input:not(:placeholder-shown) + i {
          color: #3b82f6;
        }

        .btn-login {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 12px;
          padding: 0.9rem;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.5rem;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
        }

        .btn-login:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .demo-credentials-card {
          margin-top: 2rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .demo-credentials-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .demo-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #3b82f6;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.4rem;
        }

        .demo-body {
          color: #94a3b8;
          font-size: 0.8rem;
          line-height: 1.4;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
