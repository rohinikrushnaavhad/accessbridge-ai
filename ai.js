const AccessBridgeAI=(()=>{
let recognition=null;
let listening=false;
let speaking=false;
let conversationState=null;
let pendingWhatsApp={contact:null,message:null};
let pendingCall={contact:null};

function $(id){return document.getElementById(id);}

function speak(text,onFinished){
if(!text)return;
try{
const synth=window.speechSynthesis;
if(!synth)return;
synth.cancel();
const u=new SpeechSynthesisUtterance(String(text));
u.lang="en-IN";
u.rate=.9;
u.pitch=1;
u.volume=1;
u.onstart=()=>{speaking=true;};
u.onend=()=>{speaking=false;if(typeof onFinished==="function")setTimeout(onFinished,250);};
u.onerror=()=>{speaking=false;if(typeof onFinished==="function")setTimeout(onFinished,250);};
synth.speak(u);
}catch(e){console.error("Speech error:",e);}
}

function say(text,onFinished){
if(!text)return;
speak(text,onFinished);
if(typeof addHistory==="function")addHistory(text);
}

function clean(text){
return String(text||"").toLowerCase().trim().replace(/[?!.]/g,"").replace(/\s+/g," ");
}

function wait(ms){
return new Promise(resolve=>setTimeout(resolve,ms));
}

function getRecognition(){
const R=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!R)return null;
if(recognition)return recognition;
recognition=new R();
recognition.lang="en-IN";
recognition.continuous=false;
recognition.interimResults=false;
recognition.maxAlternatives=3;

recognition.onstart=()=>{
listening=true;
if(typeof setListening==="function")setListening(true);
};

recognition.onend=()=>{
listening=false;
if(typeof setListening==="function")setListening(false);
};

recognition.onerror=e=>{
listening=false;
if(typeof setListening==="function")setListening(false);

if(e.error==="not-allowed"){
say("Microphone permission was denied.");
}else if(e.error==="no-speech"){
if(conversationState){
continueConversation();
}else{
say("I did not hear anything. Please try again.");
}
}else if(e.error==="network"){
say("Voice recognition needs an internet connection.");
}else{
console.error("Speech recognition error:",e.error);
}
};

recognition.onresult=e=>{
const text=e.results[0][0].transcript;
handle(text);
};

return recognition;
}

function start(){
const r=getRecognition();

if(!r){
say("Voice recognition is not supported in this browser. Please use Chrome.");
return;
}

if(listening){
try{r.stop();}catch(e){}
return;
}

try{
r.start();
}catch(e){
console.error("Recognition start error:",e);
}
}

function listenAgain(){
if(!recognition)recognition=getRecognition();

setTimeout(()=>{
if(!listening&&!speaking&&recognition){
try{
recognition.start();
}catch(e){
console.log("Automatic listening:",e);
}
}
},400);
}

function stop(){
conversationState=null;
pendingWhatsApp={contact:null,message:null};
pendingCall={contact:null};

if(recognition&&listening){
try{recognition.stop();}catch(e){}
}

if(window.speechSynthesis){
window.speechSynthesis.cancel();
}

listening=false;
speaking=false;

if(typeof setListening==="function")setListening(false);
}

async function handle(raw){
const original=String(raw||"");
const c=clean(original);

if(typeof showStatus==="function")showStatus(original);

if(!c)return;

if(conversationState){
const handled=await handleConversation(original,c);
if(handled)return;
}

if(/^(hi|hello|hey)( accessbridge| assistant)?$/.test(c)){
say("Hello. I am AccessBridge. How can I help you?");
return;
}

if(
c.includes("open communication")||
c.includes("communication mode")||
c.includes("start communication")||
c.includes("open communication mode")||
c.includes("communication")
){
openCommunicationDirect();
return;
}

if(c.includes("time")||c.includes("what time")){
const d=new Date();
say("The time is "+d.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"}));
return;
}

if(
c.includes("date")||
c==="today"||
c.includes("today's date")||
c.includes("todays date")
){
const d=new Date();
say("Today is "+d.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"}));
return;
}

if(isCalculationCommand(c)){
const expression=extractCalculation(c);
const result=calculate(expression);

if(result!==null){
say("The answer is "+formatNumber(result));
if(typeof showCalculation==="function")showCalculation(expression,result);
}else{
say("I could not understand that calculation.");
}
return;
}

if(isWhatsAppCommand(c)){
await handleWhatsAppCommand(original);
return;
}

if(isCallCommand(c)){
handleCallCommand(original);
return;
}

if(c.includes("open youtube")||c==="youtube"){
say("Opening YouTube.");
window.open("https://www.youtube.com","_blank");
return;
}

if(c.includes("open google")||c==="google"){
say("Opening Google.");
window.open("https://www.google.com","_blank");
return;
}

if(c.includes("search google")||c.includes("search for")){
let q=c.replace("search google","").replace("search for","").trim();

if(q){
say("Searching Google for "+q);
window.open("https://www.google.com/search?q="+encodeURIComponent(q),"_blank");
}else{
say("What should I search for?",listenAgain);
}
return;
}

if(c.includes("news")){
if(typeof readNews==="function"){
readNews();
}else{
say("Opening the news.");
window.open("https://news.google.com","_blank");
}
return;
}

if(c.includes("weather")){
await weather();
return;
}

if(
c.includes("open camera and scan")||
c.includes("scan object")||
c.includes("scan this object")||
c.includes("identify this")||
c.includes("identify object")||
c.includes("identify what")||
c.includes("what is in front of me")||
c.includes("what's in front of me")
){
if(typeof openScanner==="function")openScanner();

say("Opening the camera.");
await wait(600);

if(typeof startObjectCamera!=="function"){
say("The object scanner is not available.");
return;
}

const ready=await startObjectCamera();

if(!ready)return;

say("Camera is ready. Scanning now.");
await wait(1000);

if(typeof scanCurrentObject==="function"){
await scanCurrentObject();
}else{
say("The object scanner is not available.");
}
return;
}

if(c.includes("open camera")||c==="camera"||c.includes("start camera")){
if(typeof openScanner==="function")openScanner();

await wait(500);

if(typeof startObjectCamera==="function"){
const ready=await startObjectCamera();

if(ready){
say("Camera is ready. Point it at an object and say scan object.");
}
}else{
say("The object scanner is not available.");
}
return;
}

if(c.includes("read this")||c.includes("read text")||c.includes("read for me")){
if(typeof openReader==="function"){
openReader();
}else{
say("Please open the Read for me section.");
}
return;
}

if(c.includes("increase text")||c.includes("larger text")||c.includes("bigger text")){
if(typeof increaseTextSize==="function"){
increaseTextSize();
}else{
document.documentElement.style.fontSize="110%";
}
say("Text size increased.");
return;
}

if(c.includes("decrease text")||c.includes("smaller text")){
if(typeof decreaseTextSize==="function"){
decreaseTextSize();
}else{
document.documentElement.style.fontSize="95%";
}
say("Text size decreased.");
return;
}

if(c.includes("high contrast")||c.includes("contrast mode")){
if(typeof toggleContrast==="function"){
toggleContrast();
}else{
document.body.classList.toggle("high-contrast");
}
say("Contrast setting changed.");
return;
}

if(c.includes("stop speaking")||c.includes("be quiet")||c==="stop"){
if(window.speechSynthesis)window.speechSynthesis.cancel();
speaking=false;
return;
}

const result=await askAI(original);

if(result){
say(result);
}else{
say("I can help with communication, WhatsApp, calls, time, date, weather, Google, YouTube, news, calculations, object scanning and reading.");
}
}

function openCommunicationDirect(){
const panel=$("communicationPanel");

if(!panel){
say("Communication mode is not available. Please check the communication panel.");
return;
}

document.querySelectorAll(".panel").forEach(p=>{
p.classList.add("hidden");
});

panel.classList.remove("hidden");

setTimeout(()=>{
panel.scrollIntoView({
behavior:"smooth",
block:"start"
});
},100);

if(
window.AccessBridgeCommunication&&
typeof AccessBridgeCommunication.init==="function"
){
AccessBridgeCommunication.init();
}

say("Communication mode is open.");
}

function continueConversation(){
if(conversationState)listenAgain();
}

async function handleConversation(raw,c){

if(conversationState==="whatsapp_contact"){
const contactText=extractContactAnswer(raw);
const contact=findContactSafely(contactText);

if(!contact){
say("I couldn't find that contact. Please say a saved contact name.",listenAgain);
return true;
}

pendingWhatsApp.contact=contact;
conversationState="whatsapp_message";

say("What message should I send to "+contact.name+"?",listenAgain);
return true;
}

if(conversationState==="whatsapp_message"){
const message=String(raw||"").trim();

if(!message){
say("Please tell me the message you want to send.",listenAgain);
return true;
}

pendingWhatsApp.message=message;
conversationState=null;

sendWhatsApp(
pendingWhatsApp.contact,
pendingWhatsApp.message
);

pendingWhatsApp={contact:null,message:null};
return true;
}

if(conversationState==="call_contact"){
const contact=findContactSafely(extractContactAnswer(raw));

if(!contact){
say("I couldn't find that contact. Please say a saved contact name.",listenAgain);
return true;
}

conversationState=null;
makeCall(contact);
pendingCall={contact:null};
return true;
}

return false;
}

function isWhatsAppCommand(c){
return c.includes("whatsapp")||
c.includes("send a message")||
c.includes("send message")||
c.includes("message to")||
c.includes("send msg");
}

function isCallCommand(c){
return c==="call"||
c.startsWith("call ")||
c.includes("make a call")||
c.includes("phone ");
}

async function handleWhatsAppCommand(raw){

const c=clean(raw);

const contactText=extractContactFromCommand(c);
const message=extractMessageFromCommand(raw);

if(!contactText){
conversationState="whatsapp_contact";
say("Who should I message?",listenAgain);
return;
}

const contact=findContactSafely(contactText);

if(!contact){
conversationState="whatsapp_contact";
say("I couldn't find that contact. Please say a saved contact name.",listenAgain);
return;
}

if(!message){
pendingWhatsApp.contact=contact;
conversationState="whatsapp_message";
say("What message should I send to "+contact.name+"?",listenAgain);
return;
}

sendWhatsApp(contact,message);
}

function handleCallCommand(raw){

const c=clean(raw);

const contactText=c
.replace("make a call","")
.replace("make call","")
.replace("call","")
.replace("phone","")
.trim();

if(!contactText){
conversationState="call_contact";
say("Who should I call?",listenAgain);
return;
}

const contact=findContactSafely(contactText);

if(!contact){
conversationState="call_contact";
say("I couldn't find that contact. Please say a saved contact name.",listenAgain);
return;
}

makeCall(contact);
}

function extractContactFromCommand(c){

let text=c;

text=text
.replace("send a whatsapp to","")
.replace("send whatsapp to","")
.replace("send a message to","")
.replace("send message to","")
.replace("send msg to","")
.replace("message to","")
.replace("whatsapp to","")
.replace("whatsapp","")
.trim();

const markers=[
" saying ",
" say ",
" message ",
" that ",
" with message "
];

for(const marker of markers){
const index=text.indexOf(marker);

if(index>=0){
text=text.substring(0,index).trim();
break;
}
}

return text;
}

function extractMessageFromCommand(raw){

const text=String(raw||"").trim();

const patterns=[
/\bsaying\s+(.+)$/i,
/\bsay\s+(.+)$/i,
/\bwith message\s+(.+)$/i,
/\bmessage\s*[:\-]\s*(.+)$/i
];

for(const pattern of patterns){
const match=text.match(pattern);

if(match)return match[1].trim();
}

return null;
}

function extractContactAnswer(raw){

return String(raw||"")
.trim()
.replace(/^(please\s+)?(call|message|whatsapp)\s+/i,"")
.trim();
}

function findContactSafely(name){

if(typeof findContact!=="function")return null;

try{

const result=findContact(name);

if(!result)return null;

if(typeof result==="string"){
return{name:name,phone:result};
}

if(result.phone){
return{
name:result.name||name,
phone:result.phone
};
}

return null;

}catch(e){
console.error("Contact lookup error:",e);
return null;
}
}

function normalizePhone(phone){

return String(phone||"")
.replace(/[^\d+]/g,"")
.replace(/^00/,"+");
}

function sendWhatsApp(contact,message){

if(!contact||!contact.phone){
say("I don't have a phone number for that contact.");
return;
}

const phone=normalizePhone(contact.phone);

if(!phone){
say("The contact does not have a valid phone number.");
return;
}

say("Opening WhatsApp for "+contact.name+".");

const url=
"https://wa.me/"+
phone.replace("+","")+
"?text="+
encodeURIComponent(message);

setTimeout(()=>{
window.location.href=url;
},700);
}

function makeCall(contact){

if(!contact||!contact.phone){
say("I don't have a phone number for that contact.");
return;
}

const phone=normalizePhone(contact.phone);

if(!phone){
say("The contact does not have a valid phone number.");
return;
}

say("Calling "+contact.name+".");

setTimeout(()=>{
window.location.href="tel:"+phone;
},700);
}

function isCalculationCommand(c){

if(/[0-9]+\s*[\+\-\*\/%]\s*[0-9]+/.test(c))return true;

const words=[
"plus",
"minus",
"times",
"multiplied by",
"multiply by",
"divided by",
"divide by",
"over"
];

return words.some(word=>c.includes(word))&&/\d/.test(c);
}

function extractCalculation(c){

let x=c;

x=x
.replace(/^what is\s+/,"")
.replace(/^what's\s+/,"")
.replace(/^calculate\s+/,"")
.replace(/^can you calculate\s+/,"")
.replace(/^please calculate\s+/,"")
.trim();

x=x
.replace(/multiplied\s+by/g," * ")
.replace(/multiply\s+by/g," * ")
.replace(/multiplied/g," * ")
.replace(/times/g," * ")
.replace(/plus/g," + ")
.replace(/minus/g," - ")
.replace(/divided\s+by/g," / ")
.replace(/divide\s+by/g," / ")
.replace(/divided/g," / ")
.replace(/over/g," / ")
.replace(/\badd\b/g," + ")
.replace(/\bsubtract\b/g," - ")
.replace(/\bmultiply\b/g," * ")
.replace(/\bdivide\b/g," / ");

return x.replace(/\s+/g," ").trim();
}

function calculate(expression){

try{

let x=String(expression||"").trim();

x=x.replace(/[^0-9+\-*/().%\s]/g,"");
x=x.replace(/\s+/g,"");

if(!x)return null;

if(!/^[0-9+\-*/().%]+$/.test(x))return null;

if(!/[0-9]/.test(x))return null;

if(/[*/%+\-]$/.test(x))return null;

const result=Function(
'"use strict";return ('+x+')'
)();

if(typeof result!=="number")return null;

if(!Number.isFinite(result))return null;

return Number.isInteger(result)
?result
:Number(result.toFixed(6));

}catch(e){
console.error("Calculation error:",e);
return null;
}
}

function formatNumber(number){

return Number(number).toLocaleString(
"en-IN",
{maximumFractionDigits:6}
);

}

async function weather(){

if(!navigator.geolocation){
say("Location is not available in this browser.");
return;
}

say("Getting your weather information.");

navigator.geolocation.getCurrentPosition(
async pos=>{
try{

const lat=pos.coords.latitude;
const lon=pos.coords.longitude;

const url=
"https://api.open-meteo.com/v1/forecast"+
"?latitude="+lat+
"&longitude="+lon+
"&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m";

const response=await fetch(url);

if(!response.ok)throw new Error("Weather request failed");

const data=await response.json();
const current=data.current;

say(
"The current weather is "+
weatherDescription(current.weather_code)+
". Temperature is "+
current.temperature_2m+
" degrees Celsius, humidity is "+
current.relative_humidity_2m+
" percent, and wind speed is "+
current.wind_speed_10m+
" kilometers per hour."
);

}catch(e){

console.error("Weather error:",e);

say(
"Sorry, I could not get the weather right now."
);

}
},
()=>{
say(
"I need your location permission to provide the weather."
);
}
);
}

function weatherDescription(code){

if(code===0)return"clear sky";
if([1,2,3].includes(code))return"partly cloudy";
if([45,48].includes(code))return"foggy";
if([51,53,55,56,57].includes(code))return"drizzling";
if([61,63,65,66,67].includes(code))return"rainy";
if([71,73,75,77].includes(code))return"snowy";
if([80,81,82].includes(code))return"showery";
if([95,96,99].includes(code))return"thunderstorm";

return"mixed conditions";
}

async function askAI(text){

try{

if(
typeof window.ACCESSBRIDGE_AI_ENDPOINT!=="string"||
!window.ACCESSBRIDGE_AI_ENDPOINT
){
return null;
}

const response=await fetch(
window.ACCESSBRIDGE_AI_ENDPOINT,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({message:text})
}
);

if(!response.ok)return null;

const data=await response.json();

return data.reply||
data.response||
data.message||
null;

}catch(e){

console.error("AI endpoint error:",e);

return null;
}
}

return{
start,
stop,
handle,
speak,
calculate,
weather
};

})();

window.AccessBridgeAI=AccessBridgeAI;