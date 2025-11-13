import { Mic, MicOff } from "lucide-react";

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export function VoiceVisualizer({ isListening, isSpeaking }: VoiceVisualizerProps) {
  return (
    <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
      <div className="flex items-center justify-center gap-4 mb-4">
        {isSpeaking && (
          <div className="flex items-center gap-3 text-green-600">
            
            <span className="text-xl font-semibold">The Interviewer is asking...</span>
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
  );
}
