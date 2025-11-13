import { Button } from "@/components/ui/button";
import { Home, CheckCircle, AlertCircle, Mic, Briefcase} from "lucide-react";
import Link from "next/link";

interface FeedbackItem {
  questionId: number;
  question: string;
  userAnswer: string;
  expectedAnswer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface FeedbackReportProps {
  feedback: FeedbackItem[];
  totalQuestions: number;
  answeredCount: number;
  averageScore: number;
  duration: number;
  onNewInterview: () => void;
}

export function FeedbackReport({
  feedback,
  totalQuestions,
  answeredCount,
  averageScore,
  duration,
  onNewInterview,
}: FeedbackReportProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-6">Interview Complete! 🎉</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard value={totalQuestions} label="Total Questions" />
            <StatCard value={answeredCount} label="Answered" />
            <StatCard value={`${averageScore.toFixed(0)}%`} label="Avg Score" />
            <StatCard 
              value={`${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`} 
              label="Duration" 
            />
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Performance Insights</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <InsightCard
              count={feedback.filter(f => f.score >= 80).length}
              label="Excellent Answers"
              color="green"
            />
            <InsightCard
              count={feedback.filter(f => f.score >= 60 && f.score < 80).length}
              label="Good Answers"
              color="yellow"
            />
            <InsightCard
              count={feedback.filter(f => f.score < 60).length}
              label="Needs Improvement"
              color="red"
            />
          </div>
        </div>

        {/* Detailed Feedback */}
        <h2 className="text-3xl font-bold mb-6">Detailed Feedback</h2>
        <div className="space-y-6">
          {feedback.map((item, index) => (
            <FeedbackCard key={item.questionId} item={item} index={index + 1} />
          ))}
        </div>

        {/* Actions */}
        // In FeedbackReport.tsx, update the Action Buttons section:

{/* Actions */}
<div className="mt-10 flex flex-wrap justify-center gap-4">
  <Link href="/interview">
    <Button size="lg" variant="outline">Back to Questions</Button>
  </Link>
  <Button size="lg" onClick={onNewInterview}>Start New Interview</Button>
  
  {/* ✅ NEW: Job Recommendations Button */}
  <Link 
    href={{
      pathname: "/job-rec",
      query: { 
        score: averageScore.toFixed(0),
        answeredCount: answeredCount,
        totalQuestions: totalQuestions
      }
    }}
    onClick={() => {
      // Save data to sessionStorage for job matching
      sessionStorage.setItem("interviewScore", averageScore.toFixed(0));
      sessionStorage.setItem("interviewData", JSON.stringify({
        score: averageScore,
        answeredCount,
        totalQuestions,
        feedback: feedback.map(f => ({
          category: f.question.split(' ')[0], // Extract category
          score: f.score
        }))
      }));
    }}
  >
    <Button size="lg" className="bg-green-600 hover:bg-green-700">
      <Briefcase size={20} className="mr-2" />
      Find Matching Jobs
    </Button>
  </Link>
  
  <Link href="/">
    <Button size="lg"><Home size={20} className="mr-2" />Home</Button>
  </Link>
</div>

      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-sm mt-1">{label}</p>
    </div>
  );
}

function InsightCard({ count, label, color }: { count: number; label: string; color: string }) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className={`text-center p-4 rounded-lg border-2 ${colors[color as keyof typeof colors]}`}>
      <p className="text-3xl font-bold">{count}</p>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
    </div>
  );
}

function FeedbackCard({ item, index }: { item: FeedbackItem; index: number }) {
  const scoreColor = item.score >= 80 ? 'text-green-600' : 
                     item.score >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">
              {index}
            </span>
            <h3 className="text-xl font-semibold text-gray-800">{item.question}</h3>
          </div>
        </div>
        <span className={`text-3xl font-bold ${scoreColor}`}>{item.score}%</span>
      </div>

      <div className="space-y-4">
        <AnswerBox title="Your Answer" content={item.userAnswer} icon={<Mic size={16} />} color="blue" />
        <AnswerBox title="Expected Answer" content={item.expectedAnswer} icon="✓" color="green" />
        <AnswerBox title="AI Feedback" content={item.feedback} icon="🤖" color="purple" />

        <div className="grid md:grid-cols-2 gap-4">
          {item.strengths?.length > 0 && (
            <ListBox title="Strengths" items={item.strengths} icon={<CheckCircle size={18} />} color="green" />
          )}
          {item.improvements?.length > 0 && (
            <ListBox title="Areas to Improve" items={item.improvements} icon={<AlertCircle size={18} />} color="orange" />
          )}
        </div>
      </div>
    </div>
  );
}

function AnswerBox({ title, content, icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 border-blue-500 text-blue-900',
    green: 'bg-green-50 border-green-500 text-green-900',
    purple: 'bg-purple-50 border-purple-500 text-purple-900',
  };

  return (
    <div className={`rounded-lg p-4 border-l-4 ${colors[color as keyof typeof colors]}`}>
      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
        {icon} {title}:
      </p>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}

function ListBox({ title, items, icon, color }: any) {
  const colors = {
    green: 'border-green-200 text-green-900',
    orange: 'border-orange-200 text-orange-900',
  };

  return (
    <div className={`bg-white border-2 rounded-lg p-4 ${colors[color as keyof typeof colors]}`}>
      <p className="font-semibold mb-2 flex items-center gap-2">{icon} {title}:</p>
      <ul className="space-y-1">
        {items.map((item: string, i: number) => (
          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
            <span className={color === 'green' ? 'text-green-600' : 'text-orange-600'}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
