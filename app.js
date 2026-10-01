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

function speak(text,again=true){
 speechSynthesis.cancel();
 speaking=true;
 const voice=new SpeechSynthesisUtterance(text);
 voice.lang="en-IN";
 voice.rate=.9;
 voice.onend=()=>{
  speaking=false;
  if(assistantMode&&again)setTimeout(listen,600);
 };
 speechSynthesis.speak(voice);
}

function performAction(intent,text){
 if(intent==="greeting"){
  show("Hello 👋","AccessBridge AI is ready.");
  speak("Hello. AccessBridge AI is ready.");
 }

 else if(intent==="time"){
  const now=new Date();
  const time=now.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"});
  show("Current time",time);
  speak("The time is "+time);
 }

 else if(intent==="date"){
  const date=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  show("Today's date",date);
  speak("Today is "+date);
 }

 else if(intent==="google"){
  show("Opening Google","Launching Google.");
  speak("Opening Google.",false);
  setTimeout(()=>window.open("https://www.google.com","_blank"),700);
 }

 else if(intent==="youtube"){
  show("Opening YouTube","Launching YouTube.");
  speak("Opening YouTube.",false);
  setTimeout(()=>window.open("https://www.youtube.com","_blank"),700);
 }

 else if(intent==="text_increase"){
  if(typeof increaseText==="function")increaseText();
  show("Text increased","The text size has been increased.");
  speak("Text size increased.");
 }

 else if(intent==="text_decrease"){
  if(typeof decreaseText==="function")decreaseText();
  show("Text decreased","The text size has been decreased.");
  speak("Text size decreased.");
 }

 else if(intent==="contrast"){
  if(typeof toggleHighContrast==="function")toggleHighContrast();
  show("Contrast changed","High contrast mode has been changed.");
  speak("Contrast mode changed.");
 }

 else if(intent==="stop"){
  assistantMode=false;
  if(recognition){
   recognition.abort();
   recognition=null;
  }
  speechSynthesis.cancel();
  speaking=false;
  talkText.textContent="Start AccessBridge";
  show("Sleeping 😴","AccessBridge is waiting.");
  speak("Okay. I am going to sleep.",false);
 }

 else{
  show("I heard you",text);
  speak("I understood your request, but I don't have an action for it yet.");
 }
}

function processCommand(text){
 const result=getIntentResponse(text);
 console.log("Intent:",result.intent,"Text:",result.text);
 performAction(result.intent,result.text);
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
 alert("Heard: "+text);
 recognition=null;
  orb.style.animation="";
  processCommand(text);
 };

 recognition.onerror=()=>{
  recognition=null;
  orb.style.animation="";
  if(assistantMode)setTimeout(listen,1000);
 };

 recognition.onend=()=>{
  recognition=null;
  orb.style.animation="";
 };

 try{
  recognition.start();
 }catch(e){
  recognition=null;
 }
}

talkBtn.onclick=()=>{
 if(assistantMode){
  assistantMode=false;
  if(recognition){
   recognition.abort();
   recognition=null;
  }
  speechSynthesis.cancel();
  speaking=false;
  talkText.textContent="Start AccessBridge";
  show("Sleeping 😴","AccessBridge is waiting.");
  return;
 }

 assistantMode=true;
 talkText.textContent="Listening...";
 show("AccessBridge is awake","Starting voice assistant...");
 speak("AccessBridge is ready.");
};

show("Ready to listen","Tap Start AccessBridge.");