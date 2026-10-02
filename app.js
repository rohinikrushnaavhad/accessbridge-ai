const $=id=>document.getElementById(id);

const panels=[
"scannerPanel",
"calculatorPanel",
"readerPanel"
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

const list=$("historyList");

if(!list)return;

const empty=list.querySelector(".empty-history");

if(empty)empty.remove();

const item=document.createElement("div");

item.className="history-item";

const strong=document.createElement("strong");

strong.textContent=text;

const span=document.createElement("span");

span.textContent=
new Date().toLocaleTimeString("en-IN",{
hour:"numeric",
minute:"2-digit"
});

item.append(strong,span);

list.prepend(item);

while(list.children.length>8){
list.lastElementChild.remove();
}

try{

const history=
JSON.parse(
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

}catch(e){}

}

function loadHistory(){

try{

const history=
JSON.parse(
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

span.textContent=
new Date(item.time).toLocaleTimeString("en-IN",{
hour:"numeric",
minute:"2-digit"
});

row.append(strong,span);

list.append(row);

});

}catch(e){}

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

function showCalculation(expression,result){

openPanel("calculatorPanel");

const input=$("calculationInput");
const output=$("calculationResult");

if(input)input.value=expression;

if(output)output.textContent="Answer: "+result;

}

function calculateManual(){

const input=$("calculationInput");

if(!input)return;

const result=
AccessBridgeAI.calculate(input.value);

if(result===null){

$("calculationResult").textContent=
"I could not understand that calculation.";

AccessBridgeAI.speak(
"I could not understand that calculation."
);

}else{

$("calculationResult").textContent=
"Answer: "+result;

AccessBridgeAI.speak(
"The answer is "+result
);

}

}

async function initCamera(){

if(typeof startObjectCamera==="function"){

await startObjectCamera();

}else{

AccessBridgeAI.speak(
"The object scanner is not available."
);

}

}

async function scanObject(){

if(typeof scanCurrentObject==="function"){

await scanCurrentObject();

}else{

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

localStorage.removeItem("accessbridge_history");

const list=$("historyList");

if(list){

list.innerHTML=
'<p class="empty-history">No recent activity.</p>';

}

}

function setup(){

loadHistory();

$("listenBtn")?.addEventListener(
"click",
()=>{
AccessBridgeAI.start();
}
);

document
.querySelectorAll(".action-card")
.forEach(button=>{

button.addEventListener(
"click",
()=>{
AccessBridgeAI.handle(
button.dataset.command||""
);
}
);

});

$("calculatorBtn")?.addEventListener(
"click",
()=>openPanel("calculatorPanel")
);

$("scannerBtn")?.addEventListener(
"click",
()=>openPanel("scannerPanel")
);

$("readerBtn")?.addEventListener(
"click",
()=>openPanel("readerPanel")
);

$("calculateBtn")?.addEventListener(
"click",
calculateManual
);

$("startCameraBtn")?.addEventListener(
"click",
initCamera
);

$("scanObjectBtn")?.addEventListener(
"click",
scanObject
);

$("stopCameraBtn")?.addEventListener(
"click",
stopCamera
);

$("readTextBtn")?.addEventListener(
"click",
()=>{

const text=
$("readerInput")?.value.trim();

if(!text){

AccessBridgeAI.speak(
"Please enter some text first."
);

return;
}

AccessBridgeAI.speak(text);

}
);

$("clearHistoryBtn")?.addEventListener(
"click",
clearHistory
);

document
.querySelectorAll("[data-close]")
.forEach(button=>{

button.addEventListener(
"click",
()=>{

const id=button.dataset.close;

$(id)?.classList.add("hidden");

}
);

});

$("settingsBtn")?.addEventListener(
"click",
()=>{

if(typeof openSettings==="function"){

openSettings();

}else{

AccessBridgeAI.speak(
"Settings are available through the accessibility controls."
);

}

}
);

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
window.showCalculation=showCalculation;