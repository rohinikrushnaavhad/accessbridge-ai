const AccessBridgeAI=(()=>{
let recognition=null;
let listening=false;
let speaking=false;

function speak(text){
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
u.onstart=()=>{speaking=true};
u.onend=()=>{speaking=false};
u.onerror=()=>{speaking=false};
synth.speak(u);
}catch(e){console.error(e)}
}

function say(text){
speak(text);
if(typeof addHistory==="function")addHistory(text);
}

function clean(t){
return(t||"").toLowerCase().trim().replace(/[?!.]/g,"");
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
if(e.error==="not-allowed")say("Microphone permission was denied.");
else if(e.error==="no-speech")say("I did not hear anything. Please try again.");
else if(e.error==="network")say("Voice recognition needs an internet connection.");
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
try{r.stop()}catch(e){}
return;
}

try{
r.start();
}catch(e){
console.log(e);
}
}

function stop(){
if(recognition&&listening){
try{recognition.stop()}catch(e){}
}
}

async function handle(raw){

const c=clean(raw);

if(typeof showStatus==="function")showStatus(raw);

if(!c)return;

/* GREETING */

if(/^(hi|hello|hey)( accessbridge| assistant)?$/.test(c)){
say("Hello. I am AccessBridge. How can I help you?");
return;
}

/* TIME */

if(c.includes("time")||c.includes("what time")){
const d=new Date();
say("The time is "+d.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"}));
return;
}

/* DATE */

if(c.includes("date")||c==="today"||c.includes("today's date")||c.includes("todays date")){
const d=new Date();
say("Today is "+d.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"}));
return;
}

/* CALCULATION - CHECK THIS BEFORE GENERAL AI */

if(isCalculationCommand(c)){
const expression=extractCalculation(c);
const result=calculate(expression);

if(result!==null){
say("The answer is "+formatNumber(result));
if(typeof showCalculation==="function"){
showCalculation(expression,result);
}
}else{
say("I could not understand that calculation.");
}
return;
}

/* YOUTUBE */

if(c.includes("open youtube")||c==="youtube"){
say("Opening YouTube.");
window.open("https://www.youtube.com","_blank");
return;
}

/* GOOGLE */

if(c.includes("open google")||c==="google"){
say("Opening Google.");
window.open("https://www.google.com","_blank");
return;
}

/* GOOGLE SEARCH */

if(c.includes("search google")||c.includes("search for")){
let q=c.replace("search google","").replace("search for","").trim();

if(q){
say("Searching Google for "+q);
window.open("https://www.google.com/search?q="+encodeURIComponent(q),"_blank");
}else{
say("What should I search for?");
}
return;
}

/* NEWS */

if(c.includes("news")){
if(typeof readNews==="function"){
readNews();
}else{
say("Opening the news.");
window.open("https://news.google.com","_blank");
}
return;
}

/* WEATHER */

if(c.includes("weather")){
await weather();
return;
}

/* OBJECT SCANNER */

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

/* SCAN */

if(
c==="scan"||
c.includes("scan the object")||
c.includes("scan this")
){

if(typeof openScanner==="function")openScanner();

if(typeof startObjectCamera==="function"){

const ready=await startObjectCamera();

if(!ready)return;

await wait(800);

if(typeof scanCurrentObject==="function"){
await scanCurrentObject();
}

}

return;
}

/* OPEN CAMERA */

if(
c.includes("open camera")||
c==="camera"||
c.includes("start camera")
){

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

/* READ */

if(
c.includes("read this")||
c.includes("read text")||
c.includes("read for me")
){

if(typeof openReader==="function"){
openReader();
}else{
say("Please open the Read for me section.");
}

return;
}

/* COMMUNICATION */

if(
c.includes("send message")||
c.includes("send a message")||
c.includes("message ")
){

if(typeof openCommunication==="function"){
openCommunication();
}

say("The communication panel is ready.");
return;
}

/* ACCESSIBILITY */

if(
c.includes("increase text")||
c.includes("larger text")||
c.includes("bigger text")
){

if(typeof increaseTextSize==="function"){
increaseTextSize();
}else{
document.documentElement.style.fontSize="110%";
}

say("Text size increased.");
return;
}

if(
c.includes("decrease text")||
c.includes("smaller text")
){

if(typeof decreaseTextSize==="function"){
decreaseTextSize();
}else{
document.documentElement.style.fontSize="95%";
}

say("Text size decreased.");
return;
}

if(
c.includes("high contrast")||
c.includes("contrast mode")
){

if(typeof toggleContrast==="function"){
toggleContrast();
}else{
document.body.classList.toggle("high-contrast");
}

say("Contrast setting changed.");
return;
}

/* STOP SPEECH */

if(
c.includes("stop speaking")||
c.includes("be quiet")||
c==="stop"
){

window.speechSynthesis.cancel();
return;
}

/* AI BACKEND */

const result=await askAI(raw);

if(result){
say(result);
}else{
say("I can help with time, date, weather, Google, YouTube, news, calculations, object scanning, reading and communication.");
}

}

/* =========================
   CALCULATION ENGINE
========================= */

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

let x=expression.trim();

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

return Number(number).toLocaleString("en-IN",{
maximumFractionDigits:6
});

}

/* WEATHER */

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

const r=await fetch(url);

if(!r.ok)throw new Error();

const d=await r.json();

const temp=d.current.temperature_2m;
const humidity=d.current.relative_humidity_2m;
const wind=d.current.wind_speed_10m;

const description=
weatherDescription(d.current.weather_code);

say(
"The current weather is "+
description+
". Temperature is "+
temp+
" degrees Celsius, humidity is "+
humidity+
" percent, and wind speed is "+
wind+
" kilometers per hour."
);

}catch(e){

say("Sorry, I could not get the weather right now.");

}

},
()=>{
say("I need your location permission to provide the weather.");
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

/* OPTIONAL AI BACKEND */

async function askAI(text){

try{

if(
typeof window.ACCESSBRIDGE_AI_ENDPOINT!=="string"||
!window.ACCESSBRIDGE_AI_ENDPOINT
){
return null;
}

const r=await fetch(
window.ACCESSBRIDGE_AI_ENDPOINT,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
message:text
})
}
);

if(!r.ok)return null;

const d=await r.json();

return d.reply||d.response||d.message||null;

}catch(e){

return null;

}

}

return{
start,
stop,
handle,
speak,
calculate
};

})();

window.AccessBridgeAI=AccessBridgeAI;