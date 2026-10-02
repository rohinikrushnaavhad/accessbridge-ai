const state={listening:false,history:JSON.parse(localStorage.getItem("accessbridge_history")||"[]"),autoListen:false,newsPlaying:false,newsPaused:false,newsIndex:0,newsEndTime:0,newsTimer:null};

const $=id=>document.getElementById(id);

let speechToken=0;

function speak(text,onEnd){
if(!("speechSynthesis"in window)){
if(typeof onEnd==="function")onEnd();
return;
}
speechToken++;
const token=speechToken;
speechSynthesis.cancel();
const u=new SpeechSynthesisUtterance(String(text));
u.lang="en-IN";
u.rate=.95;
u.pitch=1;
u.onend=()=>{
if(token!==speechToken)return;
if(typeof onEnd==="function")onEnd();
};
u.onerror=()=>{
if(token!==speechToken)return;
if(typeof onEnd==="function")onEnd();
};
speechSynthesis.speak(u);
}

function show(title,message){
const titleEl=$("toastTitle");
const messageEl=$("toastMessage");
const toast=$("toast");
if(titleEl)titleEl.textContent=title||"AccessBridge";
if(messageEl)messageEl.textContent=message||"";
if(toast){
toast.classList.add("show");
clearTimeout(window.toastTimer);
window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2800);
}
}

function saveHistory(command,response){
state.history.unshift({
command:String(command),
response:String(response),
time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})
});
state.history=state.history.slice(0,8);
localStorage.setItem("accessbridge_history",JSON.stringify(state.history));
renderHistory();
}

function escapeHtml(value){
return String(value).replace(/[&<>"']/g,m=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#039;"
}[m]));
}

function renderHistory(){
const box=$("activityList");
if(!box)return;
if(!state.history.length){
box.innerHTML='<div class="empty-state">No recent activity yet.</div>';
return;
}
box.innerHTML=state.history.map(x=>`
<div class="activity-item">
<strong>${escapeHtml(x.command)}</strong>
<small>${escapeHtml(x.response)} • ${escapeHtml(x.time)}</small>
</div>
`).join("");
}

function navigate(pageId){
document.querySelectorAll(".page").forEach(page=>{
page.classList.toggle("active",page.id===pageId);
});
document.querySelectorAll(".nav-item").forEach(item=>{
item.classList.toggle("active",item.dataset.page===pageId);
});
window.scrollTo({top:0,behavior:"smooth"});
if(pageId==="newsPage"&&typeof loadNews==="function"){
loadNews();
}
}

function openNews(){
navigate("newsPage");
if(typeof loadNews==="function"){
setTimeout(()=>loadNews(),100);
}
}

function openNewsCategory(category){
navigate("newsPage");

const button=document.querySelector(`.category[data-category="${category}"]`);

if(button){
document.querySelectorAll(".category").forEach(item=>item.classList.remove("active"));
button.classList.add("active");
}

if(typeof window.setNewsCategory==="function"){
window.setNewsCategory(category);
}else if(typeof loadNews==="function"){
setTimeout(()=>loadNews(true),100);
}
}

function getNewsPlayCategory(text){
const t=String(text||"").toLowerCase();
if(/\b(india|indian)\b/.test(t))return"india";
if(/\b(technology|tech)\b/.test(t))return"technology";
if(/\b(science)\b/.test(t))return"science";
if(/\b(sports|sport)\b/.test(t))return"sports";
if(/\b(business|businesses)\b/.test(t))return"business";
return typeof getNewsCategory==="function"?getNewsCategory():"top";
}

function getNewsPlayDuration(text){
const t=String(text||"").toLowerCase();
const match=t.match(/\b(?:for|about)\s+(\d+)\s*(seconds?|minutes?|mins?|hours?|hrs?)\b/);
if(!match)return 0;
const amount=parseInt(match[1],10);
const unit=match[2];
if(unit.startsWith("second"))return amount*1000;
if(unit.startsWith("hour")||unit.startsWith("hr"))return amount*60*60*1000;
return amount*60*1000;
}

