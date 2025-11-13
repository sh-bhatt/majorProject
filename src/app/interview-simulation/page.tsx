"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Home, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { InterviewWelcome } from "@/components/interview/InterviewWelcome";
import { InterviewProgress } from "@/components/interview/InterviewProgress";
import { QuestionDisplay } from "@/components/interview/QuestionDisplay";
import { VoiceVisualizer } from "@/components/interview/VoiceVisualizer";
import { TranscriptDisplay } from "@/components/interview/TranscriptDisplay";
import { InterviewControls } from "@/components/interview/InterviewControls";
import { FeedbackReport } from "@/components/interview/FeedBackReport";

interface InterviewQuestion {
  id: number;
  category: string;
  topic: string;
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export default function InterviewSimulationPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const isRecognitionActive = useRef(false);

  useEffect(() => {
    loadAndGenerateQuestions();
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const loadAndGenerateQuestions = async () => {
    try {
      const techData = sessionStorage.getItem("techData");
      const experienceData = sessionStorage.getItem("experienceData");
      const projectsData = sessionStorage.getItem("projectsData");

      if (!techData) {
        setError("No resume data found. Please upload your resume first.");
        setIsLoading(false);
        return;
      }

      const skills = JSON.parse(techData);
      const experience = experienceData ? JSON.parse(experienceData) : null;
      const projects = projectsData ? JSON.parse(projectsData) : null;

      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, experience, projects })
      });

      if (!response.ok) throw new Error("Failed to generate questions");

      const result = await response.json();
      setQuestions(result.questions);
      
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInterview = () => {
    setIsInterviewStarted(true);
    setInterviewStartTime(Date.now());
    speakQuestion(questions[0], 0);
  };

  const speakQuestion = (question: InterviewQuestion, index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(
      `Question ${index + 1}. ${question.question}`
    );
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en-US'));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleStartListening = () => {
    if (typeof window === 'undefined') return;
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition not supported. Please use Chrome.");
      return;
    }
    if (isRecognitionActive.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      isRecognitionActive.current = true;
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const trans = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += trans + ' ';
        else interimTranscript += trans;
      }
      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error("Speech error:", event.error);
      }
      isRecognitionActive.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      isRecognitionActive.current = false;
      if (isRecognitionActive.current) setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isRecognitionActive.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
    isRecognitionActive.current = false;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = transcript.trim() || "";
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscript("");
      setTimeout(() => {
        speakQuestion(questions[currentQuestionIndex + 1], currentQuestionIndex + 1);
      }, 500);
    } else {
      handleEndInterview();
    }
  };

  const handleSkipQuestion = () => {
    window.speechSynthesis.cancel();
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = "";
    setAnswers(newAnswers);
    handleNextQuestion();
  };

  const handleEndInterview = async () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    
    setIsGeneratingFeedback(true);
    
    const answersForEvaluation = questions.map((q, index) => ({
      questionId: q.id,
      question: q.question,
      userAnswer: answers[index] || "",
      expectedAnswer: q.answer,
    }));

    try {
      const response = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersForEvaluation })
      });

      if (response.ok) {
        const result = await response.json();
        setFeedbackData(result.feedback);
        setShowFeedback(true);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-gray-600">Loading interview questions...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100 text-center px-6">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-gray-800 mb-2">{error || "No questions available"}</p>
        <Link href="/resume">
          <Button size="lg"><Home size={20} className="mr-2" />Go Back</Button>
        </Link>
      </div>
    );
  }

  if (isGeneratingFeedback) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-4" />
        <p className="text-2xl font-semibold text-gray-800">Generating Feedback...</p>
      </div>
    );
  }

  if (showFeedback) {
    const averageScore = feedbackData.reduce((sum, f) => sum + f.score, 0) / feedbackData.length;
    const answeredCount = answers.filter(a => a && a.trim().length > 0).length;
    const totalDuration = (Date.now() - interviewStartTime) / 1000;

    return (
      <FeedbackReport
        feedback={feedbackData}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        averageScore={averageScore}
        duration={totalDuration}
        onNewInterview={() => {
          setShowFeedback(false);
          setIsInterviewStarted(false);
          setCurrentQuestionIndex(0);
          setAnswers([]);
          setTranscript("");
          setFeedbackData([]);
          loadAndGenerateQuestions();
        }}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Live Interview Simulation</h1>
          <Link href="/interview">
            <Button variant="outline"><Home size={20} className="mr-2" />Exit</Button>
          </Link>
        </div>

        {!isInterviewStarted ? (
          <InterviewWelcome 
            questionCount={questions.length} 
            onStart={handleStartInterview} 
          />
        ) : (
          <div className="space-y-6">
            <InterviewProgress 
              currentQuestion={currentQuestionIndex + 1} 
              totalQuestions={questions.length} 
            />
            
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
            />

            <VoiceVisualizer 
              isListening={isListening} 
              isSpeaking={isSpeaking} 
            />

            <TranscriptDisplay transcript={transcript} />

            <InterviewControls
              isListening={isListening}
              isSpeaking={isSpeaking}
              hasTranscript={transcript.trim().length > 0}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onNextQuestion={handleNextQuestion}
              onSkip={handleSkipQuestion}
              onEnd={handleEndInterview}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.7; }
          50% { transform: scaleY(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
