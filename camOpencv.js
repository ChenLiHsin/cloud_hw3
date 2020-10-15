const m1 = document.querySelector("#mission1") ;
const m2 = document.querySelector("#mission2") ;
const video = document.querySelector('#webcam');
const enableWebcamButton = document.querySelector('#enableWebcamButton');
const enableWebcamButton2 = document.querySelector('#enableWebcamButton2') ;
const disableWebcamButton = document.querySelector('#disableWebcamButton');
const canvas = document.querySelector('#outputCanvas');
const lowThresBox = document.querySelector('#lowThresInput') ;
const highThresBox = document.querySelector('#highThresInput') ;

function onOpenCvReady() {
    document.querySelector('#status').innerHTML = 'opencv.js is ready.';
    /* enable the button */
    m1.addEventListener('change', prepare) ;
    m2.addEventListener('change', prepare) ;
}

function prepare() {
    if ( m1.checked ) {
        if ( !disableWebcamButton2.disabled ) {
            disableCam(disableWebcamButton2) ;
            // disableWebcamButton2.disabled = true ;
        } // if()
        lowThresBox.disabled = false ;
        highThresBox.disabled = false ;
        enableWebcamButton.disabled = false;
        disableWebcamButton.disabled = true ;
        enableWebcamButton2.disabled = true ;
    } // if()
    else if ( m2.checked ) {
        if ( !disableWebcamButton.disabled ) {
            disableCam(disableWebcamButton) ;
            // disableWebcamButton.disabled = true ;
        } // if()
        enableWebcamButton2.disabled = false ;
        lowThresBox.disabled = true ;
        highThresBox.disabled = true ;
        enableWebcamButton.disabled = true ;
    } // else if()
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
    enableWebcamButton2.addEventListener('click', enableCam) ;
    disableWebcamButton.addEventListener('click', disableCam);
    disableWebcamButton2.addEventListener('click', disableCam);
    lowThresBox.addEventListener('change', numCheck) ;
    highThresBox.addEventListener('change', numCheck) ;
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }

  function enableCam(event) {
    if ( !numCheck() ) return ;
    /* disable this button once clicked.*/
    event.target.disabled = true;
      
    /* show the disable webcam button once clicked.*/
    if ( m1.checked ) disableWebcamButton.disabled = false ;
    else disableWebcamButton2.disabled = false;
  
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
      console.log("here: ", event) ;
      event.target.disabled = true;
      if ( m1.checked ) enableWebcamButton.disabled = false;
      else enableWebcamButton2.disabled = false;
  
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

function numCheck() {
    let lowThresElement = document.getElementById("lowThresInput") ;
    let highThresElement = document.getElementById("highThresInput") ;
    let low = true ;
    let high = true ;
    let result = false ;

    var re = /^[0-9]+$/ ;

    if ( !re.test(lowThresElement.value)) {
        alert("Low Threshold Error: Only number is avaliable!!!") ;
        lowThresElement.value = "" ;
        low = false ;
    } // if()
    
    if ( !re.test(highThresElement.value)) {
        alert("High Threshold Error: Only number is avaliable!!!") ;
        highThresElement.value = "" ;
        high = false ;
    } // if()
    
    if ( !low && !high ) {
        document.getElementById("err").innerHTML = "Please refill the Low threshold feild and High threshold feild!" ;
    } // if()
    else if ( !low ) {
        document.getElementById("err").innerHTML = "Please refill the Low threshold feild!" ;
    } // else if()
    else if ( !high ) {
        document.getElementById("err").innerHTML = "Please refill the High threshold feild!" ;
    } // else if()
    else {
        document.getElementById("err").innerHTML = "" ;
        result = true ;
    } // else()

    return result ;
} // numCheck

function processFrame(src) {
    let dst = new cv.Mat();
    let lowThresElement = document.getElementById("lowThresInput") ;
    let highThresElement = document.getElementById("highThresInput") ;

    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    console.log("type: ",typeof(lowThres));
    //console.log("low: ", lowThres);
    //console.log("high: ",highThres) ;
    cv.Canny(src, dst, parseInt(lowThresElement.value, 10), parseInt(highThresElement.value, 10));
    cv.imshow('outputCanvas', dst);
    src.delete();
    dst.delete();

    /* Call this function again to keep processing when the browser is ready. */
    window.requestAnimationFrame(processVid);  // 根據browser設定不斷呼叫(1/60秒呼叫一次)
}