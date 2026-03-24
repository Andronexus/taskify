import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

interface Props { onClose: () => void; }

const ForgotPasswordModal: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPw, setConfirmPw]         = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [loading, setLoading]             = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPassword !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username, newPassword, confirmPassword: confirmPw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Something went wrong.'); }
      else {
        setSuccess('Password changed successfully!');
        setTimeout(onClose, 2000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg-2)',
    color: 'var(--text-primary)', fontSize: '13.5px', outline: 'none',
    boxSizing: 'border-box',
  };
  const wrap: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center' };
  const eyeBtn: React.CSSProperties = {
    position: 'absolute', right: '10px', background: 'none',
    border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
  };
  const label: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '6px',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  };

  const confirmMismatch = confirmTouched && confirmPw !== '' && newPassword !== confirmPw;

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}>
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
              🔑 Reset Password
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Resetting password for <strong style={{ color: 'var(--accent)' }}>{user?.username}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1, padding: '2px 6px',
          }}>✕</button>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid var(--red)',
            borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
            color: 'var(--red)', fontSize: '12.5px',
          }}>⚠ {error}</div>
        )}
        {success && (
          <div style={{
            background: 'var(--green-bg)', border: '1px solid var(--green)',
            borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
            color: 'var(--green)', fontSize: '12.5px',
          }}>✓ {success}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* New Password */}
          <div>
            <label style={label}>New Password</label>
            <div style={wrap}>
              <input
                style={{ ...inp, paddingRight: '36px' }}
                type={showNew ? 'text' : 'password'}
                placeholder="Min 6 chars, 1 number"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                required
              />
              <button type="button" style={eyeBtn} onClick={() => setShowNew(v => !v)}>
                {showNew ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={label}>Confirm Password</label>
            <div style={wrap}>
              <input
                style={{
                  ...inp,
                  paddingRight: '36px',
                  borderColor: confirmMismatch ? 'var(--red)' : undefined,
                }}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat new password"
                value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setError(''); }}
                onBlur={() => setConfirmTouched(true)}
                required
              />
              <button type="button" style={eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
            {confirmMismatch && (
              <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--red)' }}>
                Passwords don't match
              </p>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '10px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'var(--bg-2)',
              color: 'var(--text-secondary)', fontSize: '13.5px',
              cursor: 'pointer', fontWeight: 500,
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: '13.5px',
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600,
              opacity: loading ? 0.7 : 1, display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              {loading && (
                <span style={{
                  width: '12px', height: '12px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }}/>
              )}
              {loading ? 'Saving…' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
