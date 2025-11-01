//@ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Home, Loader2, AlertCircle, Mic, MicOff, Play, SkipForward, StopCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

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
    console.log("🔍 Loading questions from sessionStorage...");
    
    try {
      const storedQuestions = sessionStorage.getItem("interviewQuestions");
      
      if (storedQuestions) {
        const parsed = JSON.parse(storedQuestions);
        console.log("✅ Loaded", parsed.length, "questions");
        setQuestions(parsed);
      } else {
        setError("No questions found. Please generate questions first.");
      }
    } catch (err) {
      console.error("❌ Error loading questions:", err);
      setError("Failed to load questions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Recognition already stopped");
        }
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStartInterview = () => {
    setIsInterviewStarted(true);
    setInterviewStartTime(Date.now());
    speakQuestion(questions[0]);
  };

  const speakQuestion = (question: InterviewQuestion) => {
    if (typeof window === 'undefined') return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(
        `Question ${currentQuestionIndex + 1}. ${question.question}`
      );
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log("✅ Finished speaking question");
      };

      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  const handleStartListening = () => {
    if (typeof window === 'undefined') return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported. Please use Chrome browser.");
      return;
    }

    if (isRecognitionActive.current) {
      console.log("Recognition already active, skipping");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onstart = () => {
        isRecognitionActive.current = true;
        setIsListening(true);
        setTranscript('');
        console.log("🎤 Started listening");
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.log("Speech recognition event:", event.error);
        
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error("❌ Speech recognition error:", event.error);
        }
        
        isRecognitionActive.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log("🛑 Recognition ended");
        isRecognitionActive.current = false;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsListening(false);
      isRecognitionActive.current = false;
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isRecognitionActive.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Recognition already stopped");
      }
    }
    
    setIsListening(false);
    isRecognitionActive.current = false;
    
    // 🔍 DEBUG: Check what we're saving
    console.log(`💾 Saving answer for Q${currentQuestionIndex + 1}: "${transcript}"`);
    
    // Save the answer - make sure transcript is not empty
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = transcript.trim() || "";
    setAnswers(newAnswers);
    
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setTranscript("");
        speakQuestion(questions[currentQuestionIndex + 1]);
      }, 1000);
    } else {
      handleEndInterview();
    }
  };

  const handleSkipQuestion = () => {
    window.speechSynthesis.cancel();
    
    console.log(`⏭️ Skipping question ${currentQuestionIndex + 1}`);
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = "";  // Empty string for skipped
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscript("");
      setTimeout(() => {
        speakQuestion(questions[currentQuestionIndex + 1]);
      }, 500);
    } else {
      handleEndInterview();
    }
  };

  const handleEndInterview = async () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Recognition cleanup");
      }
    }
    
    setIsGeneratingFeedback(true);
    
    // Prepare answers for evaluation
    const answersForEvaluation = questions.map((q, index) => ({
      questionId: q.id,
      question: q.question,
      userAnswer: answers[index] || "",
      expectedAnswer: q.answer,
    }));

    // 🔍 DEBUG: Log what we're sending for evaluation
    console.log("📊 Evaluating answers:");
    answersForEvaluation.forEach((ans, i) => {
      console.log(`Q${i + 1}: "${ans.userAnswer}" (length: ${(ans.userAnswer || "").length})`);
    });

    try {
      console.log("📊 Generating feedback for", answersForEvaluation.length, "answers...");
      
      const response = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersForEvaluation })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Feedback generated:", result.feedback?.length || 0);
        setFeedbackData(result.feedback || generateBasicFeedbackFallback(answersForEvaluation));
        setShowFeedback(true);
      } else {
        console.error("Failed to generate feedback, using fallback");
        setFeedbackData(generateBasicFeedbackFallback(answersForEvaluation));
        setShowFeedback(true);
      }
    } catch (err) {
      console.error("Error generating feedback:", err);
      setFeedbackData(generateBasicFeedbackFallback(answersForEvaluation));
      setShowFeedback(true);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const generateBasicFeedbackFallback = (answersForEvaluation: any[]) => {
    return answersForEvaluation.map(answer => {
      const userAnswer = answer.userAnswer || "";
      
      // MORE STRICT checking
      const isEmpty = !userAnswer || 
                      userAnswer.trim() === "" || 
                      userAnswer.trim().length === 0;
      
      let score = 0;
      let feedback = "";
      let strengths: string[] = [];
      let improvements: string[] = [];

      // If no valid answer at all - score MUST be 0
      if (isEmpty) {
        console.log(`Question ${answer.questionId}: No answer - Score: 0`);
        return {
          questionId: answer.questionId,
          question: answer.question,
          userAnswer: "No answer provided",
          expectedAnswer: answer.expectedAnswer,
          score: 0,
          feedback: "No answer provided for this question.",
          strengths: ["Participated in the interview"],
          improvements: [
            "Ensure you answer each question",
            "Take time to think before responding",
            "Practice explaining technical concepts clearly"
          ]
        };
      }

      // Check answer length after trimming
      const trimmedAnswer = userAnswer.trim();
      
      // Answer too short (less than 10 meaningful characters)
      if (trimmedAnswer.length < 10) {
        console.log(`Question ${answer.questionId}: Too short (${trimmedAnswer.length} chars) - Score: 15`);
        return {
          questionId: answer.questionId,
          question: answer.question,
          userAnswer: userAnswer,
          expectedAnswer: answer.expectedAnswer,
          score: 15,
          feedback: "Answer is too brief. Provide more detailed explanation with examples.",
          strengths: ["Made an attempt to answer"],
          improvements: [
            "Expand your answer significantly",
            "Explain the concept step by step",
            "Include concrete examples",
            "Add technical details"
          ]
        };
      }

      // Valid answer - start scoring
      console.log(`Question ${answer.questionId}: Valid answer - Starting score calculation`);
      
      // Start with base score for having a valid answer
      score = 35;
      
      // Score based on word count (meaningful words only)
      const words = trimmedAnswer.split(/\s+/).filter(word => word.length > 2);
      const wordCount = words.length;
      
      console.log(`  Word count: ${wordCount}`);
      
      if (wordCount > 100) score += 30;
      else if (wordCount > 70) score += 25;
      else if (wordCount > 50) score += 20;
      else if (wordCount > 30) score += 15;
      else if (wordCount > 15) score += 10;
      else score += 5;
      
      // Keyword matching
      const expectedWords = answer.expectedAnswer.toLowerCase()
        .split(/\s+/)
        .filter((word: string) => word.length > 4);
      
      const userWordsLower = trimmedAnswer.toLowerCase();
      
      const matchedKeywords = expectedWords.filter((word: string) => 
        userWordsLower.includes(word)
      );
      
      const matchCount = matchedKeywords.length;
      const totalKeywords = expectedWords.length;
      const matchPercentage = totalKeywords > 0 ? (matchCount / totalKeywords) * 100 : 0;
      
      console.log(`  Keyword match: ${matchCount}/${totalKeywords} (${matchPercentage.toFixed(1)}%)`);
      
      // Add points for keyword coverage (max 35 points)
      if (matchPercentage > 60) score += 35;
      else if (matchPercentage > 40) score += 25;
      else if (matchPercentage > 25) score += 15;
      else if (matchPercentage > 10) score += 8;
      else if (matchPercentage > 0) score += 3;

      // Cap at 100
      score = Math.min(Math.max(score, 0), 100);
      
      console.log(`  Final score: ${score}%`);

      // Generate contextual feedback
      if (score >= 85) {
        feedback = "Excellent answer! You demonstrated strong understanding with comprehensive details and relevant technical terminology.";
        strengths = [
          "Comprehensive and well-structured explanation",
          "Strong use of technical terminology",
          "Covered key concepts thoroughly",
          "Provided sufficient detail"
        ];
        improvements = [
          "Consider adding a real-world example or use case",
          "Could mention potential limitations or edge cases"
        ];
      } else if (score >= 70) {
        feedback = "Very good answer. You covered the main points effectively with good technical detail.";
        strengths = [
          "Good understanding demonstrated",
          "Covered main concepts clearly",
          "Reasonable level of technical detail"
        ];
        improvements = [
          "Add more specific technical implementation details",
          "Include practical examples from your experience"
        ];
      } else if (score >= 55) {
        feedback = "Good attempt. Your answer shows understanding but needs more technical depth and specific details.";
        strengths = [
          "Basic understanding of the concept",
          "Attempted to explain the topic"
        ];
        improvements = [
          "Add significantly more technical depth",
          "Include specific examples or use cases",
          "Use more precise technical terminology"
        ];
      } else if (score >= 40) {
        feedback = "Your answer shows limited understanding. The response lacks depth and technical accuracy.";
        strengths = [
          "Made an attempt to answer",
          "Showed some awareness of the topic"
        ];
        improvements = [
          "Study this topic more thoroughly",
          "Focus on understanding core concepts",
          "Practice explaining technical concepts clearly"
        ];
      } else {
        feedback = "This answer needs significant improvement. The response was too brief, vague, or lacked relevant technical content.";
        strengths = [
          "Participated in the interview process"
        ];
        improvements = [
          "Study the fundamentals of this topic in depth",
          "Practice answering similar technical questions",
          "Focus on explaining concepts with proper terminology"
        ];
      }

      return {
        questionId: answer.questionId,
        question: answer.question,
        userAnswer: userAnswer || "No answer provided",
        expectedAnswer: answer.expectedAnswer,
        score,
        feedback,
        strengths,
        improvements
      };
    });
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
        <p className="text-xl font-semibold text-gray-800 mb-2">
          {error || "No questions available"}
        </p>
        <p className="text-gray-600 mb-6">
          Please go back and generate interview questions first.
        </p>
        <Link href="/interview">
          <Button size="lg">
            <Home size={20} className="mr-2" />
            Go Back to Questions
          </Button>
        </Link>
      </div>
    );
  }

  if (isGeneratingFeedback) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-4" />
        <p className="text-2xl font-semibold text-gray-800 mb-2">Generating Your Feedback...</p>
        <p className="text-gray-600">The Interviewer is analyzing your answers</p>
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  if (showFeedback) {
    const averageScore = feedbackData.length > 0 
      ? feedbackData.reduce((sum, f) => sum + f.score, 0) / feedbackData.length 
      : 0;
    const answeredCount = answers.filter(a => a && a.trim().length > 0).length;
    const totalDuration = (Date.now() - interviewStartTime) / 1000;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {/* Summary Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 mb-8">
            <h1 className="text-4xl font-bold mb-6 flex items-center gap-3">
              Interview Complete! 🎉
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
                <p className="text-4xl font-bold">{questions.length}</p>
                <p className="text-sm mt-1">Total Questions</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
                <p className="text-4xl font-bold">{answeredCount}</p>
                <p className="text-sm mt-1">Answered</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
                <p className="text-4xl font-bold">{averageScore.toFixed(0)}%</p>
                <p className="text-sm mt-1">Avg Score</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
                <p className="text-4xl font-bold">
                  {Math.floor(totalDuration / 60)}m {Math.floor(totalDuration % 60)}s
                </p>
                <p className="text-sm mt-1">Duration</p>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Performance Insights</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <p className="text-3xl font-bold text-green-600">
                  {feedbackData.filter(f => f.score >= 80).length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Excellent Answers</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <p className="text-3xl font-bold text-yellow-600">
                  {feedbackData.filter(f => f.score >= 60 && f.score < 80).length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Good Answers</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <p className="text-3xl font-bold text-red-600">
                  {feedbackData.filter(f => f.score < 60).length}
                </p>
                <p className="text-sm text-gray-600 font-medium">Needs Improvement</p>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6">Detailed Feedback</h2>

          {/* Feedback Cards */}
          <div className="space-y-6">
            {feedbackData.map((item, index) => (
              <div key={item.questionId} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-800">{item.question}</h3>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-3xl font-bold ${
                      item.score >= 80 ? 'text-green-600' :
                      item.score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {item.score}%
                    </span>
                    <span className="text-xs text-gray-500">Score</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Your Answer */}
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Mic size={16} />
                      Your Answer:
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {item.userAnswer}
                    </p>
                  </div>

                  {/* Expected Answer */}
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                      ✓ Expected Answer:
                    </p>
                    <p className="text-gray-700 leading-relaxed">{item.expectedAnswer}</p>
                  </div>

                  {/* AI Feedback */}
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <p className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      The Interviewer's Feedback:
                    </p>
                    <p className="text-gray-700 leading-relaxed">{item.feedback}</p>
                  </div>

                  {/* Strengths and Improvements */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {item.strengths && item.strengths.length > 0 && (
                      <div className="bg-white border-2 border-green-200 rounded-lg p-4">
                        <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <CheckCircle size={18} className="text-green-600" />
                          Strengths:
                        </p>
                        <ul className="space-y-1">
                          {item.strengths.map((strength: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.improvements && item.improvements.length > 0 && (
                      <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
                        <p className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                          <AlertCircle size={18} className="text-orange-600" />
                          Areas to Improve:
                        </p>
                        <ul className="space-y-1">
                          {item.improvements.map((improvement: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-orange-600 mt-0.5">•</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/interview">
              <Button size="lg" variant="outline">
                Back to Questions
              </Button>
            </Link>
            <Button 
              size="lg"
              onClick={() => {
                setShowFeedback(false);
                setIsInterviewStarted(false);
                setCurrentQuestionIndex(0);
                setAnswers([]);
                setTranscript("");
                setFeedbackData([]);
              }}
            >
              Start New Interview
            </Button>
            <Link href="/">
              <Button size="lg">
                <Home size={20} className="mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Live Interview Simulation</h1>
          <Link href="/interview">
            <Button variant="outline">
              <Home size={20} className="mr-2" />
              Exit
            </Button>
          </Link>
        </div>

        {!isInterviewStarted ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Ready to Start Your Interview?</h2>
              <p className="text-xl text-gray-600 mb-4">
                You'll be asked <span className="font-bold text-blue-600">{questions.length}</span> questions based on your resume.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                The Interviewer will read each question aloud, and you can answer using your voice.
              </p>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-3">📝 Interview Tips:</h3>
                <ul className="text-left text-gray-700 space-y-2">
                  <li>• <strong>Use Chrome browser</strong> for best speech recognition</li>
                  <li>• Allow microphone access when prompted</li>
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• Click "Start Answering" after AI finishes asking</li>
                  <li>• Click "Stop Recording" when you finish your answer</li>
                </ul>
              </div>

              <Button 
                size="lg" 
                onClick={handleStartInterview} 
                className="px-12 py-6 text-xl"
              >
                <Play size={24} className="mr-2" />
                Start Interview
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{currentQuestionIndex + 1} / {questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-500 uppercase">
                    {currentQuestion.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    currentQuestion.difficulty === 'Easy' 
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : currentQuestion.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Voice Status */}
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <div className="flex items-center justify-center gap-4 mb-4">
                {isSpeaking && (
                  <div className="flex items-center gap-3 text-green-600">
                    <div className="text-3xl animate-pulse">🤖</div>
                    <span className="text-xl font-semibold">The Interviewer is asking the question...</span>
                  </div>
                )}
                {isListening && (
                  <div className="flex items-center gap-3 text-blue-600">
                    <Mic size={32} className="animate-pulse" />
                    <span className="text-xl font-semibold">Listening to your answer...</span>
                  </div>
                )}
                {!isSpeaking && !isListening && (
                  <div className="flex items-center gap-3 text-gray-500">
                    <MicOff size={32} />
                    <span className="text-xl font-semibold">Ready to record</span>
                  </div>
                )}
              </div>

              {/* Audio Waveform Visual */}
              <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {(isListening || isSpeaking) ? (
                  <div className="flex items-center gap-1">
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full ${isListening ? 'bg-blue-500' : 'bg-green-500'}`}
                        style={{
                          height: `${Math.random() * 60 + 20}px`,
                          animation: 'wave 0.5s ease-in-out infinite',
                          animationDelay: `${i * 0.05}s`
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">Audio visualizer</span>
                )}
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 min-h-[150px]">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Mic size={16} />
                Your Answer (Live Transcript)
              </h3>
              {transcript ? (
                <p className="text-gray-800 text-lg leading-relaxed">{transcript}</p>
              ) : (
                <p className="text-gray-400 italic">Your spoken answer will appear here...</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {!isListening && !isSpeaking && (
                <Button
                  size="lg"
                  onClick={handleStartListening}
                  className="px-10 py-6 text-lg"
                >
                  <Mic size={24} className="mr-2" />
                  Start Answering
                </Button>
              )}

              {isListening && (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleStopListening}
                  className="px-10 py-6 text-lg"
                >
                  <MicOff size={24} className="mr-2" />
                  Done - Next Question
                </Button>
              )}

              {!isListening && !isSpeaking && (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleSkipQuestion}
                    className="px-8 py-6"
                  >
                    <SkipForward size={20} className="mr-2" />
                    Skip Question
                  </Button>

                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={handleEndInterview}
                    className="px-8 py-6"
                  >
                    <StopCircle size={20} className="mr-2" />
                    End Interview
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes wave {
          0%, 100% { 
            transform: scaleY(0.5);
            opacity: 0.7;
          }
          50% { 
            transform: scaleY(1.5);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
