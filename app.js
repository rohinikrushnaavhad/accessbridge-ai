const talkBtn=document.getElementById("talkBtn");
const status=document.getElementById("status");
const message=document.getElementById("message");
const orb=document.getElementById("orb");

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;

if(!SpeechRecognition){
 status.textContent="Voice not supported";
 message.textContent="Please open AccessBridge AI in Chrome.";
 talkBtn.disabled=true;
}else{
 const recognition=new SpeechRecognition();
 recognition.lang="en-IN";
 recognition.continuous=false;
 recognition.interimResults=false;

 talkBtn.addEventListener("click",()=>{
  status.textContent="Listening...";
  message.textContent="I'm listening. Speak your command.";
  orb.style.animation="pulse 1s infinite";
  recognition.start();
 });

 recognition.onresult=(event)=>{
  const text=event.results[0][0].transcript;
  status.textContent="I heard you";
  message.textContent='"'+text+'"';
  speak("I heard you say "+text);
 };

 recognition.onend=()=>{
  orb.style.animation="";
 };

 recognition.onerror=(event)=>{
  status.textContent="Try again";
  message.textContent="I couldn't hear you clearly.";
  orb.style.animation="";
 };

 function speak(text){
  const voice=new SpeechSynthesisUtterance(text);
  voice.lang="en-IN";
  voice.rate=.95;
  speechSynthesis.speak(voice);
 }
}