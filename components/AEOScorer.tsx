
import React, { useState } from 'react';
import { LoaderIcon, FileTextIcon, CheckIcon } from './icons';

interface MetricResult {
    name: string;
    score: number;
    status: 'Poor' | 'Average' | 'Excellent';
    desc: string;
}

export const AEOScorer: React.FC = () => {
    const [content, setContent] = useState('');
    const [results, setResults] = useState<{total: number, metrics: MetricResult[], findings: string[]} | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeContent = () => {
        setIsAnalyzing(true);
        
        // Deterministic lexical analysis
        setTimeout(() => {
            const metrics: MetricResult[] = [];
            const findings: string[] = [];
            
            // 1. Directness Check (Answerability)
            const questions = (content.match(/\?/g) || []).length;
            const definitionPatterns = content.match(/\b(is|are|means|refers to|defined as)\b/i);
            const directnessScore = Math.min((questions * 10) + (definitionPatterns ? 40 : 0), 100);
            metrics.push({
                name: 'Directness',
                score: directnessScore,
                status: directnessScore > 70 ? 'Excellent' : directnessScore > 40 ? 'Average' : 'Poor',
                desc: 'Ability to answer user queries with minimal fluff.'
            });

            // 2. Fact Density (Entity Mapping)
            const numbers = (content.match(/\d+/g) || []).length;
            const capitalizedWords = (content.match(/[A-Z][a-z]+/g) || []).length;
            const factScore = Math.min((numbers * 5) + (capitalizedWords * 1), 100);
            metrics.push({
                name: 'Fact Density',
                score: factScore,
                status: factScore > 70 ? 'Excellent' : factScore > 40 ? 'Average' : 'Poor',
                desc: 'Prevalence of data points, names, and concrete entities.'
            });

            // 3. Structure (Snippetability)
            const listItems = (content.match(/(\n[ \t]*[-*•]\s)|(\n[ \t]*\d+\.\s)/g) || []).length;
            const shortSentences = content.split(/[.!?]+/).filter(s => s.trim().split(' ').length < 15).length;
            const structureScore = Math.min((listItems * 15) + (shortSentences * 4), 100);
            metrics.push({
                name: 'Snippetability',
                score: structureScore,
                status: structureScore > 70 ? 'Excellent' : structureScore > 40 ? 'Average' : 'Poor',
                desc: 'Visual formatting ease for AI Answer extraction.'
            });

            // 4. Readability (Lexical Simplicity)
            const complexWords = (content.match(/\b\w{10,}\b/g) || []).length;
            const readabilityScore = Math.max(100 - (complexWords * 2), 20);
            metrics.push({
                name: 'Readability',
                score: readabilityScore,
                status: readabilityScore > 70 ? 'Excellent' : readabilityScore > 40 ? 'Average' : 'Poor',
                desc: 'Clarity for both AI parsers and human end-users.'
            });

            // General Findings
            if (content.length < 300) findings.push("Content is critically thin. Aim for 800+ words for authority.");
            if (listItems === 0) findings.push("Add bulleted lists to capture more featured snippets.");
            if (questions === 0) findings.push("No questions detected. Use FAQ headers to signal LLM intent.");
            if (factScore > 80) findings.push("Excellent entity density. This content signals high trustworthiness.");

            const total = Math.round(metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length);
            
            setResults({ total, metrics, findings });
            setIsAnalyzing(false);
        }, 800);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 animate-fadeIn">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-text-primary mb-3 tracking-tight">AEO <span className="text-orange">Authority Scorer</span></h1>
                <p className="text-text-secondary text-lg">A zero-cost heuristic engine that audits text for Answer Engine prominence.</p>
                <div className="mt-4 p-4 bg-orange/5 border border-orange/20 rounded-2xl inline-flex items-center gap-2">
                    <span className="text-orange text-xs font-black uppercase tracking-widest">How it works:</span>
                    <p className="text-[11px] text-text-secondary italic">We scan for lexical patterns, entity density, and snippet-friendly formatting used by modern search algorithms.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative">
                        <textarea 
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Paste your page content or drafted article here..."
                            className="w-full h-[500px] bg-bkg-light border border-border rounded-[2rem] p-8 text-sm text-text-primary focus:border-orange outline-none shadow-2xl transition-all font-sans leading-relaxed custom-scrollbar"
                        />
                        <div className="absolute bottom-6 right-6 text-[10px] font-black text-text-secondary uppercase bg-bkg p-2 rounded-lg border border-border">
                            {content.length} Characters
                        </div>
                    </div>
                    <button 
                        onClick={analyzeContent}
                        disabled={isAnalyzing || !content}
                        className="w-full py-5 rounded-2xl bg-orange text-white font-black uppercase tracking-[0.2em] hover:brightness-110 shadow-lg shadow-orange/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isAnalyzing ? <LoaderIcon className="w-5 h-5 animate-spin"/> : 'Run Authority Audit'}
                    </button>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    {results ? (
                        <div className="animate-fadeIn space-y-8">
                            <div className="bg-bkg-light border border-border p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <p className="text-[10px] font-black uppercase text-text-secondary mb-4 tracking-widest text-center">Total AEO Readiness</p>
                                <div className="text-8xl font-black text-orange text-center tracking-tighter mb-4">{results.total}%</div>
                                <div className="w-full bg-surface h-3 rounded-full overflow-hidden mb-8">
                                    <div className="bg-orange h-full transition-all duration-1000 ease-out" style={{width: `${results.total}%`}}></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {results.metrics.map(m => (
                                        <div key={m.name} className="bg-bkg p-4 rounded-2xl border border-border/50">
                                            <p className="text-[9px] font-black text-text-secondary uppercase mb-1">{m.name}</p>
                                            <div className="flex items-end justify-between">
                                                <span className="text-xl font-black text-text-primary">{m.score}%</span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${m.status === 'Excellent' ? 'bg-green/10 text-green' : m.status === 'Average' ? 'bg-orange/10 text-orange' : 'bg-red-900/10 text-red-500'}`}>{m.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-bkg-light/50 border border-border p-8 rounded-[2rem] space-y-6">
                                <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest border-b border-border pb-4">Strategic Recommendations</h4>
                                <div className="space-y-4">
                                    {results.findings.length > 0 ? results.findings.map((f, i) => (
                                        <div key={i} className="flex gap-4 items-start group">
                                            <div className="w-6 h-6 rounded-lg bg-orange/10 flex items-center justify-center flex-shrink-0 group-hover:bg-orange/20 transition-colors">
                                                <CheckIcon className="w-3 h-3 text-orange"/>
                                            </div>
                                            <p className="text-sm text-text-primary font-medium leading-tight pt-0.5">{f}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-text-secondary italic">No critical issues found. Your content is highly optimized for AI answers.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-bkg-light/30 border-2 border-dashed border-border p-12 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-3xl bg-surface mb-6 flex items-center justify-center shadow-inner">
                                <FileTextIcon className="w-10 h-10 text-text-secondary opacity-40"/>
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">Audit Desk Ready</h3>
                            <p className="text-sm text-text-secondary max-w-xs">Enter your content on the left to begin the heuristic authority audit.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
