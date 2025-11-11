
export interface Task {
  title: string;
  desc: string;
  tags: string[];
  completed: boolean;
}

export interface Phase {
  id: number;
  icon: string;
  title: string;
  meta: string;
  tasks: Task[];
}

export interface Page {
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  mainKw: string;
  secKw: string[];
  lsiKw: string[];
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  primaryKw: string;
  pages: Page[];
  researchKeywords: string[];
  phases: Phase[];
}
   