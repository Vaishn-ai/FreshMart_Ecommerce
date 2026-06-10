import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import '../style/Login.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/profile');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ username: 'marcus', password: 'password123' });

  return (
    <Layout>
      <div className="login-page">

        {/* ── Brand mark ── */}
        <div className="login-brand">
          <div className="login-brand__icon">
            <span className="material-symbols-outlined">eco</span>
          </div>
          <span className="login-brand__name">FreshMart</span>
        </div>

        <div className="login-card">
          <div className="login-card__head">
            <h1 className="login-card__title">Welcome back</h1>
            <p className="login-card__sub">Sign in to your FreshMart account</p>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="login-error" role="alert">
              <span className="material-symbols-outlined login-error__icon">error</span>
              {error}
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="login-form">

            <div className="field">
              <label htmlFor="login-username" className="field__label">Username</label>
              <div className="field__wrap">
                <span className="material-symbols-outlined field__icon">person</span>
                <input
                  id="login-username"
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  className="field__input"
                />
              </div>
            </div>

            <div className="field">
              <div className="field__label-row">
                <label htmlFor="login-password" className="field__label">Password</label>
                <button type="button" className="field__forgot">Forgot password?</button>
              </div>
              <div className="field__wrap">
                <span className="material-symbols-outlined field__icon">lock</span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="field__input"
                />
                <button
                  type="button"
                  className="field__eye"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-signin ${loading ? 'btn-signin--loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="btn-signin__spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account?{' '}
            <Link to="/register" className="login-footer__link">Create one</Link>
          </p>
        </div>

        {/* ── Demo credentials ── */}
        <button className="demo-pill" onClick={fillDemo} type="button">
          <span className="material-symbols-outlined">bolt</span>
          Use demo account &nbsp;<strong>marcus / password123</strong>
        </button>

      </div>
    </Layout>
  );
}