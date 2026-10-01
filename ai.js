function detectIntent(text){
 const t=normalizeCommand(text);

 if(/\b(hello|hi|hey|good morning|good evening)\b/.test(t))return"greeting";
 if(/\b(time|what time|current time|clock)\b/.test(t))return"time";
 if(/\b(date|today|what day|which day)\b/.test(t))return"date";

 if(/\b(open|launch|start).*(google)\b/.test(t))return"google";
 if(/\b(open|launch|start).*(youtube)\b/.test(t))return"youtube";

 if(/\b(increase|larger|bigger|zoom in).*(text|font|letters|size)\b/.test(t))return"text_increase";
 if(/\b(decrease|smaller|zoom out).*(text|font|letters|size)\b/.test(t))return"text_decrease";

 if(/\b(high contrast|contrast|contrast mode)\b/.test(t))return"contrast";

 if(/\b(stop|sleep|goodbye|shut down assistant)\b/.test(t))return"stop";

 return"unknown";
}