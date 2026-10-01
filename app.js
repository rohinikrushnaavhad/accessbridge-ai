const talkBtn=document.getElementById("talkBtn");
const talkText=document.getElementById("talkText");
const talkIcon=document.getElementById("talkIcon");
const status=document.getElementById("status");
const message=document.getElementById("message");
const orb=document.getElementById("orb");
const stateBadge=document.getElementById("stateBadge");
const lastCommand=document.getElementById("lastCommand");
const history=document.getElementById("history");
const activityCount=document.getElementById("activityCount");

const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;

let recognition=null;
let assistantMode=false;
let speaking=false;
let commandCount=0;

function show(title,text){
status.textContent=title;
message.textContent=text;
}

function setState(state){

document.body.classList.remove(
"listening",
"processing"
);

if(state==="listening"){
stateBadge.textContent="LISTENING";
stateBadge.style.color="#00ffb3";
stateBadge.style.borderColor="#00ffb3";
document.body.classList.add("listening");
}

else if(state==="processing"){
stateBadge.textContent="PROCESSING";
stateBadge.style.color="#ffd166";
stateBadge.style.borderColor="#ffd166";
document.body.classList.add("processing");
}

else if(state==="active"){
stateBadge.textContent="ACTIVE";
stateBadge.style.color="#00d4ff";
stateBadge.style.borderColor="#00d4ff";
}

else{
stateBadge.textContent="READY";
stateBadge.style.color="#00d4ff";
stateBadge.style.borderColor="#1d415e";
}
}

function speak(text,again=true){

if(!("speechSynthesis" in window)){
if(again&&assistantMode){
setTimeout(listen,500);
}
return;
}

speechSynthesis.cancel();

speaking=true;

const voice=new SpeechSynthesisUtterance(text);

voice.lang="en-IN";
voice.rate=.9;
voice.pitch=1;

voice.onend=()=>{
speaking=false;

if(assistantMode&&again){
setState("active");
setTimeout(listen,500);
}
};

voice.onerror=()=>{
speaking=false;

if(assistantMode&&again){
setTimeout(listen,500);
}
};

speechSynthesis.speak(voice);
}

function addHistory(text,intent){

commandCount++;

activityCount.textContent=commandCount;

lastCommand.textContent=text;

if(history.querySelector(".empty-history")){
history.innerHTML="";
}

const item=document.createElement("div");

item.className="history-item";

const time=new Date().toLocaleTimeString("en-IN",{
hour:"numeric",
minute:"2-digit"
});

item.innerHTML=
"<span>"+time+" • "+intent+"</span>"+
text;

history.prepend(item);

while(history.children.length>8){
history.removeChild(history.lastChild);
}
}

function performAction(intent,text){

if(intent==="greeting"){

show(
"Hello 👋",
"AccessBridge AI is ready."
);

speak(
"Hello. AccessBridge AI is ready."
);

}

else if(intent==="time"){

const now=new Date();

const time=now.toLocaleTimeString("en-IN",{
hour:"numeric",
minute:"2-digit"
});

show(
"Current time",
time
);

speak(
"The time is "+time
);

}

else if(intent==="date"){

const date=new Date().toLocaleDateString("en-IN",{
day:"numeric",
month:"long",
year:"numeric"
});

show(
"Today's date",
date
);

speak(
"Today is "+date
);

}

else if(intent==="google"){

show(
"Opening Google",
"Launching Google."
);

speak(
"Opening Google.",
false
);

setTimeout(()=>{
window.location.href="https://www.google.com";
},900);

}

else if(intent==="youtube"){

show(
"Opening YouTube",
"Launching YouTube."
);

speak(
"Opening YouTube.",
false
);

setTimeout(()=>{
window.location.href="https://www.youtube.com";
},900);

}

else if(intent==="text_increase"){

increaseText();

}

else if(intent==="text_decrease"){

decreaseText();

}

else if(intent==="contrast_on"){

if(document.body.classList.contains("high-contrast")){

show(
"High contrast already ON",
"High contrast mode is already enabled."
);

speak(
"High contrast is already enabled."
);

}else{

document.body.classList.add("high-contrast");

show(
"High contrast ON",
"High contrast mode is enabled."
);

speak(
"High contrast enabled."
);

}

}

else if(intent==="contrast_off"){

if(!document.body.classList.contains("high-contrast")){

show(
"High contrast already OFF",
"High contrast mode is already disabled."
);

speak(
"High contrast is already disabled."
);

}else{

document.body.classList.remove("high-contrast");

show(
"High contrast OFF",
"High contrast mode is disabled."
);

speak(
"High contrast disabled."
);

}

}

else if(intent==="contrast_toggle"){

toggleHighContrast();

}

else if(intent==="accessibility_reset"){

resetAccessibility();

}

else if(intent==="stop"){

assistantMode=false;

if(recognition){

try{
recognition.abort();
}catch(e){}

recognition=null;
}

speechSynthesis.cancel();

speaking=false;

talkText.textContent="Start AccessBridge";
talkIcon.textContent="🎙️";

setState("ready");

show(
"Sleeping 😴",
"AccessBridge is waiting."
);

speak(
"Okay. I am going to sleep.",
false
);

}

else{

show(
"I heard you",
text
);

speak(
"I understood your request, but I don't have an action for it yet."
);

}
}

