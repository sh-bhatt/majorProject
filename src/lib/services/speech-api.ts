export class SpeechRecognitionService {
  private recognition: any;
  private onResultCallback?: (transcript: string) => void;
  private onEndCallback?: () => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          
          if (this.onResultCallback) {
            this.onResultCallback(transcript);
          }
        };

        this.recognition.onend = () => {
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        };
      }
    }
  }

  start(onResult: (transcript: string) => void, onEnd: () => void) {
    this.onResultCallback = onResult;
    this.onEndCallback = onEnd;
    if (this.recognition) {
      this.recognition.start();
    }
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isSupported() {
    return !!this.recognition;
  }
}

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
  }

  speak(text: string, onEnd?: () => void): void {
    if (!this.synth) return;

    this.stop();

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = 0.9;
    this.currentUtterance.pitch = 1;
    this.currentUtterance.volume = 1;

    if (onEnd) {
      this.currentUtterance.onend = onEnd;
    }

    this.synth.speak(this.currentUtterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synth?.speaking || false;
  }

  isSupported(): boolean {
    return !!this.synth;
  }
}
