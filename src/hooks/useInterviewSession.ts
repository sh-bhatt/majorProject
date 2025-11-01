import { useState, useCallback } from 'react';
import { InterviewQuestion, InterviewAnswer, InterviewSession } from '@/lib/types/interview.types';

export function useInterviewSession(questions: InterviewQuestion[]) {
  const [session, setSession] = useState<InterviewSession>({
    questions,
    answers: [],
    currentQuestionIndex: 0,
    isActive: false,
    startTime: 0
  });

  const startInterview = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isActive: true,
      startTime: Date.now()
    }));
  }, []);

  const endInterview = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isActive: false,
      endTime: Date.now()
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1)
    }));
  }, []);

  const saveAnswer = useCallback((answer: InterviewAnswer) => {
    setSession(prev => ({
      ...prev,
      answers: [...prev.answers, answer]
    }));
  }, []);

  const getCurrentQuestion = useCallback(() => {
    return session.questions[session.currentQuestionIndex];
  }, [session]);

  const isLastQuestion = useCallback(() => {
    return session.currentQuestionIndex === session.questions.length - 1;
  }, [session]);

  return {
    session,
    startInterview,
    endInterview,
    nextQuestion,
    saveAnswer,
    getCurrentQuestion,
    isLastQuestion
  };
}
