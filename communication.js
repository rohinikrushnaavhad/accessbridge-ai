const AccessBridgeCommunication=(()=>{
let listening=false;
let recognition=null;
let conversation=[];
function $(id){return document.getElementById(id);}
function speak(text){
if(!text)return;
try{
const synth=window.speechSynthesis;
synth.cancel();
const u=new SpeechSynthesisUtterance(text);
u.lang="en-IN";
u.rate=.9;
u.pitch=1;
u.volume=1;
synth.speak(u);
}catch(e){console.error(e);}
}
function addMessage(type,text){
if(!text)return;
conversation.push({type,text,time:Date.now()});
const box=$("communicationMessages");
if(!box)return;
const empty=box.querySelector(".communication-empty");
if(empty)empty.remove();
const item=document.createElement("div");
item.className="communication-message "+type;
const label=document.createElement("span");
label.className="message-label";
label.textContent=type==="me"?"YOU":"OTHER PERSON";
const content=document.createElement("div");
content.className="message-content";
content.textContent=text;
item.append(label,content);
box.appendChild(item);
box.scrollTop=box.scrollHeight;
}
function sendTypedMessage(){
const input=$("communicationInput");
if(!input)return;
const text=input.value.trim();
if(!text){
speak("Please type a message first.");
input.focus();
return;
}
addMessage("me",text);
input.value="";
speak(text);
if(typeof addHistory==="function")addHistory("Communication: "+text);
}
function createRecognition(){
const R=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!R)return null;
const r=new R();
r.lang="en-IN";
r.continuous=false;
r.interimResults=true;
r.maxAlternatives=1;
r.onstart=()=>{
listening=true;
updateListeningUI(true);
};
r.onresult=e=>{
let finalText="";
let interimText="";
for(let i=e.resultIndex;i<e.results.length;i++){
const text=e.results[i][0].transcript;
if(e.results[i].isFinal)finalText+=text;
else interimText+=text;
}
const live=$("communicationLiveText");
if(live)live.textContent=interimText||finalText||"Listening…";
if(finalText.trim()){
addMessage("other",finalText.trim());
speak("You said: "+finalText.trim());
}
};
r.onerror=e=>{
listening=false;
updateListeningUI(false);
if(e.error==="not-allowed"){
speak("Microphone permission was denied.");
}else if(e.error==="no-speech"){
speak("I did not hear anything. Please try again.");
}else if(e.error==="network"){
speak("Voice recognition needs an internet connection.");
}else{
console.error(e);
}
};
r.onend=()=>{
listening=false;
updateListeningUI(false);
const live=$("communicationLiveText");
if(live)live.textContent="Ready to listen";
};
return r;
}
function startListening(){
if(listening)return;
if(!recognition)recognition=createRecognition();
if(!recognition){
speak("Speech recognition is not supported. Please use Chrome.");
return;
}
try{
recognition.start();
}catch(e){
console.error(e);
}
}
function stopListening(){
if(recognition&&listening){
try{recognition.stop();}catch(e){}
}
listening=false;
updateListeningUI(false);
}
function updateListeningUI(active){
const btn=$("communicationListenBtn");
const status=$("communicationListenStatus");
if(btn)btn.classList.toggle("active",active);
if(btn)btn.textContent=active?"STOP LISTENING":"START LISTENING";
if(status)status.textContent=active?"Listening to the other person…":"Ready to listen";
}
function clearConversation(){
conversation=[];
const box=$("communicationMessages");
if(box)box.innerHTML='<div class="communication-empty">No messages yet.</div>';
const live=$("communicationLiveText");
if(live)live.textContent="Ready to listen";
}
function init(){
$("communicationSendBtn")?.addEventListener("click",sendTypedMessage);
$("communicationListenBtn")?.addEventListener("click",()=>{
if(listening)stopListening();
else startListening();
});
$("communicationClearBtn")?.addEventListener("click",clearConversation);
$("communicationInput")?.addEventListener("keydown",e=>{
if(e.key==="Enter"&&!e.shiftKey){
e.preventDefault();
sendTypedMessage();
}
});
}
return{init,sendTypedMessage,startListening,stopListening,clearConversation,speak};
})();
window.AccessBridgeCommunication=AccessBridgeCommunication;