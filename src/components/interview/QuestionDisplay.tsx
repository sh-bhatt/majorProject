import { InterviewQuestion } from '@/lib/types/interview.types';

interface QuestionDisplayProps {
  question: InterviewQuestion;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionDisplay({ 
  question, 
  questionNumber, 
  totalQuestions 
}: QuestionDisplayProps) {
  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Hard: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500 uppercase">
            {question.category}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            difficultyColors[question.difficulty]
          }`}>
            {question.difficulty}
          </span>
        </div>
        <span className="text-sm text-gray-500 font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 leading-relaxed">
        {question.question}
      </h2>
    </div>
  );
}
