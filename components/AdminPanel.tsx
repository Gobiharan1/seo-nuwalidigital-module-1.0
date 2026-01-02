
import React, { useState, useMemo } from 'react';
import { User, ActivityLog, Project } from '../types';
import { PlusIcon, ActivityIcon, UserIcon, BarChartIcon } from './icons';

interface AdminPanelProps {
  users: User[];
  logs: ActivityLog[];
  projects: Project[];
  onAddUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, logs, projects, onAddUser, onDeleteUser, onClose }) => {
  const [tab, setTab] = useState<'users' | 'analytics' | 'logs'>('users');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');

  const userStats = useMemo(() => {
    return users.map(user => {
      const userLogs = logs.filter(l => l.userId === user.id);
      const tasksCompleted = userLogs.filter(l => l.action.toLowerCase().includes('completed')).length;
      const projectsInvolved = new Set(userLogs.map(l => l.projectId)).size;
      return {
        ...user,
        tasksCompleted,
        projectsInvolved,
        lastActive: userLogs.length > 0 ? userLogs[0].timestamp : 'Never'
      };
    });
  }, [users, logs]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName || !newPass) return;
    onAddUser({
      id: Date.now().toString(),
      email: newEmail,
      name: newName,
      password: newPass,
      role: 'user'
    });
    setNewEmail(''); setNewName(''); setNewPass('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl p-6 md:p-12 lg:p-20 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-white">Authority <span className="text-primary">Governance</span></h1>
                <p className="text-text-secondary">Administrative workforce monitoring & project audit console.</p>
            </div>
            <div className="flex bg-surface rounded-2xl p-1 border border-border">
                <button onClick={() => setTab('users')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'users' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}><UserIcon className="w-4 h-4"/> Users</button>
                <button onClick={() => setTab('analytics')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'analytics' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}><BarChartIcon className="w-4 h-4"/> Analytics</button>
                <button onClick={() => setTab('logs')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'logs' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}><ActivityIcon className="w-4 h-4"/> Audit Log</button>
            </div>
            <button onClick={onClose} className="px-6 py-3 rounded-xl bg-surface-hover text-sm font-bold border border-border text-text-primary">Exit Console</button>
        </header>

        {tab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fadeIn">
                <div className="lg:col-span-1">
                    <form onSubmit={handleAdd} className="bg-bkg-light border border-border p-8 rounded-[2rem] space-y-4 shadow-2xl">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Provision New User</h3>
                        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full Name" className="w-full bg-bkg border border-border p-4 rounded-xl text-sm outline-none focus:border-primary text-white"/>
                        <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email Address" className="w-full bg-bkg border border-border p-4 rounded-xl text-sm outline-none focus:border-primary text-white"/>
                        <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Initial Password" className="w-full bg-bkg border border-border p-4 rounded-xl text-sm outline-none focus:border-primary text-white"/>
                        <button type="submit" className="w-full py-4 bg-primary rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 text-white mt-4">Create Workforce Entity</button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Workforce Registry ({users.length} Active)</h3>
                    {userStats.map(user => (
                        <div key={user.id} className="bg-bkg-light border border-border p-6 rounded-[2rem] flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${user.role === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface text-text-secondary shadow-inner'}`}>
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-white">{user.name} <span className="text-[10px] bg-surface px-2 py-0.5 rounded ml-2 uppercase opacity-60 text-primary font-black tracking-tighter">{user.role}</span></p>
                                    <p className="text-xs text-text-secondary">{user.email}</p>
                                    <p className="text-[10px] text-text-secondary mt-1 font-bold">Involved in {user.projectsInvolved} projects • {user.tasksCompleted} tasks done</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {user.role !== 'admin' && (
                                    <button onClick={() => onDeleteUser(user.id)} className="text-[10px] font-black uppercase text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">De-provision</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {tab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                <div className="lg:col-span-3 bg-bkg-light border border-border p-10 rounded-[2.5rem] mb-6">
                    <h3 className="text-xl font-black text-white mb-8">Workforce Efficiency <span className="text-text-secondary text-sm font-medium ml-2 tracking-normal">Tasks completed per entity</span></h3>
                    <div className="space-y-8">
                        {userStats.sort((a,b) => b.tasksCompleted - a.tasksCompleted).map(user => {
                            const maxTasks = Math.max(...userStats.map(u => u.tasksCompleted), 1);
                            const percent = (user.tasksCompleted / maxTasks) * 100;
                            return (
                                <div key={user.id} className="space-y-2">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                        <span className="text-text-primary">{user.name}</span>
                                        <span className="text-primary">{user.tasksCompleted} Tasks</span>
                                    </div>
                                    <div className="w-full bg-surface h-4 rounded-full overflow-hidden border border-border">
                                        <div className="bg-primary h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{width: `${percent}%`}}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        {tab === 'logs' && (
            <div className="bg-bkg-light border border-border rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
                <div className="p-8 border-b border-border bg-surface/30">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Global Audit Ledger</h3>
                    <p className="text-xs text-text-secondary mt-1">Real-time trace of all project interactions.</p>
                </div>
                <div className="divide-y divide-border max-h-[600px] overflow-auto custom-scrollbar">
                    {logs.length > 0 ? logs.map(log => (
                        <div key={log.id} className="p-6 hover:bg-surface/20 transition-colors flex gap-6 items-start">
                            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary font-black flex-shrink-0 text-sm">
                                {log.userName.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-text-primary font-bold">
                                    <span className="text-primary">{log.userName}</span> {log.action} 
                                    <span className="text-text-secondary font-medium ml-1">"{log.details}"</span>
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black uppercase text-text-secondary opacity-50">{log.projectName}</span>
                                    <span className="text-[10px] font-medium text-text-secondary opacity-40">• {new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center">
                            <ActivityIcon className="w-12 h-12 text-text-secondary opacity-20 mx-auto mb-4"/>
                            <p className="text-text-secondary italic">No records in the audit ledger.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
