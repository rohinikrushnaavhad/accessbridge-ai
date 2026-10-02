const $=id=>document.getElementById(id);

const panels=[
"scannerPanel",
"calculatorPanel",
"readerPanel",
"communicationPanel"
];

function showStatus(text){
const e=$("status");
if(e)e.textContent=text||"Ready";
}

function setListening(active){
const button=$("listenBtn");
const text=$("listenText");
if(button)button.classList.toggle("active",active);
if(text)text.textContent=active?"Listening…":"Tap to speak";
showStatus(active?"Listening…":"Ready");
}

function addHistory(text){
if(!text)return;
const list=$("historyList");
if(list){
const empty=list.querySelector(".empty-history");
if(empty)empty.remove();

const item=document.createElement("div");
item.className="history-item";

const strong=document.createElement("strong");
strong.textContent=text;

const span=document.createElement("span");
span.textContent=new Date().toLocaleTimeString("en-IN",{
hour:"numeric",
minute:"2-digit"
});

item.append(strong,span);
list.prepend(item);

while(list.children.length>8){
list.lastElementChild.remove();
}
}

try{
const history=JSON.parse(
localStorage.getItem("accessbridge_history")||"[]"
);

history.unshift({
text:text,
time:Date.now()
});

localStorage.setItem(
"accessbridge_history",
JSON.stringify(history.slice(0,8))
);
}catch(e){
console.error("History error:",e);
}
}

function loadHistory(){
try{
const history=JSON.parse(
localStorage.getItem("accessbridge_history")||"[]"
);

const list=$("historyList");

if(!list||!history.length)return;

list.innerHTML="";

history.forEach(item=>{
const row=document.createElement("div");
row.className="history-item";

const strong=document.createElement("strong");
strong.textContent=item.text;

const span=document.createElement("span");
span.textContent=new Date(item.time).toLocaleTimeString(
"en-IN",
{
hour:"numeric",
minute:"2-digit"
}
);

row.append(strong,span);
list.append(row);
});
}catch(e){
console.error("Load history error:",e);
}
}

function hideAllPanels(){
panels.forEach(id=>{
const element=$(id);
if(element)element.classList.add("hidden");
});
}

function openPanel(id){
hideAllPanels();

const element=$(id);

if(!element)return;

element.classList.remove("hidden");

setTimeout(()=>{
element.scrollIntoView({
behavior:"smooth",
block:"start"
});
},80);
}

function openScanner(){
openPanel("scannerPanel");
}

function openReader(){
openPanel("readerPanel");
}

function openCommunication(){
openPanel("communicationPanel");

if(
window.AccessBridgeCommunication&&
typeof AccessBridgeCommunication.init==="function"
){
AccessBridgeCommunication.init();
}
}

function showCalculation(expression,result){
openPanel("calculatorPanel");

const input=$("calculationInput");
const output=$("calculationResult");

if(input)input.value=expression;

if(output){
output.textContent="Answer: "+result;
}
}

function calculateManual(){
const input=$("calculationInput");

if(!input)return;

const expression=input.value.trim();

if(!expression){
const output=$("calculationResult");

if(output){
output.textContent="Please enter a calculation.";
}

if(window.AccessBridgeAI){
AccessBridgeAI.speak(
"Please enter a calculation first."
);
}

return;
}

let result=null;

if(
window.AccessBridgeAI&&
typeof AccessBridgeAI.calculate==="function"
){
result=AccessBridgeAI.calculate(expression);
}

const output=$("calculationResult");

if(result===null){
if(output){
output.textContent=
"I could not understand that calculation.";
}

if(window.AccessBridgeAI){
AccessBridgeAI.speak(
"I could not understand that calculation."
);
}

return;
}

if(output){
output.textContent="Answer: "+result;
}

if(window.AccessBridgeAI){
AccessBridgeAI.speak(
"The answer is "+result
);
}
}

async function initCamera(){
if(typeof startObjectCamera==="function"){
await startObjectCamera();
}else if(window.AccessBridgeAI){
AccessBridgeAI.speak(
"The object scanner is not available."
);
}
}

