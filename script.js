/* Market Auto - Marketing Automation CRM
   Task: WD-CRM-005 | Data Alcott Systems
   Frontend-only demo. Data is stored in JavaScript and browser localStorage.
*/
"use strict";

const STORAGE_KEY = "marketAutoCRM_v1";
const today = new Date();
const isoDate = (date = today) => date.toISOString().slice(0, 10);
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return isoDate(d); };

const demoData = {
  user: { name: "Asmitha R", email: "ashmita@example.com" },
  campaigns: [
    {id:1,name:"Summer Sale 2026",type:"Promotional",status:"completed",audience:"All Subscribers",sent_date:daysAgo(4),open_rate:45.2,click_rate:12.8,created_at:daysAgo(12),conversions:34},
    {id:2,name:"Product Launch: New Collection",type:"Product Update",status:"scheduled",audience:"Engaged Subscribers",sent_date:daysAgo(-3),open_rate:0,click_rate:0,created_at:daysAgo(5),conversions:0},
    {id:3,name:"Monthly Community Newsletter",type:"Newsletter",status:"in-progress",audience:"All Subscribers",sent_date:daysAgo(1),open_rate:38.6,click_rate:9.4,created_at:daysAgo(3),conversions:18},
    {id:4,name:"Welcome to the Community",type:"Email Campaign",status:"draft",audience:"New Subscribers",sent_date:"",open_rate:0,click_rate:0,created_at:daysAgo(2),conversions:0}
  ],
  subscribers: [
    {id:1,name:"John Smith",email:"john@email.com",status:"active",segment:"Engaged",subscribed_date:"2026-01-15"},
    {id:2,name:"Sarah Johnson",email:"sarah@email.com",status:"active",segment:"VIP",subscribed_date:"2026-02-20"},
    {id:3,name:"Michael Brown",email:"michael@email.com",status:"active",segment:"New",subscribed_date:daysAgo(8)},
    {id:4,name:"Priya Kumar",email:"priya@email.com",status:"active",segment:"Engaged",subscribed_date:daysAgo(15)},
    {id:5,name:"David Wilson",email:"david@email.com",status:"unsubscribed",segment:"General",subscribed_date:"2026-03-11"},
    {id:6,name:"Emma Davis",email:"emma@email.com",status:"active",segment:"VIP",subscribed_date:daysAgo(2)}
  ],
  templates: [
    {id:1,name:"Welcome email",subject:"Welcome to our community!",category:"Onboarding",content:"Thanks for joining us. We're glad you're here."},
    {id:2,name:"Product announcement",subject:"Something exciting is here",category:"Product",content:"Discover what's new and explore our latest update."},
    {id:3,name:"Weekly newsletter",subject:"Your weekly update",category:"Newsletter",content:"Here are this week's highlights and updates."}
  ],
  workflows: [
    {id:1,name:"Welcome new subscribers",trigger:"When a subscriber joins",description:"Send a welcome email and introduce your brand.",status:true,steps:3},
    {id:2,name:"Customer nurture sequence",trigger:"When a contact is tagged Engaged",description:"Share useful content over a short email sequence.",status:true,steps:4},
    {id:3,name:"Abandoned cart reminder",trigger:"When a cart is left incomplete",description:"Send a friendly reminder to revisit saved items.",status:false,steps:2}
  ],
  landingPages: [
    {id:1,name:"Summer collection sign-up",headline:"Get first access to our summer collection",status:"Published",views:1240,conversions:186},
    {id:2,name:"Weekly newsletter",headline:"Ideas and updates, delivered weekly",status:"Draft",views:0,conversions:0}
  ],
  theme: "light"
};

let state = loadState();
let modalMode = null;
let editingId = null;
let chartInstances = [];

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(demoData);
    const parsed = JSON.parse(saved);
    return {...structuredClone(demoData), ...parsed};
  } catch (error) {
    console.warn("Saved data could not be loaded. Demo data restored.", error);
    return structuredClone(demoData);
  }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function moneyNumber(value) { return Number(value || 0).toLocaleString("en-IN"); }
