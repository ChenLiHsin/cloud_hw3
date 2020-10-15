const video = document.querySelector('#webcam');
const enableWebcamButton = document.querySelector('#enableWebcamButton');
const disableWebcamButton = document.querySelector('#disableWebcamButton');
const canvas = document.querySelector('#outputCanvas');

function onOpenCvReady() {
    document.querySelector('#status').innerHTML = 'opencv.js is ready.';
    /* enable the button */
    enableWebcamButton.disabled = false;
  }

/* Check if webcam access is supported. */
function getUserMediaSupported() {
    /* Check if both methods exists.*/
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
      
      /* alternative approach 
      return ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);
      */
  }
    
    /* 
     * If webcam is supported, add event listener to button for when user
     * wants to activate it to call enableCam function which we will 
     * define in the next step.
     */
  
  if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
    disableWebcamButton.addEventListener('click', disableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }

  function enableCam(event) {
    /* disable this button once clicked.*/
    event.target.disabled = true;
      
    /* show the disable webcam button once clicked.*/
    disableWebcamButton.disabled = false;
  
    /* show the video and canvas elements */
    document.querySelector("#liveView").style.display = "block";
  
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', processVid);
    })
    .catch(function(err){
      console.error('Error accessing media devices.', error);
    });
  };
  
  function disableCam(event) {
      event.target.disabled = true;
      enableWebcamButton.disabled = false;
  
      /* stop streaming */
      video.srcObject.getTracks().forEach(track => {
        track.stop();
      })
    
      /* clean up. some of these statements should be placed in processVid() */
      video.srcObject = null;
      video.removeEventListener('loadeddata', processVid);
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      document.querySelector("#liveView").style.display = "none";
  }

  function processVid() {

    if (video.srcObject == null) {
      return;
    }

    let cap = new cv.VideoCapture(video);
    /* 8UC4 means 8-bit unsigned int, 4 channels */
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(frame);
    processFrame(frame);
}

function processFrame(src) {
    let dst = new cv.Mat();
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    cv.Canny(src, dst, 100, 200);
    cv.imshow('outputCanvas', dst);
    src.delete();
    dst.delete();

    /* Call this function again to keep processing when the browser is ready. */
    window.requestAnimationFrame(processVid);  // 根據browser設定不斷呼叫(1/60秒呼叫一次)
}