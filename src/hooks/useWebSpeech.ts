import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export interface UseWebSpeechOptions {
  onFinalTranscript?: (transcript: string, isHandsFree: boolean) => void;
  onInterimTranscript?: (interim: string) => void;
  lang?: string;
  defaultAutoSpeak?: boolean;
}

export function cleanTextForSpeech(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' Code block generated. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1800);
}

export function useWebSpeech({
  onFinalTranscript,
  onInterimTranscript,
  lang = 'en-US',
  defaultAutoSpeak = false,
}: UseWebSpeechOptions = {}) {
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [isSynthesisSupported, setIsSynthesisSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const [autoSpeak, setAutoSpeak] = useState(defaultAutoSpeak);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.02);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const handsFreeRef = useRef(handsFree);
  const isSpeakingRef = useRef(isSpeaking);
  const manualStopRef = useRef(false);
  const onFinalRef = useRef(onFinalTranscript);
  const onInterimRef = useRef(onInterimTranscript);

  useEffect(() => {
    handsFreeRef.current = handsFree;
  }, [handsFree]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
    onInterimRef.current = onInterimTranscript;
  }, [onFinalTranscript, onInterimTranscript]);

  // Detect Web Speech API availability & load voices
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec: SpeechRecognitionConstructor | undefined =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .webkitSpeechRecognition;

    setIsRecognitionSupported(Boolean(SpeechRec));
    setIsSynthesisSupported('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (available.length > 0) {
          setVoices(available);
          setSelectedVoiceURI((prev) => {
            if (prev) return prev;
            const preferred =
              available.find(
                (v) =>
                  v.lang.startsWith('en') &&
                  (v.name.includes('Natural') ||
                    v.name.includes('Google US English') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Premium'))
              ) ||
              available.find((v) => v.lang.startsWith('en-US')) ||
              available.find((v) => v.lang.startsWith('en')) ||
              available[0];
            return preferred?.voiceURI || '';
          });
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      manualStopRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, []);

  const startListeningInternal = useCallback(
    (continuousMode: boolean) => {
      if (typeof window === 'undefined') return;
      const SpeechRec: SpeechRecognitionConstructor | undefined =
        (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
          .webkitSpeechRecognition;

      if (!SpeechRec) {
        setVoiceError('Web Speech Recognition is not supported in this browser.');
        return;
      }

      // Stop any ongoing speech synthesis so mic does not transcribe agent voice
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      manualStopRef.current = false;
      setVoiceError(null);

      const rec = new SpeechRec();
      rec.lang = lang;
      rec.interimResults = true;
      rec.continuous = continuousMode;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: SpeechRecognitionEventLike) => {
        if (isSpeakingRef.current) return;

        let interim = '';
        let finalizedChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            finalizedChunk += text + ' ';
          } else {
            interim += text;
          }
        }

        const cleanInterim = interim.trim();
        setInterimTranscript(cleanInterim);
        onInterimRef.current?.(cleanInterim);

        const cleanFinal = finalizedChunk.trim();
        if (cleanFinal) {
          setInterimTranscript('');
          onInterimRef.current?.('');
          onFinalRef.current?.(cleanFinal, handsFreeRef.current);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError('Microphone permission is blocked. Enable mic access to use voice input.');
          setHandsFree(false);
          handsFreeRef.current = false;
          manualStopRef.current = true;
        } else {
          setVoiceError(`Voice input notice: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        // In hands-free mode, automatically restart listening when not speaking and not manually stopped
        if (handsFreeRef.current && !manualStopRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            if (handsFreeRef.current && !manualStopRef.current && !isSpeakingRef.current) {
              try {
                rec.start();
              } catch {
                // ignore concurrent start race
              }
            }
          }, 260);
        }
      };

      recognitionRef.current = rec;
      try {
        rec.start();
      } catch {
        // already started
      }
    },
    [lang]
  );

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    setHandsFree(false);
    handsFreeRef.current = false;
    setInterimTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  const toggleDictation = useCallback(() => {
    if (isListening && !handsFree) {
      stopListening();
    } else {
      setHandsFree(false);
      handsFreeRef.current = false;
      startListeningInternal(false);
    }
  }, [isListening, handsFree, startListeningInternal, stopListening]);

  const toggleHandsFree = useCallback(() => {
    if (handsFree) {
      stopListening();
    } else {
      setHandsFree(true);
      handsFreeRef.current = true;
      setAutoSpeak(true);
      startListeningInternal(true);
    }
  }, [handsFree, startListeningInternal, stopListening]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  const speak = useCallback(
    (rawText: string, messageId?: string, onDone?: () => void): boolean => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return false;
      }

      if (messageId && speakingMessageId === messageId && isSpeaking) {
        stopSpeaking();
        return true;
      }

      const cleaned = cleanTextForSpeech(rawText);
      if (!cleaned) return false;

      // Pause recognition during synthesis to prevent acoustic feedback loop
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = lang;
      utterance.rate = speechRate;

      if (selectedVoiceURI && voices.length > 0) {
        const chosen = voices.find((v) => v.voiceURI === selectedVoiceURI);
        if (chosen) utterance.voice = chosen;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        setSpeakingMessageId(messageId || 'active');
      };

      const handleFinish = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setSpeakingMessageId(null);
        onDone?.();

        // Resume hands-free listening once speech completes
        if (handsFreeRef.current && !manualStopRef.current) {
          setTimeout(() => {
            if (handsFreeRef.current && !manualStopRef.current) {
              startListeningInternal(true);
            }
          }, 300);
        }
      };

      utterance.onend = handleFinish;
      utterance.onerror = handleFinish;

      window.speechSynthesis.speak(utterance);
      return true;
    },
    [
      isListening,
      isSpeaking,
      lang,
      selectedVoiceURI,
      speakingMessageId,
      speechRate,
      startListeningInternal,
      stopSpeaking,
      voices,
    ]
  );

  return {
    isRecognitionSupported,
    isSynthesisSupported,
    isListening,
    handsFree,
    interimTranscript,
    voiceError,
    autoSpeak,
    setAutoSpeak,
    isSpeaking,
    speakingMessageId,
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speechRate,
    setSpeechRate,
    toggleDictation,
    toggleHandsFree,
    stopListening,
    speak,
    stopSpeaking,
  };
}
