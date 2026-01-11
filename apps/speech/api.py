import os
import io
import wave
from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import ollama
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Local models - no API keys needed!
WHISPER_MODEL_SIZE = "base"  # fast and accurate
OLLAMA_MODEL = "gemma2:2b"  # lightweight model

print("🔄 Loading local Whisper model...")
stt_model = WhisperModel(WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")
print("✅ Whisper model loaded!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok", 
        "mode": "local",
        "whisper_model": WHISPER_MODEL_SIZE,
        "ollama_model": OLLAMA_MODEL
    })

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    try:
        # Save audio to BytesIO
        audio_data = io.BytesIO(audio_file.read())
        
        # Transcribe locally with Whisper (detects language automatically)
        print("📝 Transcribing with Whisper...")
        segments, info = stt_model.transcribe(audio_data, beam_size=5)
        original_text = " ".join([s.text for s in segments]).strip()
        detected_language = info.language
        
        if not original_text:
            return jsonify({"error": "No speech detected"}), 400
        
        print(f"🎤 Heard: {original_text}")
        print(f"🌍 Detected language: {detected_language}")
        
        # Only translate if NOT English
        if detected_language.lower() == 'en':
            print("✅ Already in English, skipping translation")
            translation = original_text
        else:
            # Translate locally with Ollama
            print(f"🌐 Translating from {detected_language} to English with Ollama...")
            response = ollama.chat(model=OLLAMA_MODEL, messages=[
                {'role': 'system', 'content': 'Translate the user text to English. Return ONLY the translation, nothing else.'},
                {'role': 'user', 'content': original_text}
            ])
            
            translation = response['message']['content'].strip()
            print(f"✅ Translation: {translation}")
        
        return jsonify({
            "original": original_text,
            "translation": translation,
            "language": detected_language,
            "success": True
        })
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(f"\n🚀 Local transcription API running on http://localhost:5001")
    print(f"   Using Whisper ({WHISPER_MODEL_SIZE}) + Ollama ({OLLAMA_MODEL})")
    print(f"   No API keys needed - 100% local processing!\n")
    app.run(host='0.0.0.0', port=5001, debug=True)
