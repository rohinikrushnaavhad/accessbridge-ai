const NEWS_CONFIG={
language:"en-IN",
country:"IN",
maxItems:10
};

const NEWS_FEEDS={
top:"https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
india:"https://news.google.com/rss/search?q=India&hl=en-IN&gl=IN&ceid=IN:en",
technology:"https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en",
sports:"https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en",
business:"https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en",
science:"https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-IN&gl=IN&ceid=IN:en"
};

const newsList=document.getElementById("newsList");
const newsStatus=document.getElementById("newsStatus");
const newsStatusDot=document.getElementById("newsStatusDot");
const newsUpdated=document.getElementById("newsUpdated");
const refreshNews=document.getElementById("refreshNews");
const newsTabs=document.querySelectorAll(".news-tab");

let currentNewsCategory="top";
let newsLoading=false;

function escapeNewsHTML(text){
const div=document.createElement("div");
div.textContent=String(text||"");
return div.innerHTML;
}

function cleanNewsText(text){
return String(text||"")
.replace(/<[^>]*>/g," ")
.replace(/&nbsp;/gi," ")
.replace(/&amp;/gi,"&")
.replace(/&quot;/gi,'"')
.replace(/&#39;/gi,"'")
.replace(/\s+/g," ")
.trim();
}

function setNewsStatus(text,mode="ready"){
newsStatus.textContent=text;

if(mode==="loading"){
newsStatusDot.style.background="#ffd166";
newsStatusDot.style.boxShadow="0 0 8px #ffd166";
}

else if(mode==="error"){
newsStatusDot.style.background="#ff5c7a";
newsStatusDot.style.boxShadow="0 0 8px #ff5c7a";
}

else{
newsStatusDot.style.background="#00d4ff";
newsStatusDot.style.boxShadow="0 0 8px #00d4ff";
}
}

function formatNewsTime(dateString){

if(!dateString)return"";

const date=new Date(dateString);

if(Number.isNaN(date.getTime()))return"";

return date.toLocaleString("en-IN",{
day:"numeric",
month:"short",
hour:"numeric",
minute:"2-digit"
});
}

function renderNews(items){

if(!items.length){

newsList.innerHTML=
'<div class="news-empty">No headlines were found right now. Try refreshing.</div>';

return;
}

newsList.innerHTML="";

items.slice(0,NEWS_CONFIG.maxItems).forEach(item=>{

const card=document.createElement("article");

card.className="news-card";

const title=escapeNewsHTML(item.title);
const source=escapeNewsHTML(item.source);
const description=escapeNewsHTML(item.description);
const published=escapeNewsHTML(formatNewsTime(item.published));

card.innerHTML=
'<div class="news-card-top">'+
'<span class="news-source">'+
(source||"NEWS")+
'</span>'+
'<span class="news-time">'+
published+
'</span>'+
'</div>'+
'<a class="news-title" href="'+
escapeNewsHTML(item.link)+
'" target="_blank" rel="noopener noreferrer">'+
title+
'</a>'+
(description?
'<p class="news-description">'+
description+
'</p>':
"")+
'<a class="news-open" href="'+
escapeNewsHTML(item.link)+
'" target="_blank" rel="noopener noreferrer">READ STORY →</a>';

newsList.appendChild(card);
});
}

function parseRSS(xmlText){

const parser=new DOMParser();

const xml=parser.parseFromString(
xmlText,
"application/xml"
);

const parserError=xml.querySelector("parsererror");

if(parserError){
throw new Error("Unable to read the news feed.");
}

const nodes=[
...xml.querySelectorAll("item")
];

return nodes.map(item=>{

const title=item.querySelector("title")?.textContent||"";

const link=item.querySelector("link")?.textContent||"";

const description=
item.querySelector("description")?.textContent||"";

const pubDate=
item.querySelector("pubDate")?.textContent||"";

const source=
item.querySelector("source")?.textContent||"";

return{
title:cleanNewsText(title),
link:link.trim(),
description:cleanNewsText(description).slice(0,180),
published:pubDate,
source:cleanNewsText(source)
};

}).filter(item=>item.title&&item.link);
}

async function loadNews(category=currentNewsCategory){

if(newsLoading)return;

newsLoading=true;

setNewsStatus(
"Loading latest headlines...",
"loading"
);

newsList.innerHTML=
'<div class="news-loading">'+
'<div class="loader"></div>'+
'<p>Fetching the latest headlines...</p>'+
'</div>';

try{

const feedURL=NEWS_FEEDS[category];

if(!feedURL){
throw new Error("News category not found.");
}

/*
Google News RSS is a public feed.
The allorigins proxy converts the XML feed into
a browser-readable response for GitHub Pages.
*/

const proxyURL=
"https://api.allorigins.win/raw?url="+
encodeURIComponent(feedURL);

const response=await fetch(
proxyURL,
{
cache:"no-store"
}
);

if(!response.ok){
throw new Error(
"News service returned HTTP "+
response.status
);
}

const xmlText=await response.text();

const items=parseRSS(xmlText);

renderNews(items);

const now=new Date().toLocaleTimeString(
"en-IN",
{
hour:"numeric",
minute:"2-digit"
}
);

newsUpdated.textContent="Updated "+now;

setNewsStatus(
items.length+" headlines available",
"ready"
);

}catch(error){

console.error(
"NEWS ERROR:",
error
);

newsList.innerHTML=
'<div class="news-error">'+
'News could not be loaded right now.<br>'+
'Please try the refresh button again.'+
'</div>';

setNewsStatus(
"Unable to load news",
"error"
);

}finally{

newsLoading=false;
}
}

function selectNewsCategory(category){

if(!NEWS_FEEDS[category])return;

currentNewsCategory=category;

newsTabs.forEach(tab=>{
tab.classList.toggle(
"active",
tab.dataset.category===category
);
});

loadNews(category);
}

newsTabs.forEach(tab=>{

tab.addEventListener(
"click",
()=>{
selectNewsCategory(
tab.dataset.category
);
}
);

});

if(refreshNews){

refreshNews.addEventListener(
"click",
()=>{
loadNews(currentNewsCategory);
}
);
}

window.loadNews=loadNews;

loadNews("top");