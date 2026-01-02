
import React, { useState } from 'react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (email: string, pass: string) => boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(email, pass);
    if (!success) setError(true);
  };

  return (
    <div className="min-h-screen bg-bkg flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
      <div className="max-w-md w-full animate-fadeIn">
        <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-primary/10 rotate-3">
                <span className="text-4xl font-black text-primary">A</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-text-primary mb-2 uppercase">Authority <span className="text-primary">SEO</span></h1>
            <p className="text-text-secondary text-sm font-medium">Enterprise Project & AEO Governance</p>
        </div>

        <div className="bg-bkg-light border border-border p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black uppercase text-text-secondary mb-2 tracking-widest">Identify</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => {setEmail(e.target.value); setError(false);}}
                        placeholder="admin@seo.com" 
                        className="w-full bg-surface border border-border p-4 rounded-2xl text-sm focus:border-primary outline-none transition-all placeholder:opacity-30"
                        required
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase text-text-secondary mb-2 tracking-widest">Credential</label>
                    <input 
                        type="password" 
                        value={pass} 
                        onChange={e => {setPass(e.target.value); setError(false);}}
                        placeholder="••••••••" 
                        className="w-full bg-surface border border-border p-4 rounded-2xl text-sm focus:border-primary outline-none transition-all"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-xs font-bold text-center animate-bounce">Invalid identifier or credential.</p>}
                <button type="submit" className="w-full py-5 bg-primary rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                    Initialize Session
                </button>
            </form>
            <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-4">
                <p className="text-[10px] text-text-secondary text-center leading-relaxed">System protected by local authority governance.<br/>Unauthorised access is logged locally.</p>
            </div>
        </div>
      </div>
    </div>
  );
};
