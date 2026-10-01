function increaseText(){
 document.documentElement.style.fontSize="112%";
 speak("Text size increased.");
}

function decreaseText(){
 document.documentElement.style.fontSize="100%";
 speak("Text size restored.");
}

function toggleHighContrast(){
 document.body.classList.toggle("high-contrast");
 speak(document.body.classList.contains("high-contrast")?"High contrast enabled.":"High contrast disabled.");
}