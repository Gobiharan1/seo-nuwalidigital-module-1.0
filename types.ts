
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: Role;
  name: string;
}

export interface Task {
  title: string;
  desc: string;
  tags: string[];
  completed: boolean;
  completedByUserId?: string;
  completedAt?: string;
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
  assignedUserId?: string;
  assignedAt?: string;
  deadline?: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  startDate: string;
  endDate: string;
  primaryKw: string;
  pages: Page[];
  researchKeywords: string[];
  phases: Phase[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  action: string;
  details: string;
  timestamp: string;
}
