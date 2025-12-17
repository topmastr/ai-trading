import React, { useState } from 'react';
import { Lock, Fingerprint, ArrowRight, Shield } from 'lucide-react';

interface AuthGateProps {
  onLogin: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate server verification
    setTimeout(() => {
      // In a real app, this would check against a backend. 
      if (accessCode !== 'mastr333') {
        setError('Access Code Invalid');
        setLoading(false);
      } else {
        setLoading(false);
        onLogin();
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0f1c] z-40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-yellow-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-gold-500/20">
             <Lock className="w-8 h-8 text-black" />
           </div>
           <h1 className="text-2xl font-black text-white tracking-tighter mb-2">
             SECURE TERMINAL ACCESS
           </h1>
           <p className="text-slate-500 text-sm">XAU-INTEL PRO TRADING SYSTEM</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-2xl">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gold-500 font-bold uppercase tracking-wider mb-1 block">Access Code</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition font-mono tracking-widest"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs flex items-center gap-2 bg-red-900/10 p-2 rounded border border-red-900/30">
                <Shield className="w-3 h-3" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-lg transition shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  AUTHENTICATE
                </>
              )}
            </button>
          </div>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-[10px] text-slate-600">
              Encrypted Connection (TLS 1.3) • 256-bit AES
            </p>
            <p className="text-[10px] text-slate-700 font-mono">
              (Default Access: mastr333)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthGate;