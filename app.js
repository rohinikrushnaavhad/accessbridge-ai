const talkBtn=document.getElementById("talkBtn");
const status=document.getElementById("status");
const message=document.getElementById("message");
const orb=document.getElementById("orb");

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
let recognition;
let listening=false;

function speak(text){
 const u=new SpeechSynthesisUtterance(text);
 u.lang="en-IN";
 u.rate=.95;
 speechSynthesis.cancel();
 speechSynthesis.speak(u);
}

function setStatus(a,b){
 status.textContent=a;
 message.textContent=b;
}

function handleCommand(text){
 const t=text.toLowerCase().trim();

 if(t.includes("hello")||t.includes("hi")){
  setStatus("Hello 👋","AccessBridge AI is ready.");
  speak("Hello. AccessBridge AI is ready.");
  return;
 }

 if(t.includes("time")){
  const now=new Date();
  const time=now.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"});
  setStatus("Current time",time);
  speak("The time is "+time);
  return;
 }

 if(t.includes("date")||t.includes("today")){
  const date=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  setStatus("Today's date",date);
  speak("Today is "+date);
  return;
 }

 if(t.includes("open google")){
  setStatus("Opening Google","Launching your browser...");
  speak("Opening Google.");
  window.open("https://www.google.com","_blank");
  return;
 }

 if(t.includes("open youtube")){
  setStatus("Opening YouTube","Launching your browser...");
  speak("Opening YouTube.");
  window.open("https://www.youtube.com","_blank");
  return;
 }

 if(t.includes("stop")||t.includes("quiet")){
  speechSynthesis.cancel();
  setStatus("Voice stopped","AccessBridge is ready.");
  return;
 }

 setStatus("Command received",text);
 speak("I heard you say "+text+". I don't have an action for that command yet.");
}

function startListening(){
 if(!SpeechRecognition){
  setStatus("Voice unavailable","Open AccessBridge AI in Chrome.");
  return;
 }

 if(listening)return;

 recognition=new SpeechRecognition();
 recognition.lang="en-IN";
 recognition.continuous=false;
 recognition.interimResults=false;

 recognition.onstart=()=>{
  listening=true;
  setStatus("Listening...","Speak your command.");
  orb.style.animation="pulse 1s infinite";
 };

 recognition.onresult=e=>{
  const text=e.results[0][0].transcript;
  handleCommand(text);
 };

 recognition.onerror=e=>{
  setStatus("Try again","I couldn't hear you clearly.");
 };

 recognition.onend=()=>{
  listening=false;
  orb.style.animation="";
 };

 recognition.start();
}

talkBtn.addEventListener("click",startListening);

setStatus("Ready to listen","Tap the button and talk to AccessBridge AI.");