function stopNewsPlayback(message=true){
state.newsPlaying=false;
state.newsPaused=false;
state.newsIndex=0;
state.newsEndTime=0;

if(state.newsTimer){
clearTimeout(state.newsTimer);
state.newsTimer=null;
}

if("speechSynthesis"in window)speechSynthesis.cancel();

if(message){
const reply="News playback stopped. I am listening again.";
$("listenStatus").textContent=reply;
show("News stopped",reply);
speak(reply,()=>{
if(state.autoListen)startListening();
});
}else{
if(state.autoListen)startListening();
}
}

function playNewsStory(){
if(!state.newsPlaying)return;

const articles=typeof getNewsArticles==="function"?getNewsArticles():[];

if(!articles.length){
state.newsPlaying=false;
const reply="There are no news stories available right now.";
$("listenStatus").textContent=reply;
speak(reply,()=>{
if(state.autoListen)startListening();
});
return;
}

if(state.newsEndTime&&Date.now()>=state.newsEndTime){
stopNewsPlayback(true);
return;
}

if(state.newsIndex>=articles.length){
state.newsPlaying=false;
const reply="I have finished reading all the available news stories.";
$("listenStatus").textContent=reply;
show("News complete",reply);
speak(reply,()=>{
if(state.autoListen)startListening();
});
return;
}

const article=articles[state.newsIndex];
const number=state.newsIndex+1;
const title=String(article.title||"Untitled story").trim();
const source=String(article.source||"BBC News").trim();
const description=String(article.description||"").trim();

let text=`Story ${number}. Headline: ${title}. Source: ${source}.`;

if(description){
text+=` ${description}.`;
}

$("listenStatus").textContent=`Reading news story ${number} of ${articles.length}...`;
$("transcript").textContent=title;

speak(text,()=>{
if(!state.newsPlaying)return;

state.newsIndex++;

if(state.newsEndTime&&Date.now()>=state.newsEndTime){
stopNewsPlayback(true);
return;
}

state.newsTimer=setTimeout(()=>{
state.newsTimer=null;
playNewsStory();
},700);
});
}

async function startNewsPlayback(category,duration){
stopNewsPlayback(false);

state.newsPlaying=true;
state.newsPaused=false;
state.newsIndex=0;
state.newsEndTime=duration?Date.now()+duration:0;

state.autoListen=false;

openNewsCategory(category);

$("listenStatus").textContent="Preparing news playback...";
$("transcript").textContent="Loading news stories...";

let articles=typeof getNewsArticles==="function"?getNewsArticles():[];

if(!articles.length&&typeof loadNews==="function"){
try{
await loadNews(true);
}catch(error){}
}

articles=typeof getNewsArticles==="function"?getNewsArticles():[];

if(!articles.length){
state.newsPlaying=false;
const reply="I could not find any news stories to read right now.";
$("listenStatus").textContent=reply;
speak(reply,()=>{
if(state.autoListen)startListening();
});
return;
}

const categoryName=typeof NEWS_CATEGORIES!=="undefined"&&NEWS_CATEGORIES[category]
?NEWS_CATEGORIES[category]
:category;

const durationText=duration
?` for ${Math.round(duration/60000)} minutes`
:"";

const intro=`${categoryName} News. I found ${articles.length} stories. I will read the headlines and details${durationText}.`;

$("listenStatus").textContent=`Reading ${categoryName} news...`;
$("transcript").textContent=intro;

speak(intro,()=>{
if(state.newsPlaying)playNewsStory();
});
}

function pauseNewsPlayback(){
if(!state.newsPlaying)return;
state.newsPaused=true;
state.newsPlaying=false;
if(state.newsTimer){
clearTimeout(state.newsTimer);
state.newsTimer=null;
}
if("speechSynthesis"in window)speechSynthesis.pause();
$("listenStatus").textContent="News playback paused.";
show("News paused","Say resume news to continue.");
}

