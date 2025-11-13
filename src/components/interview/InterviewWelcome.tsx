import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface InterviewWelcomeProps {
  questionCount: number;
  onStart: () => void;
}

export function InterviewWelcome({ questionCount, onStart }: InterviewWelcomeProps) {
  return (
    <div className="text-center py-20">
      <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-6">Ready to Start Your Interview?</h2>
        <p className="text-xl text-gray-600 mb-4">
          You'll be asked <span className="font-bold text-blue-600">{questionCount}</span> NEW questions.
        </p>
        <p className="text-lg text-gray-600 mb-8">
          The Interviewer will read each question aloud, and you can answer using your voice.
        </p>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">📝 Interview Tips:</h3>
          <ul className="text-left text-gray-700 space-y-2">
            <li>• <strong>Use Chrome browser</strong> for best speech recognition</li>
            <li>• Allow microphone access when prompted</li>
            <li>• Speak clearly and take your time</li>
            <li>• Click "Done Answering" when you finish</li>
            <li>• Use "Next Question" to move forward</li>
          </ul>
        </div>

        <Button size="lg" onClick={onStart} className="px-12 py-6 text-xl">
          <Play size={24} className="mr-2" />
          Start Interview
        </Button>
      </div>
    </div>
  );
}
