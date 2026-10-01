const AI_CONFIG={
 assistantName:"AccessBridge",
 language:"en-IN",
 mode:"voice"
};

function normalizeCommand(text){
 return text
  .toLowerCase()
  .replace(/[!?.,]/g,"")
  .trim();
}

function detectIntent(text){
 const t=normalizeCommand(text);

 if(t.includes("time"))return"time";
 if(t.includes("date")||t.includes("today"))return"date";
 if(t.includes("open google"))return"google";
 if(t.includes("open youtube"))return"youtube";
 if(t.includes("hello")||t.includes("hi"))return"greeting";
 if(t.includes("stop")||t.includes("sleep"))return"stop";

 return"ai";
}