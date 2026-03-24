import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import s from './Auth.module.css';

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <path d="M16 2L29 9.5V22.5L16 30L3 22.5V9.5L16 2Z"
      stroke="url(#lg1)" strokeWidth="1.5" fill="url(#lg2)"/>
    <path d="M16 9L22 12.5V19.5L16 23L10 19.5V12.5L16 9Z" fill="url(#lg3)"/>
    <defs>
      <linearGradient id="lg1" x1="3" y1="2" x2="29" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#06b6d4"/>
      </linearGradient>
      <linearGradient id="lg2" x1="3" y1="2" x2="29" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0ea5e9" stopOpacity="0.2"/><stop offset="1" stopColor="#06b6d4" stopOpacity="0.05"/>
      </linearGradient>
      <linearGradient id="lg3" x1="10" y1="9" x2="22" y2="23" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" stopOpacity="0.6"/><stop offset="1" stopColor="#06b6d4" stopOpacity="0.2"/>
      </linearGradient>
    </defs>
  </svg>
);

const EyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path d="M3 3l14 14M8.5 8.6A2.5 2.5 0 0011.4 11.5M6.4 6.5C4.6 7.6 3.2 9 2 10s3 6 8 6c1.6 0 3-.4 4.2-1M10 4c5 0 8 6 8 6a14 14 0 01-2.3 3"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);



const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await authApi.login(form);
      if (res.data.data) { login(res.data.data.token, res.data.data.user); navigate('/dashboard'); }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.page}>

      {/* ── Navbar ── */}
      <nav className={s.navbar}>
        <div className={s.navBrand}>
          <Logo />
          <span className={s.navBrandName}>Taskify</span>
        </div>
        <div className={s.navRight}>
          <div className={s.navTabs}>
            <span className={`${s.navTab} ${s.navTabActive}`}>Login</span>
            <Link to="/signup" className={s.navTab}>Sign Up</Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* ── Diagonal split ── */}
      <div className={s.main}>

        {/* LEFT — form */}
        <div className={s.leftPanel}>
          <div className={s.formWrap}>
            <div className={s.cardBadge}>
              <span className={s.cardBadgeDot} />
              Welcome back
            </div>
            <h1 className={s.cardTitle}>Sign in to <em>Taskify</em></h1>
            <p className={s.cardSub}>Your workspace is waiting. Let's get things done.</p>

            <div className={s.quoteBlock}>
              <div className={s.quoteAccent} />
              <div className={s.quoteContent}>
                <p className={s.quoteText}>"The secret of getting ahead is getting started."</p>
                <p className={s.quoteAuthor}>— Mark Twain</p>
              </div>
            </div>

            <div className={s.hr} />

            {error && (
              <div className={s.errorBox}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={s.form}>
              <div className={s.field}>
                <label className={s.label}>Email address</label>
                <div className={s.inputWrap}>
                  <svg className={s.inputIcon} width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1 6l7 4 7-4" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="you@example.com"
                    className={`${s.input} ${s.inputNoRight}`}
                    autoComplete="email" required />
                </div>
              </div>

              <div className={s.field}>
                <label className={s.label}>Password</label>
                <div className={s.inputWrap}>
                  <svg className={s.inputIcon} width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder="••••••••"
                    className={s.input} autoComplete="current-password" required />
                  <button type="button" className={s.eyeBtn} onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
              </div>

              <button type="submit" className={s.submitBtn} disabled={loading}>
                {loading && <span className={s.spinner} />}
                {loading ? 'Signing in…' : 'Sign in to Taskify →'}
              </button>
            </form>




            <p className={s.formFoot}>
              Don't have an account?{' '}
              <Link to="/signup" className={s.formLink}>Create one free</Link>
            </p>
          </div>
        </div>

        {/* RIGHT — brand */}
        <div className={s.rightPanel}>
          <div className={s.brandWrap}>
            <div className={s.brandBadge}>Task Management</div>
            <h2 className={s.brandHeading}>
              Build sharper<br />
              <span>workflows,</span><br />
              ship faster.
            </h2>
            <p className={s.brandDesc}>
              A command center for ambitious teams — track every task,
              hit every deadline, and see your progress in real time.
            </p>
            <div className={s.featureList}>
              <div className={s.featureItem}>
                <div className={s.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="2" width="4" height="12" rx="1" fill="#29b6e6"/>
                    <rect x="6" y="5" width="4" height="9" rx="1" fill="#29b6e6" opacity="0.6"/>
                    <rect x="11" y="1" width="4" height="13" rx="1" fill="#29b6e6" opacity="0.35"/>
                  </svg>
                </div>
                <div>
                  <span className={s.featureTitle}>Kanban &amp; List views</span>
                  <span className={s.featureSub}>Switch between board and table layouts instantly.</span>
                </div>
              </div>
              <div className={s.featureItem}>
                <div className={s.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <polyline points="1,13 5,8 8,10 12,4 15,6" stroke="#29b6e6" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                <div>
                  <span className={s.featureTitle}>Live analytics</span>
                  <span className={s.featureSub}>Charts showing your productivity at a glance.</span>
                </div>
              </div>
              <div className={s.featureItem}>
                <div className={s.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.5" stroke="#29b6e6" strokeWidth="1.3"/>
                    <polyline points="8,4 8,8.5 11,10.5" stroke="#29b6e6" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <span className={s.featureTitle}>Priority &amp; due dates</span>
                  <span className={s.featureSub}>Smart overdue alerts so you never miss a deadline.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className={s.bottomBar}>
        <div className={s.bottomLinks}>
          <a href="#" className={s.bottomLink}>Privacy</a>
          <a href="#" className={s.bottomLink}>Terms</a>
          <a href="#" className={s.bottomLink}>Support</a>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;