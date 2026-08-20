import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export type VoiceDictation = {
  supported: boolean;
  listening: boolean;
  interim: string;
  start: () => void;
  stop: () => void;
};

/**
 * Browser-native voice dictation (Web Speech API).
 * Streams interim results so the textarea fills as the user speaks.
 */
export function useVoiceDictation(opts: {
  lang: "es" | "en";
  onFinal: (text: string) => void;
  onError?: (msg: string) => void;
}): VoiceDictation {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    try {
      const rec = new Ctor();
      rec.lang = optsRef.current.lang === "en" ? "en-US" : "es-ES";
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e: any) => {
        let finalText = "";
        let interimText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          const t = r[0]?.transcript ?? "";
          if (r.isFinal) finalText += t;
          else interimText += t;
        }
        if (finalText) optsRef.current.onFinal(finalText.trim());
        setInterim(interimText);
      };
      rec.onerror = (e: any) => {
        optsRef.current.onError?.(String(e?.error ?? "error"));
        setListening(false);
      };
      rec.onend = () => {
        setListening(false);
        setInterim("");
      };
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch (err) {
      optsRef.current.onError?.(String(err));
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {}
    setListening(false);
  }, []);

  useEffect(
    () => () => {
      try {
        recRef.current?.abort();
      } catch {}
    },
    [],
  );

  return { supported, listening, interim, start, stop };
}
