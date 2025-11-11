
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Import Task type for cleaner type assertions.
import { Project, Phase, Task } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

// Fix: Removed module-level initialization of GoogleGenAI client to prevent errors when API_KEY is missing.
// The client will be initialized inside the function where it is used.

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.NUMBER },
        icon: { type: Type.STRING },
        title: { type: Type.STRING },
        meta: { type: Type.STRING },
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              desc: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'desc', 'tags'],
          },
        },
      },
      required: ['id', 'icon', 'title', 'meta', 'tasks'],
    },
};

export const generateEnhancedPhases = async (projectData: Omit<Project, 'phases' | 'id'>): Promise<Phase[]> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  // Fix: Initialize the GoogleGenAI client here to ensure API_KEY is available.
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    You are an expert SEO and AEO (Answer Engine Optimization) project manager.
    Based on the following project details, generate a comprehensive and customized task list, broken down into standard SEO project phases.

    Project Details:
    - Project Name: ${projectData.name}
    - Timeline: ${projectData.startDate} to ${projectData.endDate}
    - Main Page Primary Keyword: ${projectData.primaryKw}
    - Pages to Optimize:
    ${projectData.pages.map(p => `- ${p.name} (Priority: ${p.priority}, Main Keyword: "${p.mainKw}")`).join('\n')}
    - Additional research keywords provided by user: ${projectData.researchKeywords.length > 0 ? projectData.researchKeywords.slice(0, 20).join(', ') : 'None'}

    Please provide the output as a JSON array of phase objects. Each phase object should have a numeric 'id', an 'icon' (emoji), a 'title', a 'meta' description (e.g., 'Week 1-2 • Foundation'), and a 'tasks' array. Each task object should have a 'title', a detailed 'desc' (description), and an array of relevant 'tags'.

    Make the tasks specific and actionable. For example, for a page named "Services", create tasks like "Optimize Title Tag for Services Page with keyword '${projectData.pages[0]?.mainKw || 'relevant keyword'}'". Ensure the generated plan is realistic for the given timeline.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // Fix: Trim whitespace from the response text before parsing.
    const jsonText = response.text.trim();
    // Fix: Corrected the type assertion with parentheses to ensure the entire object type is part of the array.
    const generatedPhases = JSON.parse(jsonText) as (Omit<Phase, 'tasks'> & { tasks: Omit<Task, 'completed'>[] })[];

    return generatedPhases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(task => ({ ...task, completed: false }))
    }));

  } catch (error) {
    console.error("Error generating tasks with Gemini:", error);
    throw new Error("Failed to generate AI-powered task list. Please check your API key and try again.");
  }
};
