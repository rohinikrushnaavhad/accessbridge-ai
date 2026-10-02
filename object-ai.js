let objectModel=null;
let objectStream=null;
let objectLoading=false;

async function loadObjectModel(){
if(objectModel)return objectModel;
if(objectLoading)return null;
objectLoading=true;
const message=document.getElementById("cameraMessage");
if(message)message.textContent="Loading object AI…";
try{
if(typeof cocoSsd==="undefined"){
if(message)message.textContent="Object AI library unavailable.";
objectLoading=false;
return null;
}
objectModel=await cocoSsd.load();
if(message)message.textContent="Object AI ready.";
return objectModel;
}catch(e){
console.error(e);
if(message)message.textContent="Could not load object AI.";
objectLoading=false;
return null;
}
}

async function startObjectCamera(){
const video=document.getElementById("cameraVideo");
const message=document.getElementById("cameraMessage");
if(!video)return;
try{
if(objectStream){
video.srcObject=objectStream;
return;
}
objectStream=await navigator.mediaDevices.getUserMedia({
video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},
audio:false
});
video.srcObject=objectStream;
await video.play();
if(message)message.textContent="Camera active. Point at an object.";
loadObjectModel();
}catch(e){
console.error(e);
if(message)message.textContent="Camera permission was denied.";
if(window.AccessBridgeAI)AccessBridgeAI.speak("I could not access the camera. Please allow camera permission.");
}
}

async function scanCurrentObject(){
const video=document.getElementById("cameraVideo");
const result=document.getElementById("objectResult");
const message=document.getElementById("cameraMessage");
if(!video||!video.srcObject){
if(window.AccessBridgeAI)AccessBridgeAI.speak("Please start the camera first.");
return;
}
if(!objectModel){
if(message)message.textContent="Loading object AI…";
const model=await loadObjectModel();
if(!model){
if(window.AccessBridgeAI)AccessBridgeAI.speak("Object recognition is not ready.");
return;
}
}
if(message)message.textContent="Scanning…";
try{
const predictions=await objectModel.detect(video);
if(!predictions.length){
if(result)result.textContent="No familiar object detected.";
if(message)message.textContent="Nothing detected.";
AccessBridgeAI.speak("I could not identify the object.");
return;
}
predictions.sort((a,b)=>b.score-a.score);
const best=predictions[0];
const name=formatObjectName(best.class);
const confidence=Math.round(best.score*100);
if(result)result.textContent=name+" detected ("+confidence+"% confidence)";
if(message)message.textContent="Object detected.";
AccessBridgeAI.speak("This appears to be a "+name+".");
}catch(e){
console.error(e);
if(message)message.textContent="Scanning failed.";
AccessBridgeAI.speak("Sorry, I could not scan the object.");
}
}

function formatObjectName(name){
const special={
"cell phone":"mobile phone",
"laptop":"laptop",
"tv":"television",
"remote":"remote control",
"couch":"sofa",
"dining table":"dining table",
"potted plant":"plant",
"teddy bear":"teddy bear",
"traffic light":"traffic light",
"stop sign":"stop sign"
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