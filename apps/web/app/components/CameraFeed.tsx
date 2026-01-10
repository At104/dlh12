"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CameraFeed.module.css";

export default function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError("");
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please grant camera permissions.");
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.video}
        />
        {!isStreaming && !error && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Initializing camera...</p>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p>{error}</p>
          </div>
        )}
        {isStreaming && (
          <div className={styles.overlay}>
            <div className={styles.statusBadge}>
              <span className={styles.liveIndicator}></span>
              Live
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
