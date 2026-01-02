
import React, { useState } from 'react';
import { CheckIcon, ArrowRightIcon, FileTextIcon } from './icons';

interface PromptStep {
  step: number;
  id: string;
  title: string;
  subtitle: string;
  prompts: {
    label: string;
    text: string;
    description: string;
    tip: string;
  }[];
}

const WORKFLOW_STEPS: PromptStep[] = [
  {
    step: 1,
    id: 'strategy',
    title: 'Intent & Strategy',
    subtitle: 'Define the "Why" before writing.',
    prompts: [
      {
        label: 'Search Intent Profiler',
        description: 'Analyze the query to see if users want info, products, or a specific brand.',
        text: 'Act as a senior SEO strategist. Analyze the search query "[KEYWORD]". Determine the primary and secondary search intent (Informational, Navigational, Transactional, or Commercial). Provide a brief content strategy that satisfies this intent better than the current top 3 results.',
        tip: 'Knowing intent prevents high bounce rates.'
      }
    ]
  },
  {
    step: 2,
    id: 'meta',
    title: 'Meta Architecture',
    subtitle: 'Optimize for the Click-Through Rate (CTR).',
    prompts: [
      {
        label: 'The "Hook" Title Tag',
        description: 'Generate titles that attract both bots and humans.',
        text: 'Write 5 SEO title tags (max 60 chars) for "[TOPIC]". Rule 1: Include "[KEYWORD]". Rule 2: Use a "Power Word" (e.g., Proven, Ultimate, Simple). Rule 3: Use brackets at the end for fresh context (e.g., [2025 Update]).',
        tip: 'Titles are your "Front Door" in Google.'
      },
      {
        label: 'Benefit-Driven Meta Description',
        description: 'Summarize the value proposition in 155 characters.',
        text: 'Write a 155-character meta description for "[TOPIC]" focusing on the primary benefit: [BENEFIT]. Include a clear CTA like "Learn more" or "Get started" and ensure "[KEYWORD]" is included once.',
        tip: 'Descriptions don’t rank you, but they drive the click.'
      }
    ]
  },
  {
    step: 3,
    id: 'structure',
    title: 'Semantic Outline',
    subtitle: 'Build the topical roadmap for the page.',
    prompts: [
      {
        label: 'Entity-Based H-Tag Outline',
        description: 'Structure H1, H2, and H3 tags to cover the topic comprehensively.',
        text: 'Generate a semantic content outline for "[TOPIC]". Include an H1 that uses the main keyword. For H2s, use related entities and sub-topics. Ensure there is a logical flow that answers every potential user question about the topic.',
        tip: 'Google loves "Topical Authority"—don\'t leave gaps.'
      }
    ]
  },
  {
    step: 4,
    id: 'eeat',
    title: 'E-E-A-T Infusion',
    subtitle: 'Adding Experience, Expertise, Authoritativeness, and Trust.',
    prompts: [
      {
        label: 'Proof of Experience (The "E")',
        description: 'Help the reader (and Google) see that you have actually done this.',
        text: 'Rewrite the following introduction to include "First-Hand Experience" signals. Use phrases like "In my 10 years of doing X...", "When I tested Y...", or "The data I collected shows...". Topic: "[TOPIC]".',
        tip: 'AI-generated content often fails here; human experience is the differentiator.'
      }
    ]
  },
  {
    step: 5,
    id: 'aeo',
    title: 'AEO & LLM Optimization',
    subtitle: 'Formatting content to be cited by ChatGPT, Gemini, and Perplexity.',
    prompts: [
      {
        label: 'LLM "Snippet" Optimizer',
        description: 'Craft the perfect 2-3 sentence answer for AI answer engines.',
        text: 'Write a "Direct Answer" paragraph for the question: "[USER QUESTION]". The answer must be 40-50 words, start with a clear definition, and use concise, factual language that an LLM can easily extract as a featured snippet or citation.',
        tip: 'Answer engines prefer objective, structured facts over flowery prose.'
      }
    ]
  }
];

