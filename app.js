const state={listening:false,history:JSON.parse(localStorage.getItem("accessbridge_history")||"[]")};
const $=id=>document.getElementById(id);
function speak(text){
if(!("speechSynthesis"in window))return;
speechSynthesis.cancel();
const u=new SpeechSynthesisUtterance(String(text));
u.lang="en-IN";
u.rate=.95;
u.pitch=1;
speechSynthesis.speak(u);
}
function show(title,message){
$("toastTitle").textContent=title||"AccessBridge";
$("toastMessage").textContent=message||"";
$("toast").classList.add("show");
clearTimeout(window.toastTimer);
window.toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2800);
}
function saveHistory(command,response){
state.history.unshift({command,response,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})});
state.history=state.history.slice(0,8);
localStorage.setItem("accessbridge_history",JSON.stringify(state.history));
renderHistory();
}
function renderHistory(){
const box=$("activityList");
if(!state.history.length){
box.innerHTML='<div class="empty-state">No recent activity yet.</div>';
return;
}
box.innerHTML=state.history.map(x=>`<div class="activity-item"><strong>${escapeHtml(x.command)}</strong><small>${escapeHtml(x.response)} • ${escapeHtml(x.time)}</small></div>`).join("");
}
function escapeHtml(value){
return String(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function navigate(pageId){
document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===pageId));
document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===pageId));
window.scrollTo({top:0,behavior:"smooth"});
if(pageId==="newsPage"&&typeof loadNews==="function")loadNews();
}
function processCommand(command){
const raw=String(command||"").trim();
if(!raw)return;
const result=typeof getIntentResponse==="function"?getIntentResponse(raw):{intent:"unknown",cleanText:raw};
$("transcript").textContent=raw;
let reply="";
switch(result.intent){
case"wake":
reply="Yes, I'm listening.";
break;
case"greeting":
reply="Hello! I'm AccessBridge. How can I help you?";
break;
case"time":
reply=`The current time is ${new Date().toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"})}.`;
break;
case"date":
reply=`Today is ${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}.`;
break;
case"google":
reply="Opening Google.";
speak(reply);
saveHistory(raw,reply);
setTimeout(()=>window.open("https://www.google.com","_blank"),300);
return;
case"youtube":
reply="Opening YouTube.";
speak(reply);
saveHistory(raw,reply);
setTimeout(()=>window.open("https://www.youtube.com","_blank"),300);
return;
case"text_increase":
if(typeof increaseText==="function")increaseText();
reply="Text size increased.";
break;
case"text_decrease":
if(typeof decreaseText==="function")decreaseText();
reply="Text size reduced.";
break;
case"contrast_on":
if(typeof enableHighContrast==="function")enableHighContrast();
reply="High contrast is now enabled.";
break;
case"contrast_off":
if(typeof disableHighContrast==="function")disableHighContrast();
reply="High contrast is now disabled.";
break;
case"contrast_toggle":
if(typeof toggleHighContrast==="function"){toggleHighContrast();return;}
break;
case"accessibility_reset":
if(typeof resetAccessibility==="function")resetAccessibility();
reply="Accessibility settings have been restored.";
break;
case"stop":
reply="Okay. I am going to stop listening.";
stopListening();
break;
default:
reply="I heard you, but I don't have that command yet. More AI features are coming soon.";
}
$("listenStatus").textContent=reply;
show("AccessBridge",reply);
speak(reply);
saveHistory(raw,reply);
}
let recognition=null;
function setupVoice(){
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!SpeechRecognition){
$("listenStatus").textContent="Voice recognition is not supported in this browser.";
return;
}
recognition=new SpeechRecognition();
recognition.lang="en-IN";
recognition.continuous=false;
recognition.interimResults=true;
recognition.maxAlternatives=1;
recognition.onstart=()=>{
state.listening=true;
$("listenBtn").classList.add("listening");
$("listenStatus").textContent="Listening...";
$("transcript").textContent="Speak now...";
};
recognition.onresult=e=>{
let text="";
for(let i=e.resultIndex;i<e.results.length;i++)text+=e.results[i][0].transcript;
$("transcript").textContent=text;
if(e.results[e.results.length-1].isFinal)processCommand(text);
};
recognition.onerror=e=>{
state.listening=false;
$("listenBtn").classList.remove("listening");
$("listenStatus").textContent=e.error==="not-allowed"?"Microphone permission is blocked.":"Voice recognition stopped.";
if(e.error!=="aborted")show("Voice error",$("listenStatus").textContent);
};
recognition.onend=()=>{
state.listening=false;
$("listenBtn").classList.remove("listening");
if($("listenStatus").textContent==="Listening...")$("listenStatus").textContent="Tap to speak";
};
}
function startListening(){
if(!recognition){
show("Voice unavailable","Your browser does not support voice recognition.");
return;
}
try{recognition.start();}catch(e){}
}
function stopListening(){
if(recognition)try{recognition.stop();}catch(e){}
state.listening=false;
$("listenBtn").classList.remove("listening");
$("listenStatus").textContent="Tap to speak";
}
function init(){
const hour=new Date().getHours();
$("greetingTime").textContent=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
renderHistory();
setupVoice();
document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.page)));
$("listenBtn").addEventListener("click",()=>state.listening?stopListening():startListening());
document.querySelectorAll(".quick-card").forEach(btn=>btn.addEventListener("click",()=>processCommand(btn.dataset.command)));
$("clearHistoryBtn").addEventListener("click",()=>{
state.history=[];
localStorage.removeItem("accessbridge_history");
renderHistory();
show("History cleared","Recent activity has been removed.");
});
$("settingsBtn").addEventListener("click",()=>navigate("morePage"));
$("accessibilityBtn").addEventListener("click",()=>{
if(typeof show==="function")show("Accessibility","Voice commands for text size and high contrast are available.");
});
$("voiceBtn").addEventListener("click",()=>{
show("Voice Assistant","Tap the Listen button and speak your command.");
});
$("aboutBtn").addEventListener("click",()=>{
show("AccessBridge AI","Accessibility-first assistant • Version 3.0");
});
$("readTextBtn").addEventListener("click",()=>{
const text="Welcome to AccessBridge. This tool is designed to make digital information easier to access through voice and accessibility features.";
$("readerOutput").innerHTML=`<p>${escapeHtml(text)}</p>`;
speak(text);
});
}
document.addEventListener("DOMContentLoaded",init);