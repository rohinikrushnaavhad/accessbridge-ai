const NEWS_API="https://accessbridge-ai.gawalivaibhav883.workers.dev/news";
let currentNewsCategory="top";
let newsLoading=false;
let currentNewsArticles=[];

const NEWS_CATEGORIES={
top:"Top",
india:"India",
technology:"Technology",
science:"Science",
sports:"Sports",
business:"Business"
};

function newsEscape(value){
return String(value||"").replace(/[&<>"']/g,m=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#039;"
}[m]));
}

function newsTime(value){
if(!value)return"";
const date=new Date(value);
if(Number.isNaN(date.getTime()))return"";
return date.toLocaleString("en-IN",{
day:"numeric",
month:"short",
hour:"numeric",
minute:"2-digit"
});
}

function newsImageFallback(){
return"";
}

function renderNews(articles){
const box=document.getElementById("newsList");
if(!box)return;

if(!articles||!articles.length){
box.innerHTML=`
<div class="news-error">
<strong>No stories found</strong>
<span>There are no articles available for this category right now.</span>
</div>`;
return;
}

box.innerHTML=articles.map((article,index)=>{

const title=newsEscape(article.title);
const description=newsEscape(article.description||"Latest news from "+(article.source||"BBC News")+".");
const source=newsEscape(article.source||"BBC News");
const published=newsEscape(newsTime(article.publishedAt));
const link=newsEscape(article.link);

return`
<article class="news-card">
<div class="news-number">${String(index+1).padStart(2,"0")}</div>
<div class="news-content">
<div class="news-meta">
<span>${source}</span>
${published?`<span>•</span><span>${published}</span>`:""}
</div>
<h2>${title}</h2>
<p>${description}</p>
<div class="news-actions">
<button class="read-story" data-text="${newsEscape(article.title+" . "+(article.description||""))}">
<span>▶</span> Listen
</button>
<a class="read-story" href="${link}" target="_blank" rel="noopener noreferrer">
<span>↗</span> Open
</a>
</div>
</div>
</article>`;
}).join("");

box.querySelectorAll(".read-story[data-text]").forEach(button=>{
button.addEventListener("click",()=>{
const text=button.dataset.text||"";
if(typeof speak==="function")speak(text);
});
});
}

function setNewsStatus(text){
const status=document.getElementById("newsStatus");
if(status)status.textContent=text;
}

async function loadNews(force=false){
if(newsLoading&&!force)return;

newsLoading=true;

const category=currentNewsCategory;

setNewsStatus("Loading latest "+NEWS_CATEGORIES[category].toLowerCase()+" news...");

const box=document.getElementById("newsList");

if(box){
box.innerHTML=`
<div class="news-loading">
<div class="loading-spinner"></div>