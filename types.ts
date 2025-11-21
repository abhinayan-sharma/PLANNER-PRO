
export interface Subject {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  focusAreas: string;
}

export interface UserProfile {
  name: string;
  subjects: Subject[];
  hoursPerDay: number;
  startHour: number; // 0-23
  weekendStudy: boolean;
}

export interface StudySlot {
  time: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  activityType: 'Learn' | 'Review' | 'Practice' | 'Break';
  notes?: string;
}

export interface DailyPlan {
  day: string;
  date?: string;
  slots: StudySlot[];
  focusOfTheDay: string;
}

export interface WeeklyPlan {
  weekOf: string;
  days: DailyPlan[];
}

export interface SearchResult {
  title: string;
  url: string;
}

export interface TaskBreakdown {
  topic: string;
  subtasks: {
    id: string;
    text: string;
    estimatedMin: number;
    completed: boolean;
  }[];
}

export interface SavedPlan {
  id: number;
  title: string;
  date: string;
  summary: string;
  fullContent: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PLANNER = 'PLANNER',
  FOCUS = 'FOCUS',
  RESOURCES = 'RESOURCES',
  ANALYZER = 'ANALYZER',
  PROFILE = 'PROFILE',
  VIEW_PLAN = 'VIEW_PLAN',
  FLASHCARDS = 'FLASHCARDS'
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp?: number;
}
