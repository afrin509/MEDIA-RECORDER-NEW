// const { not } = require("cheerio/lib/api/traversing");
// const { innerText } = require("domutils");

// let videoBox = document.querySelector("#video_elem");
let captureBtn = document.querySelector("#camera");
let recorderBtn = document.querySelector("#recorder");
let timmer = document.querySelector("#timer");
let time = document.querySelector("#recTime");
let backBtn = document.querySelector("#back");
let galleryBtn = document.querySelector("#gallery");
let zoomInBtn = document.querySelector("#zoomIn");
let zoomOutBtn = document.querySelector("#zoomOut");

let popMsg = document.querySelector("#popUpMsg");
let popwindow = document.querySelector("#popup_window");
let textBox = document.querySelector("#textBox");
let enterBtn = document.querySelector(".enter");

// it is reprsenting the buffer storage here your stram is stored in the form of chunks
// chunks represent the element of buffer
let buffer = [];
let clearObj;
let imageCapture;
let zoomLevel = 1;
let mediaRecorder;
let recordState = false;
let constraints = {
    video: true,
    audio: true
}

backBtn.addEventListener("click", function () {
    window.location.assign("../index.html")
})
galleryBtn.addEventListener("click", function () {
    window.location.assign("../Gallery/g_index.html")
})
// navigator is an object interacts b/w user and browser using methods,object to access permission from user  to get their details like 
// get preffered language,audio /vieo permissions
// constraints::these are the permissions that you want from user
// getUser media is a method called on mediadevices object that ask for permission of constraints it returns a promise
navigator.mediaDevices.getUserMedia(constraints)
    .then(function (mediaStream) {
        videoBox.srcObject = mediaStream;
        // stream you are getting  from user  pass onto this video element
        let mediaStreamTrack = mediaStream.getVideoTracks()[0];
        imageCapture = new ImageCapture(mediaStreamTrack);

        mediaRecorder = new MediaRecorder(mediaStream);
        // if you have some stram present in mediaRecorder then call for dataavailable event listner thse many time that you have data available
        mediaRecorder.addEventListener("dataavailable", function (e) {
            buffer.push(e.data);
        })
        mediaRecorder.addEventListener("stop", function () {
            popwindow.classList.add("show");
            popUpMsg();
            popUpWindow("video")
        })
    })
    .catch(function (err) {
        console.log(err)
    });

captureBtn.addEventListener("click", function (e) {
    let canvas = document.createElement("canvas");
    canvas.width = videoBox.videoWidth;
    canvas.height = videoBox.videoHeight;
    let tool = canvas.getContext("2d");

    captureBtn.classList.add("activeBtn");
    videoBox.classList.add("blink");
    popwindow.classList.add("show");
    setTimeout(function () {
        captureBtn.classList.remove("activeBtn");
    }, 200);
    tool.scale(zoomLevel, zoomLevel);
    tool.filter = newFilter;
    let x = (canvas.width/zoomLevel - canvas.width)/2;
    let y = (canvas.width/zoomLevel - canvas.height)/2;
    tool.drawImage(videoBox, x, y);

    popUpMsg();
    popUpWindow("camera", canvas);
})

recorderBtn.addEventListener("click", function () {
    // based on the state of recordState we say that our recording is on or off
    if (recordState == false) {
        // mediarecorder object does not start untill you call this method on it
        mediaRecorder.start();
        // styling on ui if recording is on
        recorderBtn.classList.add("activeBtn");
        recorderBtn.classList.add("record_animation");
        // call this function to show the time since your recording has been started
        startTimmer();
        recordState = true;
    } else {
        mediaRecorder.stop();
                // styling on ui if recording is off
     recorderBtn.classList.remove("activeBtn");
        recorderBtn.classList.remove("record_animation");
        videoBox.classList.add("blink");
        setTimeout(function () {
            videoBox.classList.remove("blink");
        }, 200);
        stopTimmer();
        recordState = false;
    }
})

function startTimmer() {
    timmer.classList.add("timerActive");
    let timeCount = 0;
    // for everysec you gonna increase the timeCount by 1sec and based on that you are making changes in the hours,minutes based on not.of seconds elapsed
    clearObj = setInterval(function () {
        // if remainder is <10 then we have to show using 0{remainde},else {remainder}
        let seconds = (timeCount % 60) < 10 ? `0${timeCount % 60}` : `${timeCount % 60}`;
        //  1min=60sec if we have timeCount sec then how many minutes we have elapsed 
        let minutes = (timeCount / 60) < 10 ? `0${Number.parseInt(timeCount / 60)}` : `${Number.parseInt(timeCount % 60)}`;
        //  1min=3600sec if we have timeCount sec then how many hours we have elapsed
        let hours = (timeCount / 3600) < 10 ? `0${Number.parseInt(timeCount / 3600)}` : `${Number.parseInt(timeCount % 60)}`;
        // show it on the ui using innerText
        time.innerText = `${hours}:${minutes}:${seconds}`;
        // since we have completed 1 sec then we are implementing this code that we y we have to increae the timeCount by 1 to make count o that 1 sec
        timeCount++;
    }, 1000)
}
function stopTimmer() {
    // remove the timer from the ui using removing the styling class 
    timmer.classList.remove("timerActive");
    // set the timer to default value
    time.innerText = "00:00:00";
    clearInterval(clearObj);
}

function findDate() {
    let date = new Date();
    let str = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
    return str;
}

function popUpMsg() {
    popMsg.className = "show";
    setTimeout(function () { popMsg.className = popMsg.className.replace("show", ""); }, 2000);
}

function popUpWindow(type, canvas) {
    enterBtn.addEventListener("click", function () {
        let mediaName = textBox.innerText;
        let date = findDate();
        if(type === "camera"){
            let link = canvas.toDataURL();
            addMedia(link, "img", mediaName, date);
        }
        else{
            let blob = new Blob(buffer, { type: 'video/mp4' });
            addMedia(blob, "video", mediaName, date);
            // to improve the storage
            buffer = [];
        }
        videoBox.classList.remove("blink");
        popwindow.classList.remove("show");
    })
}

zoomInBtn.addEventListener("click", function () {
    if (zoomLevel < 3) {
        zoomLevel += 0.2;
        videoBox.style.transform = `scale(${zoomLevel})`
    }
})

zoomOutBtn.addEventListener("click", function () {
    if (zoomLevel > 1) {
        zoomLevel -= 0.2;
        videoBox.style.transform = `scale(${zoomLevel})`
    }
})