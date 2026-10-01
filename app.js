const talkBtn=document.getElementById("talkBtn");
const talkText=document.getElementById("talkText");
const status=document.getElementById("status");
const message=document.getElementById("message");
const orb=document.getElementById("orb");
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;

let recognition=null;
let assistantMode=false;
let processing=false;

function speak(text,thenListen=false){
 speechSynthesis.cancel();
 const voice=new SpeechSynthesisUtterance(text);
 voice.lang="en-IN";
 voice.rate=.9;
 voice.onend=()=>{
  if(thenListen) setTimeout(listen,400);
 };
 speechSynthesis.speak(voice);
}

function show(title,text){
 status.textContent=title;
 message.textContent=text;
}

function command(text){
 const t=text.toLowerCase().trim();
 console.log("COMMAND:",t);
 processing=true;

 if(t.includes("hello")||t.includes("hi")){
  show("Hello 👋","AccessBridge AI is ready.");
  speak("Hello. AccessBridge AI is ready.",assistantMode);
 }
 else if(t.includes("time")){
  const now=new Date();
  const time=now.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"});
  show("Current time",time);
  speak("The time is "+time,assistantMode);
 }
 else if(t.includes("date")||t.includes("today")){
  const date=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  show("Today's date",date);
  speak("Today is "+date,assistantMode);
 }
 else if(t.includes("stop")||t.includes("sleep")||t.includes("goodbye")){
  assistantMode=false;
  talkText.textContent="Start AccessBridge";
  show("Sleeping","Say AccessBridge or tap the button to start again.");
  speak("Okay. I am going to sleep.");
 }
 else{
  show("I heard you",text);
  speak("I heard you say "+text,assistantMode);
 }

 processing=false;
}

function listen(){
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
  show("Listening 🎙️","Speak now...");
  orb.style.animation="pulse 1s infinite";
 };

 recognition.onresult=(event)=>{
  const text=event.results[0][0].transcript;
  recognition=null;
  command(text);
 };

 recognition.onerror=(event)=>{
  console.log("VOICE ERROR:",event.error);
  recognition=null;
  orb.style.animation="";
  show("Try again","I couldn't hear you clearly.");
 };

 recognition.onend=()=>{
  recognition=null;
  orb.style.animation="";
 };

 recognition.start();
}

talkBtn.onclick=()=>{
 assistantMode=true;
 talkText.textContent="Listening...";
 show("AccessBridge is awake","I'm ready for your command.");
 speak("AccessBridge is ready.",true);
};

show("Ready to listen","Tap the button to activate AccessBridge AI.");