export const AIPromptLibrary: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({
    '[TOPIC]': '',
    '[KEYWORD]': '',
    '[BENEFIT]': '',
    '[USER QUESTION]': ''
  });

  const handlePlaceholderChange = (key: string, val: string) => {
    setPlaceholders(prev => ({ ...prev, [key]: val }));
  };

  const getProcessedPrompt = (rawText: string) => {
    let text = rawText;
    Object.entries(placeholders).forEach(([key, val]) => {
      const displayVal = val || key;
      text = text.split(key).join(displayVal);
    });
    return text;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentStepData = WORKFLOW_STEPS.find(s => s.step === activeStep);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fadeIn">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary mb-3 tracking-tight">Content Factory <span className="text-primary">Laboratory</span></h1>
          <p className="text-text-secondary text-lg max-w-xl">Engineer high-authority prompts for your LLM of choice. Variables sync across the entire workflow.</p>
        </div>
        <div className="flex bg-surface rounded-2xl p-1 border border-border">
            {WORKFLOW_STEPS.map(s => (
                <button 
                    key={s.id} 
                    onClick={() => setActiveStep(s.step)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${activeStep === s.step ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    {s.step}
                </button>
            ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
            <div className="bg-bkg-light border border-border rounded-3xl p-6 shadow-xl sticky top-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6">Template Variables</h3>
                <div className="space-y-5">
                    {Object.keys(placeholders).map(key => (
                        <div key={key}>
                            <label className="block text-[10px] font-bold text-text-secondary mb-1.5 opacity-60 uppercase">{key}</label>
                            <input 
                                value={placeholders[key]} 
                                onChange={e => handlePlaceholderChange(key, e.target.value)}
                                placeholder={`...`}
                                className="w-full bg-bkg border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary outline-none transition-all placeholder:opacity-30"
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-[10px] text-text-secondary italic leading-relaxed">Changes here propagate instantly to the factory floor prompts.</p>
                </div>
            </div>
        </aside>

        <main className="lg:col-span-3 space-y-8">
            <div className="bg-bkg-light border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20">
                            {currentStepData?.step}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-text-primary tracking-tight">{currentStepData?.title}</h2>
                            <p className="text-text-secondary text-sm font-medium">{currentStepData?.subtitle}</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-16">
                    {currentStepData?.prompts.map((prompt, idx) => {
                        const id = `${activeStep}-${idx}`;
                        const processedText = getProcessedPrompt(prompt.text);

                        return (
                            <div key={id} className="group animate-slideUp">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">{prompt.label}</h3>
                                        <p className="text-sm text-text-secondary mt-1">{prompt.description}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(processedText, id)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                                            copiedId === id ? 'bg-green text-white scale-95' : 'bg-surface text-text-primary hover:bg-surface-hover border border-border active:scale-95'
                                        }`}
                                    >
                                        {copiedId === id ? <><CheckIcon className="w-4 h-4"/> Copied</> : 'Copy Framework'}
                                    </button>
                                </div>

                                <div className="relative group/code">
                                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-bkg-light border border-border rounded text-[9px] font-black text-text-secondary uppercase tracking-tighter z-10">Prompt Preview</div>
                                    <pre className="bg-bkg p-6 pt-8 rounded-3xl border border-border/50 font-mono text-sm text-text-primary/70 leading-relaxed whitespace-pre-wrap select-all group-hover/code:border-primary/30 transition-all">
                                        {processedText}
                                    </pre>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center gap-2 text-[10px] text-text-secondary font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                        {prompt.tip}
                                    </div>
                                    <div className="flex-1 h-px bg-border/30"></div>
                                    <div className="flex gap-2">
                                        <button onClick={() => copyToClipboard(`[ChatGPT] ${processedText}`, `${id}-gpt`)} className="text-[9px] font-black text-text-secondary hover:text-primary uppercase tracking-widest p-1">For ChatGPT</button>
                                        <button onClick={() => copyToClipboard(`[Claude] ${processedText}`, `${id}-claude`)} className="text-[9px] font-black text-text-secondary hover:text-primary uppercase tracking-widest p-1">For Claude</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <footer className="mt-16 pt-8 border-t border-border flex justify-between">
                    <button 
                        onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                        disabled={activeStep === 1}
                        className="text-xs font-black uppercase text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all flex items-center gap-2"
                    >
                        Previous Phase
                    </button>
                    <button 
                        onClick={() => setActiveStep(Math.min(WORKFLOW_STEPS.length, activeStep + 1))}
                        disabled={activeStep === WORKFLOW_STEPS.length}
                        className="text-xs font-black uppercase text-primary hover:translate-x-1 disabled:opacity-30 transition-all flex items-center gap-2"
                    >
                        Next Phase <ArrowRightIcon className="w-4 h-4"/>
                    </button>
                </footer>
            </div>
        </main>
      </div>
    </div>
  );
};
