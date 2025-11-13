export interface InterviewQuestion {
  id: number;
  category: string;
  topic: string;
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface FeedbackItem {
  questionId: number;
  question: string;
  userAnswer: string;
  expectedAnswer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewSession {
  startTime: number;
  endTime?: number;
  currentQuestionIndex: number;
  answers: string[];
  questions: InterviewQuestion[];
}

export interface TechData {
  programming_languages: string[];
  technologies: string[];
  tools: string[];
  coursework: string[];
}

export interface ExperienceEntry {
  title?: string;
  company?: string;
  description?: string;
  duration?: string;
}

export interface ProjectEntry {
  name?: string;
  description?: string;
  technologies?: string[];
}
