const m1 = document.querySelector("#mission1") ;
const m2 = document.querySelector("#mission2") ;
const video = document.querySelector('#webcam');
const enableWebcamButton = document.querySelector('#enableWebcamButton');
const enableWebcamButton2 = document.querySelector('#enableWebcamButton2') ;
const disableWebcamButton = document.querySelector('#disableWebcamButton');
const canvas = document.querySelector('#outputCanvas');
const lowThresBox = document.querySelector('#lowThresInput') ;
const highThresBox = document.querySelector('#highThresInput') ;
// const submitBotton = document.querySelector('#submit') ;

function onOpenCvReady() {
    document.querySelector('#status').innerHTML = 'opencv.js is ready.';
    m1.addEventListener('change', prepare) ;
    m2.addEventListener('change', prepare) ;
}

function isCanvasBlank(canvas) {
    var blank = document.createElement('canvas') ;
    blank.width = canvas.width ;
    blank.height = canvas.height ;
    return canvas.toDataURL() == blank.toDataURL() ;
} 

function prepare(event) {
    if ( event.target.checked ) { 
        if ( !isCanvasBlank(canvas) ) {  
            video.srcObject.getTracks().forEach(track => {
                track.stop();
            })

            /* clean up. some of these statements should be placed in processVid() */
            video.srcObject = null;
            video.removeEventListener('loadeddata', processVid);
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            document.querySelector("#liveView").style.display = "none";
  
        } // if()

        if ( m1.checked ) {
            lowThresBox.disabled = false ;
            highThresBox.disabled = false ;
            // submitBotton.disabled = false ;
            enableWebcamButton2.disabled = true ;
            disableWebcamButton2.disabled = true ;
            lowThresBox.addEventListener('change', numCheck) ;
            highThresBox.addEventListener('change', numCheck) ;
            enableWebcamButton.disabled = false ;
            enableWebcamButton.addEventListener('click', enableCam);

            disableWebcamButton.addEventListener('click', disableCam);

        } // if()
        else if ( m2.checked ) {
            enableWebcamButton2.addEventListener('click', enableCam) ;
            disableWebcamButton2.addEventListener('click', disableCam);

            enableWebcamButton2.disabled = false ;

            enableWebcamButton.disabled = true ;
            disableWebcamButton.disabled = true ;
            lowThresBox.disabled = true ;
            highThresBox.disabled = true ;
        } // else if()
    } // if()
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
      m1.disabled = false ;
      m2.disabled = false ;
  } else {
      console.warn('getUserMedia() is not supported by your browser');
  }

  function enableCam(event) {
    if ( !numCheck ) return ;
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
    if ( m1.checked ) processFrame(frame);
    else if ( m2.checked ) processPencil(frame);
}

function checkAndEnableBotton() {
    if ( isNum(lowThresBox.value) && isNum(highThresBox.value) ) {
        enableWebcamButton.disabled = false ;
        enableWebcamButton.addEventListener('click', enableCam);
    } // if()
} // decide()

function isNum(str) {
    var re = /^[0-9]+$/ ;
    if ( !re.test(str) ) {
        return false ;
    } //if()
    return true ;
} // numCheck()


function numCheck() {
    let low = true ;
    let high = true ;
    let result = false ;

    var re = /^[0-9]+$/ ;

    if ( !re.test(lowThresBox.value)) {
        alert("Low Threshold Error: Only number is avaliable!!!") ;
        lowThresBox.value = "" ;
        low = false ;
    } // if()
    
    if ( !re.test(highThresBox.value)) {
        alert("High Threshold Error: Only number is avaliable!!!") ;
        highThresBox.value = "" ;
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
        // result = true ;
    } // else()
    checkAndEnableBotton() ;
    // return result ;
} // numCheck

function processFrame(src) {
    let dst = new cv.Mat();

    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    cv.Canny(src, dst, parseInt(lowThresBox.value, 10), parseInt(highThresBox.value, 10));
    cv.imshow('outputCanvas', dst);
    src.delete();
    dst.delete();

    /* Call this function again to keep processing when the browser is ready. */
    window.requestAnimationFrame(processVid);  // 根據browser設定不斷呼叫(1/60秒呼叫一次)
}

function minus256(img) {
    let img2 = new cv.Mat(240, 320, cv.CV_8UC1) ;
    for ( var row = 0 ; row < 240 ; row ++ ) {
      for ( var col = 0 ; col < 320 ; col ++ ) {
            img2.ucharPtr( row, col)[0] = 255 - img.ucharPtr( row, col)[0] ;           
      } // for()
  } // for()
  return img2 ;
} // minus256()

function processPencil(src) {
    let grayDst = new cv.Mat();
    let invertDst = new cv.Mat() ;
    let blurDst = new cv.Mat() ;
    let final = new cv.Mat() ;
    let ksize = new cv.Size(5,5) ;
    let anchor = new cv.Point(-1, -1);
    cv.cvtColor(src, grayDst, cv.COLOR_RGBA2GRAY) ;
    cv.bitwise_not(grayDst, invertDst) ;
    cv.GaussianBlur(invertDst,blurDst,ksize,0,0,cv.BORDER_DEFAULT) ;
    cv.divide( grayDst, minus256(blurDst), final, 256, -1 ) ;
    cv.imshow('outputCanvas', final);

    grayDst.delete() ;
    invertDst.delete() ;
    blurDst.delete() ;
    // final.delete() ;
    /* Call this function again to keep processing when the browser is ready. */
    window.requestAnimationFrame(processVid);  // 根據browser設定不斷呼叫(1/60秒呼叫一次)
}