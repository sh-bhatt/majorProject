import { useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export function VoiceVisualizer({ isListening, isSpeaking }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isListening || isSpeaking) {
        const bars = 50;
        const barWidth = canvas.width / bars;

        for (let i = 0; i < bars; i++) {
          const height = Math.sin(time + i * 0.5) * 30 + 40;
          const color = isListening ? '#3b82f6' : '#10b981';
          
          ctx.fillStyle = color;
          ctx.fillRect(
            i * barWidth,
            canvas.height / 2 - height / 2,
            barWidth - 2,
            height
          );
        }

        time += 0.1;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isListening, isSpeaking]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={600}
        height={100}
        className="w-full h-24 rounded-lg bg-gray-100"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {isListening ? (
          <div className="flex items-center gap-2 text-blue-600">
            <Mic size={32} className="animate-pulse" />
            <span className="text-lg font-semibold">Listening...</span>
          </div>
        ) : isSpeaking ? (
          <div className="flex items-center gap-2 text-green-600">
            <Mic size={32} className="animate-pulse" />
            <span className="text-lg font-semibold">AI Speaking...</span>
          </div>
        ) : (
          <MicOff size={32} className="text-gray-400" />
        )}
      </div>
    </div>
  );
}
