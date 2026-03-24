import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import ThemeToggle from '../components/ThemeToggle';
import s from './Auth.module.css';

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <path d="M16 2L29 9.5V22.5L16 30L3 22.5V9.5L16 2Z"
      stroke="url(#sg1)" strokeWidth="1.5" fill="url(#sg2)"/>
    <path d="M16 9L22 12.5V19.5L16 23L10 19.5V12.5L16 9Z" fill="url(#sg3)"/>
    <defs>
      <linearGradient id="sg1" x1="3" y1="2" x2="29" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#06b6d4"/>
      </linearGradient>
      <linearGradient id="sg2" x1="3" y1="2" x2="29" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0ea5e9" stopOpacity="0.2"/><stop offset="1" stopColor="#06b6d4" stopOpacity="0.05"/>
      </linearGradient>
      <linearGradient id="sg3" x1="10" y1="9" x2="22" y2="23" gradientUnits="userSpaceOnUse">
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

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // ← NEW
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await authApi.register(form);
      if (res.data.data) {
        // ← CHANGED: show success message, redirect to login after 2s
        setSuccess('Account created successfully! Redirecting to login…');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      const msgs = err.response?.data?.errors;
      setError(msgs?.[0]?.msg || err.response?.data?.message || 'Registration failed.');
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
            <Link to="/login" className={s.navTab}>Login</Link>
            <span className={`${s.navTab} ${s.navTabActive}`}>Sign Up</span>
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
              Free forever
            </div>
            <h1 className={s.cardTitle}>Join <em>Taskify</em></h1>
            <p className={s.cardSub}>Create your account and start shipping better work today.</p>

            <div className={s.quoteBlock}>
              <div className={s.quoteAccent} />
              <div className={s.quoteContent}>
                <p className={s.quoteText}>"An investment in knowledge pays the best interest."</p>
                <p className={s.quoteAuthor}>— Benjamin Franklin</p>
              </div>
            </div>

            <div className={s.hr} />

            {/* Error box */}
            {error && (
              <div className={s.errorBox}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* ── SUCCESS BOX (new) ── */}
            {success && (
              <div className={s.successBox}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className={s.form}>
              <div className={s.row2}>
                <div className={s.field}>
                  <label className={s.label}>Username</label>
                  <div className={s.inputWrap}>
                    <svg className={s.inputIcon} width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <input type="text" name="username" value={form.username} onChange={handleChange}
                      placeholder="your_username"
                      className={`${s.input} ${s.inputNoRight}`}
                      autoComplete="username" required />
                  </div>
                </div>
                <div className={s.field}>
                  <label className={s.label}>Email</label>
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
              </div>

              <div className={s.field}>
                <label className={s.label}>Password</label>
                <div className={s.inputWrap}>
                  <svg className={s.inputIcon} width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder="Min. 6 characters, 1 number"
                    className={s.input} autoComplete="new-password" required />
                  <button type="button" className={s.eyeBtn} onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
              </div>

              <button type="submit" className={s.submitBtn} disabled={loading || !!success}>
                {loading && <span className={s.spinner} />}
                {loading ? 'Creating account…' : 'Create my account →'}
              </button>
            </form>

            <p className={s.formFoot}>
              Already have an account?{' '}
              <Link to="/login" className={s.formLink}>Sign in</Link>
            </p>
          </div>
        </div>

        {/* RIGHT — brand */}
        <div className={s.rightPanel}>
          <div className={s.brandWrap}>
            <div className={s.brandBadge}>Start for free</div>
            <h2 className={s.brandHeading}>
              Ship work<br />
              <span>smarter,</span><br />
              not harder.
            </h2>
            <p className={s.brandDesc}>
              Join thousands of teams already using Taskify to stay
              on top of projects, deadlines, and daily priorities.
            </p>
            <div className={s.featureList}>
              <div className={s.featureItem}>
                <div className={s.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 4" stroke="#29b6e6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <span className={s.featureTitle}>No credit card needed</span>
                  <span className={s.featureSub}>Get started instantly, upgrade when you're ready.</span>
                </div>
              </div>
              <div className={s.featureItem}>
                <div className={s.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="6" r="3" stroke="#29b6e6" strokeWidth="1.3"/>
                    <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="#29b6e6" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <span className={s.featureTitle}>Invite your team</span>
                  <span className={s.featureSub}>Collaborate in real time with unlimited members.</span>
                </div>
              </div>
              <div className={s.featureItem}>
                <div className={s.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="5" height="5" rx="1" stroke="#29b6e6" strokeWidth="1.3"/>
                    <rect x="9" y="2" width="5" height="5" rx="1" stroke="#29b6e6" strokeWidth="1.3"/>
                    <rect x="2" y="9" width="5" height="5" rx="1" stroke="#29b6e6" strokeWidth="1.3"/>
                    <rect x="9" y="9" width="5" height="5" rx="1" stroke="#29b6e6" strokeWidth="1.3"/>
                  </svg>
                </div>
                <div>
                  <span className={s.featureTitle}>All views included</span>
                  <span className={s.featureSub}>Kanban, list, calendar — all in one place.</span>
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

export default SignupPage;