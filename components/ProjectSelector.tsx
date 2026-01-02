
import React, { useState } from 'react';
import { Project, User } from '../types';
import { PlusIcon, FileTextIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';

interface ProjectSelectorProps {
  projects: Project[];
  currentUser: User;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ 
  projects, 
  currentUser, 
  onSelectProject, 
  onNewProject, 
  onDeleteProject,
  onOpenAdmin,
  onLogout
}) => {
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-bkg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <header className="flex justify-between items-center mb-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter mb-2">Authority <span className="text-primary">Terminal</span></h1>
                <p className="text-text-secondary font-medium">Welcome back, <span className="text-text-primary font-bold">{currentUser.name}</span></p>
            </div>
            <div className="flex gap-3">
                {isAdmin && <button onClick={onOpenAdmin} className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all">Admin</button>}
                <button onClick={onLogout} className="px-5 py-2.5 rounded-xl bg-surface text-text-secondary text-xs font-black uppercase tracking-widest border border-border">Logout</button>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {projects.map(project => (
            <div 
                key={project.id} 
                className="group relative bg-bkg-light border border-border p-6 rounded-[2rem] hover:bg-surface/50 hover:border-primary/40 transition-all cursor-pointer shadow-xl overflow-hidden" 
                onClick={() => onSelectProject(project.id)}
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-inner">
                            <FileTextIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-black text-text-primary truncate">{project.name}</h2>
                            <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary opacity-60 italic">{project.primaryKw}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <p className="text-[10px] font-bold text-text-secondary">{project.pages.length} target entities</p>
                        {isAdmin && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteCandidate(project.id); }} 
                                className="text-[10px] font-black uppercase text-red-500 hover:brightness-110 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Terminate
                            </button>
                        )}
                    </div>
                </div>
            </div>
          ))}
          
          <button
            onClick={onNewProject}
            className="w-full min-h-[140px] flex flex-col items-center justify-center gap-3 p-6 bg-transparent border-2 border-dashed border-border rounded-[2rem] text-text-secondary hover:bg-surface hover:border-solid hover:text-primary transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-full border border-dashed border-text-secondary flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                <PlusIcon className="w-6 h-6" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em]">New Authority Core</span>
          </button>
        </div>

        {!isAdmin && (
            <p className="text-center text-[10px] text-text-secondary font-medium uppercase tracking-[0.1em] opacity-40">Project deletion requires administrative privilege.</p>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!deleteCandidate}
        title="Confirm Termination"
        message="Are you certain you wish to purge this authority core? This action is irreversible and all mapped entities will be lost."
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
            if (deleteCandidate) onDeleteProject(deleteCandidate);
            setDeleteCandidate(null);
        }}
      />
    </div>
  );
};
