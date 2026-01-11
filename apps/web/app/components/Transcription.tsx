"use client";

import { useState, useRef } from "react";
import styles from "./Transcription.module.css";

interface TranscriptionProps {
  onTranscriptionComplete?: (text: string) => void;
}

export default function Transcription({ onTranscriptionComplete }: TranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<{
    original: string;
    translation: string;
    language: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError("");
      setTranscription(null);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Unable to access microphone. Please grant permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("http://localhost:5001/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      const result = {
        original: data.original,
        translation: data.translation,
        language: data.language || "unknown",
      };
      setTranscription(result);
      setError("");
      
      if (onTranscriptionComplete) {
        onTranscriptionComplete(result.translation || result.original);
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError("Failed to transcribe audio. Make sure the backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reRecord = () => {
    setTranscription(null);
    setError("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        {!isRecording && !isProcessing && !transcription && (
          <button onClick={startRecording} className={styles.recordButton}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Start Recording
          </button>
        )}

        {isRecording && (
          <button onClick={stopRecording} className={styles.stopButton}>
            <span className={styles.recordingIndicator}></span>
            Stop Recording
          </button>
        )}

        {isProcessing && (
          <div className={styles.processing}>
            <div className={styles.spinner}></div>
            Processing...
          </div>
        )}

        {transcription && (
          <button onClick={reRecord} className={styles.reRecordButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Re-record
          </button>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {transcription && (
        <div className={styles.results}>
          {transcription.language.toLowerCase() !== 'en' && (
            <div className={styles.resultBox}>
              <label>Original ({transcription.language.toUpperCase()}):</label>
              <div className={styles.textbox}>{transcription.original}</div>
            </div>
          )}
          <div className={styles.resultBox}>
            <label>{transcription.language.toLowerCase() === 'en' ? 'Transcription' : 'Translation (English)'}:</label>
            <div className={styles.textbox}>{transcription.translation}</div>
          </div>
        </div>
      )}
    </div>
  );
}
