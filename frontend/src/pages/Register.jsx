import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import '../style/Register.css';

const FIELDS = [
  { key: 'username',   label: 'Username',   type: 'text',     ph: 'johndoe',          icon: 'person',        half: false },
  { key: 'email',      label: 'Email',      type: 'email',    ph: 'john@example.com', icon: 'mail',          half: false },
  { key: 'password',   label: 'Password',   type: 'password', ph: 'Min. 8 characters',icon: 'lock',          half: false },
];

function PasswordStrength({ password }) {
  const score = !password ? 0
    : [/.{8,}/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const cls    = ['', 'ps--weak', 'ps--fair', 'ps--good', 'ps--strong'];
  if (!password) return null;
  return (
    <div className="password-strength">
      <div className="ps__bars">
        {[1,2,3,4].map(i => (
          <div key={i} className={`ps__bar ${score >= i ? cls[score] : ''}`} />
        ))}
      </div>
      <span className={`ps__label ${cls[score]}`}>{labels[score]}</span>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useApp();
  const navigate = useNavigate();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/profile');
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="register-page">

        {/* ── Brand ── */}
        <div className="register-brand">
          <div className="register-brand__icon">
            <span className="material-symbols-outlined">eco</span>
          </div>
          <span className="register-brand__name">FreshMart</span>
        </div>

        <div className="register-card">
          <div className="register-card__head">
            <h1 className="register-card__title">Create account</h1>
            <p className="register-card__sub">Join FreshMart for fresh organic groceries</p>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="register-error" role="alert">
              <span className="material-symbols-outlined register-error__icon">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">

            {/* Name row */}
            <div className="name-row">
              {[['first_name', 'First Name', 'John'], ['last_name', 'Last Name', 'Doe']].map(([key, label, ph]) => (
                <div key={key} className="field">
                  <label htmlFor={`reg-${key}`} className="field__label">{label}</label>
                  <div className="field__wrap">
                    <span className="material-symbols-outlined field__icon">badge</span>
                    <input
                      id={`reg-${key}`}
                      type="text"
                      value={form[key]}
                      onChange={e => set(key, e.target.value)}
                      placeholder={ph}
                      required
                      className="field__input"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Other fields */}
            {FIELDS.map(({ key, label, type, ph, icon }) => (
              <div key={key} className="field">
                <label htmlFor={`reg-${key}`} className="field__label">{label}</label>
                <div className="field__wrap">
                  <span className="material-symbols-outlined field__icon">{icon}</span>
                  <input
                    id={`reg-${key}`}
                    type={key === 'password' ? (showPassword ? 'text' : 'password') : type}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={ph}
                    required
                    autoComplete={key === 'password' ? 'new-password' : key}
                    className="field__input"
                  />
                  {key === 'password' && (
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
                  )}
                </div>
                {key === 'password' && <PasswordStrength password={form.password} />}
              </div>
            ))}

            {/* Terms */}
            <p className="register-terms">
              By creating an account you agree to our{' '}
              <a href="#" className="register-terms__link">Terms of Service</a> and{' '}
              <a href="#" className="register-terms__link">Privacy Policy</a>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className={`btn-register ${loading ? 'btn-register--loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="btn-register__spinner" />
                  Creating account…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">person_add</span>
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="register-footer">
            Already have an account?{' '}
            <Link to="/login" className="register-footer__link">Sign in</Link>
          </p>
        </div>

      </div>
    </Layout>
  );
}