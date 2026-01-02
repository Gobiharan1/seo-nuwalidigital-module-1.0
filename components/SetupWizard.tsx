
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Project, Page } from '../types';
import { parseKeywordFile } from '../services/fileParserService';
import { generateStaticRoadmap } from '../services/roadmapService';
import { ArrowLeftIcon, ArrowRightIcon, LoaderIcon, CheckIcon } from './icons';

interface SetupWizardProps {
  onComplete: (newProject: Project) => void;
  onCancel: () => void;
}

const WIZARD_STEPS = ['Project Info', 'Keywords', 'Pages', 'Confirm'];

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 63)).toISOString().split('T')[0]);
  
  const [primaryKw, setPrimaryKw] = useState('');
  const [kwFile, setKwFile] = useState<File | null>(null);

  const [pageCount, setPageCount] = useState(3);
  // Using 'as const' to ensure 'Medium' is inferred as the literal type rather than 'string'
  const [pages, setPages] = useState<Omit<Page, 'secKw' | 'lsiKw'>[]>(Array(3).fill({ name: '', priority: 'Medium' as const, mainKw: '' }));
  
  const updatePageField = <T,>(index: number, field: keyof Page, value: T) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], [field]: value };
    setPages(newPages);
  };

  const handlePageCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    let count = parseInt(e.target.value, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 20) count = 20;
    setPageCount(count);

    // Added explicit type annotation and 'as const' for the priority field to satisfy Omit<Page, 'secKw' | 'lsiKw'>
    const newPages: Omit<Page, 'secKw' | 'lsiKw'>[] = Array(count).fill(null).map((_, i) => pages[i] || { name: `Page ${i+1}`, priority: 'Medium' as const, mainKw: `` });
    setPages(newPages);
  };

  const nextStep = () => {
     if (step < WIZARD_STEPS.length) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Give it a tiny artificial delay for UX "Generating" feel, but no AI call
    setTimeout(async () => {
        try {
            let researchKeywords: string[] = [];
            if (kwFile) {
                researchKeywords = await parseKeywordFile(kwFile);
            }

            // Fix: Added placeholder ownerId to satisfy type Omit<Project, 'id' | 'phases'>
            const projectData: Omit<Project, 'id' | 'phases'> = {
                ownerId: '',
                name: projectName,
                startDate,
                endDate,
                primaryKw,
                pages: pages.map(p => ({ ...p, secKw: [], lsiKw: [] })),
                researchKeywords,
            };

            const phases = generateStaticRoadmap(projectData);

            const newProject: Project = {
                id: new Date().toISOString(),
                ...projectData,
                phases: phases,
            };

            onComplete(newProject);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    }, 800);
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
            <div className="animate-fadeIn">
                <h3 className="text-xl font-bold mb-6 text-text-primary">Project Information</h3>
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Project Name *</label>
                        <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g., SaaS SEO Strategy" required className="w-full bg-bkg-light border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Start Date *</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-bkg-light border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"/>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-text-secondary mb-1">End Date *</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-bkg-light border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"/>
                        </div>
                    </div>
                </div>
            </div>
        );
      case 2:
        return (
            <div className="animate-fadeIn">
                <h3 className="text-xl font-bold mb-6 text-text-primary">Target Search Keywords</h3>
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Main Core Keyword *</label>
                        <input type="text" value={primaryKw} onChange={e => setPrimaryKw(e.target.value)} placeholder="e.g., modern project management" required className="w-full bg-bkg-light border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"/>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Upload Keyword Research (Excel/CSV)</label>
                        <input type="file" onChange={e => setKwFile(e.target.files ? e.target.files[0] : null)} accept=".xlsx,.xls,.csv" className="w-full text-sm text-text-secondary file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-surface file:text-text-primary hover:file:bg-surface-hover file:cursor-pointer"/>
                        <p className="text-xs text-text-secondary mt-2 opacity-60 italic">Automated roadmap will factor in these terms if available.</p>
                    </div>
                </div>
            </div>
        );
      case 3:
        return (
            <div className="animate-fadeIn">
                <h3 className="text-xl font-bold mb-6 text-text-primary">Page Configuration</h3>
                <div className="form-group mb-6 flex items-center gap-4">
                    <label className="text-sm font-medium text-text-secondary">Number of target pages:</label>
                    <input type="number" value={pageCount} onChange={handlePageCountChange} min="1" max="20" required className="w-20 bg-bkg-light border border-border rounded-xl p-2 text-center focus:ring-primary focus:border-primary outline-none"/>
                </div>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-3 custom-scrollbar">
                    {pages.map((page, i) => (
                        <div key={i} className="p-5 bg-bkg-light rounded-2xl border border-border hover:border-primary/20 transition-all">
                            <h4 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-wider">Page {i + 1}</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-text-secondary mb-1">Label</label>
                                    <input type="text" value={page.name} onChange={e => updatePageField(i, 'name', e.target.value)} placeholder="Homepage" required className="w-full bg-surface border border-border rounded-xl p-2.5 text-sm focus:border-primary outline-none"/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-text-secondary mb-1">Priority</label>
                                    <select value={page.priority} onChange={e => updatePageField(i, 'priority', e.target.value as any)} required className="w-full bg-surface border border-border rounded-xl p-2.5 text-sm focus:border-primary outline-none">
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-text-secondary mb-1">Primary Keyword for this Page</label>
                                    <input type="text" value={page.mainKw} onChange={e => updatePageField(i, 'mainKw', e.target.value)} placeholder="e.g., SEO dashboard app" required className="w-full bg-surface border border-border rounded-xl p-2.5 text-sm focus:border-primary outline-none"/>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );
      case 4:
        return (
            <div className="animate-fadeIn">
                <h3 className="text-xl font-bold mb-6 text-text-primary">Confirm & Launch</h3>
                <div className="p-6 bg-bkg-light/50 rounded-2xl border border-border space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Project:</span>
                        <span className="font-bold">{projectName || 'Untitled'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Duration:</span>
                        <span className="font-bold">{startDate} to {endDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Target Pages:</span>
                        <span className="font-bold">{pageCount} Pages</span>
                    </div>
                </div>
                 <p className="text-sm text-text-secondary mt-6 italic">The automated engine will construct a custom roadmap including technical, content, E-E-A-T and AEO tasks based on your configuration.</p>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div className="bg-bkg border border-border rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden border border-white/5">
        <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black mb-2 text-text-primary tracking-tight">New Authority Project</h2>
            <p className="text-text-secondary mb-10">Configure your parameters to generate the implementation roadmap.</p>

            <div className="flex items-center mb-10 gap-2">
                {WIZARD_STEPS.map((name, index) => (
                    <React.Fragment key={name}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step > index + 1 ? 'bg-green text-white rotate-[360deg]' : step === index + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-surface text-text-secondary opacity-50'}`}>
                                {step > index + 1 ? <CheckIcon className="w-6 h-6"/> : index + 1}
                            </div>
                        </div>
                        {index < WIZARD_STEPS.length - 1 && <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step > index + 1 ? 'bg-green' : 'bg-surface'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="min-h-[320px]">
                    {renderStepContent()}
                </div>
                
                {error && <p className="text-red-500 text-sm my-4 font-bold">⚠️ {error}</p>}
                
                <div className="flex justify-between items-center mt-12">
                    <button type="button" onClick={onCancel} className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
                    <div className="flex gap-4">
                        {step > 1 && <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl bg-surface hover:bg-surface-hover text-sm font-bold flex items-center gap-2 transition-all">Back</button>}
                        {step < WIZARD_STEPS.length && <button type="button" onClick={nextStep} className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">Continue <ArrowRightIcon className="w-4 h-4"/></button>}
                        {step === WIZARD_STEPS.length && (
                            <button type="submit" disabled={isLoading} className="px-8 py-3 rounded-xl bg-green hover:brightness-110 text-white text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-green/20">
                                {isLoading ? <><LoaderIcon className="w-4 h-4 animate-spin"/> Processing...</> : '🚀 Build Project'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
