import { useState, useEffect, useRef } from 'react';
import { TextToSpeechService } from '@/lib/services/speech-api';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const serviceRef = useRef<TextToSpeechService | null>(null);

  useEffect(() => {
    serviceRef.current = new TextToSpeechService();
    setIsSupported(serviceRef.current.isSupported());

    return () => {
      if (serviceRef.current) {
        serviceRef.current.stop();
      }
    };
  }, []);

  const speak = (text: string, onEnd?: () => void) => {
    if (!serviceRef.current) return;

    setIsSpeaking(true);
    serviceRef.current.speak(text, () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    });
  };

  const stop = () => {
    if (serviceRef.current) {
      serviceRef.current.stop();
      setIsSpeaking(false);
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
    isSupported
  };
}
