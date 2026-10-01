let currentNewsCategory="top";
let newsCache={};
const NEWS_FEEDS={
top:"https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
india:"https://news.google.com/rss/search?q=India&hl=en-IN&gl=IN&ceid=IN:en",
technology:"https://news.google.com/rss/search?q=technology&hl=en-IN&gl=IN&ceid=IN:en",
science:"https://news.google.com/rss/search?q=science&hl=en-IN&gl=IN&ceid=IN:en",
sports:"https://news.google.com/rss/search?q=sports&hl=en-IN&gl=IN&ceid=IN:en",
business:"https://news.google.com/rss/search?q=business&hl=en-IN&gl=IN&ceid=IN:en"
};
const NEWS_PROXY="https://api.allorigins.win/raw?url=";
function newsEscape(value){
return String(value||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function cleanNewsText(text){
const temp=document.createElement("div");
temp.innerHTML=text||"";
return temp.textContent.replace(/\s+/g," ").trim();
}
function getNewsTime(date){
const d=new Date(date);
if(Number.isNaN(d.getTime()))return"Latest";
const diff=Math.floor((Date.now()-d.getTime())/60000);
if(diff<1)return"Just now";
if(diff<60)return`${diff} min ago`;
const hours=Math.floor(diff/60);
if(hours<24)return`${hours} hr ago`;
return d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
}
function getSource(title){
const parts=String(title||"").split(" - ");
return parts.length>1?parts[parts.length-1]:"News";
}
function parseNews(xml){
const doc=new DOMParser().parseFromString(xml,"text/xml");
return[...doc.querySelectorAll("item")].slice(0,15).map(item=>{
const title=cleanNewsText(item.querySelector("title")?.textContent);
const description=cleanNewsText(item.querySelector("description")?.textContent);
const link=item.querySelector("link")?.textContent?.trim()||"#";
const pubDate=item.querySelector("pubDate")?.textContent||"";
return{title:title.replace(/\s+-\s+[^-]+$/,""),description:description.slice(0,150),link,date:pubDate,source:getSource(title)};
}).filter(x=>x.title);
}
async function fetchNews(category){
const feed=NEWS_FEEDS[category]||NEWS_FEEDS.top;
const url=NEWS_PROXY+encodeURIComponent(feed);
const response=await fetch(url,{cache:"no-store"});
if(!response.ok)throw new Error("News service unavailable");
const xml=await response.text();
const items=parseNews(xml);
if(!items.length)throw new Error("No stories found");
return items;
}
function renderNews(items){
const box=document.getElementById("newsList");
if(!box)return;
if(!items.length){
box.innerHTML='<div class="news-error">No stories are available right now.</div>';
return;
}
box.innerHTML=items.map((item,index)=>`
<article class="news-card">
<div class="news-meta">
<span>${newsEscape(item.source||currentNewsCategory)}</span>
<span>${newsEscape(getNewsTime(item.date))}</span>
</div>
<h2>${newsEscape(item.title)}</h2>
<p>${newsEscape(item.description||"Open the story to read the full report.")}</p>
<div class="news-actions">
<button class="read-story" data-index="${index}">Read story →</button>
<button class="speak-story" data-index="${index}" aria-label="Read headline aloud">◉</button>
</div>
</article>`).join("");
box.querySelectorAll(".read-story").forEach(btn=>btn.addEventListener("click",()=>{
const item=items[Number(btn.dataset.index)];
if(item?.link&&item.link!=="#")window.open(item.link,"_blank");
}));
box.querySelectorAll(".speak-story").forEach(btn=>btn.addEventListener("click",()=>{
const item=items[Number(btn.dataset.index)];
if(typeof speak==="function")speak(item.title);
}));
}
async function loadNews(force=false){
const status=document.getElementById("newsStatus");
const box=document.getElementById("newsList");
if(!status||!box)return;
if(!force&&newsCache[currentNewsCategory]){
renderNews(newsCache[currentNewsCategory]);
status.textContent=`Latest ${currentNewsCategory} stories`;
return;
}
status.textContent="Loading latest stories...";
box.innerHTML="";
try{
const items=await fetchNews(currentNewsCategory);
newsCache[currentNewsCategory]=items;
renderNews(items);
status.textContent=`Updated just now • ${items.length} stories`;
}catch(error){
box.innerHTML='<div class="news-error">News could not be loaded right now.<br>Please try refreshing.</div>';
status.textContent="Unable to connect to the news service";
}
}
function initNews(){
document.querySelectorAll(".category").forEach(btn=>{
btn.addEventListener("click",()=>{
document.querySelectorAll(".category").forEach(x=>x.classList.remove("active"));
btn.classList.add("active");
currentNewsCategory=btn.dataset.category;
loadNews();
});
});
const refresh=document.getElementById("refreshNewsBtn");
if(refresh)refresh.addEventListener("click",()=>loadNews(true));
}
document.addEventListener("DOMContentLoaded",initNews);