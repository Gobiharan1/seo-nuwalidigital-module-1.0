
import React, { useState } from 'react';
import { CheckIcon, FileTextIcon } from './icons';

export const SchemaGenerator: React.FC = () => {
    const [type, setType] = useState<'FAQ' | 'Article'>('FAQ');
    const [faqs, setFaqs] = useState([{ q: '', a: '' }]);
    const [article, setArticle] = useState({ title: '', author: '', date: new Date().toISOString().split('T')[0] });
    const [copied, setCopied] = useState(false);

    const generateJSON = () => {
        if (type === 'FAQ') {
            return JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqs.map(f => ({
                    "@type": "Question",
                    "name": f.q,
                    "acceptedAnswer": { "@type": "Answer", "text": f.a }
                }))
            }, null, 2);
        } else {
            return JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": article.title,
                "author": { "@type": "Person", "name": article.author },
                "datePublished": article.date
            }, null, 2);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateJSON());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-text-primary mb-2 tracking-tight">AEO <span className="text-secondary">Entity Builder</span></h1>
                <p className="text-text-secondary">Generate technical JSON-LD schema to help LLMs and Search Engines understand your entities.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="flex gap-2 p-1.5 bg-bkg-light rounded-2xl border border-border inline-flex">
                        <button onClick={() => setType('FAQ')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${type === 'FAQ' ? 'bg-secondary text-white' : 'text-text-secondary hover:text-text-primary'}`}>FAQ Schema</button>
                        <button onClick={() => setType('Article')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${type === 'Article' ? 'bg-secondary text-white' : 'text-text-secondary hover:text-text-primary'}`}>Article Schema</button>
                    </div>

                    <div className="bg-bkg-light p-6 rounded-2xl border border-border space-y-4">
                        {type === 'FAQ' ? (
                            <div className="space-y-6">
                                {faqs.map((f, i) => (
                                    <div key={i} className="space-y-2 pb-4 border-b border-border/50 last:border-0">
                                        <input 
                                            placeholder="Question..." 
                                            value={f.q} 
                                            onChange={e => {
                                                const newF = [...faqs];
                                                newF[i].q = e.target.value;
                                                setFaqs(newF);
                                            }}
                                            className="w-full bg-surface border border-border rounded-xl p-3 text-sm focus:border-secondary outline-none"
                                        />
                                        <textarea 
                                            placeholder="Answer..." 
                                            value={f.a}
                                            onChange={e => {
                                                const newF = [...faqs];
                                                newF[i].a = e.target.value;
                                                setFaqs(newF);
                                            }}
                                            className="w-full bg-surface border border-border rounded-xl p-3 text-sm h-24 focus:border-secondary outline-none"
                                        />
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setFaqs([...faqs, { q: '', a: '' }])}
                                    className="text-secondary text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                                >
                                    + Add Another Question
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <input placeholder="Article Headline" value={article.title} onChange={e => setArticle({...article, title: e.target.value})} className="w-full bg-surface border border-border rounded-xl p-3 text-sm focus:border-secondary outline-none"/>
                                <input placeholder="Author Name" value={article.author} onChange={e => setArticle({...article, author: e.target.value})} className="w-full bg-surface border border-border rounded-xl p-3 text-sm focus:border-secondary outline-none"/>
                                <input type="date" value={article.date} onChange={e => setArticle({...article, date: e.target.value})} className="w-full bg-surface border border-border rounded-xl p-3 text-sm focus:border-secondary outline-none"/>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-text-secondary">JSON-LD Output</span>
                        <button 
                            onClick={handleCopy}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green text-white' : 'bg-secondary text-white hover:brightness-110'}`}
                        >
                            {copied ? <CheckIcon className="w-3 h-3"/> : 'Copy JSON-LD'}
                        </button>
                    </div>
                    <pre className="bg-bkg p-6 rounded-3xl border border-border overflow-auto h-[400px] text-[11px] font-mono text-secondary-hover/90 custom-scrollbar">
                        {generateJSON()}
                    </pre>
                </div>
            </div>
        </div>
    );
};
