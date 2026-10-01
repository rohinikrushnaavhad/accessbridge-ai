function increaseText(){
document.documentElement.style.fontSize="112%";

if(typeof show==="function"){
show("Text increased","Text size has been increased.");
}

if(typeof speak==="function"){
speak("Text size increased.");
}
}

function decreaseText(){
document.documentElement.style.fontSize="100%";

if(typeof show==="function"){
show("Text restored","Text size has been restored.");
}

if(typeof speak==="function"){
speak("Text size restored.");
}
}

function enableHighContrast(){
document.body.classList.add("high-contrast");
}

function disableHighContrast(){
document.body.classList.remove("high-contrast");
}

function toggleHighContrast(){

const enabled=!document.body.classList.contains("high-contrast");

document.body.classList.toggle("high-contrast",enabled);

if(typeof show==="function"){
show(
enabled?"High contrast ON":"High contrast OFF",
enabled?"High contrast mode is enabled.":"High contrast mode is disabled."
);
}

if(typeof speak==="function"){
speak(
enabled?"High contrast enabled.":"High contrast disabled."
);
}
}

function resetAccessibility(){

document.documentElement.style.fontSize="100%";
document.body.classList.remove("high-contrast");

if(typeof show==="function"){
show(
"Accessibility reset",
"Accessibility settings have been restored."
);
}

if(typeof speak==="function"){
speak("Accessibility settings restored.");
}
}