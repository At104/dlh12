# 🎙️ Transcription Integration

## Setup Instructions

### 1. Start the Backend API

Open a new terminal and run:

```bash
cd /Users/atul/Desktop/Code/deltahacks12/repo/apps/speech
./start-api.sh
```

This will:
- Install Python dependencies (Flask, Google Gemini API, etc.)
- Start the Flask API on `http://localhost:5000`

**Note:** Make sure you have `GEMINI_API_KEY` in `/Users/atul/Desktop/Code/deltahacks12/repo/.env`

### 2. Frontend is Already Running

The Next.js frontend should already be running on `http://localhost:3000`

If not, run:

```bash
cd /Users/atul/Desktop/Code/deltahacks12/repo
npm run dev
```

## How to Test

1. Open `http://localhost:3000` in your browser
2. Allow camera and microphone permissions when prompted
3. Click the **"Start Recording"** button
4. Speak in any language (e.g., Mandarin, Spanish, English)
5. Click **"Stop Recording"**
6. Wait for processing (~2-5 seconds)
7. See the results:
   - **Original:** The text in the original language
   - **Translation:** The English translation

## Features

✅ Multi-language transcription (Mandarin, Spanish, French, etc.)  
✅ Real-time translation to English  
✅ WebRTC audio recording  
✅ Beautiful UI with loading states  
✅ Error handling  

## Architecture

```
Frontend (React/Next.js)
    ↓ (Audio recording via MediaRecorder API)
Backend (Flask API on port 5000)
    ↓ (Sends audio to Gemini API)
Google Gemini AI
    ↓ (Returns transcription + translation)
Frontend displays results
```

## Troubleshooting

**"Failed to transcribe audio. Make sure the backend is running."**
- Make sure the Flask API is running on port 5000
- Check that `GEMINI_API_KEY` is set in `.env`

**"Unable to access microphone"**
- Grant microphone permissions in your browser
- Make sure no other app is using the microphone
