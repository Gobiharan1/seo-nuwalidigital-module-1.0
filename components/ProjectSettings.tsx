
import React, { useState } from 'react';
import { Project, Page, User } from '../types';
import { CheckIcon, PlusIcon, CalendarIcon } from './icons';

interface ProjectSettingsProps {
  project: Project;
  users: User[];
  onUpdate: (updatedProject: Project) => void;
  onLog: (action: string, details: string) => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project, users, onUpdate, onLog }) => {
  const [formData, setFormData] = useState<Project>({ ...project });
  const [saved, setSaved] = useState(false);

  const handleUpdateField = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatePage = (idx: number, field: keyof Page, value: any) => {
    const newPages = [...formData.pages];
    newPages[idx] = { ...newPages[idx], [field]: value };
    setFormData(prev => ({ ...prev, pages: newPages }));
  };

  const handleAddPage = () => {
    const newPage: Page = {
      name: 'New Entity',
      priority: 'Medium',
      mainKw: '',
      secKw: [],
      lsiKw: []
    };
    setFormData(prev => ({ ...prev, pages: [...prev.pages, newPage] }));
  };

  const handleRemovePage = (idx: number) => {
    const newPages = formData.pages.filter((_, i) => i !== idx);
    setFormData(prev => ({ ...prev, pages: newPages }));
  };

  const saveChanges = () => {
    onUpdate(formData);
    onLog('updated project configuration', formData.name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="bg-bkg-light border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-primary"/>
            </div>
            Core Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Project Name</label>
                <input 
                    value={formData.name} 
                    onChange={e => handleUpdateField('name', e.target.value)}
                    className="w-full bg-bkg border border-border p-4 rounded-2xl text-sm focus:border-primary outline-none text-white transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Primary Keyword</label>
                <input 
                    value={formData.primaryKw} 
                    onChange={e => handleUpdateField('primaryKw', e.target.value)}
                    className="w-full bg-bkg border border-border p-4 rounded-2xl text-sm focus:border-primary outline-none text-white transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Launch Date</label>
                <input 
                    type="date"
                    value={formData.startDate} 
                    onChange={e => handleUpdateField('startDate', e.target.value)}
                    className="w-full bg-bkg border border-border p-4 rounded-2xl text-sm focus:border-primary outline-none text-white transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Target End Date</label>
                <input 
                    type="date"
                    value={formData.endDate} 
                    onChange={e => handleUpdateField('endDate', e.target.value)}
                    className="w-full bg-bkg border border-border p-4 rounded-2xl text-sm focus:border-primary outline-none text-white transition-all"
                />
            </div>
        </div>
      </div>

      <div className="bg-bkg-light border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <PlusIcon className="w-5 h-5 text-secondary"/>
                </div>
                Page Registry
            </h3>
            <button onClick={handleAddPage} className="px-5 py-2.5 bg-surface hover:bg-surface-hover rounded-xl text-[10px] font-black uppercase tracking-widest text-text-primary border border-border transition-all">+ Add Page</button>
        </div>

        <div className="space-y-4">
            {formData.pages.map((page, idx) => (
                <div key={idx} className="p-6 bg-surface/30 rounded-2xl border border-border grid grid-cols-1 md:grid-cols-12 gap-6 items-center group">
                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">Page Name</label>
                        <input 
                            value={page.name} 
                            onChange={e => handleUpdatePage(idx, 'name', e.target.value)}
                            className="w-full bg-bkg border border-border p-2.5 rounded-xl text-xs text-white outline-none focus:border-primary"
                        />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">Target Keyword</label>
                        <input 
                            value={page.mainKw} 
                            onChange={e => handleUpdatePage(idx, 'mainKw', e.target.value)}
                            className="w-full bg-bkg border border-border p-2.5 rounded-xl text-xs text-white outline-none focus:border-primary"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">Priority</label>
                        <select 
                            value={page.priority} 
                            onChange={e => handleUpdatePage(idx, 'priority', e.target.value)}
                            className="w-full bg-bkg border border-border p-2.5 rounded-xl text-xs text-white outline-none focus:border-primary"
                        >
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">Deadline</label>
                        <input 
                            type="date"
                            value={page.deadline || ''} 
                            onChange={e => handleUpdatePage(idx, 'deadline', e.target.value)}
                            className="w-full bg-bkg border border-border p-2.5 rounded-xl text-xs text-white outline-none focus:border-primary"
                        />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                        <button onClick={() => handleRemovePage(idx)} className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="sticky bottom-8 flex justify-center z-20">
        <button 
            onClick={saveChanges}
            className={`px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 ${saved ? 'bg-green text-white scale-95' : 'bg-primary text-white hover:brightness-110 active:scale-95 shadow-primary/20'}`}
        >
            {saved ? <><CheckIcon className="w-5 h-5"/> Authority Updated</> : 'Commit Project Changes'}
        </button>
      </div>
    </div>
  );
};