function resumeNewsPlayback(){
if(!state.newsPaused)return;
state.newsPaused=false;
state.newsPlaying=true;
if("speechSynthesis"in window&&speechSynthesis.paused){
speechSynthesis.resume();
}else{
playNewsStory();
}
}

function processCommand(command){
const raw=String(command||"").trim();

if(!raw)return;

const lowerRaw=raw.toLowerCase();

if(/\b(stop|cancel)\b.*\b(news|reading)\b|\bstop news\b|\bstop reading\b/.test(lowerRaw)){
stopNewsPlayback(true);
saveHistory(raw,"News playback stopped.");
return;
}

if(/\b(pause|hold)\b.*\b(news|reading)\b|\bpause news\b/.test(lowerRaw)){
pauseNewsPlayback();
saveHistory(raw,"News playback paused.");
return;
}

if(/\b(resume|continue)\b.*\b(news|reading)\b|\bresume news\b/.test(lowerRaw)){
resumeNewsPlayback();
saveHistory(raw,"News playback resumed.");
return;
}

if(/\b(next|skip)\b.*\b(news|story|article)\b/.test(lowerRaw)){
if(state.newsPlaying||state.newsPaused){
if("speechSynthesis"in window)speechSynthesis.cancel();
state.newsPaused=false;
state.newsPlaying=true;
state.newsIndex++;
playNewsStory();
saveHistory(raw,"Moved to the next news story.");
}
return;
}

if(/\b(repeat|again)\b.*\b(news|story|headline|article)\b/.test(lowerRaw)){
if(state.newsPlaying||state.newsPaused){
if("speechSynthesis"in window)speechSynthesis.cancel();
state.newsPaused=false;
state.newsPlaying=true;
playNewsStory();
saveHistory(raw,"Repeating the current news story.");
}
return;
}

const playNewsRequest=
/\b(play|read|listen to|start)\b.*\b(news|headlines?|stories?|articles?)\b/.test(lowerRaw)&&
!/\b(open)\b.*\b(news)\b/.test(lowerRaw);

if(playNewsRequest){
const category=getNewsPlayCategory(lowerRaw);
const duration=getNewsPlayDuration(lowerRaw);
startNewsPlayback(category,duration);
saveHistory(raw,"Started voice news playback.");
return;
}

const result=typeof getIntentResponse==="function"
?getIntentResponse(raw)
:{intent:"unknown",cleanText:raw};

$("transcript").textContent=raw;

let reply="";
let shouldResume=true;

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
speak(reply,()=>{
if(state.autoListen)startListening();
});
saveHistory(raw,reply);
setTimeout(()=>window.open("https://www.google.com","_blank"),300);
return;

case"youtube":
reply="Opening YouTube.";
speak(reply,()=>{
if(state.autoListen)startListening();
});
saveHistory(raw,reply);
setTimeout(()=>window.open("https://www.youtube.com","_blank"),300);
return;

case"news":
reply="Opening News.";
openNews();
break;

case"technology_news":
reply="Opening technology news.";
openNewsCategory("technology");
break;

case"india_news":
reply="Opening India news.";
openNewsCategory("india");
break;

case"sports_news":
reply="Opening sports news.";
openNewsCategory("sports");
break;

case"science_news":
reply="Opening science news.";
openNewsCategory("science");
break;

case"business_news":
reply="Opening business news.";
openNewsCategory("business");
break;

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
if(typeof toggleHighContrast==="function"){
toggleHighContrast();
return;
}
break;

case"accessibility_reset":
if(typeof resetAccessibility==="function")resetAccessibility();
reply="Accessibility settings have been restored.";
break;

case"stop":
reply="Okay. I am going to stop listening.";
shouldResume=false;
state.autoListen=false;
stopListening();
break;

default:
reply="I heard you, but I don't have that command yet.";
}

$("listenStatus").textContent=reply;

