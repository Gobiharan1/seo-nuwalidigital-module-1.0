
import React, { useState, useMemo, useEffect } from 'react';
import { Project, Phase, Task, User, Page, ActivityLog } from '../types';
import { CheckIcon, ChevronDownIcon, CalendarIcon, ListIcon, ArrowLeftIcon, ArrowRightIcon, FileTextIcon, PlusIcon, UserIcon, ActivityIcon, BarChartIcon } from './icons';
import { AIPromptLibrary } from './AIPromptLibrary';
import { SchemaGenerator } from './SchemaGenerator';
import { AEOScorer } from './AEOScorer';
import { ProjectSettings } from './ProjectSettings';

interface DashboardProps {
  project: Project;
  users: User[];
  currentUser: User;
  onUpdateProject: (updatedProject: Project) => void;
  onLogActivity: (action: string, details: string) => void;
  onBack: () => void;
}

const toDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getTagColor = (tag: string): string => {
  const normalizedTag = tag.toLowerCase();
  const colors: { [key: string]: string } = {
    'strategy': 'bg-blue-900/40 text-blue-300 border-blue-500/20',
    'planning': 'bg-blue-900/40 text-blue-300 border-blue-500/20',
    'research': 'bg-sky-900/40 text-sky-300 border-sky-500/20',
    'technical': 'bg-purple-900/40 text-purple-300 border-purple-500/20',
    'on-page': 'bg-emerald-900/40 text-emerald-300 border-emerald-500/20',
    'content': 'bg-green-900/40 text-green-300 border-green-500/20',
    'aeo': 'bg-rose-900/50 text-rose-200 border-rose-400/30 font-bold',
    'llm': 'bg-rose-900/50 text-rose-200 border-rose-400/30 font-bold',
    'ai': 'bg-pink-900/40 text-pink-300 border-pink-500/20',
    'backlinks': 'bg-amber-900/40 text-amber-300 border-amber-500/20',
    'reporting': 'bg-slate-700/40 text-slate-300 border-slate-500/20',
  };
  for (const key in colors) if (normalizedTag.includes(key)) return colors[key];
  return 'bg-zinc-800 text-zinc-400 border-zinc-700';
};

