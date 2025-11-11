
import React, { useState, useEffect, useCallback } from 'react';
import { Project } from './types';
import { SetupWizard } from './components/SetupWizard';
import { ProjectSelector } from './components/ProjectSelector';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('seoProjects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
      const savedActiveId = localStorage.getItem('activeSeoProjectId');
      if (savedActiveId) {
        setActiveProjectId(savedActiveId);
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
    }
  }, []);
  
  const saveProjects = useCallback((updatedProjects: Project[]) => {
      setProjects(updatedProjects);
      localStorage.setItem('seoProjects', JSON.stringify(updatedProjects));
  }, []);

  const handleNewProject = (newProject: Project) => {
    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    setActiveProjectId(newProject.id);
    localStorage.setItem('activeSeoProjectId', newProject.id);
    setIsWizardOpen(false);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
      const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
      saveProjects(updatedProjects);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      saveProjects(updatedProjects);
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
        localStorage.removeItem('activeSeoProjectId');
      }
    }
  };
  
  const selectProject = (projectId: string) => {
      setActiveProjectId(projectId);
      localStorage.setItem('activeSeoProjectId', projectId);
  };

  const deselectProject = () => {
      setActiveProjectId(null);
      localStorage.removeItem('activeSeoProjectId');
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  if (isWizardOpen) {
    return <SetupWizard onComplete={handleNewProject} onCancel={() => setIsWizardOpen(false)} />;
  }
  
  if (activeProject) {
    return <Dashboard project={activeProject} onUpdateProject={handleUpdateProject} onBack={deselectProject} />;
  }

  return <ProjectSelector projects={projects} onSelectProject={selectProject} onNewProject={() => setIsWizardOpen(true)} onDeleteProject={handleDeleteProject} />;
};

export default App;
   