const talkBtn=document.getElementById("talkBtn");
const talkText=document.getElementById("talkText");
const status=document.getElementById("status");
const message=document.getElementById("message");
const orb=document.getElementById("orb");
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;

let recognition=null;
let assistantMode=false;
let speaking=false;

function show(title,text){
 status.textContent=title;
 message.textContent=text;
}

function speak(text){
 speechSynthesis.cancel();
 speaking=true;
 const voice=new SpeechSynthesisUtterance(text);
 voice.lang="en-IN";
 voice.rate=.9;
 voice.onend=()=>{
  speaking=false;
  if(assistantMode){
   setTimeout(()=>listen(),600);
  }
 };
 speechSynthesis.speak(voice);
}

function command(text){
 const t=text.toLowerCase().trim();
 console.log("COMMAND:",t);

 if(t.includes("stop")||t.includes("sleep")||t.includes("goodbye")){
  assistantMode=false;
  if(recognition){
   recognition.abort();
   recognition=null;
  }
  speechSynthesis.cancel();
  talkText.textContent="Start AccessBridge";
  show("Sleeping 😴","AccessBridge is waiting.");
  speak("Okay. I am going to sleep.");
  return;
 }

 if(t.includes("hello")||t.includes("hi")){
  show("Hello 👋","AccessBridge AI is ready.");
  speak("Hello. AccessBridge AI is ready.");
  return;
 }

 if(t.includes("time")){
  const now=new Date();
  const time=now.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"});
  show("Current time",time);
  speak("The time is "+time);
  return;
 }

 if(t.includes("date")||t.includes("today")){
  const date=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  show("Today's date",date);
  speak("Today is "+date);
  return;
 }

 if(t.includes("open google")){
  show("Opening Google","Launching Google.");
  speak("Opening Google.");
  setTimeout(()=>window.open("https://www.google.com","_blank"),500);
  return;
 }

 if(t.includes("open youtube")){
  show("Opening YouTube","Launching YouTube.");
  speak("Opening YouTube.");
  setTimeout(()=>window.open("https://www.youtube.com","_blank"),500);
  return;
 }

 show("I heard you",text);
 speak("I heard you say "+text);
}

function listen(){
 if(!assistantMode||speaking)return;

 if(!Recognition){
  show("Voice unavailable","Please use Google Chrome.");
  return;
 }

 if(recognition)return;

 recognition=new Recognition();
 recognition.lang="en-IN";
 recognition.continuous=false;
 recognition.interimResults=false;

 recognition.onstart=()=>{
  show("Listening 🎙️","Speak your command...");
  talkText.textContent="Listening...";
  orb.style.animation="pulse 1s infinite";
 };

 recognition.onresult=(event)=>{
  const text=event.results[0][0].transcript;
  recognition=null;
  orb.style.animation="";
  command(text);
 };

 recognition.onerror=(event)=>{
  console.log("VOICE ERROR:",event.error);
  recognition=null;