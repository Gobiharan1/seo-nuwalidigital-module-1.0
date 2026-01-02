
import React, { useState, useEffect, useCallback } from 'react';
import { Project, User, ActivityLog } from './types';
import { SetupWizard } from './components/SetupWizard';
import { ProjectSelector } from './components/ProjectSelector';
import { Dashboard } from './components/Dashboard';
import { AuthPage } from './components/AuthPage';
import { AdminPanel } from './components/AdminPanel';

const INITIAL_ADMINS: User[] = [
  { id: 'admin1', name: 'Admin One', email: 'admin1@seo.com', password: 'admin123', role: 'admin' },
  { id: 'admin2', name: 'Admin Two', email: 'admin2@seo.com', password: 'admin123', role: 'admin' },
  { id: 'admin3', name: 'Admin Three', email: 'admin3@seo.com', password: 'admin123', role: 'admin' },
  { id: 'admin4', name: 'Admin Four', email: 'admin4@seo.com', password: 'admin123', role: 'admin' },
];

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('seoUsers');
      setUsers(savedUsers ? JSON.parse(savedUsers) : INITIAL_ADMINS);
      if (!savedUsers) localStorage.setItem('seoUsers', JSON.stringify(INITIAL_ADMINS));
      
      const savedSession = localStorage.getItem('seoSession');
      if (savedSession) setCurrentUser(JSON.parse(savedSession));

      const savedProjects = localStorage.getItem('seoProjects');
      if (savedProjects) setProjects(JSON.parse(savedProjects));

      const savedLogs = localStorage.getItem('seoLogs');
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (error) { console.error("Persistence failure", error); }
  }, []);

  const handleLogin = (email: string, pass: string): boolean => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('seoSession', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('seoSession');
    setActiveProjectId(null);
  };

  const saveProjects = useCallback((updatedProjects: Project[]) => {
      setProjects(updatedProjects);
      localStorage.setItem('seoProjects', JSON.stringify(updatedProjects));
  }, []);

  const logActivity = (action: string, details: string) => {
    if (!currentUser || !activeProjectId) return;
    const project = projects.find(p => p.id === activeProjectId);
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      projectId: activeProjectId,
      projectName: project?.name || 'Unknown Project',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs].slice(0, 1000); // Keep last 1000 logs
    setLogs(updatedLogs);
    localStorage.setItem('seoLogs', JSON.stringify(updatedLogs));
  };

  const handleNewProject = (newProject: Project) => {
    if (!currentUser) return;
    const projectWithOwner = { ...newProject, ownerId: currentUser.id };
    const updatedProjects = [...projects, projectWithOwner];
    saveProjects(updatedProjects);
    setActiveProjectId(newProject.id);
    setIsWizardOpen(false);
    
    // Log project creation
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      projectId: newProject.id,
      projectName: newProject.name,
      action: 'initialized project',
      details: newProject.name,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('seoLogs', JSON.stringify(updatedLogs));
  };

  if (!currentUser) return <AuthPage onLogin={handleLogin} />;
  
  const activeProject = projects.find(p => p.id === activeProjectId);

  if (isAdminPanelOpen && currentUser.role === 'admin') {
    return (
      <AdminPanel 
        users={users} 
        logs={logs} 
        projects={projects}
        onAddUser={u => { const up = [...users, u]; setUsers(up); localStorage.setItem('seoUsers', JSON.stringify(up)); }}
        onDeleteUser={id => { const up = users.filter(u => u.id !== id); setUsers(up); localStorage.setItem('seoUsers', JSON.stringify(up)); }}
        onClose={() => setIsAdminPanelOpen(false)} 
      />
    );
  }

  if (isWizardOpen) return <SetupWizard onComplete={handleNewProject} onCancel={() => setIsWizardOpen(false)} />;
  
  if (activeProject) {
    return (
      <Dashboard 
        project={activeProject} 
        users={users} 
        currentUser={currentUser}
        onUpdateProject={p => saveProjects(projects.map(item => item.id === p.id ? p : item))} 
        onLogActivity={logActivity}
        onBack={() => setActiveProjectId(null)} 
      />
    );
  }

  return (
    <ProjectSelector 
        projects={projects} 
        currentUser={currentUser}
        onSelectProject={id => setActiveProjectId(id)} 
        onNewProject={() => setIsWizardOpen(true)} 
        onDeleteProject={id => saveProjects(projects.filter(p => p.id !== id))}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
    />
  );
};

export default App;
