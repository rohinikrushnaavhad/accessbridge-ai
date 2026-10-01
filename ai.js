const AI_CONFIG={
assistantName:"AccessBridge",
wakeName:"access",
language:"en-IN",
mode:"voice",
version:"2.0"
};

function normalizeCommand(text){

return String(text||"")
.toLowerCase()
.replace(/[!?.,;:]/g,"")
.replace(/\s+/g," ")
.trim();
}

function removeWakeWord(text){

let t=normalizeCommand(text);

const wakeWords=[
"access",
"access bridge",
"accessbridge",
"hey access",
"hey access bridge"
];

for(const word of wakeWords){

if(t===word){
return"";
}

if(t.startsWith(word+" ")){
return t.slice(word.length).trim();
}
}

return t;
}

function hasWakeWord(text){

const t=normalizeCommand(text);

return(
t==="access"||
t.startsWith("access ")||
t==="access bridge"||
t.startsWith("access bridge ")||
t==="accessbridge"||
t.startsWith("accessbridge ")||
t.startsWith("hey access ")||
t.startsWith("hey access bridge ")
);
}

function detectIntent(text){

const t=removeWakeWord(text);

if(!t)return"wake";

if(/\b(hello|hi|hey|namaste|good morning|good afternoon|good evening)\b/.test(t))
return"greeting";

if(/\b(what is the time|what's the time|what time is it|tell me the time|current time|time|clock)\b/.test(t))
return"time";

if(/\b(what is the date|what's the date|today's date|today date|tell me the date|what day is today|which day is today|date)\b/.test(t))
return"date";

if(/\b(open|launch|start|go to|visit).*\b(google)\b/.test(t))
return"google";

if(/\b(open|launch|start|go to|visit).*\b(youtube|you tube)\b/.test(t))
return"youtube";

if(/\b(increase|enlarge|enlarge the|make).*(text|font|letters|writing|size).*(bigger|larger|large|increase|greater)?\b/.test(t))
return"text_increase";

if(/\b(make|set|change).*(text|font|letters|writing|size).*(bigger|larger|large)\b/.test(t))
return"text_increase";

if(/\b(decrease|reduce|reduce the|make).*(text|font|letters|writing|size).*(smaller|small|decrease|less)?\b/.test(t))
return"text_decrease";

if(/\b(make|set|change).*(text|font|letters|writing|size).*(smaller|small)\b/.test(t))
return"text_decrease";

if(/\b(turn on|enable|activate|switch on).*(high contrast|contrast|contrast mode)\b/.test(t))
return"contrast_on";

if(/\b(high contrast|contrast mode|contrast)\b.*\b(on|enable|enabled)\b/.test(t))
return"contrast_on";

if(/\b(turn off|disable|deactivate|switch off).*(high contrast|contrast|contrast mode)\b/.test(t))
return"contrast_off";

if(/\b(high contrast|contrast mode|contrast)\b.*\b(off|disable|disabled)\b/.test(t))
return"contrast_off";

if(/\b(toggle|change).*(high contrast|contrast|contrast mode)\b/.test(t))
return"contrast_toggle";

if(/\b(reset|restore).*(accessibility|accessibility settings|settings)\b/.test(t))
return"accessibility_reset";

if(/\b(stop|sleep|goodbye|bye|shut down assistant|go to sleep)\b/.test(t))
return"stop";

return"unknown";
}

function getIntentResponse(text){

return{
intent:detectIntent(text),
text:String(text||""),
wakeWord:hasWakeWord(text),
cleanText:removeWakeWord(text)
};
}