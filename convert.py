# Importing Package
import speech_recognition as sr

# Initialize Speech Recognition
r = sr.Recognizer()

file_audio = sr.AudioFile('recorded.wav')

with file_audio as source:
    audio_text = r.record(source)

text = r.recognize_google(audio_text)

with open("output.txt", "w") as f:
    f.write(text)
