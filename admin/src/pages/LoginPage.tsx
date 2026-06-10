import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { setToken } from '../signals/store';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { access_token } = await authApi.login(username, password);
      setToken(access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      {/* Sketch wobble filter */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="sketch">
            <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="2" result="noise" seed="5" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="sketch-box w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-ink text-center py-8 px-6 rounded-t-lg">
          <div className="text-5xl mb-3">✂️</div>
          <h1 className="font-sketch text-3xl text-amber font-bold m-0">מנהל תורים</h1>
          <p className="text-white/60 text-sm mt-1">Admin Panel — כניסה למערכת</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="form-label">👤 שם משתמש</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div>
            <label className="form-label">🔒 סיסמה</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-crimson/15 border border-crimson/40 text-crimson text-sm rounded px-3 py-2 text-center">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="btn bg-mint text-white py-2.5 text-base w-full mt-1"
          >
            {loading ? '⏳ מתחבר...' : '🔑 כניסה'}
          </button>
        </form>
      </div>
    </div>
  );
}
