import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  // --- UI STATE ---
  // Views: 'login' | 'forgot_email' | 'forgot_method' | 'forgot_question' | 'forgot_key' | 'reset_password'
  const [view, setView] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- FORM DATA STATE ---
  const [email, setEmail] = useState('admin@sazgar.com');
  const [password, setPassword] = useState('');
  
  // Recovery State
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [backupKey, setBackupKey] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --- HANDLERS ---
  const resetErrors = () => { setError(''); setSuccessMsg(''); };

  const handleStandardLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetErrors();

    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      setIsLoading(false);
      if (data.error) return setError(data.error);
      
      localStorage.setItem('sazgar_token', data.token);
      localStorage.setItem('sazgar_user', JSON.stringify(data.user));
      onLoginSuccess();
    }).catch(() => { setIsLoading(false); setError("Server connection failed."); });
  };

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetErrors();

    fetch('http://localhost:5000/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).then(res => res.json()).then(data => {
      setIsLoading(false);
      if (data.error) return setError(data.error);
      
      setSecurityQuestion(data.question);
      setView('forgot_method');
    }).catch(() => { setIsLoading(false); setError("Server connection failed."); });
  };

  const handleVerifyRecovery = (type) => (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetErrors();

    const payload = { email, type, answer: securityAnswer, backupKey };

    fetch('http://localhost:5000/api/auth/verify-recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
      setIsLoading(false);
      if (data.error) return setError(data.error);
      
      setSuccessMsg("Identity verified. Please set a new password.");
      setView('reset_password');
    }).catch(() => { setIsLoading(false); setError("Server connection failed."); });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetErrors();

    fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    }).then(res => res.json()).then(data => {
      setIsLoading(false);
      if (data.error) return setError(data.error);
      
      setSuccessMsg("Password updated successfully! You can now log in.");
      setPassword('');
      setView('login');
    }).catch(() => { setIsLoading(false); setError("Server connection failed."); });
  };

  // --- RENDER HELPERS ---
  const inputClass = "w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";
  const btnClass = "w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-3xl"></div>

      <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-white p-10 z-10 animate-fade-in relative">
        
        {/* Back Button (if not on login screen) */}
        {view !== 'login' && view !== 'reset_password' && (
          <button onClick={() => { setView('login'); resetErrors(); }} className="absolute top-6 left-6 text-sm text-slate-400 hover:text-indigo-600 font-semibold transition-colors flex items-center gap-1">
            ← Back
          </button>
        )}

        {/* Branding */}
        <div className="flex flex-col items-center mb-8 pt-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <span className="text-white font-bold text-2xl">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">Quality<span className="text-indigo-500">System</span></h1>
        </div>

        {/* Messages */}
        {error && <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl mb-6 border border-rose-100 text-center font-medium animate-fade-in">{error}</div>}
        {successMsg && <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-xl mb-6 border border-emerald-100 text-center font-medium animate-fade-in">{successMsg}</div>}

        {/* --- VIEW: LOGIN --- */}
        {view === 'login' && (
          <form onSubmit={handleStandardLogin} className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="admin@sazgar.com" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <button type="button" onClick={() => { setView('forgot_email'); resetErrors(); }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Forgot Password?</button>
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading} className={`${btnClass} mt-4`}>{isLoading ? 'Authenticating...' : 'Sign In'}</button>
          </form>
        )}

        {/* --- VIEW: FORGOT PASSWORD (EMAIL) --- */}
        {view === 'forgot_email' && (
          <form onSubmit={handleVerifyEmail} className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Account Recovery</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your registered email address.</p>
            </div>
            <div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="Email address" />
            </div>
            <button type="submit" disabled={isLoading} className={btnClass}>{isLoading ? 'Checking...' : 'Continue'}</button>
          </form>
        )}

        {/* --- VIEW: CHOOSE RECOVERY METHOD --- */}
        {view === 'forgot_method' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Verification Method</h2>
              <p className="text-sm text-slate-500 mt-1">How would you like to verify your identity?</p>
            </div>
            <button onClick={() => setView('forgot_question')} className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 mr-4 border border-slate-100">?</div>
              <div>
                <p className="font-bold text-slate-700">Security Question</p>
                <p className="text-xs text-slate-500">Answer your personal secret question.</p>
              </div>
            </button>
            <button onClick={() => setView('forgot_key')} className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mr-4 border border-slate-100">⚿</div>
              <div>
                <p className="font-bold text-slate-700">Backup Key</p>
                <p className="text-xs text-slate-500">Use your 16-character offline key.</p>
              </div>
            </button>
          </div>
        )}

        {/* --- VIEW: SECURITY QUESTION --- */}
        {view === 'forgot_question' && (
          <form onSubmit={handleVerifyRecovery('question')} className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Security Question</h2>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4">
              <p className="text-sm font-semibold text-slate-700 text-center">{securityQuestion}</p>
            </div>
            <div>
              <input type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required className={inputClass} placeholder="Your answer" />
            </div>
            <button type="submit" disabled={isLoading} className={btnClass}>{isLoading ? 'Verifying...' : 'Verify Answer'}</button>
          </form>
        )}

        {/* --- VIEW: BACKUP KEY --- */}
        {view === 'forgot_key' && (
          <form onSubmit={handleVerifyRecovery('key')} className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Backup Key</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your offline recovery key.</p>
            </div>
            <div>
              <input type="text" value={backupKey} onChange={(e) => setBackupKey(e.target.value)} required className={`${inputClass} font-mono uppercase tracking-widest text-center`} placeholder="XXXX-XXXX-XXXX-XXXX" />
            </div>
            <button type="submit" disabled={isLoading} className={btnClass}>{isLoading ? 'Verifying...' : 'Verify Key'}</button>
          </form>
        )}

        {/* --- VIEW: RESET PASSWORD --- */}
        {view === 'reset_password' && (
          <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Set New Password</h2>
              <p className="text-sm text-slate-500 mt-1">Please enter a strong, new password.</p>
            </div>
            <div>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="6" className={inputClass} placeholder="New password" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all">
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>&copy; 2026 SAZGAR Engineering Works.</p>
        </div>
      </div>
    </div>
  );
}