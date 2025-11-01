import { useState, useEffect, useRef } from 'react';
import { SpeechRecognitionService } from '@/lib/services/speech-api';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const serviceRef = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    serviceRef.current = new SpeechRecognitionService();
    setIsSupported(serviceRef.current.isSupported());

    return () => {
      if (serviceRef.current) {
        serviceRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!serviceRef.current) return;

    setTranscript('');
    setIsListening(true);

    serviceRef.current.start(
      (newTranscript) => {
        setTranscript(newTranscript);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    if (serviceRef.current) {
      serviceRef.current.stop();
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}