function processCommand(text){

setState("processing");

console.log("Recognized speech:",text);

const result=getIntentResponse(text);

console.log("Detected intent:",result.intent);

addHistory(
result.text,
result.intent
);

performAction(
result.intent,
result.text
);
}

function listen(){

if(!assistantMode||speaking)
return;

if(!Recognition){

setState("ready");

show(
"Voice unavailable",
"Please use Google Chrome."
);

return;
}

if(recognition)
return;

recognition=new Recognition();

recognition.lang="en-IN";
recognition.continuous=false;
recognition.interimResults=false;
recognition.maxAlternatives=1;

recognition.onstart=()=>{

setState("listening");

show(
"Listening 🎙️",
"Speak your command..."
);

talkText.textContent="Listening...";
talkIcon.textContent="🔴";
};

recognition.onresult=(event)=>{

const text=event.results[0][0].transcript;

console.log(
"HEARD:",
text
);

recognition=null;

orb.style.animation="";

processCommand(text);
};

recognition.onerror=(event)=>{

console.log(
"Speech recognition error:",
event.error
);

recognition=null;

orb.style.animation="";

if(event.error==="not-allowed"||event.error==="service-not-allowed"){

assistantMode=false;

talkText.textContent="Start AccessBridge";
talkIcon.textContent="🎙️";

setState("ready");

show(
"Microphone blocked",
"Allow microphone permission and try again."
);

return;
}

if(event.error==="no-speech"){

show(
"No speech detected",
"Please speak again."
);

}

if(assistantMode){

setTimeout(
listen,
1000
);
}

};

recognition.onend=()=>{

recognition=null;

orb.style.animation="";

if(assistantMode&&!speaking){

setTimeout(
listen,
400
);

}

};

try{

recognition.start();

}catch(error){

console.log(
"Recognition start error:",
error
);

recognition=null;

if(assistantMode){

setTimeout(
listen,
700
);

}

}
}

function startAssistant(){

if(!Recognition){

show(
"Voice unavailable",
"Please open AccessBridge AI in Google Chrome."
);

return;
}

assistantMode=true;

talkText.textContent="Listening...";
talkIcon.textContent="🔴";

setState("active");

show(
"AccessBridge is awake",
"Speak your command..."
);

listen();
}

function stopAssistant(){

assistantMode=false;

if(recognition){

try{
recognition.abort();
}catch(e){}

recognition=null;
}

speechSynthesis.cancel();

speaking=false;

talkText.textContent="Start AccessBridge";
talkIcon.textContent="🎙️";

setState("ready");

show(
"Sleeping 😴",
"AccessBridge is waiting."
);
}

talkBtn.addEventListener("click",()=>{

if(assistantMode){

stopAssistant();

}else{

startAssistant();

}

});

document.addEventListener("keydown",(event)=>{

if(
event.key==="Enter"&&
document.activeElement!==talkBtn
){

startAssistant();

}

});

show(
"Ready to listen",
"Tap Start AccessBridge."
);

setState("ready");