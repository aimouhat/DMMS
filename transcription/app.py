# app.py
import os
import time
import threading
import whisper
import numpy as np
import scipy.io.wavfile as wav
import sounddevice as sd
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from langchain_ollama import ChatOllama
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

whisper_model = whisper.load_model("medium")
recording = False
audio = []
samplerate = 16000
stream = None

def audio_callback(indata, frames, time, status):
    if recording:
        audio.append(indata.copy())

@app.get("/start")
def start_recording():
    global recording, audio, stream
    audio = []
    recording = True
    stream = sd.InputStream(callback=audio_callback, channels=1, samplerate=samplerate)
    stream.start()
    return {"status": "Recording started"}

@app.get("/stop")
def stop_recording():
    global recording, stream
    recording = False
    if stream:
        stream.stop()
        stream.close()
    # Save audio
    audio_data = np.concatenate(audio)
    wav.write("temp.wav", samplerate, (audio_data * 32767).astype(np.int16))
    result = whisper_model.transcribe("temp.wav")
    os.remove("temp.wav")

    with open("hse.txt", "w", encoding="utf-8") as f:
        f.write(result["text"])

    return generate_summary()

def generate_summary():
    try:
        with open("hse.txt", "r", encoding="utf-8") as f:
            raw_text = f.read().strip()
    except FileNotFoundError:
        return {"error": "hse.txt not found"}

    if not raw_text:
        return {"error": "hse.txt is empty"}

    prompt = (
        "You are LAVEX, the safety expert assistant of the beneficiation plant. "
        "Based on the raw transcription below, extract the key idea and rewrite it professionally "
        "as the daily safety contact announcement. Use the tone of a responsible, safety-conscious leader. "
        "Limit the summary to a maximum of 120 words.\n\n"
        f"📝 Transcription:\n{raw_text}\n\n"
        "✍️ Format the result like this:\n"
        "[your summary here, in one paragraph, maximum 120 words]"
    )

    model = ChatOllama(model="llama3.2", temperature=0)
    response = model.invoke(prompt)
    response_text = response.content if hasattr(response, 'content') else str(response)

    with open("safety_contact_of_today.txt", "w", encoding="utf-8") as f:
        f.write(response_text.strip())

    return {"status": "Summary generated", "summary": response_text.strip()}

@app.get("/summary")
def get_summary():
    try:
        with open("safety_contact_of_today.txt", "r", encoding="utf-8") as f:
            content = f.read()
            return JSONResponse(content={"summary": content})
    except FileNotFoundError:
        return JSONResponse(status_code=404, content={"error": "Summary not generated yet"})
