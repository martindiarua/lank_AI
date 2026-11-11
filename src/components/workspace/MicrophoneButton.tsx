"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Activity } from "lucide-react";

// Initialize SpeechRecognition for cross-browser compatibility
const SpeechRecognitionAPI = 
  typeof window !== "undefined" && 
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export function MicrophoneButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");

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

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
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
        
        // Dynamic color shifting based on frequency height (Tailwind Red scale)
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
      console.error("Native speech recognition error:", event.error);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const startRecording = async () => {
    setAudioUrl(null);
    setTranscript("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 1. Initialize Web Audio API Visualizer
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      drawVisualizer();

      // 2. Initialize MediaRecorder Data Capture
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // Stop hardware tracks and close processing contexts
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current?.state !== "closed") audioContextRef.current?.close();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      // 3. Initialize Native Text Fallback
      startSpeechRecognition();

      mediaRecorder.start(250); // Capture data in 250ms chunks
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
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mt-8">
      <div 
        className={`w-full relative overflow-hidden flex flex-col items-center justify-center border-2 rounded-3xl transition-all duration-300 ${
          isRecording 
            ? "border-red-500/50 bg-red-50 dark:bg-red-950/20 shadow-[0_0_40px_rgba(239,68,68,0.2)] min-h-[300px]" 
            : "border-dashed border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800 min-h-[256px]"
        }`}
      >
        {/* Canvas overlays behind the button when recording */}
        <canvas 
          ref={canvasRef}
          width={600}
          height={150}
          className={`absolute bottom-0 w-full h-32 opacity-50 transition-opacity duration-300 ${isRecording ? "block" : "hidden"}`}
        />

        {!audioUrl ? (
          <div className="z-10 flex flex-col items-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                  : "bg-black dark:bg-white text-white dark:text-black hover:scale-105"
              }`}
            >
              {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8" />}
            </button>

            <p className={`mt-6 font-medium ${isRecording ? "text-red-500" : "text-gray-400"}`}>
              {isRecording ? "Listening..." : "Tap to speak"}
            </p>
            
            {/* Live Transcription Preview */}
            {isRecording && transcript && (
              <p className="mt-4 px-6 text-center text-sm font-medium text-gray-700 dark:text-gray-300 italic max-w-md">
                "{transcript}"
              </p>
            )}
          </div>
        ) : (
          <div className="z-10 flex flex-col items-center gap-4 w-full px-8 py-6">
            <div className="flex items-center gap-2 text-green-500 font-medium mb-2">
              <Activity className="w-5 h-5" />
              <span>Audio captured successfully!</span>
            </div>
            
            <audio src={audioUrl} controls className="w-full max-w-md" />
            
            {transcript && (
              <div className="w-full max-w-md p-4 mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Native Fallback Transcript</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{transcript}</p>
              </div>
            )}

            <button 
              onClick={clearAudio}
              className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Discard and record again
            </button>
          </div>
        )}
        
        {error && <p className="z-10 mt-2 text-sm text-red-500 bg-white/80 dark:bg-black/80 px-3 py-1 rounded">{error}</p>}
      </div>
    </div>
  );
}