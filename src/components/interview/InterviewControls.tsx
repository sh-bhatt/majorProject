import { Button } from "@/components/ui/button";
import { Mic, MicOff, SkipForward, StopCircle } from "lucide-react";

interface InterviewControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSkip: () => void;
  onEndInterview: () => void;
  canSkip: boolean;
}

export function InterviewControls({
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onSkip,
  onEndInterview,
  canSkip
}: InterviewControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {!isListening && !isSpeaking && (
        <Button
          size="lg"
          onClick={onStartListening}
          className="px-8 py-6 text-lg"
        >
          <Mic size={24} className="mr-2" />
          Start Answering
        </Button>
      )}

      {isListening && (
        <Button
          size="lg"
          variant="destructive"
          onClick={onStopListening}
          className="px-8 py-6 text-lg"
        >
          <MicOff size={24} className="mr-2" />
          Stop Recording
        </Button>
      )}

      {canSkip && (
        <Button
          size="lg"
          variant="outline"
          onClick={onSkip}
          disabled={isSpeaking}
          className="px-6 py-6"
        >
          <SkipForward size={20} className="mr-2" />
          Skip Question
        </Button>
      )}

      <Button
        size="lg"
        variant="secondary"
        onClick={onEndInterview}
        className="px-6 py-6"
      >
        <StopCircle size={20} className="mr-2" />
        End Interview
      </Button>
    </div>
  );
}