show("AccessBridge",reply);

state.autoListen=shouldResume;

speak(reply,()=>{
if(state.autoListen&&!state.newsPlaying){
startListening();
}
});

saveHistory(raw,reply);
}

let recognition=null;

function setupVoice(){

const SpeechRecognition=
window.SpeechRecognition||
window.webkitSpeechRecognition;

if(!SpeechRecognition){
$("listenStatus").textContent=
"Voice recognition is not supported in this browser.";
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

for(let i=e.resultIndex;i<e.results.length;i++){
text+=e.results[i][0].transcript;
}

$("transcript").textContent=text;

const last=e.results[e.results.length-1];

if(last.isFinal){
processCommand(text);
}
};

recognition.onerror=e=>{

state.listening=false;

$("listenBtn").classList.remove("listening");

if(e.error==="not-allowed"){
state.autoListen=false;
$("listenStatus").textContent=
"Microphone permission is blocked.";
}else{
$("listenStatus").textContent=
"Voice recognition stopped.";
}

if(e.error!=="aborted"){
show("Voice error",$("listenStatus").textContent);
}
};

recognition.onend=()=>{

state.listening=false;

$("listenBtn").classList.remove("listening");

if(state.autoListen&&!state.newsPlaying){
if("speechSynthesis"in window&&speechSynthesis.speaking)return;
setTimeout(()=>{
if(state.autoListen&&!state.listening&&!state.newsPlaying){
startListening();
}
},300);
return;
}

if($("listenStatus").textContent==="Listening..."){
$("listenStatus").textContent="Tap to speak";
}
};
}

function startListening(){

if(!recognition){
show(
"Voice unavailable",
"Your browser does not support voice recognition."
);
return;
}

if(state.listening)return;

try{
recognition.start();
}catch(error){}
}

function stopListening(){

state.autoListen=false;

if(recognition){
try{
recognition.stop();
}catch(error){}
}

state.listening=false;

$("listenBtn").classList.remove("listening");

$("listenStatus").textContent="Tap to speak";
}

function init(){

const hour=new Date().getHours();

$("greetingTime").textContent=
hour<12
?"Good morning"
:hour<17
?"Good afternoon"
:"Good evening";

renderHistory();

setupVoice();

document.querySelectorAll(".nav-item").forEach(button=>{
button.addEventListener("click",()=>{
navigate(button.dataset.page);
});
});

$("listenBtn").addEventListener("click",()=>{
state.listening
?stopListening()
:(state.autoListen=true,startListening());
});

document.querySelectorAll(".quick-card").forEach(button=>{
button.addEventListener("click",()=>{
processCommand(button.dataset.command);
});
});

$("clearHistoryBtn").addEventListener("click",()=>{

state.history=[];

localStorage.removeItem("accessbridge_history");

renderHistory();

show(
"History cleared",
"Recent activity has been removed."
);
});

$("settingsBtn").addEventListener("click",()=>{
navigate("morePage");
});

$("accessibilityBtn").addEventListener("click",()=>{
show(
"Accessibility",
"Voice commands for text size and high contrast are available."
);
});

$("voiceBtn").addEventListener("click",()=>{
show(
"Voice Assistant",
"Tap the Listen button and speak your command."
);
});

$("aboutBtn").addEventListener("click",()=>{
show(
"AccessBridge AI",
"Accessibility-first assistant • Version 3.2"
);
});

$("readTextBtn").addEventListener("click",()=>{

const text=
"Welcome to AccessBridge. This tool is designed to make digital information easier to access through voice and accessibility features.";

$("readerOutput").innerHTML=
`<p>${escapeHtml(text)}</p>`;

speak(text);

});
}

window.AccessBridge={
processCommand,
navigate,
openNews,
openNewsCategory,
startListening,
stopListening,
startNewsPlayback,
stopNewsPlayback,
pauseNewsPlayback,
resumeNewsPlayback
};

document.addEventListener("DOMContentLoaded",init);