# Importing Packages
from flask import Flask, request, render_template, Response
import os
import speech_recognition as sr
import subprocess

# Initializing Flask
app = Flask(__name__)


# Home Page
@app.route("/", methods=['POST', 'GET'])
def index():
    return render_template("index.html")


# Dummy URL for getting Data from Recorder.js
@app.route('/messages', methods=['POST'])
def api_message():
    f = open('./recorded.wav', 'wb')
    f.write(request.data)
    f.close()
    return "Binary message written!"


# Download
@app.route('/downloads', methods=['POST', 'GET'])
def convert():
    subprocess.run('python3 convert.py', shell=True)
    file = open('output.txt', 'r')
    returnfile = file.read().encode('latin-1')
    file.close()
    return Response(returnfile,
                    mimetype="text",
                    headers={"Content-disposition":
                             "attachment; filename=output.txt"})


# Main Function
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
