const AccessBridgeContacts={
Vaibhav:"+918830234108",
Sister:"+918788109287",
Friend:"+919356640158",
Yash:"+919860070415"
};

function normalizeContactName(name){
return String(name||"").toLowerCase().trim().replace(/\s+/g," ");
}

function findContact(name){
const wanted=normalizeContactName(name);
for(const key of Object.keys(AccessBridgeContacts)){
if(normalizeContactName(key)===wanted)return{name:key,phone:AccessBridgeContacts[key]};
}
for(const key of Object.keys(AccessBridgeContacts)){
const k=normalizeContactName(key);
if(k.includes(wanted)||wanted.includes(k))return{name:key,phone:AccessBridgeContacts[key]};
}
return null;
}

function getContacts(){
return AccessBridgeContacts;
}

window.AccessBridgeContacts=AccessBridgeContacts;
window.findContact=findContact;
window.getContacts=getContacts;