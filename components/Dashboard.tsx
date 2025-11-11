import React, { useState, useMemo, useEffect } from 'react';
import { Project, Phase, Task } from '../types';
import { CheckIcon, ChevronDownIcon, CalendarIcon, ListIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';

interface DashboardProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onBack: () => void;
}

const toDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const getTagColor = (tag: string): string => {
  const normalizedTag = tag.toLowerCase();
  const colors: { [key: string]: string } = {
    'strategy': 'bg-blue-900/50 text-blue-300 border border-blue-500/30',
    'planning': 'bg-blue-900/50 text-blue-300 border border-blue-500/30',
    'research': 'bg-sky-900/50 text-sky-300 border border-sky-500/30',
    'analysis': 'bg-sky-900/50 text-sky-300 border border-sky-500/30',
    'technical': 'bg-purple-900/50 text-purple-300 border border-purple-500/30',
    'structure': 'bg-purple-900/50 text-purple-300 border border-purple-500/30',
    'performance': 'bg-violet-900/50 text-violet-300 border border-violet-500/30',
    'security': 'bg-fuchsia-900/50 text-fuchsia-300 border border-fuchsia-500/30',
    'schema': 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30',
    'on-page': 'bg-green-900/50 text-green-300 border border-green-500/30',
    'content': 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30',
    'writing': 'bg-teal-900/50 text-teal-300 border border-teal-500/30',
    'keywords': 'bg-lime-900/50 text-lime-300 border border-lime-500/30',
    'off-page': 'bg-amber-900/50 text-amber-300 border border-amber-500/30',
    'backlinks': 'bg-orange-900/50 text-orange-300 border border-orange-500/30',
    'outreach': 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30',
    'linking': 'bg-amber-900/50 text-amber-300 border border-amber-500/30',
    'ai': 'bg-pink-900/50 text-pink-300 border border-pink-500/30',
    'aeo': 'bg-rose-900/50 text-rose-300 border border-rose-500/30',
    'llm': 'bg-rose-900/50 text-rose-300 border border-rose-500/30',
    'tools': 'bg-zinc-700 text-zinc-300 border border-zinc-500/30',
    'google': 'bg-zinc-700 text-zinc-300 border border-zinc-500/30',
    'reporting': 'bg-slate-700 text-slate-300 border border-slate-500/30',
    'audit': 'bg-slate-700 text-slate-300 border border-slate-500/30',
  };

  for (const key in colors) {
    if (normalizedTag.includes(key)) {
      return colors[key];
    }
  }

  // Fallback for any tags not matched above
  return 'bg-gray-700 text-gray-300 border border-gray-500/30';
};


const TaskItem: React.FC<{ task: Task, onToggle: () => void }> = ({ task, onToggle }) => (
    <div className={`flex items-start gap-4 p-3 rounded-md transition-opacity ${task.completed ? 'opacity-50' : ''}`}>
        <button onClick={onToggle} className={`mt-1 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green border-green' : 'border-border hover:border-primary'}`}>
            {task.completed && <CheckIcon className="w-3 h-3 text-white" />}
        </button>
        <div className="flex-1">
            <p className={`text-text-primary ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
            <p className="text-sm text-text-secondary mt-1">{task.desc}</p>
            <div className="flex flex-wrap gap-2 mt-2">
                {task.tags.map(tag => (
                    <span key={tag} className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTagColor(tag)}`}>{tag}</span>
                ))}
            </div>
        </div>
    </div>
);

