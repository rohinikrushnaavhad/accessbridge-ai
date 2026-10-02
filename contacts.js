const ACCESS_CONTACTS_KEY="accessbridge_contacts_v1";

function getContacts(){
try{
const data=JSON.parse(localStorage.getItem(ACCESS_CONTACTS_KEY)||"[]");
return Array.isArray(data)?data:[];
}catch(error){
return[];
}
}

function saveContacts(contacts){
localStorage.setItem(ACCESS_CONTACTS_KEY,JSON.stringify(contacts));
}

function normalizeContactName(name){
return String(name||"")
.toLowerCase()
.replace(/[^\w\s]/g,"")
.replace(/\s+/g," ")
.trim();
}

function normalizePhone(phone){
return String(phone||"")
.replace(/[^\d+]/g,"")
.trim();
}

function addContact(name,phone){
name=String(name||"").trim();
phone=normalizePhone(phone);

if(!name||!phone){
return{success:false,message:"Contact name and phone number are required."};
}

const contacts=getContacts();
const normalized=normalizeContactName(name);

const existing=contacts.find(c=>normalizeContactName(c.name)===normalized);

if(existing){
existing.name=name;
existing.phone=phone;
saveContacts(contacts);
return{success:true,message:`${name}'s contact has been updated.`,contact:existing};
}

const contact={
id:Date.now().toString(),
name,
phone
};

contacts.push(contact);
saveContacts(contacts);

return{
success:true,
message:`${name} has been added to your contacts.`,
contact
};
}

function removeContact(name){
const normalized=normalizeContactName(name);
const contacts=getContacts();
const filtered=contacts.filter(c=>normalizeContactName(c.name)!==normalized);

if(filtered.length===contacts.length){
return{success:false,message:`I could not find ${name} in your contacts.`};
}

saveContacts(filtered);

return{
success:true,
message:`${name} has been removed from your contacts.`
};
}

function findContact(name){
const normalized=normalizeContactName(name);
const contacts=getContacts();

if(!normalized)return null;

let contact=contacts.find(
c=>normalizeContactName(c.name)===normalized
);

if(contact)return contact;

contact=contacts.find(
c=>normalizeContactName(c.name).includes(normalized)
);

if(contact)return contact;

contact=contacts.find(
c=>normalized.includes(normalizeContactName(c.name))
);

return contact||null;
}

function getAllContacts(){
return getContacts();
}

function callContact(name){
const contact=findContact(name);

if(!contact){
return{
success:false,
message:`I could not find ${name} in your contacts.`
};
}

const phone=normalizePhone(contact.phone);

if(!phone){
return{
success:false,
message:`${contact.name} does not have a valid phone number.`
};
}

return{
success:true,
message:`Calling ${contact.name}.`,
contact,
tel:"tel:"+phone
};
}

function speakContactList(){
const contacts=getContacts();

if(!contacts.length){
return"No contacts have been saved yet.";
}

if(contacts.length===1){
return`You have one saved contact, ${contacts[0].name}.`;
}

const names=contacts.map(c=>c.name).join(", ");

return`You have ${contacts.length} saved contacts: ${names}.`;
}

window.AccessBridgeContacts={
getContacts,
addContact,
removeContact,
findContact,
getAllContacts,
callContact,
speakContactList
};