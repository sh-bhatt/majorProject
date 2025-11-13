interface InterviewProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export function InterviewProgress({ currentQuestion, totalQuestions }: InterviewProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Progress</span>
        <span>{currentQuestion} / {totalQuestions}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
