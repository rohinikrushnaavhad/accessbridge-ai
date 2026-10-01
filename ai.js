const AI_CONFIG={
assistantName:"AccessBridge",
language:"en-IN",
mode:"voice",
version:"1.0"
};

function normalizeCommand(text){
return String(text||"")
.toLowerCase()
.replace(/[!?.,;:]/g,"")
.replace(/\s+/g," ")
.trim();
}

function detectIntent(text){

const t=normalizeCommand(text);

if(!t)return"unknown";

if(/\b(hello|hi|hey|namaste|good morning|good afternoon|good evening)\b/.test(t))
return"greeting";

if(/\b(what is the time|what's the time|what time is it|time|current time|clock)\b/.test(t))
return"time";

if(/\b(what is the date|what's the date|today's date|today date|today|date|which day is today)\b/.test(t))
return"date";

if(/\b(open|launch|start|go to).*\b(google)\b/.test(t))
return"google";

if(/\b(open|launch|start|go to).*\b(youtube|you tube)\b/.test(t))
return"youtube";

if(/\b(increase|increase the|make).*(text|font|letters|size).*(bigger|larger|large|increase)?\b/.test(t))
return"text_increase";

if(/\b(make|set).*(text|font|letters|size).*(bigger|larger|large)\b/.test(t))
return"text_increase";

if(/\b(decrease|decrease the|make).*(text|font|letters|size).*(smaller|small|decrease)?\b/.test(t))
return"text_decrease";

if(/\b(make|set).*(text|font|letters|size).*(smaller|small)\b/.test(t))
return"text_decrease";

if(/\b(turn on|turn the|enable|activate|switch on|use).*(high contrast|contrast|contrast mode)\b/.test(t))
return"contrast_on";

if(/\b(high contrast|contrast mode|contrast)\b.*\b(on|enable|enabled)\b/.test(t))
return"contrast_on";

if(/\b(turn off|turn the|disable|deactivate|switch off).*(high contrast|contrast|contrast mode)\b/.test(t))
return"contrast_off";

if(/\b(high contrast|contrast mode|contrast)\b.*\b(off|disable|disabled)\b/.test(t))
return"contrast_off";

if(/\b(toggle|change).*(high contrast|contrast|contrast mode)\b/.test(t))
return"contrast_toggle";

if(/\b(stop|sleep|goodbye|bye|shut down assistant|go to sleep)\b/.test(t))
return"stop";

if(/\b(reset|restore).*(accessibility|settings)\b/.test(t))
return"accessibility_reset";

return"unknown";
}

function getIntentResponse(text){
return{
intent:detectIntent(text),
text:String(text||"")
};
}