function average(items, key) {
  const values = items.map(item => Number(item[key]) || 0).filter(v => v > 0);
  return values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0;
}
function toast(message, type = "success") {
  const region = document.getElementById("toastRegion");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<i class="fa-solid ${type === "error" ? "fa-circle-exclamation" : "fa-circle-check"}"></i>${escapeHTML(message)}`;
  region.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
function statusBadge(status) {
  const label = String(status || "draft").replace("-", " ");
  return `<span class="status status-${escapeHTML(status)}">${escapeHTML(label)}</span>`;
}
function initials(name) {
  return String(name || "User").trim().split(/\s+/).slice(0,2).map(part=>part[0]).join("").toUpperCase();
}
function setUserUI() {
  const name = state.user.name || "User";
  document.getElementById("welcomeName").textContent = name.split(" ")[0];
  document.getElementById("sidebarUserName").textContent = name;
  document.getElementById("topAvatar").textContent = initials(name);
  document.getElementById("settingsName").value = name;
  document.getElementById("settingsEmail").value = state.user.email || "";
}
function renderAll() {
  setUserUI();
  renderDashboard();
  renderCampaigns();
  renderTemplates();
  renderSubscribers();
  renderAnalytics();
  renderWorkflows();
  renderLandingPages();
  renderReports();
  document.getElementById("campaignNavCount").textContent = state.campaigns.length;
  applyTheme();
}
function renderDashboard() {
  const campaigns = state.campaigns;
  const subs = state.subscribers;
  const active = subs.filter(s=>s.status==="active").length;
  document.getElementById("statCampaigns").textContent = campaigns.length;
  document.getElementById("statSubscribers").textContent = moneyNumber(subs.length);
  document.getElementById("statOpenRate").textContent = `${average(campaigns,"open_rate").toFixed(1)}%`;
  document.getElementById("statClicks").textContent = moneyNumber(campaigns.reduce((sum,c)=>sum+Math.round((c.click_rate||0)*10),0));
  document.getElementById("audienceTotal").textContent = subs.length;
  document.getElementById("activeSubscribers").textContent = active;
  document.getElementById("inactiveSubscribers").textContent = subs.length-active;
  const activePercent = subs.length ? active/subs.length*100 : 0;
  document.getElementById("audienceDonut").style.background = `conic-gradient(#dc4545 0 ${activePercent}%,#e8e4e8 ${activePercent}% 100%)`;
  const rows = campaigns.slice(0,4).map(c=>`<tr><td><div class="table-title">${escapeHTML(c.name)}</div><div class="table-sub">ID #${c.id}</div></td><td>${escapeHTML(c.type)}</td><td>${statusBadge(c.status)}</td><td>${Number(c.open_rate).toFixed(1)}%</td><td>${Number(c.click_rate).toFixed(1)}%</td><td>${escapeHTML(c.created_at||"—")}</td></tr>`).join("");
  document.getElementById("recentCampaignRows").innerHTML = rows || `<tr><td colspan="6">No campaigns yet.</td></tr>`;
  drawPerformanceChart("performanceChart", Number(document.getElementById("performanceRange").value || 30));
}
function renderCampaigns() {
  const q = (document.getElementById("campaignSearch")?.value || "").toLowerCase();
  const status = document.getElementById("campaignStatusFilter")?.value || "all";
  const type = document.getElementById("campaignTypeFilter")?.value || "all";
  const filtered = state.campaigns.filter(c=>(c.name+" "+c.type+" "+c.audience).toLowerCase().includes(q)&&(status==="all"||c.status===status)&&(type==="all"||c.type===type));
  document.getElementById("campaignRows").innerHTML = filtered.map(c=>`<tr>
    <td><div class="table-title">${escapeHTML(c.name)}</div><div class="table-sub">Campaign #${c.id}</div></td>
    <td>${escapeHTML(c.type)}</td><td>${escapeHTML(c.audience)}</td><td>${statusBadge(c.status)}</td>
    <td>${Number(c.open_rate).toFixed(1)}%</td><td>${Number(c.click_rate).toFixed(1)}%</td><td>${escapeHTML(c.created_at||"—")}</td>
    <td><div class="row-actions"><button class="tiny-action" title="Run simulated A/B test" data-action="ab-test" data-id="${c.id}"><i class="fa-solid fa-flask"></i></button><button class="tiny-action" title="Edit" data-action="edit-campaign" data-id="${c.id}"><i class="fa-solid fa-pen"></i></button><button class="tiny-action" title="Delete" data-action="delete-campaign" data-id="${c.id}"><i class="fa-regular fa-trash-can"></i></button></div></td></tr>`).join("");
  document.getElementById("campaignEmpty").classList.toggle("hidden", filtered.length>0);
}
function renderTemplates() {
  document.getElementById("templateGrid").innerHTML = state.templates.map(t=>`<article class="template-card"><div class="template-preview"><div class="email-mock"><div class="mock-logo">MARKETAUTO</div><div class="mock-line"></div><div class="mock-line short"></div><div class="mock-line"></div><div class="mock-cta"></div></div></div><div class="template-info"><h3>${escapeHTML(t.name)}</h3><p>${escapeHTML(t.subject)}</p><div class="card-bottom"><span class="card-tag">${escapeHTML(t.category)}</span><div class="row-actions"><button class="tiny-action" title="Preview" data-action="preview-template" data-id="${t.id}"><i class="fa-regular fa-eye"></i></button><button class="tiny-action" title="Send test preview (simulated)" data-action="test-template" data-id="${t.id}"><i class="fa-regular fa-paper-plane"></i></button><button class="tiny-action" title="Edit" data-action="edit-template" data-id="${t.id}"><i class="fa-solid fa-pen"></i></button><button class="tiny-action" title="Delete" data-action="delete-template" data-id="${t.id}"><i class="fa-regular fa-trash-can"></i></button></div></div></div></article>`).join("") || `<p class="muted">No templates yet. Create your first template.</p>`;
}
function renderSubscribers() {
  const q = (document.getElementById("subscriberSearch")?.value || "").toLowerCase();
  const segment = document.getElementById("subscriberSegment")?.value || "all";
  const subs = state.subscribers;
  const active = subs.filter(s=>s.status==="active").length;
  document.getElementById("allContactsCount").textContent = subs.length;
  document.getElementById("activeContactsCount").textContent = active;
  document.getElementById("unsubContactsCount").textContent = subs.length-active;
  const filtered = subs.filter(s=>{
    const matches = (s.name+" "+s.email).toLowerCase().includes(q);
    const isNew = s.subscribed_date >= daysAgo(30);
    return matches && (segment==="all" || (segment==="active"&&s.status==="active") || (segment==="unsubscribed"&&s.status==="unsubscribed") || (segment==="new"&&isNew));
  });
  document.getElementById("subscriberRows").innerHTML = filtered.map(s=>`<tr><td><div class="table-title">${escapeHTML(s.name)}</div><div class="table-sub">Contact #${s.id}</div></td><td>${escapeHTML(s.email)}</td><td>${escapeHTML(s.segment||"General")}</td><td>${statusBadge(s.status)}</td><td>${escapeHTML(s.subscribed_date||"—")}</td><td><div class="row-actions"><button class="tiny-action" title="Toggle status" data-action="toggle-subscriber" data-id="${s.id}"><i class="fa-solid fa-user-pen"></i></button><button class="tiny-action" title="Delete" data-action="delete-subscriber" data-id="${s.id}"><i class="fa-regular fa-trash-can"></i></button></div></td></tr>`).join("") || `<tr><td colspan="6">No subscribers match your search.</td></tr>`;
}
function renderAnalytics() {
  const open = average(state.campaigns,"open_rate"), click = average(state.campaigns,"click_rate");
  document.getElementById("analyticsOpen").textContent = `${open.toFixed(1)}%`;
  document.getElementById("analyticsClick").textContent = `${click.toFixed(1)}%`;
  document.getElementById("analyticsConversions").textContent = state.campaigns.reduce((n,c)=>n+(Number(c.conversions)||0),0);
  const best = [...state.campaigns].sort((a,b)=>(b.open_rate||0)-(a.open_rate||0))[0];
  document.getElementById("topCampaignInsight").textContent = best ? `${best.name} leads with ${Number(best.open_rate).toFixed(1)}% opens.` : "Create a campaign to see performance insights.";
  const active = state.subscribers.filter(s=>s.status==="active").length;
  document.getElementById("audienceInsight").textContent = `${active} of ${state.subscribers.length} contacts are currently active.`;
  document.getElementById("analyticsRows").innerHTML = state.campaigns.map(c=>`<tr><td><span class="table-title">${escapeHTML(c.name)}</span></td><td>${statusBadge(c.status)}</td><td>${Number(c.open_rate).toFixed(1)}%</td><td>${Number(c.click_rate).toFixed(1)}%</td><td>${Number(c.conversions)||0}</td></tr>`).join("");
  drawBarChart("analyticsChart", state.campaigns);
}
function renderWorkflows() {
  document.getElementById("workflowGrid").innerHTML = state.workflows.map(w=>`<article class="workflow-card"><div class="workflow-icon"><i class="fa-solid fa-diagram-project"></i></div><h3>${escapeHTML(w.name)}</h3><p>${escapeHTML(w.description)}</p><div class="card-bottom"><div><div class="table-sub">${escapeHTML(w.trigger)}</div><span class="card-tag">${w.steps} steps</span></div><div class="row-actions"><button class="toggle ${w.status?"on":""}" aria-label="Toggle workflow" data-action="toggle-workflow" data-id="${w.id}"></button><button class="tiny-action" title="Delete" data-action="delete-workflow" data-id="${w.id}"><i class="fa-regular fa-trash-can"></i></button></div></div></article>`).join("");
}
function renderLandingPages() {
  document.getElementById("landingGrid").innerHTML = state.landingPages.map(p=>`<article class="landing-card"><div class="landing-preview"><div><strong>${escapeHTML(p.headline)}</strong><br><span>YOUR BRAND • CAMPAIGN LANDING PAGE</span></div></div><div class="landing-info"><div><h3>${escapeHTML(p.name)}</h3><p>${p.views} views · ${p.conversions} conversions</p></div><div class="row-actions"><span class="card-tag">${escapeHTML(p.status)}</span><button class="tiny-action" title="Delete" data-action="delete-landing" data-id="${p.id}"><i class="fa-regular fa-trash-can"></i></button></div></div></article>`).join("");
}
function renderReports() {
  document.getElementById("reportCampaigns").textContent = state.campaigns.length;
  document.getElementById("reportAudience").textContent = state.subscribers.length;
  document.getElementById("reportOpen").textContent = `${average(state.campaigns,"open_rate").toFixed(1)}%`;
  document.getElementById("reportDetails").innerHTML = [
    ["Total campaigns",state.campaigns.length],["Active subscribers",state.subscribers.filter(s=>s.status==="active").length],
    ["Email templates",state.templates.length],["Automation workflows",state.workflows.length],
    ["Landing pages",state.landingPages.length],["Total conversions",state.campaigns.reduce((n,c)=>n+(Number(c.conversions)||0),0)]
  ].map(([label,value])=>`<div class="report-detail"><span>${label}</span><b>${value}</b></div>`).join("");
}

/* Lightweight canvas charts: no charting library or database required. */
function prepareCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(rect.width, 280), height = Number(canvas.getAttribute("height")) || 240;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width*dpr; canvas.height = height*dpr;
  const ctx = canvas.getContext("2d"); ctx.scale(dpr,dpr);
  return {ctx,width,height};
}
function drawPerformanceChart(id, range=30) {
  const result = prepareCanvas(id); if (!result) return;
  const {ctx,w}= {ctx:result.ctx,w:result.width}; const width=result.width,height=result.height;
  ctx.clearRect(0,0,width,height);
  const pad={l:30,r:12,t:14,b:28}, chartW=width-pad.l-pad.r, chartH=height-pad.t-pad.b;
  ctx.font="10px DM Sans"; ctx.fillStyle="#aaa"; ctx.strokeStyle="#f0e8e8"; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){const y=pad.t+chartH*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();ctx.fillText(`${100-i*25}%`,2,y+3);}
  const labels=range===7?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:range===90?["W1","W2","W3","W4","W5","W6"]:["1","5","10","15","20","25","30"];
  const open=range===7?[38,52,45,66,58,74,68]:range===90?[35,42,48,44,62,70,76]:[30,42,39,55,49,70,65];
  const clicks=open.map(v=>v*.32);
  const drawLine=(values,color)=>{ctx.beginPath();values.forEach((v,i)=>{const x=pad.l+i*chartW/(values.length-1),y=pad.t+chartH-(v/100)*chartH;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.lineCap="round";ctx.stroke();values.forEach((v,i)=>{const x=pad.l+i*chartW/(values.length-1),y=pad.t+chartH-(v/100)*chartH;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();});};
  drawLine(open,"#dc4545");drawLine(clicks,"#f3a0a0");
  ctx.fillStyle="#aaa";ctx.textAlign="center";labels.forEach((l,i)=>ctx.fillText(l,pad.l+i*chartW/(labels.length-1),height-7));
}
function drawBarChart(id,campaigns) {
  const result=prepareCanvas(id);if(!result)return;
  const {ctx,width,height}=result;ctx.clearRect(0,0,width,height);
  const data=campaigns.slice(0,5),pad={l:28,r:10,t:12,b:50},chartW=width-pad.l-pad.r,chartH=height-pad.t-pad.b;
  ctx.font="10px DM Sans";ctx.fillStyle="#aaa";ctx.strokeStyle="#f0e8e8";
  for(let i=0;i<=4;i++){const y=pad.t+chartH*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();ctx.fillText(`${100-i*25}`,2,y+3);}
  const group=chartW/Math.max(data.length,1),barW=Math.min(18,group*.25);
  data.forEach((c,i)=>{const x=pad.l+group*i+group/2;const values=[Number(c.open_rate)||0,Number(c.click_rate)||0];values.forEach((v,j)=>{const h=v/100*chartH;ctx.fillStyle=j?"#f3a0a0":"#dc4545";ctx.beginPath();ctx.roundRect(x+(j?2:-barW-2),pad.t+chartH-h,barW,h,4);ctx.fill();});ctx.fillStyle="#999";ctx.textAlign="center";ctx.fillText(c.name.slice(0,11),x,height-22);});
}
function navigate(page) {
  const valid = ["dashboard","campaigns","templates","subscribers","analytics","workflows","landing","reports","settings"];
  if(!valid.includes(page)) page="dashboard";
  document.querySelectorAll(".page").forEach(el=>el.classList.toggle("active",el.id===`page-${page}`));
  document.querySelectorAll(".nav-link[data-page]").forEach(el=>el.classList.toggle("active",el.dataset.page===page));
  const link=document.querySelector(`.nav-link[data-page="${page}"]`);
  document.getElementById("breadcrumbPage").textContent=link?link.querySelector("span").textContent:"Dashboard";
  history.replaceState(null,"",`#${page}`);
  document.getElementById("sidebar").classList.remove("open");
  if(page==="dashboard")drawPerformanceChart("performanceChart",Number(document.getElementById("performanceRange").value||30));
  if(page==="analytics")drawBarChart("analyticsChart",state.campaigns);
}
function field(label,name,type="text",value="",full=false,placeholder="") {
  const safeValue=escapeHTML(value);
  if(type==="textarea") return `<label class="${full?"full":""}">${label}<textarea name="${name}" placeholder="${escapeHTML(placeholder)}">${safeValue}</textarea></label>`;
  if(type==="select") return `<label class="${full?"full":""}">${label}<select name="${name}">${value}</select></label>`;
  return `<label class="${full?"full":""}">${label}<input name="${name}" type="${type}" value="${safeValue}" placeholder="${escapeHTML(placeholder)}" ${name==="email"?"required":""}></label>`;
}
function openModal(mode,id=null) {
  modalMode=mode;editingId=id;
  const titles={campaign:id?"Edit campaign":"Create campaign",template:id?"Edit email template":"Create email template",subscriber:"Add subscriber",workflow:"Create automation workflow",landing:"Create landing page",preview:"Email template preview"};
  document.getElementById("modalTitle").textContent=titles[mode]||"Create item";
  const record = id ? ({
    campaign:state.campaigns,template:state.templates,subscriber:state.subscribers,
    workflow:state.workflows,landing:state.landingPages
  }[mode]||[]).find(x=>x.id===id) : {};
  let html="";
  if(mode==="campaign") html=field("Campaign name","name","text",record.name||"",true,"e.g. Winter launch")+field("Campaign type","type","select",["Email Campaign","Product Update","Newsletter","Promotional"].map(x=>`<option ${record.type===x?"selected":""}>${x}</option>`).join(""))+field("Audience","audience","select",["All Subscribers","Engaged Subscribers","New Subscribers","VIP Customers"].map(x=>`<option ${record.audience===x?"selected":""}>${x}</option>`).join(""))+field("Status","status","select",["draft","scheduled","in-progress","completed","cancelled"].map(x=>`<option value="${x}" ${record.status===x?"selected":""}>${x.replace("-"," ")}</option>`).join(""))+field("Send date","sent_date","date",record.sent_date||"")+field("Open rate (%)","open_rate","number",record.open_rate??0)+field("Click rate (%)","click_rate","number",record.click_rate??0)+field("Conversions","conversions","number",record.conversions??0);
  if(mode==="template") html=field("Template name","name","text",record.name||"",true,"e.g. Product launch email")+field("Category","category","text",record.category||"General")+field("Subject line","subject","text",record.subject||"",true,"Write a clear subject line")+field("Email content","content","textarea",record.content||"",true,"Write your email content here...");
  if(mode==="subscriber") html=field("Full name","name","text","",true,"Contact name")+field("Email address","email","email","",true,"name@example.com")+field("Segment","segment","select",["General","Engaged","VIP","New"].map(x=>`<option>${x}</option>`).join(""))+field("Status","status","select",'<option value="active">Active</option><option value="unsubscribed">Unsubscribed</option>');
  if(mode==="workflow") html=field("Workflow name","name","text","",true,"e.g. Birthday email sequence")+field("Trigger","trigger","text","",true,"When a subscriber joins")+field("Description","description","textarea","",true,"Describe what this automation does")+field("Number of steps","steps","number",3)+field("Status","status","select",'<option value="true">Active</option><option value="false">Paused</option>');
  if(mode==="landing") html=field("Page name","name","text","",true,"e.g. Newsletter sign-up")+field("Headline","headline","text","",true,"Your landing page headline")+field("Status","status","select",'<option>Draft</option><option>Published</option>')+field("Views","views","number",0)+field("Conversions","conversions","number",0);
  if(mode==="preview") html=`<div class="preview-content"><b>${escapeHTML(record.name||"Email preview")}</b><p><strong>Subject:</strong> ${escapeHTML(record.subject||"")}</p><p>${escapeHTML(record.content||"")}</p></div>`;
  document.getElementById("modalFields").innerHTML=html;
  document.getElementById("modalSubmit").classList.toggle("hidden",mode==="preview");
  document.getElementById("modalCancel").textContent=mode==="preview"?"Close":"Cancel";
  document.getElementById("modalBackdrop").classList.add("show");
  document.getElementById("modalBackdrop").setAttribute("aria-hidden","false");
}
function closeModal() {
  document.getElementById("modalBackdrop").classList.remove("show");
  document.getElementById("modalBackdrop").setAttribute("aria-hidden","true");
  document.getElementById("modalForm").reset();
  modalMode=null;editingId=null;
}
function formObject(form) { return Object.fromEntries(new FormData(form).entries()); }
function saveModal(event) {
  event.preventDefault();
  const data=formObject(event.currentTarget);
  const number=(key, fallback=0)=>Number(data[key]??fallback)||0;
  const id=editingId || Date.now();
  if(modalMode==="campaign") {
    const item={id,name:data.name.trim(),type:data.type,status:data.status,audience:data.audience,sent_date:data.sent_date,open_rate:number("open_rate"),click_rate:number("click_rate"),created_at:editingId?(state.campaigns.find(x=>x.id===id)?.created_at||isoDate()):isoDate(),conversions:number("conversions")};
    if(!item.name){toast("Campaign name is required.","error");return;}
    upsert(state.campaigns,item);
  } else if(modalMode==="template") {
    const item={id,name:data.name.trim(),category:data.category,subject:data.subject,content:data.content};
    if(!item.name){toast("Template name is required.","error");return;}
    upsert(state.templates,item);
  } else if(modalMode==="subscriber") {
    if(state.subscribers.some(s=>s.email.toLowerCase()===data.email.toLowerCase())){toast("This email address already exists.","error");return;}
    state.subscribers.unshift({id:Date.now(),name:data.name.trim(),email:data.email.trim(),segment:data.segment,status:data.status,subscribed_date:isoDate()});
  } else if(modalMode==="workflow") {
    upsert(state.workflows,{id,name:data.name.trim(),trigger:data.trigger,description:data.description,steps:number("steps",1),status:data.status==="true"});
  } else if(modalMode==="landing") {
    upsert(state.landingPages,{id,name:data.name.trim(),headline:data.headline,status:data.status,views:number("views"),conversions:number("conversions")});
  }
  saveState();renderAll();closeModal();toast(editingId?"Changes saved successfully.":"New item created successfully.");
}
function upsert(list,item) { const index=list.findIndex(x=>x.id===item.id);if(index>=0)list[index]=item;else list.unshift(item); }
function handleAction(action,id) {
  const map={ "delete-campaign":[state.campaigns,"campaign"],"delete-template":[state.templates,"template"],"delete-subscriber":[state.subscribers,"subscriber"],"delete-workflow":[state.workflows,"workflow"],"delete-landing":[state.landingPages,"landing page"] };
  if(map[action]) {
    const [list,label]=map[action];
    if(!confirm(`Delete this ${label}? This action cannot be undone.`))return;
    const index=list.findIndex(x=>x.id===id);if(index>=0)list.splice(index,1);
    saveState();renderAll();toast(`${label[0].toUpperCase()+label.slice(1)} deleted.`);return;
  }
  if(action==="ab-test"){const c=state.campaigns.find(x=>x.id===id);if(c){const a=(Number(c.open_rate)||30)+Math.random()*8;const b=(Number(c.open_rate)||30)+Math.random()*8;const winner=a>=b?"Variant A":"Variant B";toast(`Simulated A/B test complete for “${c.name}”. ${winner} performed better.`);}return;}
  if(action==="test-template"){const t=state.templates.find(x=>x.id===id);if(t)toast(`Test preview for “${t.name}” prepared. Email delivery is simulated.`);return;}
  if(action==="edit-campaign")openModal("campaign",id);
  if(action==="edit-template")openModal("template",id);
  if(action==="preview-template")openModal("preview",id);
  if(action==="toggle-subscriber"){const s=state.subscribers.find(x=>x.id===id);if(s)s.status=s.status==="active"?"unsubscribed":"active";saveState();renderAll();toast("Subscriber status updated.");}
  if(action==="toggle-workflow"){const w=state.workflows.find(x=>x.id===id);if(w)w.status=!w.status;saveState();renderWorkflows();toast("Workflow status updated.");}
}
function downloadCSV(filename, rows) {
  if(!rows.length){toast("There is no data to export.","error");return;}
  const headers=Object.keys(rows[0]);
  const csv=[headers.join(","),...rows.map(row=>headers.map(key=>`"${String(row[key]??"").replace(/"/g,'""')}"`).join(","))].join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
  toast("CSV report downloaded.");
}
function exportCampaigns(){downloadCSV("market-auto-campaigns.csv",state.campaigns);}
function exportSubscribers(){downloadCSV("market-auto-subscribers.csv",state.subscribers);}
function printReport(){window.print();}
function applyTheme(){document.body.classList.toggle("dark",state.theme==="dark");document.getElementById("themeToggle").innerHTML=state.theme==="dark"?'<i class="fa-regular fa-sun"></i>':'<i class="fa-regular fa-moon"></i>';}
function toggleTheme(){state.theme=state.theme==="dark"?"light":"dark";saveState();applyTheme();}

document.addEventListener("click",event=>{
  const pageLink=event.target.closest("[data-page]");
  if(pageLink){event.preventDefault();navigate(pageLink.dataset.page);return;}
  const opener=event.target.closest("[data-open-modal]");
  if(opener){openModal(opener.dataset.openModal);return;}
  const action=event.target.closest("[data-action]");
  if(action){handleAction(action.dataset.action,Number(action.dataset.id));return;}
});
document.getElementById("modalForm").addEventListener("submit",saveModal);
document.getElementById("modalClose").addEventListener("click",closeModal);
document.getElementById("modalCancel").addEventListener("click",closeModal);
document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.getElementById("globalSearch").focus();}});
["campaignSearch","campaignStatusFilter","campaignTypeFilter"].forEach(id=>document.getElementById(id).addEventListener("input",renderCampaigns));
["subscriberSearch","subscriberSegment"].forEach(id=>document.getElementById(id).addEventListener("input",renderSubscribers));
document.getElementById("performanceRange").addEventListener("change",e=>drawPerformanceChart("performanceChart",Number(e.target.value)));
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("themeToggle").addEventListener("click",toggleTheme);
document.getElementById("settingsTheme").addEventListener("click",toggleTheme);
document.getElementById("profileForm").addEventListener("submit",e=>{e.preventDefault();const data=formObject(e.currentTarget);state.user={name:data.name.trim(),email:data.email.trim()};saveState();renderAll();toast("Profile updated.");});
document.getElementById("resetData").addEventListener("click",()=>{if(confirm("Restore the original demo data? Your current browser data will be replaced.")){state=structuredClone(demoData);saveState();renderAll();toast("Demo data restored.");}});
document.getElementById("exportSubscribers").addEventListener("click",exportSubscribers);
document.getElementById("reportCsv").addEventListener("click",exportCampaigns);
document.getElementById("downloadAnalytics").addEventListener("click",exportCampaigns);
document.getElementById("reportPrint").addEventListener("click",printReport);
document.getElementById("notificationButton").addEventListener("click",()=>toast("You're all caught up."));
document.getElementById("profileButton").addEventListener("click",()=>navigate("settings"));
document.getElementById("globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){const q=e.target.value.trim();if(q){navigate("campaigns");document.getElementById("campaignSearch").value=q;renderCampaigns();}}});
document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("en-IN",{weekday:"long",month:"long",day:"numeric"}).format(today).toUpperCase();

window.addEventListener("resize",()=>{clearTimeout(window.__chartResize);window.__chartResize=setTimeout(()=>{drawPerformanceChart("performanceChart",Number(document.getElementById("performanceRange").value||30));drawBarChart("analyticsChart",state.campaigns);},150);});
renderAll();
const initialPage=location.hash.replace("#","");navigate(initialPage||"dashboard");
