let objectModel=null;
let objectStream=null;
let objectLoading=false;

async function loadObjectModel(){
if(objectModel)return objectModel;
if(objectLoading){
while(objectLoading&&!objectModel)await new Promise(r=>setTimeout(r,200));
return objectModel;
}
objectLoading=true;
const message=document.getElementById("cameraMessage");
if(message)message.textContent="Loading object AI…";
try{
if(typeof cocoSsd==="undefined")throw new Error("COCO-SSD unavailable");
objectModel=await cocoSsd.load();
if(message)message.textContent="Object AI ready.";
objectLoading=false;
return objectModel;
}catch(e){
console.error(e);
objectLoading=false;
if(message)message.textContent="Object AI could not load.";
return null;
}
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
if(message)message.textContent="Camera is not supported.";
AccessBridgeAI.speak("Camera is not supported in this browser.");
return false;
}
if(message)message.textContent="Opening camera…";
objectStream=await navigator.mediaDevices.getUserMedia({
video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},
audio:false
});
video.srcObject=objectStream;
await video.play();
if(message)message.textContent="Camera active.";
const model=await loadObjectModel();
if(!model)return false;
if(message)message.textContent="Camera and object AI ready.";
return true;
}catch(e){
console.error(e);
objectStream=null;
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

if(!objectModel){
const model=await loadObjectModel();
if(!model){
AccessBridgeAI.speak("Object recognition is not ready.");
return false;
}
}

if(message)message.textContent="Scanning…";

try{
const predictions=await objectModel.detect(video);

if(!predictions.length){
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
"dining table":"dining table"
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