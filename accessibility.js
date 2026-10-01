let originalFontSize="100%";

function increaseText(){
document.documentElement.style.fontSize="112%";
show("Text increased","Text size has been increased.");
speak("Text size increased.");
}

function decreaseText(){
document.documentElement.style.fontSize="100%";
show("Text restored","Text size has been restored.");
speak("Text size restored.");
}

function toggleHighContrast(){
const enabled=!document.body.classList.contains("high-contrast");

document.body.classList.toggle("high-contrast",enabled);

if(enabled){
show("High contrast ON","High contrast mode is enabled.");
speak("High contrast enabled.");
}else{
show("High contrast OFF","High contrast mode is disabled.");
speak("High contrast disabled.");
}
}

function enableHighContrast(){
if(!document.body.classList.contains("high-contrast")){
document.body.classList.add("high-contrast");
}
}

function disableHighContrast(){
document.body.classList.remove("high-contrast");
}

function resetAccessibility(){
document.documentElement.style.fontSize=originalFontSize;
document.body.classList.remove("high-contrast");
show("Accessibility reset","Accessibility settings restored.");
speak("Accessibility settings restored.");
}