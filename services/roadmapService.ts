
import { Project, Phase, Task, Page } from '../types';

export const generateStaticRoadmap = (projectData: Omit<Project, 'phases' | 'id'>): Phase[] => {
  const { pages, primaryKw, startDate, endDate } = projectData;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const weekStep = Math.max(1, Math.floor(totalDays / 7 / 5)); // Divide into 5 segments

  const createTasksForPages = (type: 'technical' | 'content' | 'aeo' | 'onpage'): Task[] => {
    return pages.flatMap(page => {
      if (type === 'technical') {
        return [{
          title: `Technical Audit: ${page.name}`,
          desc: `Check indexing status, crawl errors, and mobile-friendliness for the "${page.mainKw}" target page.`,
          tags: ['Technical', 'Audit'],
          completed: false
        }];
      }
      if (type === 'onpage') {
        return [{
          title: `On-Page: ${page.name}`,
          desc: `Optimize H1-H3 tags and Meta Data for "${page.mainKw}". Ensure LSI keywords are naturally integrated.`,
          tags: ['On-Page', 'SEO'],
          completed: false
        }];
      }
      if (type === 'aeo') {
        return [{
          title: `LLM Optimization: ${page.name}`,
          desc: `Structure content for Answer Engines. Add FAQ Schema and ensure "Direct Answer" paragraphs for "${page.mainKw}".`,
          tags: ['AEO', 'LLM', 'Schema'],
          completed: false
        }];
      }
      return [{
        title: `Content Update: ${page.name}`,
        desc: `Expand content depth for "${page.mainKw}". Focus on user intent and E-E-A-T principles.`,
        tags: ['Content', 'E-E-A-T'],
        completed: false
      }];
    });
  };

  return [
    {
      id: 1,
      icon: '🔍',
      title: 'Foundation & Analysis',
      meta: `Week 1-${weekStep}`,
      tasks: [
        { title: 'Market & Competitor Gap Analysis', desc: `Analyze top 5 competitors for "${primaryKw}" and identify content gaps.`, tags: ['Strategy'], completed: false },
        ...createTasksForPages('technical')
      ]
    },
    {
      id: 2,
      icon: '⚙️',
      title: 'Technical & On-Page',
      meta: `Week ${weekStep + 1}-${weekStep * 2}`,
      tasks: createTasksForPages('onpage')
    },
    {
      id: 3,
      icon: '✍️',
      title: 'Content & E-E-A-T',
      meta: `Week ${weekStep * 2 + 1}-${weekStep * 3}`,
      tasks: createTasksForPages('content')
    },
    {
      id: 4,
      icon: '🤖',
      title: 'AEO & LLM Optimization',
      meta: `Week ${weekStep * 3 + 1}-${weekStep * 4}`,
      tasks: [
        { title: 'Global FAQ Schema Implementation', desc: 'Deploy JSON-LD FAQ blocks across all priority pages to capture PAA boxes.', tags: ['AEO', 'Technical'], completed: false },
        ...createTasksForPages('aeo')
      ]
    },
    {
      id: 5,
      icon: '📈',
      title: 'Authority & Review',
      meta: `Week ${weekStep * 4 + 1}+`,
      tasks: [
        { title: 'Backlink Acquisition', desc: `Secure 3-5 high-authority placements using the "${primaryKw}" anchor.`, tags: ['Backlinks'], completed: false },
        { title: 'Final Performance Review', desc: 'Compare ranking data against baseline and adjust meta descriptions for CTR.', tags: ['Reporting'], completed: false }
      ]
    }
  ];
};
