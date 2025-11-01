"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  Loader2,
  AlertCircle,
  Brain,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Play,
} from "lucide-react";
import Link from "next/link";

interface TechData {
  programming_languages: string[];
  technologies: string[];
  tools: string[];
  coursework: string[];
}

interface InterviewQuestion {
  id: number;
  category: string;
  topic: string;
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export default function InterviewPage() {
  const [data, setData] = useState<TechData | null>(null);
  const [experience, setExperience] = useState<any>(null);
  const [projects, setProjects] = useState<any>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadResumeData();
  }, []);

  const loadResumeData = async () => {
    try {
      const storedData = sessionStorage.getItem("techData");
      const storedExperience = sessionStorage.getItem("experienceData");
      const storedProjects = sessionStorage.getItem("projectsData");

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const parsedExperience = storedExperience ? JSON.parse(storedExperience) : null;
        const parsedProjects = storedProjects ? JSON.parse(storedProjects) : null;

        setData(parsedData);
        setExperience(parsedExperience);
        setProjects(parsedProjects);

        await generateQuestions(parsedData, parsedExperience, parsedProjects);
      } else {
        setError("No resume data found. Please upload your resume first.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please re-upload your resume.");
      setIsLoading(false);
    }
  };

  const generateQuestions = async (skills: TechData, exp: any, proj: any) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: skills,
          experience: exp,
          projects: proj,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const result = await response.json();
      setQuestions(result.questions);
    } catch (err: any) {
      console.error("Error generating questions:", err);
      setError("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const regenerateQuestions = async () => {
    setShowAnswers({});
    await generateQuestions(data!, experience, projects);
  };

  const toggleAnswer = (id: number) => {
    setShowAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ["all", ...new Set(questions.map(q => q.category))];

  const filteredQuestions = selectedCategory === "all"
    ? questions
    : questions.filter(q => q.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-gray-600">
          {isGenerating ? "The Interviewer is generating your interview questions..." : "Loading..."}
        </p>
        <p className="text-sm text-gray-500 mt-2">This may take 10-20 seconds</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100 text-center">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-gray-800 mb-2">{error}</p>
        <Link href="/resume">
          <Button size="lg" className="mt-2 flex items-center gap-2">
            <Home size={20} /> Go Back to Upload
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/extract-tech">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              The Interview Preparation
              <Sparkles className="text-yellow-500" size={32} />
            </h1>
            <p className="text-gray-600">
              {questions.length} Generated questions based on your resume
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain size={32} />
            <div>
              <h2 className="text-2xl font-bold">Practice Makes Perfect</h2>
              <p className="text-blue-100">Questions tailored by The Interviewer to your skills and experience</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-3xl font-bold">{questions.filter(q => q.difficulty === "Easy").length}</p>
              <p className="text-sm text-blue-100">Easy</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-3xl font-bold">{questions.filter(q => q.difficulty === "Medium").length}</p>
              <p className="text-sm text-blue-100">Medium</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-3xl font-bold">{questions.filter(q => q.difficulty === "Hard").length}</p>
              <p className="text-sm text-blue-100">Hard</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="capitalize"
              >
                {cat === "all" ? "All Questions" : cat}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={regenerateQuestions}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Regenerate
              </>
            )}
          </Button>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-4" />
            <p className="text-lg text-gray-600">The Interviewer is generating new questions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, index) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={index + 1}
                showAnswer={showAnswers[q.id] || false}
                onToggleAnswer={() => toggleAnswer(q.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/extract-tech">
            <Button variant="outline" size="lg">
              Back to Analysis
            </Button>
          </Link>
          <Button size="lg" onClick={() => setShowAnswers({})}>
            <RotateCcw size={20} className="mr-2" />
            Hide All Answers
          </Button>
          <Link
            href="/interview-simulation"
            onClick={() => {
              // Save questions to sessionStorage before navigation
              if (questions && questions.length > 0) {
                sessionStorage.setItem("interviewQuestions", JSON.stringify(questions));
                console.log("✅ Saved questions to sessionStorage:", questions.length);
              } else {
                console.error("❌ No questions to save");
              }
            }}
          >
            <Button size="lg" className="flex items-center gap-2">
              <Play size={20} />
              Start Live Interview
            </Button>
          </Link>



        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  showAnswer,
  onToggleAnswer,
}: {
  question: InterviewQuestion;
  index: number;
  showAnswer: boolean;
  onToggleAnswer: () => void;
}) {
  const difficultyColor = {
    Easy: "bg-green-100 text-green-700 border-green-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Hard: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {index}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">{question.category}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${difficultyColor[question.difficulty]}`}>
                {question.difficulty}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{question.topic}</h3>
            <p className="text-gray-700 leading-relaxed">{question.question}</p>
          </div>
        </div>
      </div>

      <Button
        variant={showAnswer ? "secondary" : "default"}
        onClick={onToggleAnswer}
        className="w-full flex items-center justify-center gap-2"
      >
        {showAnswer ? (
          <>
            <CheckCircle2 size={18} />
            Hide Answer
          </>
        ) : (
          <>
            <MessageSquare size={18} />
            Show Answer
          </>
        )}
      </Button>

      {showAnswer && (
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">Answer:</p>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{question.answer}</div>
        </div>
      )}
    </div>
  );
}
