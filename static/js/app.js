URL = window.URL || window.webkitURL;

var gumStream; // Stream from getUserMedia()
var rec; // Recorder.js object
var input; // MediaStreamAudioSourceNode we'll be recording

// Shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; // Audio context to record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

// Add events to Buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

function startRecording() {
  console.log("recordButton clicked");

  // Simple constraints object, for more advanced audio features see https://addpipe.com/blog/audio-constraints-getusermedia/

  var constraints = { audio: true, video: false };

  recordButton.disabled = true;
  stopButton.disabled = false;
  pauseButton.disabled = false;

  // We're using the standard promise based getUserMedia() https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      console.log(
        "getUserMedia() success, stream created, initializing Recorder.js ..."
      );

      /* Create an audio context after getUserMedia is called SampleRate might change after getUserMedia is called, like it does 
      on macOS when recording through AirPods the sampleRate defaults to the one set in your OS for your playback device */
      audioContext = new AudioContext();

      // Update the format
      document.getElementById("formats").innerHTML =
        "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz";

      // Assign to gumStream for later use
      gumStream = stream;

      // Use the stream
      input = audioContext.createMediaStreamSource(stream);

      /* Create the Recorder object and configure to record mono sound (1 channel)
      Recording 2 channels  will double the file size */
      rec = new Recorder(input, { numChannels: 1 });

      // Start the recording process
      rec.record();

      console.log("Recording started");
    })
    .catch(function (err) {
      // Enable the record button if getUserMedia() fails
      recordButton.disabled = false;
      stopButton.disabled = true;
      pauseButton.disabled = true;
    });
}

function pauseRecording() {
  console.log("pauseButton clicked rec.recording=", rec.recording);
  if (rec.recording) {
    // Pause
    rec.stop();
    pauseButton.innerHTML = "Resume";
  } else {
    // Resume
    rec.record();
    pauseButton.innerHTML = "Pause";
  }
}

function stopRecording() {
  console.log("stopButton clicked");

  // Disable the stop button, enable the record too allow for new recordings
  stopButton.disabled = true;
  recordButton.disabled = false;
  pauseButton.disabled = true;

  // Reset button just in case the recording is stopped while paused
  pauseButton.innerHTML = "Pause";

  // Stop the recording
  rec.stop();

  // Stop microphone access
  gumStream.getAudioTracks()[0].stop();

  // Create the wav blob and pass it on to createDownloadLink
  rec.exportWAV(createDownloadLink);

  // Send Audio file to Server
  rec.exportWAV(sendData);
}

// Send Recording to Server
function sendData(blob) {
  fetch("/messages", {
    method: "POST",
    body: blob,
  });
}
function createDownloadLink(blob) {
  var url = URL.createObjectURL(blob);
  var au = document.createElement("audio");
  var link = document.createElement("a");

  // Add controls to the <audio> element
  au.controls = true;
  au.src = url;

  // Save to disk link
  link.href = url;

  // Add the li element to list
  recordingsList.append(au);
}