const TaskItem: React.FC<{ task: Task, users: User[], onToggle: () => void }> = ({ task, users, onToggle }) => {
    const completedByUser = task.completedByUserId ? users.find(u => u.id === task.completedByUserId) : null;

    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-border hover:bg-surface/30 transition-all group ${task.completed ? 'opacity-40' : ''}`}>
            <button 
                onClick={onToggle} 
                className={`mt-1 w-6 h-6 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${task.completed ? 'bg-green border-green' : 'border-border group-hover:border-primary'}`}
            >
                {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
            </button>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <p className={`text-text-primary font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                    {task.completed && completedByUser && (
                        <div className="flex items-center gap-2" title={`Done by ${completedByUser.name}`}>
                             <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[8px] font-black flex items-center justify-center uppercase">{completedByUser.name.charAt(0)}</div>
                             <span className="text-[9px] font-bold text-text-secondary uppercase tracking-tighter">Done by {completedByUser.name.split(' ')[0]}</span>
                        </div>
                    )}
                </div>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">{task.desc}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                    {task.tags.map(tag => (
                        <span key={tag} className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md border ${getTagColor(tag)}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PhaseAccordion: React.FC<{ phase: Phase, users: User[], onToggleTask: (taskIndex: number) => void }> = ({ phase, users, onToggleTask }) => {
    const [isOpen, setIsOpen] = useState(true);
    const completedTasks = useMemo(() => phase.tasks.filter(t => t.completed).length, [phase.tasks]);
    const progress = phase.tasks.length > 0 ? Math.round((completedTasks / phase.tasks.length) * 100) : 0;

    return (
        <div className="bg-bkg-light/50 backdrop-blur-md border border-border rounded-2xl overflow-hidden shadow-lg mb-6">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 text-left hover:bg-surface/20 transition-colors">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 flex items-center justify-center bg-surface rounded-xl text-2xl shadow-inner border border-border">{phase.icon}</div>
                    <div>
                        <h3 className="text-xl font-bold text-text-primary">{phase.title}</h3>
                        <p className="text-sm text-text-secondary font-medium mt-0.5">{phase.meta}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-text-secondary mb-1">Phase Progress</div>
                        <div className="w-32 bg-surface rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <p className="text-lg font-bold text-primary">{progress}%</p>
                    <ChevronDownIcon className={`w-6 h-6 text-text-secondary transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
                </div>
            </button>
            {isOpen && (
                <div className="px-6 pb-6 animate-fadeIn">
                    <div className="border-t border-border/50 pt-4 space-y-2">
                        {phase.tasks.map((task, index) => (
                            <TaskItem key={index} task={task} users={users} onToggle={() => onToggleTask(index)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const CalendarView: React.FC<{ scheduledTasks: Map<string, (Task & { phaseTitle: string })[]>, projectStartDate: string }> = ({ scheduledTasks, projectStartDate }) => {
    const [displayDate, setDisplayDate] = useState(() => {
        const start = new Date(projectStartDate);
        start.setDate(1);
        return start;
    });
    const monthName = displayDate.toLocaleString('default', { month: 'long' });
    const year = displayDate.getFullYear();
    const prevMonth = () => setDisplayDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    const nextMonth = () => setDisplayDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    const daysInMonth = new Date(year, displayDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, displayDate.getMonth(), 1).getDay();
    const calendarDays = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, i) => i < firstDayOfMonth ? null : i - firstDayOfMonth + 1);
    const todayKey = toDateKey(new Date());

    return (
        <div className="bg-bkg-light/50 backdrop-blur-md border border-border rounded-2xl p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold tracking-tight">{monthName} <span className="text-text-secondary font-medium">{year}</span></h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border transition-colors"><ArrowLeftIcon className="w-5 h-5" /></button>
                    <button onClick={nextMonth} className="p-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border transition-colors"><ArrowRightIcon className="w-5 h-5" /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-3">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="text-center text-[10px] text-text-secondary font-black tracking-widest py-2">{day}</div>
                ))}
                {calendarDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="aspect-square opacity-20"></div>;
                    const date = new Date(year, displayDate.getMonth(), day);
                    const dateKey = toDateKey(date);
                    const tasksForDay = scheduledTasks.get(dateKey) || [];
                    const isToday = dateKey === todayKey;
                    return (
                        <div key={dateKey} className={`relative pt-9 p-2 border border-border/30 rounded-xl min-h-[140px] transition-all hover:bg-surface/40 hover:border-primary/30 group ${isToday ? 'bg-primary/5 border-primary/40' : 'bg-bkg/40'}`}>
                            <span className={`absolute top-3 left-3 text-xs font-bold ${isToday ? 'bg-primary text-white rounded-lg px-2 py-1 shadow-lg shadow-primary/20' : 'text-text-secondary'}`}>
                                {day}
                            </span>
                            <div className="space-y-1.5 overflow-hidden">
                                {tasksForDay.slice(0, 3).map((task, taskIndex) => (
                                    <div key={taskIndex} title={`${task.phaseTitle}: ${task.title}`} className={`text-[10px] p-1.5 rounded-md truncate cursor-pointer font-medium border ${task.completed ? 'bg-green/10 text-text-secondary line-through border-green/20' : 'bg-surface-hover/80 text-text-primary border-border shadow-sm'}`}>
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ project, users, currentUser, onUpdateProject, onLogActivity, onBack }) => {
  const [currentProject, setCurrentProject] = useState(project);
  const [view, setView] = useState<'list' | 'calendar' | 'prompts' | 'tools' | 'scorer' | 'assignments' | 'settings'>('list');

  useEffect(() => setCurrentProject(project), [project]);

  const isAdmin = currentUser.role === 'admin';

  const handleToggleTask = (phaseIndex: number, taskIndex: number) => {
    const updatedProject = { ...currentProject };
    const task = updatedProject.phases[phaseIndex].tasks[taskIndex];
    task.completed = !task.completed;
    task.completedByUserId = task.completed ? currentUser.id : undefined;
    task.completedAt = task.completed ? new Date().toISOString() : undefined;
    
    setCurrentProject(updatedProject);
    onUpdateProject(updatedProject);
    onLogActivity(task.completed ? 'completed task' : 'reopened task', task.title);
  };

  const handleAssignPage = (pageIndex: number, userId: string) => {
    const updatedProject = { ...currentProject };
    updatedProject.pages[pageIndex].assignedUserId = userId;
    updatedProject.pages[pageIndex].assignedAt = userId ? new Date().toISOString() : undefined;
    
    const assignedUser = users.find(u => u.id === userId);
    setCurrentProject(updatedProject);
    onUpdateProject(updatedProject);
    onLogActivity('assigned page', `${updatedProject.pages[pageIndex].name} to ${assignedUser?.name || 'Unassigned'}`);
  };

  const handleSetPageDeadline = (pageIndex: number, deadline: string) => {
    const updatedProject = { ...currentProject };
    updatedProject.pages[pageIndex].deadline = deadline;
    setCurrentProject(updatedProject);
    onUpdateProject(updatedProject);
    onLogActivity('updated deadline', `${updatedProject.pages[pageIndex].name} deadline set to ${deadline}`);
  };

  const { totalTasks, completedTasks, progress } = useMemo(() => {
    let completed = 0; let total = 0;
    currentProject.phases.forEach(ph => { total += ph.tasks.length; completed += ph.tasks.filter(t => t.completed).length; });
    return { totalTasks: total, completedTasks: completed, progress: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [currentProject]);

  const workforceStats = useMemo(() => {
    return users.map(user => {
        const assignedPages = currentProject.pages.filter(p => p.assignedUserId === user.id);
        const tasksDone = currentProject.phases.flatMap(ph => ph.tasks).filter(t => t.completedByUserId === user.id);
        const contributionPercent = totalTasks > 0 ? Math.round((tasksDone.length / totalTasks) * 100) : 0;
        
        return {
            ...user,
            assignedPages,
            tasksDone,
            contributionPercent,
            isLead: user.id === currentProject.ownerId
        };
    }).filter(u => u.tasksDone.length > 0 || u.assignedPages.length > 0 || u.id === currentProject.ownerId);
  }, [currentProject, users, totalTasks]);

  const scheduledTasks = useMemo(() => {
    const taskMap = new Map<string, (Task & { phaseTitle: string })[]>();
    const projectStartDate = new Date(project.startDate);
    project.phases.forEach(phase => {
      const weekMatch = phase.meta.match(/Week (\d+)(?:-(\d+))?/);
      if (!weekMatch) return;
      const startWeek = parseInt(weekMatch[1], 10);
      const endWeek = weekMatch[2] ? parseInt(weekMatch[2], 10) : startWeek;
      const phaseStartDate = new Date(projectStartDate);
      phaseStartDate.setDate(projectStartDate.getDate() + (startWeek - 1) * 7);
      const phaseEndDate = new Date(projectStartDate);
      phaseEndDate.setDate(projectStartDate.getDate() + (endWeek * 7 - 1));
      const durationDays = (phaseEndDate.getTime() - phaseStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
      phase.tasks.forEach((task, index) => {
        const dayOffset = Math.floor(index * (durationDays / phase.tasks.length));
        const dateKey = toDateKey(new Date(phaseStartDate.getTime() + dayOffset * 24 * 60 * 60 * 1000));
        if (!taskMap.has(dateKey)) taskMap.set(dateKey, []);
        taskMap.get(dateKey)!.push({ ...task, phaseTitle: phase.title });
      });
    });
    return taskMap;
  }, [project]);

  return (
    <div className="min-h-screen bg-bkg text-text-primary pb-20">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col lg:flex-row gap-10">
            <aside className="lg:w-64 space-y-8 flex-shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary transition-colors group">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Exit Dashboard
                </button>
                <nav className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4">Implementation</p>
                    <button onClick={() => setView('list')} className={`w-full ${view === 'list' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-text-secondary hover:bg-surface'} flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all font-bold text-sm`}><ListIcon className="w-4 h-4"/> Roadmap</button>
                    <button onClick={() => setView('calendar')} className={`w-full ${view === 'calendar' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-text-secondary hover:bg-surface'} flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all font-bold text-sm`}><CalendarIcon className="w-4 h-4"/> Calendar</button>
                    <button onClick={() => setView('assignments')} className={`w-full ${view === 'assignments' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-text-secondary hover:bg-surface'} flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all font-bold text-sm`}><UserIcon className="w-4 h-4"/> Workforce</button>
                    <p className="px-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 mt-10">Strategy Suite</p>
                    <button onClick={() => setView('prompts')} className={`w-full ${view === 'prompts' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-text-secondary hover:bg-surface'} flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all font-bold text-sm`}><FileTextIcon className="w-4 h-4"/> Content Factory</button>
                    <button onClick={() => setView('scorer')} className={`w-full ${view === 'scorer' ? 'bg-orange/10 text-orange border-l-4 border-orange' : 'text-text-secondary hover:bg-surface'} flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all font-bold text-sm`}><CheckIcon className="w-4 h-4"/> AEO Scorer</button>
                    <p className="px-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 mt-10">Project Management</p>
                    <button onClick={() => setView('settings')} className={`w-full ${view === 'settings' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-text-secondary hover:bg-surface'} flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all font-bold text-sm`}><PlusIcon className="w-4 h-4"/> Settings</button>
                </nav>
            </aside>
            <main className="flex-1 min-w-0">
                <header className="mb-10 animate-fadeIn flex justify-between items-end">
                    <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-3">Project Dashboard</div>
                        <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight">{currentProject.name}</h1>
                    </div>
                    <div className="text-right hidden sm:block">
                         <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Global Completion</div>
                         <div className="text-3xl font-black text-primary">{progress}%</div>
                    </div>
                </header>

                {view === 'list' && (
                    <div className="space-y-6 animate-fadeIn">
                        {currentProject.phases.map((phase, index) => (
                            <PhaseAccordion key={phase.id} phase={phase} users={users} onToggleTask={(taskIndex) => handleToggleTask(index, taskIndex)} />
                        ))}
                    </div>
                )}
                
                {view === 'calendar' && <CalendarView scheduledTasks={scheduledTasks} projectStartDate={currentProject.startDate} />}
                {view === 'prompts' && <AIPromptLibrary />}
                {view === 'scorer' && <AEOScorer />}
                {view === 'settings' && <ProjectSettings project={currentProject} users={users} onUpdate={onUpdateProject} onLog={onLogActivity} />}

                {view === 'assignments' && (
                    <div className="space-y-10 animate-fadeIn">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-bkg-light border border-border p-6 rounded-3xl flex items-center gap-5">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><UserIcon className="w-6 h-6"/></div>
                                <div><p className="text-[10px] font-black uppercase text-text-secondary">Contributors</p><p className="text-2xl font-black text-white">{workforceStats.length}</p></div>
                            </div>
                            <div className="bg-bkg-light border border-border p-6 rounded-3xl flex items-center gap-5">
                                <div className="w-12 h-12 bg-green/10 rounded-2xl flex items-center justify-center text-green"><CheckIcon className="w-6 h-6"/></div>
                                <div><p className="text-[10px] font-black uppercase text-text-secondary">Tasks Completed</p><p className="text-2xl font-black text-white">{completedTasks} / {totalTasks}</p></div>
                            </div>
                            <div className="bg-bkg-light border border-border p-6 rounded-3xl flex items-center gap-5">
                                <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary"><ActivityIcon className="w-6 h-6"/></div>
                                <div><p className="text-[10px] font-black uppercase text-text-secondary">Efficiency</p><p className="text-2xl font-black text-white">{progress}%</p></div>
                            </div>
                        </div>

                        {/* User Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {workforceStats.map(u => (
                                <div key={u.id} className="bg-bkg-light border border-border rounded-[2.5rem] p-8 hover:border-primary/40 transition-all group shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-surface flex items-center justify-center text-2xl font-black text-primary shadow-inner border border-border">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-white flex items-center gap-2">
                                                    {u.name}
                                                    {u.isLead && <span className="text-[8px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Project Lead</span>}
                                                </h4>
                                                <p className="text-xs text-text-secondary">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-primary">{u.contributionPercent}%</p>
                                            <p className="text-[9px] font-black uppercase text-text-secondary tracking-widest">Share of work</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">
                                                <span>Task Completion</span>
                                                <span>{u.tasksDone.length} Units</span>
                                            </div>
                                            <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-1000" style={{width: `${u.contributionPercent}%`}}></div>
                                            </div>
                                        </div>

                                        <div className="bg-bkg/50 border border-border rounded-2xl p-5">
                                            <h5 className="text-[10px] font-black uppercase text-text-secondary mb-4 tracking-[0.2em]">Owned Entities & Deadlines</h5>
                                            <div className="space-y-3">
                                                {u.assignedPages.length > 0 ? u.assignedPages.map(p => (
                                                    <div key={p.name} className="p-3 rounded-lg bg-surface border border-border flex justify-between items-center group/page">
                                                        <div>
                                                            <p className="text-xs font-bold text-text-primary">{p.name}</p>
                                                            <p className="text-[9px] text-text-secondary uppercase">Assigned: {formatDate(p.assignedAt)}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-[10px] font-black uppercase ${p.deadline ? 'text-primary' : 'text-text-secondary opacity-40'}`}>
                                                                {p.deadline ? `Due: ${formatDate(p.deadline)}` : 'No Deadline'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )) : <p className="text-[10px] text-text-secondary italic">No pages assigned directly.</p>}
                                            </div>
                                        </div>

                                        <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                            <h5 className="text-[10px] font-black uppercase text-text-secondary mb-3 tracking-[0.2em]">Recent Contributions</h5>
                                            <div className="space-y-2">
                                                {u.tasksDone.slice(0, 5).map((t, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 text-[10px] text-text-secondary group/task">
                                                        <CheckIcon className="w-3 h-3 text-green"/>
                                                        <span className="truncate group-hover/task:text-text-primary transition-colors">{t.title}</span>
                                                    </div>
                                                ))}
                                                {u.tasksDone.length === 0 && <p className="text-[10px] text-text-secondary italic">No tasks completed yet.</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Page Assignment Registry (Admin Only for Edit) */}
                        <div className="bg-bkg-light border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                            <h3 className="text-2xl font-black text-white mb-8">Workforce Registry & Assignments</h3>
                            <div className="space-y-4">
                                {currentProject.pages.map((page, idx) => {
                                    const assignedUser = users.find(u => u.id === page.assignedUserId);
                                    return (
                                        <div key={idx} className="bg-surface/30 p-6 rounded-2xl border border-border grid grid-cols-1 lg:grid-cols-12 gap-6 items-center group hover:border-primary/20 transition-all">
                                            <div className="lg:col-span-4 flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${page.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : page.priority === 'Medium' ? 'bg-orange/10 text-orange' : 'bg-green/10 text-green'}`}>
                                                    {page.priority.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-lg font-bold text-white truncate">{page.name}</p>
                                                    <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest opacity-60 truncate">KW: {page.mainKw}</p>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-3">
                                                <div className="flex flex-col">
                                                    <label className="text-[9px] font-black uppercase text-text-secondary mb-1 opacity-50 tracking-tighter">Assigned Date</label>
                                                    <div className="text-xs font-bold text-text-primary bg-bkg/40 px-3 py-2 rounded-xl border border-border/50">
                                                        {page.assignedAt ? formatDate(page.assignedAt) : '--'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-3">
                                                <div className="flex flex-col">
                                                    <label className="text-[9px] font-black uppercase text-text-secondary mb-1 opacity-50 tracking-tighter">Projected Deadline</label>
                                                    {isAdmin ? (
                                                        <input 
                                                            type="date"
                                                            value={page.deadline || ''}
                                                            onChange={e => handleSetPageDeadline(idx, e.target.value)}
                                                            className="bg-bkg border border-border p-2 rounded-xl text-xs text-text-primary outline-none focus:border-primary"
                                                        />
                                                    ) : (
                                                        <div className="text-xs font-bold text-primary bg-primary/5 px-3 py-2 rounded-xl border border-primary/20">
                                                            {page.deadline ? formatDate(page.deadline) : 'Not Set'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="lg:col-span-2 flex items-center justify-end gap-4">
                                                {isAdmin ? (
                                                    <div className="flex flex-col items-end w-full">
                                                        <label className="text-[9px] font-black uppercase text-text-secondary mb-1 opacity-50 tracking-tighter">Assignee</label>
                                                        <select 
                                                            value={page.assignedUserId || ''} 
                                                            onChange={e => handleAssignPage(idx, e.target.value)}
                                                            className="w-full bg-bkg border border-border p-2.5 rounded-xl text-xs text-text-primary outline-none focus:border-primary cursor-pointer hover:bg-surface transition-colors"
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 bg-bkg/40 px-4 py-2 rounded-xl border border-border">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${assignedUser ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface text-text-secondary'}`}>
                                                            {assignedUser ? assignedUser.name.charAt(0) : '?'}
                                                        </div>
                                                        <div className="hidden sm:block">
                                                            <p className="text-[10px] font-black uppercase text-text-secondary opacity-40 leading-none mb-1">Assignee</p>
                                                            <p className="text-xs font-bold text-text-primary leading-none truncate max-w-[80px]">{assignedUser ? assignedUser.name.split(' ')[0] : 'None'}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
      </div>
    </div>
  );
};
