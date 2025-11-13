import { Button } from "@/components/ui/button";
import { Mic, MicOff, ArrowRight, SkipForward, StopCircle } from "lucide-react";

interface InterviewControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  hasTranscript: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onNextQuestion: () => void;
  onSkip: () => void;
  onEnd: () => void;
}

export function InterviewControls({
  isListening,
  isSpeaking,
  hasTranscript,
  onStartListening,
  onStopListening,
  onNextQuestion,
  onSkip,
  onEnd,
}: InterviewControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {!isListening && !isSpeaking && (
        <Button size="lg" onClick={onStartListening} className="px-10 py-6 text-lg">
          <Mic size={24} className="mr-2" />
          Start Answering
        </Button>
      )}

      {isListening && (
        <Button
          size="lg"
          variant="destructive"
          onClick={onStopListening}
          className="px-10 py-6 text-lg"
        >
          <MicOff size={24} className="mr-2" />
          Done Answering
        </Button>
      )}

      {!isListening && !isSpeaking && hasTranscript && (
        <Button
          size="lg"
          onClick={onNextQuestion}
          className="px-10 py-6 text-lg bg-green-600 hover:bg-green-700"
        >
          <ArrowRight size={24} className="mr-2" />
          Next Question
        </Button>
      )}

      {!isListening && !isSpeaking && (
        <>
          <Button size="lg" variant="outline" onClick={onSkip} className="px-8 py-6">
            <SkipForward size={20} className="mr-2" />
            Skip Question
          </Button>

          <Button size="lg" variant="secondary" onClick={onEnd} className="px-8 py-6">
            <StopCircle size={20} className="mr-2" />
            End Interview
          </Button>
        </>
      )}
    </div>
  );
}
