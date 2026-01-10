import os
import wave
import io
import pyaudio
import threading
import datetime
import google.generativeai as genai

# Configuration
API_KEY = os.getenv('GEMINI_API_KEY')

# configure Gemini model
MODEL_NAME = 'models/gemini-2.5-flash-lite'
#MODEL_NAME = 'models/gemini-2.5-pro'
#MODEL_NAME = 'models/gemini-3-flash-preview'
#MODEL_NAME = 'models/gemini-2.5-flash'

# This array will store all your transcription/translation data
session_data = []

class AudioRecorder:
    def __init__(self):
        self.chunk = 1024
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 44100
        self.p = pyaudio.PyAudio()
        self.frames = []
        self.recording = False

    def start_recording(self):
        self.recording = True
        self.frames = []
        self.thread = threading.Thread(target=self._record)
        self.thread.start()
        print("\n🔴 Recording... (Press Enter to stop)")

    def _record(self):
        stream = self.p.open(format=self.format, channels=self.channels,
                             rate=self.rate, input=True, frames_per_buffer=self.chunk)
        while self.recording:
            try:
                data = stream.read(self.chunk, exception_on_overflow=False)
                self.frames.append(data)
            except Exception:
                break
        stream.stop_stream()
        stream.close()

    def stop_recording(self):
        self.recording = False
        if hasattr(self, 'thread'):
            self.thread.join()
        
        audio_buffer = io.BytesIO()
        with wave.open(audio_buffer, 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.p.get_sample_size(self.format))
            wf.setframerate(self.rate)
            wf.writeframes(b''.join(self.frames))
        audio_buffer.seek(0)
        return audio_buffer

def process_and_store(model, audio_file):
    """
    Sends audio to Gemini and saves the result into the global array.
    """
    # Prompting for a structured response to make parsing easier
    prompt = """
    Listen to this audio. Transcribe it and translate it to English. 
    Return the output EXACTLY like this:
    Original: <text>
    Translation: <text>
    """
    
    try:
        response = model.generate_content([
            prompt,
            {"mime_type": "audio/wav", "data": audio_file.read()}
        ])
        
        full_text = response.text
        
        # Simple parsing logic to separate original from translation
        original = "Unknown"
        translated = "Unknown"
        
        for line in full_text.split('\n'):
            if line.startswith("Original:"):
                original = line.replace("Original:", "").strip()
            elif line.startswith("Translation:"):
                translated = line.replace("Translation:", "").strip()

        # Create the data object
        entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "original_text": original,
            "english_translation": translated
        }
        
        # Store in our array for future API use
        session_data.append(entry)
        
        print(f"\n✨ Recorded Entry #{len(session_data)}:")
        print(f"   [Original]: {original}")
        print(f"   [Translated]: {translated}")

    except Exception as e:
        print(f"❌ API Error: {e}")

def main():
    if not API_KEY:
        print("Please set your GEMINI_API_KEY environment variable.")
        return

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(MODEL_NAME)
    recorder = AudioRecorder()

    print(f"--- Audio Translation Manager ({MODEL_NAME}) ---")

    try:
        while True:
            choice = input("\n[Enter] to record, [S] to show array, [Q] to quit: ").lower()
            
            if choice == '':
                recorder.start_recording()
                input() # Wait for second Enter to stop
                audio_data = recorder.stop_recording()
                process_and_store(model, audio_data)
            
            elif choice == 's':
                print("\n--- Current session_data Array ---")
                for i, item in enumerate(session_data):
                    print(f"{i}: {item}")
            
            elif choice == 'q':
                break
    finally:
        print(f"\nFinal Array has {len(session_data)} items. Ready for your next API!")
        # You can now pass 'session_data' to any other function or API
        os._exit(0)

if __name__ == "__main__":
    main()