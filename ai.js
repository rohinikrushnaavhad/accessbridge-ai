const AI_CONFIG={
 assistantName:"AccessBridge",
 language:"en-IN",
 mode:"voice"
};

function normalizeCommand(text){
 return text.toLowerCase().replace(/[!?.,]/g,"").trim();
}

function detectIntent(text){
 const t=normalizeCommand(text);

 if(/\b(hello|hi|hey|good morning|good evening)\b/.test(t))return"greeting";
 if(/\b(time|clock|current time)\b/.test(t))return"time";
 if(/\b(date|today|day is it)\b/.test(t))return"date";
 if(/\b(open|launch|start).*(google)\b/.test(t))return"google";
 if(/\b(open|launch|start).*(youtube)\b/.test(t))return"youtube";
 if(/\b(stop|sleep|goodbye|shut down assistant)\b/.test(t))return"stop";
 if(/\b(increase|larger|bigger).*(text|font|letters)\b/.test(t))return"text_increase";
 if(/\b(decrease|smaller).*(text|font|letters)\b/.test(t))return"text_decrease";
 if(/\b(high contrast|contrast mode)\b/.test(t))return"contrast";

 return"unknown";
}

function getIntentResponse(text){
 const intent=detectIntent(text);
 return{intent,text};
}