const PhaseAccordion: React.FC<{ phase: Phase, onToggleTask: (taskIndex: number) => void }> = ({ phase, onToggleTask }) => {
    const [isOpen, setIsOpen] = useState(true);
    const completedTasks = useMemo(() => phase.tasks.filter(t => t.completed).length, [phase.tasks]);
    const totalTasks = phase.tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="bg-bkg-light border border-border rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-4">
                    <div className="text-2xl">{phase.icon}</div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">{phase.title}</h3>
                        <p className="text-sm text-text-secondary">{phase.meta}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-text-secondary">{progress}%</p>
                    <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    <div className="border-t border-border pt-2">
                        {phase.tasks.map((task, index) => (
                            <TaskItem key={index} task={task} onToggle={() => onToggleTask(index)} />
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

    const calendarDays = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, i) => {
        if (i < firstDayOfMonth) return null;
        return i - firstDayOfMonth + 1;
    });
    
    const todayKey = toDateKey(new Date());

    return (
        <div className="bg-bkg-light border border-border rounded-lg p-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 rounded-md hover:bg-surface"><ArrowLeftIcon className="w-5 h-5" /></button>
                <h3 className="text-lg font-semibold">{monthName} {year}</h3>
                <button onClick={nextMonth} className="p-2 rounded-md hover:bg-surface"><ArrowRightIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs text-text-secondary font-bold py-2">{day}</div>
                ))}
                {calendarDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="border border-transparent rounded-md"></div>;
                    const date = new Date(year, displayDate.getMonth(), day);
                    const dateKey = toDateKey(date);
                    const tasksForDay = scheduledTasks.get(dateKey) || [];
                    const isToday = dateKey === todayKey;

                    return (
                        <div key={dateKey} className={`relative pt-8 p-1.5 border border-border/50 rounded-md min-h-[120px] transition-colors hover:bg-surface ${isToday ? 'bg-surface' : ''}`}>
                            <span className={`absolute top-2 left-2 text-xs font-semibold ${isToday ? 'bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-text-secondary'}`}>
                                {day}
                            </span>
                            <div className="space-y-1">
                                {tasksForDay.slice(0, 3).map((task, taskIndex) => (
                                    <div key={taskIndex} title={`${task.phaseTitle}: ${task.title}`} className={`text-xs p-1 rounded truncate cursor-pointer ${task.completed ? 'bg-green/20 text-text-secondary line-through' : 'bg-surface-hover text-text-primary'}`}>
                                        {task.title}
                                    </div>
                                ))}
                                {tasksForDay.length > 3 && (
                                    <div className="text-xs text-text-secondary cursor-pointer mt-1">+ {tasksForDay.length - 3} more</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ project, onUpdateProject, onBack }) => {
  const [currentProject, setCurrentProject] = useState(project);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const handleToggleTask = (phaseIndex: number, taskIndex: number) => {
    const updatedProject = { ...currentProject };
    const task = updatedProject.phases[phaseIndex].tasks[taskIndex];
    task.completed = !task.completed;
    setCurrentProject(updatedProject);
    onUpdateProject(updatedProject);
  };

  const { completedTasks, totalTasks, progress } = useMemo(() => {
    let completed = 0;
    let total = 0;
    currentProject.phases.forEach(phase => {
        total += phase.tasks.length;
        completed += phase.tasks.filter(t => t.completed).length;
    });
    return {
        completedTasks: completed,
        totalTasks: total,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [currentProject]);

  const daysRemaining = useMemo(() => {
    const end = new Date(currentProject.endDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [currentProject.endDate]);

  const scheduledTasks = useMemo(() => {
    const taskMap = new Map<string, (Task & { phaseTitle: string })[]>();
    const projectStartDate = new Date(project.startDate);
    
    project.phases.forEach(phase => {
      const weekMatch = phase.meta.match(/Week (\d+)(?:-(\d+))?/);
      if (!weekMatch) return;

      const startWeek = parseInt(weekMatch[1], 10);
      const endWeek = weekMatch[2] ? parseInt(weekMatch[2], 10) : startWeek;

      const phaseStartOffset = (startWeek - 1) * 7;
      
      const phaseStartDate = new Date(projectStartDate);
      phaseStartDate.setHours(0,0,0,0);
      phaseStartDate.setDate(projectStartDate.getDate() + phaseStartOffset);

      const phaseEndDate = new Date(projectStartDate);
      phaseEndDate.setHours(0,0,0,0);
      phaseEndDate.setDate(projectStartDate.getDate() + (endWeek * 7 -1));
      
      const durationDays = Math.max(1, (phaseEndDate.getTime() - phaseStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1);
      const tasksInPhase = phase.tasks.length;

      if (tasksInPhase === 0) return;

      phase.tasks.forEach((task, index) => {
        const dayOffset = Math.floor(index * (durationDays / tasksInPhase));
        const currentTaskDate = new Date(phaseStartDate);
        currentTaskDate.setDate(phaseStartDate.getDate() + dayOffset);
        
        const dateKey = toDateKey(currentTaskDate);
        if (!taskMap.has(dateKey)) {
          taskMap.set(dateKey, []);
        }
        taskMap.get(dateKey)!.push({ ...task, phaseTitle: phase.title });
      });
    });
    return taskMap;
  }, [project]);

  const viewButtonClasses = (isActive: boolean) => 
    `flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isActive ? 'bg-surface text-text-primary' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
    }`;

  return (
    <div className="min-h-screen bg-bkg text-text-primary">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button onClick={onBack} className="text-sm text-text-secondary hover:text-primary mb-4">&larr; Back to Projects</button>
        <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{project.name}</h1>
            <p className="text-text-secondary mt-1">Custom Strategic Plan for Modern Search Optimization</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-bkg-light p-4 rounded-lg border border-border">
                <p className="text-sm text-text-secondary mb-1">Total Progress</p>
                <p className="text-2xl font-bold">{progress}%</p>
                <div className="w-full bg-surface rounded-full h-1.5 mt-2">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
             <div className="bg-bkg-light p-4 rounded-lg border border-border">
                <p className="text-sm text-text-secondary mb-1">Completed Tasks</p>
                <p className="text-2xl font-bold">{completedTasks} / {totalTasks}</p>
            </div>
             <div className="bg-bkg-light p-4 rounded-lg border border-border">
                <p className="text-sm text-text-secondary mb-1">Days Remaining</p>
                <p className="text-2xl font-bold">{daysRemaining}</p>
            </div>
             <div className="bg-bkg-light p-4 rounded-lg border border-border">
                <p className="text-sm text-text-secondary mb-1">End Date</p>
                <p className="text-2xl font-bold">{new Date(project.endDate).toLocaleDateString()}</p>
            </div>
        </div>
        
        <div className="flex items-center bg-bkg-light p-1 rounded-lg gap-1 mb-8 w-min">
            <button onClick={() => setView('list')} className={viewButtonClasses(view === 'list')}>
                <ListIcon className="w-4 h-4" /> List
            </button>
            <button onClick={() => setView('calendar')} className={viewButtonClasses(view === 'calendar')}>
                <CalendarIcon className="w-4 h-4" /> Calendar
            </button>
        </div>

        {view === 'list' ? (
             <main className="space-y-4 animate-fadeIn">
                {currentProject.phases.map((phase, index) => (
                    <PhaseAccordion key={phase.id} phase={phase} onToggleTask={(taskIndex) => handleToggleTask(index, taskIndex)} />
                ))}
            </main>
        ) : (
            <CalendarView scheduledTasks={scheduledTasks} projectStartDate={project.startDate} />
        )}
      </div>
    </div>
  );
};
