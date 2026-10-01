const talkBtn=document.getElementById("talkBtn");
const status=document.getElementById("status");
const message=document.getElementById("message");
const orb=document.getElementById("orb");
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;

let recognition=null;

function speak(text){
 speechSynthesis.cancel();
 const voice=new SpeechSynthesisUtterance(text);
 voice.lang="en-IN";
 voice.rate=0.9;
 speechSynthesis.speak(voice);
}

function show(title,text){
 status.textContent=title;
 message.textContent=text;
}

function command(text){
 const t=text.toLowerCase().trim();
 console.log("COMMAND:",t);

 if(t.includes("hello")||t.includes("hi")){
  show("Hello 👋","AccessBridge AI is ready.");
  speak("Hello. AccessBridge AI is ready.");
 }
 else if(t.includes("time")){
  const now=new Date();
  const time=now.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"});
  show("Current time",time);
  speak("The time is "+time);
 }
 else if(t.includes("date")||t.includes("today")){
  const date=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  show("Today's date",date);
  speak("Today is "+date);
 }
 else if(t.includes("open google")){
  show("Opening Google","Opening Google in a new tab.");
  speak("Opening Google.");
  window.open("https://www.google.com","_blank");
 }
 else if(t.includes("open youtube")){
  show("Opening YouTube","Opening YouTube in a new tab.");
  speak("Opening YouTube.");
  window.open("https://www.youtube.com","_blank");
 }
 else if(t.includes("stop")||t.includes("quiet")){
  speechSynthesis.cancel();
  show("Stopped","AccessBridge AI is ready.");
 }
 else{
  show("I heard you",text);
  speak("I heard you say "+text);
 }
}

function listen(){
 if(!Recognition){
  show("Not supported","Please use Google Chrome.");
  return;
 }

 recognition=new Recognition();
 recognition.lang="en-IN";
 recognition.continuous=false;
 recognition.interimResults=false;

 recognition.onstart=()=>{
  show("Listening 🎙️","Speak now...");
  orb.style.animation="pulse 1s infinite";
 };

 recognition.onresult=(event)=>{
  const text=event.results[0][0].transcript;
  command(text);
 };

 recognition.onerror=(event)=>{
  console.log("VOICE ERROR:",event.error);
  show("Voice error","Please try again.");
 };

 recognition.onend=()=>{
  orb.style.animation="";
 };

 recognition.start();
}

talkBtn.onclick=listen;

show("Ready to listen","Tap the button and talk to AccessBridge AI.");