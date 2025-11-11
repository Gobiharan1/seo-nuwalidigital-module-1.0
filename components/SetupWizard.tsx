
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Project, Page } from '../types';
import { parseKeywordFile } from '../services/fileParserService';
import { generateEnhancedPhases } from '../services/geminiService';
// Fix: Import CheckIcon to resolve 'Cannot find name' error.
import { ArrowLeftIcon, ArrowRightIcon, LoaderIcon, CheckIcon } from './icons';

interface SetupWizardProps {
  onComplete: (newProject: Project) => void;
  onCancel: () => void;
}

const WIZARD_STEPS = ['Project Info', 'Keywords', 'Pages', 'Generate'];

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
  const [pages, setPages] = useState<Omit<Page, 'secKw' | 'lsiKw'>[]>(Array(3).fill({ name: '', priority: 'Medium', mainKw: '' }));
  
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

    const newPages = Array(count).fill(null).map((_, i) => pages[i] || { name: ``, priority: 'Medium', mainKw: `` });
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

    try {
        let researchKeywords: string[] = [];
        if (kwFile) {
            researchKeywords = await parseKeywordFile(kwFile);
        }

        const projectData: Omit<Project, 'id' | 'phases'> = {
            name: projectName,
            startDate,
            endDate,
            primaryKw,
            pages: pages.map(p => ({ ...p, secKw: [], lsiKw: [] })),
            researchKeywords,
        };

        const enhancedPhases = await generateEnhancedPhases(projectData);

        const newProject: Project = {
            id: new Date().toISOString(),
            ...projectData,
            phases: enhancedPhases,
        };

        onComplete(newProject);

    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
            <div>
                <h3 className="text-xl font-bold mb-6 text-text-primary">Project Information</h3>
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Project Name *</label>
                        <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g., Notion Killer App SEO" required className="w-full bg-bkg-light border border-border rounded-md p-2 focus:ring-primary focus:border-primary"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Start Date *</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-bkg-light border border-border rounded-md p-2 focus:ring-primary focus:border-primary"/>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-text-secondary mb-1">End Date *</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-bkg-light border border-border rounded-md p-2 focus:ring-primary focus:border-primary"/>
                        </div>
                    </div>
                </div>
            </div>
        );
      case 2:
        return (
            <div>
                <h3 className="text-xl font-bold mb-6 text-text-primary">Keyword Research</h3>
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Primary Keyword for Main Page *</label>
                        <input type="text" value={primaryKw} onChange={e => setPrimaryKw(e.target.value)} placeholder="e.g., best project management tool" required className="w-full bg-bkg-light border border-border rounded-md p-2 focus:ring-primary focus:border-primary"/>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Keyword Research Document (Optional)</label>
                        <input type="file" onChange={e => setKwFile(e.target.files ? e.target.files[0] : null)} accept=".xlsx,.xls,.csv" className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-surface file:text-text-primary hover:file:bg-surface-hover"/>
                        <p className="text-xs text-text-secondary mt-1">Upload an Excel or CSV file with a 'keyword' column.</p>
                    </div>
                </div>
            </div>
        );
      case 3:
        return (
            <div>
                <h3 className="text-xl font-bold mb-6 text-text-primary">Page Configuration</h3>
                <div className="form-group mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Number of Pages to Optimize *</label>
                    <input type="number" value={pageCount} onChange={handlePageCountChange} min="1" max="20" required className="w-24 bg-bkg-light border border-border rounded-md p-2 focus:ring-primary focus:border-primary"/>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {pages.map((page, i) => (
                        <div key={i} className="p-4 bg-bkg-light rounded-lg border border-border">
                            <h4 className="font-semibold text-text-primary mb-2">Page {i + 1}</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Page Name *</label>
                                    <input type="text" value={page.name} onChange={e => updatePageField(i, 'name', e.target.value)} placeholder="e.g., Homepage" required className="w-full bg-surface border border-border rounded-md p-2 text-sm focus:ring-primary focus:border-primary"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Priority *</label>
                                    <select value={page.priority} onChange={e => updatePageField(i, 'priority', e.target.value)} required className="w-full bg-surface border border-border rounded-md p-2 text-sm focus:ring-primary focus:border-primary">
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Main Keyword *</label>
                                    <input type="text" value={page.mainKw} onChange={e => updatePageField(i, 'mainKw', e.target.value)} placeholder="e.g., SEO project management" required className="w-full bg-surface border border-border rounded-md p-2 text-sm focus:ring-primary focus:border-primary"/>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );
      case 4:
        return (
            <div>
                <h3 className="text-xl font-bold mb-6 text-text-primary">Review & Generate</h3>
                <div className="p-4 bg-bkg-light rounded-lg border border-border space-y-2 text-sm">
                    <p><strong>Project:</strong> {projectName}</p>
                    <p><strong>Timeline:</strong> {startDate} to {endDate}</p>
                    <p><strong>Primary Keyword:</strong> {primaryKw}</p>
                    <p><strong>Pages:</strong> {pageCount}</p>
                    <p><strong>Keyword File:</strong> {kwFile?.name || 'Not provided'}</p>
                </div>
                 <p className="text-sm text-text-secondary mt-4">Click "Generate Project" to use AI to build your customized SEO roadmap. This may take a moment.</p>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-bkg border border-border rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-2 text-text-primary">🚀 Create New SEO Project</h2>
            <p className="text-text-secondary mb-6">Let's build a customized implementation roadmap with AI.</p>

            {/* Progress Bar */}
            <div className="flex items-center mb-8">
                {WIZARD_STEPS.map((name, index) => (
                    <React.Fragment key={name}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${step > index + 1 ? 'bg-green text-white' : step === index + 1 ? 'bg-primary text-white' : 'bg-surface text-text-secondary'}`}>
                                {step > index + 1 ? <CheckIcon className="w-5 h-5"/> : index + 1}
                            </div>
                            <p className={`text-xs mt-2 transition-colors ${step >= index + 1 ? 'text-text-primary' : 'text-text-secondary'}`}>{name}</p>
                        </div>
                        {index < WIZARD_STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 transition-colors ${step > index + 1 ? 'bg-green' : 'bg-surface'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="min-h-[250px]">
                    {renderStepContent()}
                </div>
                
                {error && <p className="text-red-500 text-sm my-4">{error}</p>}
                
                <div className="flex justify-between items-center mt-8">
                    <button type="button" onClick={onCancel} className="text-sm text-text-secondary hover:text-text-primary">Cancel</button>
                    <div className="flex gap-4">
                        {step > 1 && <button type="button" onClick={prevStep} className="px-4 py-2 rounded-md bg-surface hover:bg-surface-hover text-sm font-semibold flex items-center gap-1"><ArrowLeftIcon className="w-4 h-4"/> Back</button>}
                        {step < WIZARD_STEPS.length && <button type="button" onClick={nextStep} className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-sm font-semibold flex items-center gap-1">Next <ArrowRightIcon className="w-4 h-4"/></button>}
                        {step === WIZARD_STEPS.length && (
                            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md bg-green hover:bg-opacity-80 text-white text-sm font-semibold disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {isLoading ? <><LoaderIcon className="w-4 h-4 animate-spin"/> Generating...</> : '✨ Generate Project'}
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
