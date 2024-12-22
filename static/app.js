const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Start camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error('Error accessing the camera:', err);
  }
}

// Start the camera as soon as the page loads
startCamera();

// Initialize MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// Handle the results from the hand tracking model
hands.onResults((results) => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    results.multiHandLandmarks.forEach((handLandmarks) => {
      const fingertip = handLandmarks[8]; // Index finger tip landmark (8th landmark)
      
      if (fingertip && fingertip.y < 0.3) {  // Adjust this threshold for fingertip position
        console.log('Fingertip detected');
        captureImage();
      }
    });
  } else {
    console.error("No hands detected");
  }
});

// Capture the current video frame as an image
function captureImage() {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/png');
  console.log('Captured image:', dataUrl);
}

// Send the video frame to the MediaPipe Hands solution
function detectFingertips() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    hands.send({ image: video });
  } else {
    console.warn("Video is not ready for processing");
  }
}

// Continuously process the video feed (every 100ms)
setInterval(detectFingertips, 100);