async function scanObject(){
if(typeof scanCurrentObject==="function"){
await scanCurrentObject();
}else if(window.AccessBridgeAI){
AccessBridgeAI.speak(
"The object scanner is not available."
);
}
}

function stopCamera(){
if(typeof stopObjectCamera==="function"){
stopObjectCamera();
}
}

function clearHistory(){
try{
localStorage.removeItem("accessbridge_history");
}catch(e){
console.error(e);
}

const list=$("historyList");

if(list){
list.innerHTML=
'<p class="empty-history">No recent activity.</p>';
}
}

function closePanel(id){
const element=$(id);
if(element)element.classList.add("hidden");

if(id==="scannerPanel"&&typeof stopObjectCamera==="function"){
stopObjectCamera();
}
}

function setup(){

loadHistory();

const listenButton=$("listenBtn");

if(listenButton){
listenButton.addEventListener("click",()=>{
if(window.AccessBridgeAI){
AccessBridgeAI.start();
}
});
}

document.querySelectorAll(".action-card").forEach(button=>{
button.addEventListener("click",()=>{
const command=button.dataset.command||"";

if(window.AccessBridgeAI){
AccessBridgeAI.handle(command);
}
});
});

const calculatorButton=$("calculatorBtn");

if(calculatorButton){
calculatorButton.addEventListener(
"click",
()=>openPanel("calculatorPanel")
);
}

const scannerButton=$("scannerBtn");

if(scannerButton){
scannerButton.addEventListener(
"click",
()=>openPanel("scannerPanel")
);
}

const readerButton=$("readerBtn");

if(readerButton){
readerButton.addEventListener(
"click",
()=>openPanel("readerPanel")
);
}

const communicationButton=$("communicationBtn");

if(communicationButton){
communicationButton.addEventListener(
"click",
openCommunication
);
}

const calculateButton=$("calculateBtn");

if(calculateButton){
calculateButton.addEventListener(
"click",
calculateManual
);
}

const startCameraButton=$("startCameraBtn");

if(startCameraButton){
startCameraButton.addEventListener(
"click",
initCamera
);
}

const scanObjectButton=$("scanObjectBtn");

if(scanObjectButton){
scanObjectButton.addEventListener(
"click",
scanObject
);
}

const stopCameraButton=$("stopCameraBtn");

if(stopCameraButton){
stopCameraButton.addEventListener(
"click",
stopCamera
);
}

const readTextButton=$("readTextBtn");

if(readTextButton){
readTextButton.addEventListener("click",()=>{
const input=$("readerInput");
const text=input?input.value.trim():"";

if(!text){
if(window.AccessBridgeAI){
AccessBridgeAI.speak(
"Please enter some text first."
);
}
return;
}

if(window.AccessBridgeAI){
AccessBridgeAI.speak(text);
}
});
}

const clearHistoryButton=$("clearHistoryBtn");

if(clearHistoryButton){
clearHistoryButton.addEventListener(
"click",
clearHistory
);
}

document.querySelectorAll("[data-close]").forEach(button=>{
button.addEventListener("click",()=>{
const id=button.dataset.close;
closePanel(id);
});
});

const settingsButton=$("settingsBtn");

if(settingsButton){
settingsButton.addEventListener("click",()=>{
if(typeof openSettings==="function"){
openSettings();
}else if(window.AccessBridgeAI){
AccessBridgeAI.speak(
"Settings are available through the accessibility controls."
);
}
});
}

if(
window.AccessBridgeCommunication&&
typeof AccessBridgeCommunication.init==="function"
){
AccessBridgeCommunication.init();
}
}

document.addEventListener(
"DOMContentLoaded",
setup
);

window.showStatus=showStatus;
window.setListening=setListening;
window.addHistory=addHistory;
window.openScanner=openScanner;
window.openReader=openReader;
window.openCommunication=openCommunication;
window.showCalculation=showCalculation;