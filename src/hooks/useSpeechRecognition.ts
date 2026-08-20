import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = 'ar-SA', onResult, onError } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          currentTranscript += result[0].transcript;
          if (result.isFinal) {
            isFinal = true;
          }
        }

        setTranscript(currentTranscript);
        if (onResult) {
          onResult(currentTranscript, isFinal);
        }
      };

      recognition.onerror = (event: any) => {
        let errMsg = 'حدث خطأ أثناء التعرف على الصوت';
        if (event.error === 'no-speech') {
          errMsg = 'لم يتم التقاط صوت. يرجى التحدث بوضوح بالقرب من الميكروفون.';
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errMsg = 'تم رفض الوصول للميكروفون. يرجى السماح بالصلاحية من إعدادات المتصفح.';
        } else if (event.error === 'audio-capture') {
          errMsg = 'لم يتم العثور على ميكروفون جاهز في الجهاز.';
        } else if (event.error === 'network') {
          errMsg = 'حدث خطأ في شبكة خدمة التعرف على الصوت.';
        }

        setError(errMsg);
        setIsListening(false);
        if (onError) {
          onError(errMsg);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [lang, onResult, onError]);

  const startListening = useCallback((customLang?: string) => {
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('متصفحك الحالي لا يدعم الإملاء الصوتي المباشر (Web Speech API)');
        setIsSupported(false);
        return;
      }
    }

    try {
      if (recognitionRef.current) {
        if (customLang) {
          recognitionRef.current.lang = customLang;
        }
        setTranscript('');
        setError(null);
        recognitionRef.current.start();
      }
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 200);
        } catch (_) {}
      } else {
        setError('تعذر تشغيل الميكروفون حالياً');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback((customLang?: string) => {
    if (isListening) {
      stopListening();
    } else {
      startListening(customLang);
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}
