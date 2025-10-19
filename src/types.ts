export interface LogEntry {
  id: number;
  text: string;
  intensity: number;
}

export interface DailyLog {
  goodWords: LogEntry[];
  badWords: LogEntry[];
  goodThoughts: number;
  badThoughts: number;
  goodActions: number;
  badActions: number;
  happyEvents: number;
  toughEvents: number;
}

export interface FeedbackEntry {
  id: string;
  timestamp: Date;
  email: string;
  content: string;
  userAgent: string;
  page: string;
}
