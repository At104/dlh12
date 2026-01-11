"use client";

import { useState, useEffect } from "react";
import { PatientRecord, loadPatientRecords, clearPatientRecords } from "../lib/patientStorage";
import styles from "./dashboard.module.css";

export default function HealthcareDashboard() {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [filter, setFilter] = useState<"all" | "text" | "voice">("all");

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const loaded = loadPatientRecords();
    // Sort by timestamp (newest first)
    setRecords(loaded.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all patient records? This cannot be undone.")) {
      clearPatientRecords();
      setRecords([]);
      setSelectedRecord(null);
    }
  };

  const filteredRecords = records.filter(r => 
    filter === "all" || r.inputMethod === filter
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Healthcare Worker Dashboard</h1>
        <p className={styles.subtitle}>Patient Triage Queue</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({records.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === "text" ? styles.active : ""}`}
            onClick={() => setFilter("text")}
          >
            Text ({records.filter(r => r.inputMethod === "text").length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === "voice" ? styles.active : ""}`}
            onClick={() => setFilter("voice")}
          >
            Voice ({records.filter(r => r.inputMethod === "voice").length})
          </button>
        </div>
        <div className={styles.actions}>
          <button onClick={loadRecords} className={styles.refreshButton}>
            🔄 Refresh
          </button>
          <button onClick={handleClearAll} className={styles.clearButton}>
            🗑️ Clear All
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.recordsList}>
          {filteredRecords.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No patient records yet</p>
            </div>
          ) : (
            filteredRecords.map(record => (
              <div
                key={record.id}
                className={`${styles.recordCard} ${selectedRecord?.id === record.id ? styles.selected : ""}`}
                onClick={() => setSelectedRecord(record)}
              >
                <div className={styles.recordHeader}>
                  <span className={styles.recordId}>#{record.id.slice(-6)}</span>
                  <span className={styles.recordTime}>{formatTimestamp(record.timestamp)}</span>
                </div>
                <div className={styles.recordMethod}>
                  {record.inputMethod === "voice" ? "🎤" : "⌨️"} {record.inputMethod}
                  {record.language && ` (${record.language.toUpperCase()})`}
                </div>
                <div className={styles.recordSymptoms}>
                  {record.symptoms.substring(0, 100)}
                  {record.symptoms.length > 100 && "..."}
                </div>
                {record.photo && (
                  <div className={styles.hasPhoto}>📸 Photo attached</div>
                )}
              </div>
            ))
          )}
        </div>

        <div className={styles.detailsPanel}>
          {selectedRecord ? (
            <>
              <div className={styles.detailsHeader}>
                <h2>Patient Record #{selectedRecord.id.slice(-6)}</h2>
                <span className={styles.timestamp}>
                  {new Date(selectedRecord.timestamp).toLocaleString()}
                </span>
              </div>

              <div className={styles.detailsSection}>
                <h3>Input Method</h3>
                <p>
                  {selectedRecord.inputMethod === "voice" ? "🎤 Voice" : "⌨️ Text"}
                  {selectedRecord.language && ` (${selectedRecord.language.toUpperCase()})`}
                </p>
              </div>

              <div className={styles.detailsSection}>
                <h3>Symptoms</h3>
                <p className={styles.symptomsText}>{selectedRecord.symptoms}</p>
              </div>

              {selectedRecord.photo && (
                <div className={styles.detailsSection}>
                  <h3>Patient Photo</h3>
                  <img
                    src={selectedRecord.photo}
                    alt="Patient"
                    className={styles.patientPhoto}
                  />
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyDetails}>
              <p>Select a patient record to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
