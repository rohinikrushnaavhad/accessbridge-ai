const WORKER_URL="PASTE_YOUR_WORKER_URL_HERE";

const talkBtn=document.getElementById("talkBtn");
const talkText=document.getElementById("talkText");
const talkIcon=document.getElementById("talkIcon");
const status=document.getElementById("status");
const message=document.getElementById("message");
const stateBadge=document.getElementById("stateBadge");
const lastCommand=document.getElementById("lastCommand");
const history=document.getElementById("history");
const activityCount=document.getElementById("activityCount");
const navButtons=document.querySelectorAll(".nav-btn");
const pageSections=document.querySelectorAll(".page-section");

const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;

let recognition=null;
let assistantMode=false;
let speaking=false;
let processingAI=false;
let waitingForCommand=false;
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

stateBadge.textContent="THINKING";
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

if(!text)return;

if(!("speechSynthesis" in window)){

speaking=false;

if(again&&assistantMode){
setTimeout(listen,500);
}

return;
}

speechSynthesis.cancel();

speaking=true;

const voice=new SpeechSynthesisUtterance(
String(text)
);

voice.lang="en-IN";
voice.rate=.9;
voice.pitch=1;

voice.onend=()=>{

speaking=false;

if(
assistantMode&&
again&&
!processingAI
){

setState("active");

setTimeout(
listen,
500
);
}
};

voice.onerror=()=>{

speaking=false;

if(
assistantMode&&
again&&
!processingAI
){

setTimeout(
listen,
500
);
}
};

speechSynthesis.speak(voice);
}

function escapeHTML(text){

const div=document.createElement("div");

div.textContent=String(text||"");

return div.innerHTML;
}

function addHistory(text,intent){

commandCount++;

activityCount.textContent=
commandCount;

lastCommand.textContent=
text;

if(history.querySelector(".empty-history")){
history.innerHTML="";
}

const item=
document.createElement("div");

item.className=
"history-item";

const time=
new Date().toLocaleTimeString(
"en-IN",
{
hour:"numeric",
minute:"2-digit"
}
);

item.innerHTML=
"<span>"+
time+
" • "+
escapeHTML(intent)+
"</span>"+
escapeHTML(text);

history.prepend(item);

while(history.children.length>8){

history.removeChild(
history.lastChild
);
}
}

async function askAI(text){

if(
!WORKER_URL||
WORKER_URL.includes(
"PASTE_YOUR_WORKER_URL"
)
){

show(
"AI unavailable",
"AI connection is currently being configured."
);

speak(
"AI connection is currently unavailable."
);

return;
}

processingAI=true;

setState("processing");

show(
"AccessBridge AI is thinking",
"Please wait..."
);

talkText.textContent=
"Thinking...";

talkIcon.textContent=
"🧠";

try{

const response=
await fetch(
WORKER_URL,
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify({
message:text
})
}
);

const data=
await response.json();

console.log(
"AI RESPONSE:",
data
);

if(
!response.ok||
!data.success
){

throw new Error(
data.details||
data.error||
"AI request failed"
);
}

const answer=
String(
data.answer||
"I could not generate a response."
);

show(
"AccessBridge AI",
answer
);

speak(answer);

}catch(error){

console.error(
"AI CONNECTION ERROR:",
error
);

show(
"AI temporarily unavailable",
"Your other AccessBridge features are still working."
);

speak(
"AI is temporarily unavailable. You can still use the other AccessBridge features."
);

}finally{

processingAI=false;

talkText.textContent=
assistantMode?
"Listening...":
"Start AccessBridge";

talkIcon.textContent=
assistantMode?
"🔴":
"🎙️";
}
}

function openSection(sectionId){

pageSections.forEach(section=>{
section.classList.toggle(
"active-section",
section.id===sectionId
);
});

navButtons.forEach(button=>{
button.classList.toggle(
"active",
button.dataset.section===sectionId
);
});

if(sectionId==="newsSection"&&typeof loadNews==="function"){
loadNews();
}

window.scrollTo({
top:0,
behavior:"smooth"
});
}

navButtons.forEach(button=>{

button.addEventListener(
"click",
()=>{
openSection(
button.dataset.section
);
}
);

});

