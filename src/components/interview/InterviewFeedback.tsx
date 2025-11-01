import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, TrendingUp, Home } from "lucide-react";
import Link from "next/link";
import { InterviewFeedback as FeedbackType } from "@/lib/types/interview.types";

interface InterviewFeedbackPageProps {
  feedback: FeedbackType[];
  totalDuration: number;
}

export function InterviewFeedbackPage({ feedback, totalDuration }: InterviewFeedbackPageProps) {
  const averageScore = feedback.reduce((sum, f) => sum + f.score, 0) / feedback.length;
  const totalQuestions = feedback.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">Interview Complete! 🎉</h1>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{totalQuestions}</p>
              <p className="text-sm">Questions Answered</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{averageScore.toFixed(1)}%</p>
              <p className="text-sm">Average Score</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{Math.floor(totalDuration / 60)}m</p>
              <p className="text-sm">Duration</p>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-6">Detailed Feedback</h2>

        <div className="space-y-6">
          {feedback.map((item, index) => (
            <FeedbackCard key={item.questionId} feedback={item} index={index + 1} />
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/interview">
            <Button size="lg" variant="outline">
              Back to Questions
            </Button>
          </Link>
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

function FeedbackCard({ feedback, index }: { feedback: FeedbackType; index: number }) {
  const scoreColor = feedback.score >= 80 ? "text-green-600" : feedback.score >= 60 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              {index}
            </span>
            <h3 className="text-lg font-semibold text-gray-800">{feedback.question}</h3>
          </div>
        </div>
        <span className={`text-2xl font-bold ${scoreColor}`}>{feedback.score}%</span>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Your Answer:</p>
          <p className="text-gray-700">{feedback.userAnswer || "No answer provided"}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-900 mb-2">Expected Answer:</p>
          <p className="text-gray-700">{feedback.expectedAnswer}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-purple-900 mb-2">AI Feedback:</p>
          <p className="text-gray-700">{feedback.feedback}</p>
        </div>

        {feedback.strengths.length > 0 && (
          <div className="flex items-start gap-2">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-green-900 mb-1">Strengths:</p>
              <ul className="list-disc list-inside text-gray-700">
                {feedback.strengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {feedback.improvements.length > 0 && (
          <div className="flex items-start gap-2">
            <TrendingUp className="text-orange-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-orange-900 mb-1">Areas for Improvement:</p>
              <ul className="list-disc list-inside text-gray-700">
                {feedback.improvements.map((improvement, i) => (
                  <li key={i}>{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
