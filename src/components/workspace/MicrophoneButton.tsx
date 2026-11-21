"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Activity, Loader2, Send } from "lucide-react";
import SavePhraseButton from "./SavePhraseButton";

// Initialize SpeechRecognition for cross-browser compatibility
const SpeechRecognitionAPI =
  typeof window !== "undefined" &&
  ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

// Languages supported by Groq Whisper Turbo
const WHISPER_SUPPORTED_LANGS = new Set(["en", "ha", "yo", "fr", "ar", "sw", "es", "de", "pt"]);

export function MicrophoneButton({ sourceLang, targetLang }: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [serverTranscript, setServerTranscript] = useState<string>("");
  const [originalText, setOriginalText] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const isVoiceSupported = WHISPER_SUPPORTED_LANGS.has(sourceLang);

  // Core Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Web Audio API Refs (Visualizer)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Web Speech API Ref (Fallback)
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current?.state !== "closed") audioContextRef.current?.close();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        canvasCtx.fillStyle = `rgb(239, ${Math.max(68, 200 - barHeight)}, 68)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const startSpeechRecognition = () => {
    if (!SpeechRecognitionAPI) {
      console.warn("Native Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.warn("Native speech recognition warning:", event.error);
    };

    recognition.lang = sourceLang;
    recognition.start();
    recognitionRef.current = recognition;
  };

  const speakTranslation = (text: string, langCode: string) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const nativeVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
    );

    if (nativeVoice) {
      utterance.voice = nativeVoice;
    } else {
      console.warn(`No native offline voice installed for '${langCode}'. Using browser default.`);
    }

    window.speechSynthesis.speak(utterance);
  };

  const saveToHistory = async (orig: string, trans: string) => {
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLang,
          targetLang,
          originalText: orig,
          translatedText: trans,
        }),
      });
    } catch (dbError) {
      console.warn("Failed to auto-save to history:", dbError);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);
    setServerTranscript("");
    setOriginalText("");

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("sourceLang", sourceLang);
      formData.append("targetLang", targetLang);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      setServerTranscript(data.text);
      setOriginalText(data.originalText);
      speakTranslation(data.text, targetLang);
      await saveToHistory(data.originalText, data.text);
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setAudioUrl(null);
    setTranscript("");
    setServerTranscript("");
    setOriginalText("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textInput.trim(),
          sourceLang,
          targetLang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Translation failed");
      }

      setOriginalText(data.originalText);
      setServerTranscript(data.text);
      setTextInput("");
      speakTranslation(data.text, targetLang);
      await saveToHistory(data.originalText, data.text);
    } catch (err: any) {
      console.error("Text translation error:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    if (!isVoiceSupported) return;

    setAudioUrl(null);
    setTranscript("");
    setServerTranscript("");
    setOriginalText("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      drawVisualizer();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(audioBlob));

        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current?.state !== "closed") audioContextRef.current?.close();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        processAudio(audioBlob);
      };

      startSpeechRecognition();

      mediaRecorder.start(250);
      setError(null);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      setError("Microphone access denied. Please check your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => {
    setAudioUrl(null);
    setTranscript("");
    setServerTranscript("");
    setOriginalText("");
    setError(null);
  };

  const hasResult = Boolean(audioUrl || serverTranscript || isProcessing);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mt-8">
      <div
        className={`w-full relative overflow-visible flex flex-col items-center justify-center border-2 rounded-3xl transition-all duration-300 ${
          isRecording
            ? "border-red-500/50 bg-red-50 dark:bg-red-950/20 shadow-[0_0_40px_rgba(239,68,68,0.2)] min-h-[300px]"
            : "border-dashed border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800 min-h-[256px]"
        }`}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          className={`absolute bottom-0 w-full h-32 rounded-b-3xl opacity-50 transition-opacity duration-300 pointer-events-none ${
            isRecording ? "block" : "hidden"
          }`}
        />

        {!hasResult ? (
          <div className="z-10 flex flex-col items-center py-8 px-6 text-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isVoiceSupported}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                !isVoiceSupported
                  ? "bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                  : isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-black dark:bg-white text-white dark:text-black hover:scale-105"
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 text-white fill-current" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            {!isVoiceSupported ? (
              <p className="mt-5 text-sm font-medium text-amber-500 max-w-sm">
                Voice recording isn&apos;t supported for {sourceLang.toUpperCase()} yet. Please use
                the text box below to type and translate.
              </p>
            ) : (
              <p className={`mt-6 font-medium ${isRecording ? "text-red-500" : "text-gray-400"}`}>
                {isRecording ? "Listening..." : "Tap to speak"}
              </p>
            )}

            {isRecording && transcript && (
              <p className="mt-4 px-6 text-center text-sm font-medium text-gray-700 dark:text-gray-300 italic max-w-md">
                &quot;{transcript}&quot;
              </p>
            )}
          </div>
        ) : (
          <div className="z-10 flex flex-col items-center gap-4 w-full px-8 py-6">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 text-blue-500 mb-4">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="font-medium animate-pulse">Translating...</p>
              </div>
            ) : serverTranscript ? (
              <div className="w-full max-w-md flex flex-col gap-3 mb-4">
                {/* Original Text Bubble */}
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm self-start max-w-[85%]">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">
                    You said ({sourceLang})
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">{originalText}</p>
                </div>

                {/* Translated Text Bubble */}
                <div className="p-4 bg-blue-600 text-white rounded-2xl rounded-tr-sm self-end max-w-[85%] shadow-md">
                  <p className="text-xs text-blue-200 font-semibold mb-1 uppercase">
                    Translation ({targetLang})
                  </p>
                  <p className="text-lg font-medium">{serverTranscript}</p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => speakTranslation(serverTranscript, targetLang)}
                      className="text-xs bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      Replay Audio
                    </button>
                    <SavePhraseButton
                      originalText={originalText}
                      translatedText={serverTranscript}
                      sourceLang={sourceLang}
                      targetLang={targetLang}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {audioUrl && (
              <>
                <div className="flex items-center gap-2 text-green-500 font-medium mb-2">
                  <Activity className="w-5 h-5" />
                  <span>Audio captured successfully</span>
                </div>
                <audio src={audioUrl} controls className="w-full max-w-md mb-2" />
              </>
            )}

            {transcript && !isProcessing && (
              <div className="w-full max-w-md px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 opacity-70">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                  Native Fallback
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  &quot;{transcript}&quot;
                </p>
              </div>
            )}

            <button
              onClick={clearAudio}
              className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear and start again
            </button>
          </div>
        )}

        {error && (
          <p className="z-10 mt-2 mb-4 text-sm text-red-500 bg-white/90 dark:bg-black/90 px-4 py-2 rounded-md shadow-sm border border-red-200 dark:border-red-900">
            {error}
          </p>
        )}
      </div>

      {/* Text Input Option */}
      <form onSubmit={handleTextTranslate} className="w-full flex items-center gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          disabled={isRecording || isProcessing}
          placeholder={`Or type in ${sourceLang.toUpperCase()} to translate...`}
          className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!textInput.trim() || isRecording || isProcessing}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Translate
        </button>
      </form>
    </div>
  );
}