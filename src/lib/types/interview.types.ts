export interface InterviewQuestion {
  id: number;
  category: string;
  topic: string;
  question: string;
  expectedAnswer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface InterviewAnswer {
  questionId: number;
  question: string;
  userAnswer: string;
  expectedAnswer: string;
  timestamp: number;
  duration: number;
}

export interface InterviewFeedback {
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
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestionIndex: number;
  isActive: boolean;
  startTime: number;
  endTime?: number;
}
