
import React from 'react';
import { Project } from '../types';
import { PlusIcon, FileTextIcon } from './icons';

interface ProjectSelectorProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ projects, onSelectProject, onNewProject, onDeleteProject }) => {
  return (
    <div className="min-h-screen bg-bkg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">AI SEO Project Manager</h1>
        <p className="text-lg text-text-secondary mb-12">Select a project to continue or create a new one.</p>

        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.id} className="group flex items-center justify-between p-4 bg-bkg-light border border-border rounded-lg hover:bg-surface transition-all duration-200 cursor-pointer" onClick={() => onSelectProject(project.id)}>
                <div className="flex items-center gap-4">
                    <FileTextIcon className="w-6 h-6 text-text-secondary" />
                    <div>
                        <h2 className="text-lg font-semibold text-left text-text-primary">{project.name}</h2>
                        <p className="text-sm text-left text-text-secondary">{project.startDate} to {project.endDate}</p>
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} 
                    className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                    Delete
                </button>
            </div>
          ))}
          
          <button
            onClick={onNewProject}
            className="w-full flex items-center justify-center gap-2 p-4 bg-transparent border-2 border-dashed border-border rounded-lg text-text-secondary hover:bg-surface hover:border-solid hover:text-text-primary transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            Create New Project
          </button>
        </div>
      </div>
    </div>
  );
};
   