let objectModel=null;
let objectStream=null;
let objectLoading=null;

async function loadObjectModel(){
if(objectModel)return objectModel;
if(objectLoading)return await objectLoading;
const message=document.getElementById("cameraMessage");
if(message)message.textContent="Loading object AI…";
objectLoading=(async()=>{
try{
if(typeof cocoSsd==="undefined")throw new Error("COCO-SSD unavailable");
const model=await cocoSsd.load();
objectModel=model;
if(message)message.textContent="Object AI ready.";
return model;
}catch(e){
console.error(e);
if(message)message.textContent="Object AI could not load.";
return null;
}finally{
objectLoading=null;
}
})();
return await objectLoading;
}

async function startObjectCamera(){
const video=document.getElementById("cameraVideo");
const message=document.getElementById("cameraMessage");
if(!video)return false;

try{
if(objectStream){
video.srcObject=objectStream;
await video.play();
return true;
}

if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
if(message)message.textContent="Camera not supported.";
AccessBridgeAI.speak("Camera is not supported in this browser.");
return false;
}

if(message)message.textContent="Opening camera…";

objectStream=await navigator.mediaDevices.getUserMedia({
video:{
facingMode:{ideal:"environment"},
width:{ideal:1280},
height:{ideal:720}
},
audio:false
});

video.srcObject=objectStream;

await new Promise(resolve=>{
if(video.readyState>=2)resolve();
else video.onloadedmetadata=()=>resolve();
});

await video.play();

if(message)message.textContent="Camera active.";

const model=await loadObjectModel();

if(!model){
AccessBridgeAI.speak("Object recognition could not be loaded.");
return false;
}

if(message)message.textContent="Camera and object AI ready.";

return true;

}catch(e){
console.error(e);
if(objectStream){
objectStream.getTracks().forEach(t=>t.stop());
objectStream=null;
}
if(message)message.textContent="Camera permission required.";
AccessBridgeAI.speak("I could not access the camera. Please allow camera permission.");
return false;
}
}

async function scanCurrentObject(){
const video=document.getElementById("cameraVideo");
const result=document.getElementById("objectResult");
const message=document.getElementById("cameraMessage");

if(!video||!objectStream){
AccessBridgeAI.speak("The camera is not open.");
return false;
}

if(video.readyState<2){
await new Promise(r=>setTimeout(r,1000));
}

const model=await loadObjectModel();

if(!model){
AccessBridgeAI.speak("Object recognition is not ready.");
return false;
}

if(message)message.textContent="Scanning…";

try{
const predictions=await model.detect(video);

if(!predictions||!predictions.length){
if(result)result.textContent="No familiar object detected.";
if(message)message.textContent="No object detected.";
AccessBridgeAI.speak("I could not identify the object.");
return false;
}

predictions.sort((a,b)=>b.score-a.score);

const best=predictions[0];
const name=formatObjectName(best.class);
const confidence=Math.round(best.score*100);

if(result)result.textContent=name+" detected ("+confidence+"% confidence)";
if(message)message.textContent="Object detected.";

AccessBridgeAI.speak("This appears to be a "+name+".");

return true;

}catch(e){
console.error(e);
if(message)message.textContent="Scanning failed.";
AccessBridgeAI.speak("Sorry, I could not scan the object.");
return false;
}
}

function formatObjectName(name){
const special={
"cell phone":"mobile phone",
"tv":"television",
"remote":"remote control",
"couch":"sofa",
"potted plant":"plant",
"dining table":"dining table",
"traffic light":"traffic light",
"stop sign":"stop sign",
"teddy bear":"teddy bear"
};
return special[name]||name;
}

function stopObjectCamera(){
if(objectStream){
objectStream.getTracks().forEach(track=>track.stop());
objectStream=null;
}

const video=document.getElementById("cameraVideo");
if(video)video.srcObject=null;

const message=document.getElementById("cameraMessage");
if(message)message.textContent="Camera stopped.";
}

window.startObjectCamera=startObjectCamera;
window.scanCurrentObject=scanCurrentObject;
window.stopObjectCamera=stopObjectCamera;