function performAction(
intent,
text,
originalText
){

if(intent==="wake"){

show(
"Yes, I'm listening 👂",
"Tell me what you need."
);

speak(
"Yes, I'm listening."
);

return;
}

if(intent==="greeting"){

show(
"Hello 👋",
"AccessBridge AI is ready."
);

speak(
"Hello. AccessBridge AI is ready."
);

return;
}

if(intent==="time"){

const now=
new Date();

const time=
now.toLocaleTimeString(
"en-IN",
{
hour:"numeric",
minute:"2-digit"
}
);

show(
"Current time",
time
);

speak(
"The time is "+
time
);

return;
}

if(intent==="date"){

const date=
new Date().toLocaleDateString(
"en-IN",
{
day:"numeric",
month:"long",
year:"numeric"
}
);

show(
"Today's date",
date
);

speak(
"Today is "+
date
);

return;
}

if(intent==="google"){

show(
"Opening Google",
"Launching Google."
);

speak(
"Opening Google.",
false
);

setTimeout(
()=>{
window.location.href=
"https://www.google.com";
},
900
);

return;
}

if(intent==="youtube"){

show(
"Opening YouTube",
"Launching YouTube."
);

speak(
"Opening YouTube.",
false
);

setTimeout(
()=>{
window.location.href=
"https://www.youtube.com";
},
900
);

return;
}

if(intent==="text_increase"){

increaseText();

return;
}

if(intent==="text_decrease"){

decreaseText();

return;
}

if(intent==="contrast_on"){

if(
document.body.classList.contains(
"high-contrast"
)
){

show(
"High contrast already ON",
"High contrast mode is already enabled."
);

speak(
"High contrast is already enabled."
);

}else{

enableHighContrast();

show(
"High contrast ON",
"High contrast mode is enabled."
);

speak(
"High contrast enabled."
);
}

return;
}

if(intent==="contrast_off"){

if(
!document.body.classList.contains(
"high-contrast"
)
){

show(
"High contrast already OFF",
"High contrast mode is already disabled."
);

speak(
"High contrast is already disabled."
);

}else{

disableHighContrast();

show(
"High contrast OFF",
"High contrast mode is disabled."
);

speak(
"High contrast disabled."
);
}

return;
}

if(intent==="contrast_toggle"){

toggleHighContrast();

return;
}

if(intent==="accessibility_reset"){

resetAccessibility();

return;
}

if(intent==="stop"){

stopAssistant();

speak(
"Okay. I am going to sleep.",
false
);

return;
}

/* AI fallback */

askAI(originalText);
}

function processCommand(text){

setState("processing");

console.log(
"Recognized speech:",
text
);

const result=
getIntentResponse(text);

console.log(
"Detected intent:",
result.intent
);

console.log(
"Wake word:",
result.wakeWord
);

addHistory(
result.text,
result.intent
);

performAction(
result.intent,
result.cleanText,
result.text
);
}

function listen(){

if(
!assistantMode||
speaking||
processingAI
){
return;
}

if(!Recognition){

setState("ready");

show(
"Voice unavailable",
"Please open AccessBridge AI in Google Chrome."
);

return;
}

if(recognition)return;

recognition=
new Recognition();

recognition.lang=
"en-IN";

recognition.continuous=
false;

recognition.interimResults=
false;

recognition.maxAlternatives=
1;

recognition.onstart=()=>{

waitingForCommand=
true;

setState("listening");

show(
"Listening 🎙️",
"Say “Access” or speak your command..."
);

talkText.textContent=
"Listening...";

talkIcon.textContent=
"🔴";
};

recognition.onresult=
(event)=>{

const text=
event.results[0][0]
.transcript;

console.log(
"HEARD:",
text
);

waitingForCommand=
false;

recognition=null;

processCommand(text);
};

recognition.onerror=
(event)=>{

console.log(
"Speech recognition error:",
event.error
);

waitingForCommand=
false;

recognition=null;

if(
event.error==="not-allowed"||
event.error==="service-not-allowed"
){

assistantMode=false;

talkText.textContent=
"Start AccessBridge";

talkIcon.textContent=
"🎙️";

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
"Listening again..."
);
}

if(
assistantMode&&
!speaking&&
!processingAI
){

setTimeout(
listen,
900
);
}
};

recognition.onend=()=>{

recognition=null;

if(
assistantMode&&
!speaking&&
!processingAI&&
!waitingForCommand
){

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
"Please use Google Chrome."
);

return;
}

assistantMode=
true;

talkText.textContent=
"Listening...";

talkIcon.textContent=
"🔴";

setState("active");

show(
"AccessBridge is awake",
"Say “Access” or speak your command."
);

listen();
}

function stopAssistant(){

assistantMode=
false;

waitingForCommand=
false;

processingAI=
false;

if(recognition){

try{
recognition.abort();
}catch(e){}

recognition=null;
}

if(
"speechSynthesis" in window
){

speechSynthesis.cancel();
}

speaking=false;

talkText.textContent=
"Start AccessBridge";

talkIcon.textContent=
"🎙️";

setState("ready");

show(
"Sleeping 😴",
"AccessBridge is waiting."
);
}

talkBtn.addEventListener(
"click",
()=>{

if(assistantMode){

stopAssistant();

}else{

startAssistant();
}
}
);

document.addEventListener(
"keydown",
(event)=>{

if(
(event.key==="Enter"||
event.key===" ")&&
document.activeElement!==talkBtn
){

event.preventDefault();

if(!assistantMode){

startAssistant();
}
}
}
);

show(
"Ready to listen",
"Tap Start AccessBridge to activate voice control."
);

setState("ready");