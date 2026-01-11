// Shared type definitions for patient triage system
export interface PatientRecord {
  id: string;
  timestamp: string;
  symptoms: string;
  inputMethod: "text" | "voice";
  photo?: string;
  language?: string;
}

// Local storage key for patient records
export const STORAGE_KEY = "triage_patient_records";

// Helper functions for localStorage operations
export const loadPatientRecords = (): PatientRecord[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load patient records:", e);
    return [];
  }
};

export const savePatientRecords = (records: PatientRecord[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const clearPatientRecords = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const addPatientRecord = (record: PatientRecord): void => {
  const records = loadPatientRecords();
  records.push(record);
  savePatientRecords(records);
};

export const updatePatientRecord = (id: string, updates: Partial<PatientRecord>): void => {
  const records = loadPatientRecords();
  const index = records.findIndex(r => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    savePatientRecords(records);
  }
};
