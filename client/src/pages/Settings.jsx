// client/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';

// --- Icons ---
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const KeyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
const EyeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;
const ShieldCheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const BellIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const LaptopIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const QuestionMarkIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

export default function Settings() {
  const [user, setUser] = useState({ name: '', email: '', role: '' });
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    symbol: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('sazgar_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Real-time password strength analyzer
  useEffect(() => {
    let strength = 0;
    const checks = {
      length: newPassword.length >= 6,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      symbol: /[^A-Za-z0-9]/.test(newPassword),
    };
    setPasswordChecks(checks);
    if (checks.length) strength++;
    if (checks.uppercase) strength++;
    if (checks.number) strength++;
    if (checks.symbol) strength++;
    if (newPassword.length >= 8) strength = Math.min(4, strength + 1);
    setPasswordStrength(newPassword.length === 0 ? 0 : strength);
  }, [newPassword]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showToast('New passwords do not match.', 'error');
    }
    if (newPassword.length < 6) {
      return showToast('New password must be at least 6 characters long.', 'error');
    }
    if (passwordStrength < 2) {
      return showToast('Password is too weak. Please use numbers and letters.', 'error');
    }
    setIsLoading(true);
    fetch('http://localhost:5000/api/auth/update-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, currentPassword, newPassword })
    })
    .then(res => res.json())
    .then(data => {
      setIsLoading(false);
      if (data.error) return showToast(data.error, 'error');
      showToast('Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
    })
    .catch(() => {
      setIsLoading(false);
      showToast('Server connection failed.', 'error');
    });
  };

  const inputClass = "w-full border border-slate-300 bg-slate-50 focus:bg-white rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm";

  return (
    <div className="max-w-7xl mx-auto animate-fade-in font-sans pb-10">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-3 animate-fade-in ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {toast.type === 'error' ? '⚠️' : <ShieldCheckIcon />} {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your profile, security, and active sessions.</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('sazgar_token');
            localStorage.removeItem('sazgar_user');
            window.location.reload();
          }}
          className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-sm font-bold border border-rose-200 transition-colors"
        >
          <LogoutIcon /> Logout All Devices
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Profile & Sessions */}
        <div className="lg:col-span-5 space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-6 py-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
              <div className="w-24 h-24 bg-indigo-500 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-xl z-10 relative">
                <span className="text-3xl font-black text-white">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
              </div>
              <h2 className="text-xl font-bold text-white mt-4 z-10">{user.name || 'System User'}</h2>
              <p className="text-indigo-200 text-sm font-medium z-10">{user.email || 'user@sazgar.com'}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Role</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black uppercase tracking-widest border border-indigo-100">
                    {user.role || 'Standard Access'}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</label>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ShieldCheckIcon /> Active & Verified
                </div>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <LaptopIcon /> Active Sessions
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="text-sm font-bold text-slate-800">Current Session</p>
                <p className="text-xs text-slate-500 mt-0.5">Windows • Chrome Browser</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Active Now</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Security & Preferences */}
        <div className="lg:col-span-7 space-y-8">
          {/* Change Security Question */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <QuestionMarkIcon /> Security Question
            </h3>
            <p className="text-sm text-slate-500 mb-6">Change your account recovery question and answer.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Question</label>
                <select className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" disabled>
                  <option>Your first pet name?</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Answer</label>
                <input type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-slate-700" placeholder="Enter answer" disabled />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-medium">* Security question update will be available in next release.</p>
          </div>

          {/* Password Update */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <KeyIcon /> Password Update
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Ensure your account is using a strong password.</p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="p-6 sm:p-8 space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required 
                    className={inputClass} 
                    placeholder="Enter current password" 
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              
              <div className="w-full h-px bg-slate-100 my-6"></div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <input 
                    type={showNew ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    className={inputClass} 
                    placeholder="Create a new password" 
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    {showNew ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-500 uppercase">Strength</span>
                      <span className={`text-xs font-black uppercase ${
                        passwordStrength <= 1 ? 'text-rose-500' : passwordStrength === 2 ? 'text-amber-500' : passwordStrength === 3 ? 'text-indigo-500' : 'text-emerald-500'
                      }`}>
                        {passwordStrength <= 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                    <div className="flex gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className={`flex-1 rounded-full transition-colors ${
                          passwordStrength >= level 
                            ? (passwordStrength <= 1 ? 'bg-rose-500' : passwordStrength === 2 ? 'bg-amber-500' : passwordStrength === 3 ? 'bg-indigo-500' : 'bg-emerald-500')
                            : 'bg-slate-200'
                        }`}></div>
                      ))}
                    </div>
                    {/* Detailed Checklist */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${passwordChecks.length ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className="text-xs text-slate-500">At least 6 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${passwordChecks.uppercase ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className="text-xs text-slate-500">One uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${passwordChecks.number ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className="text-xs text-slate-500">One number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${passwordChecks.symbol ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className="text-xs text-slate-500">One symbol</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showNew ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className={`${inputClass} ${confirmPassword && newPassword !== confirmPassword ? 'border-rose-300 focus:ring-rose-500 bg-rose-50' : confirmPassword && newPassword === confirmPassword ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50' : ''}`} 
                    placeholder="Repeat new password" 
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500">Mismatch</span>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"><ShieldCheckIcon /></span>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full sm:w-auto bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 text-white font-black uppercase tracking-widest text-sm py-4 px-8 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Updating...</>
                  ) : (
                    <><KeyIcon /> Save New Password</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* System Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <BellIcon /> System Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">Email Notifications</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Receive alerts for critical V1 defects.</p>
                </div>
                <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-not-allowed opacity-80">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">Weekly Quality Digest</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Automated summary of PDI and DPU ratios.</p>
                </div>
                <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-not-allowed">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}