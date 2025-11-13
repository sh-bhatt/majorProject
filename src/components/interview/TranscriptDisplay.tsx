import { Mic } from "lucide-react";

interface TranscriptDisplayProps {
  transcript: string;
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  return (
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
  );
}
