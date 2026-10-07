/* Aurum Guard - Merchant Dashboard (demo, vanilla JS, mock data) */
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const now=()=>{const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())};
const ago=m=>{const d=new Date(Date.now()-m*60000);return pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())};

/* ---- Mock data (states follow the project's item state machine) ---- */
const STATES={ON_DISPLAY:['On Display','ok'],IN_HAND:['In Hand','in'],OUT_OF_VIEW:['Out of View','wa'],SOLD:['Sold','nu'],SUSPICIOUS:['Suspicious','cr'],MISSING:['Missing','cr']};
const ZONES=[{n:'Display Zone A',c:'CAM-01',x:[8,38],y:[28,62]},{n:'Display Zone B',c:'CAM-02',x:[58,88],y:[28,62]},{n:'Interaction Area',c:'CAM-03',x:[34,66],y:[68,88]},{n:'Exit Zone',c:'CAM-04',x:[80,94],y:[72,90]}];
const TYPES=['Gold Necklace','Gold Bracelet','Ring','Gold Watch','Earrings'];
const items=[];
for(let i=0;i<24;i++){const z=i%3===2?(i%6===2?2:1):0;const zz=ZONES[i%2===0?0:1];
 items.push({id:'G-'+(1001+i),tag:'T-'+(4800+i*7+21),type:TYPES[i%5],st:'ON_DISPLAY',zone:zz.n,cam:zz.c,seen:ago(i%4),px:rnd(zz.x),py:rnd(zz.y)})}
function rnd(r){return r[0]+Math.random()*(r[1]-r[0])}
function setItem(id,st,zi,min){const it=items.find(x=>x.id===id),z=ZONES[zi];Object.assign(it,{st,zone:z.n,cam:z.c,seen:ago(min),px:rnd(z.x),py:rnd(z.y)})}
setItem('G-1002','IN_HAND',2,0);setItem('G-1005','IN_HAND',2,1);setItem('G-1009','SOLD',2,18);setItem('G-1013','SOLD',2,31);
setItem('G-1017','SUSPICIOUS',3,2);
items.push({id:'G-1042',tag:'T-5121',type:'Gold Bracelet',st:'OUT_OF_VIEW',zone:'Display Zone B',cam:'CAM-03',seen:ago(5),px:70,py:45});
const cams=[{id:'CAM-01',n:'Camera 01',loc:'Display Area A',st:'ok',fps:13,n_:0},{id:'CAM-02',n:'Camera 02',loc:'Display Area B',st:'ok',fps:12,n_:0},{id:'CAM-03',n:'Camera 03',loc:'Customer Interaction Area',st:'ok',fps:12,n_:0},{id:'CAM-04',n:'Camera 04',loc:'Exit',st:'ok',fps:14,n_:0},{id:'CAM-05',n:'Camera 05',loc:'Central / Overhead',st:'ok',fps:11,n_:0},{id:'CAM-06',n:'Camera 06',loc:'Backup / Blind-spot',st:'wa',fps:8,n_:0}];
cams.forEach(c=>{c.act=ago(0);c.cnt=()=>items.filter(i=>i.cam===c.id).length});
let alerts=[
{id:1,sev:'critical',title:'Item G-1017 entered the exit zone without sale confirmation',item:'G-1017',cam:'CAM-04',loc:'Exit Zone',time:'10:47 AM',risk:70,status:'New'},
{id:2,sev:'warning',title:'Item G-1042 tracking lost (out of view)',item:'G-1042',cam:'CAM-03',loc:'Display Zone B',time:'10:47 AM',risk:20,status:'New'},
{id:3,sev:'warning',title:'Camera 06 running at reduced frame rate',item:'',cam:'CAM-06',loc:'Backup / Blind-spot',time:'10:20 AM',risk:0,status:'New'},
{id:4,sev:'info',title:'Item G-1013 sale confirmed by seller',item:'G-1013',cam:'CAM-03',loc:'Interaction Area',time:'10:02 AM',risk:0,status:'Reviewed'}];
let events=[
{t:'10:52:14',txt:'Item G-1024 detected',item:'G-1024',cam:'CAM-02',sev:'info',type:'Detection'},
{t:'10:51:48',txt:'Camera 04 detected movement',item:'',cam:'CAM-04',sev:'info',type:'Camera'},
{t:'10:50:21',txt:'Item G-1024 moved to Zone B',item:'G-1024',cam:'CAM-02',sev:'info',type:'Movement'},
{t:'10:47:30',txt:'Item G-1017 in exit zone, no sale confirmation',item:'G-1017',cam:'CAM-04',sev:'critical',type:'Alert'},
{t:'10:47:02',txt:'Item G-1042 tracking lost',item:'G-1042',cam:'CAM-03',sev:'warning',type:'Tracking'},
{t:'10:41:10',txt:'Item G-1005 picked up (In Hand)',item:'G-1005',cam:'CAM-03',sev:'info',type:'Movement'},
{t:'10:20:44',txt:'Camera 06 frame rate dropped',item:'',cam:'CAM-06',sev:'warning',type:'Camera'},
{t:'10:02:15',txt:'Sale confirmed for G-1013',item:'G-1013',cam:'CAM-03',sev:'info',type:'Sale'}];
let notes=[{t:'Critical: item G-1017 in exit zone',r:0,s:'critical'},{t:'Item G-1042 tracking lost',r:0,s:'warning'},{t:'Camera 06 low frame rate',r:0,s:'warning'},{t:'Daily system check completed',r:1,s:'info'}];

/* ---- Router ---- */
const PAGES=[['dashboard','◧','Dashboard'],['live','◉','Live Monitoring'],['map','⌖','Store Map'],['items','◇','Items'],['alerts','⚑','Alerts'],['activity','≡','Activity'],['cameras','▣','Cameras'],['analytics','▤','Analytics'],['settings','⚙','Settings']];
let page='dashboard',charts=[],sortK='id',sortD=1,filt={q:'',st:'',ty:''};
const active=()=>alerts.filter(a=>a.status==='New'||a.status==='Acknowledged');
function go(p){page=p;location.hash=p;$('#sidebar').classList.remove('open');$('#shade').classList.remove('on');draw()}
function toggleMenu(){$('#sidebar').classList.toggle('open');$('#shade').classList.toggle('on')}
function pill(t,c){return `<span class="pill ${c}"><i></i>${t}</span>`}
function sp(s){return pill(STATES[s][0],STATES[s][1])}
function sevPill(s){return pill(s==='critical'?'Critical':s==='warning'?'Warning':'Info',s==='critical'?'cr':s==='warning'?'wa':'in')}
function chrome(){
 $('#nav').innerHTML=PAGES.map(p=>`<div class="nav-i ${page===p[0]?'on':''}" onclick="go('${p[0]}')"><span>${p[1]}</span>${p[2]}${p[0]==='alerts'&&active().length?`<b>${active().length}</b>`:''}</div>`).join('');
 $('#title').textContent=PAGES.find(p=>p[0]===page)[2];
 const c=active().some(a=>a.sev==='critical'),w=cams.some(x=>x.st!=='ok');
 $('#sys').className='pill '+(c?'cr':w?'wa':'ok');$('#sys span').textContent=c?'Critical Alert Active':w?'Operational (1 warning)':'System Operational';
 const u=notes.filter(n=>!n.r).length;$('#ncount').textContent=u||'';$('#ncount').style.display=u?'':'none';renderNotif()}
function draw(){charts.forEach(c=>c.destroy());charts=[];chrome();$('#view').innerHTML=V[page]();if(AFTER[page])AFTER[page]();window.scrollTo(0,0)}

/* ---- Components ---- */
function feedHTML(c,i){
 if(c.st==='off')return `<div class="feed off"><div class="offmsg">Camera offline</div></div>`;
 const n=Math.min(c.cnt(),3);let t='';
 items.filter(x=>x.cam===c.id).slice(0,n).forEach((x,k)=>t+=`<span class="tagbox ${x.st==='SUSPICIOUS'?'red':''}" data-f="${c.id}" style="left:${15+k*28+Math.random()*8}%;top:${28+Math.random()*35}%;width:34px;height:26px">${x.tag.slice(2)}</span>`);
 return `<div class="feed" id="f-${c.id}"><span class="ov">${c.n} · ${c.loc}</span><span class="rec"></span>${t}<span class="ts" data-ts>${now()}</span></div>`}
function camCard(c,i){const lbl=c.st==='ok'?['Online','ok']:c.st==='wa'?['Warning','wa']:['Offline','cr'];
 return `<div class="card cam-card" onclick="camModal('${c.id}')">${feedHTML(c,i)}<div class="row"><b>${c.id}</b>${pill(lbl[0],lbl[1])}</div><div class="row"><small>${c.fps} FPS · <span data-cnt="${c.id}">${c.cnt()}</span> items</small><small>Last activity <span data-act="${c.id}">${c.act}</span></small></div></div>`}
function evRow(e){return `<div class="ev"><time>${e.t}</time><i class="sd s-${e.sev==='critical'?'cr':e.sev==='warning'?'wa':'in'}"></i><div style="flex:1">${e.txt}<br><small style="color:var(--mu)">${e.cam||''}</small></div></div>`}
function alertCard(a){const done=a.status==='Reviewed';
 return `<div class="alert ${a.sev} ${done?'done':''}"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${sevPill(a.sev)}<b>${a.title}</b><span style="margin-left:auto">${pill(a.status,a.status==='New'?'wa':'nu')}</span></div>
 <div class="meta">${a.item?'Item '+a.item+' · ':''}${a.cam} · ${a.loc} · ${a.time}${a.risk?' · Risk score '+a.risk:''}</div>
 <div class="act"><button class="btn s p" onclick="alertModal(${a.id})">View</button>${a.status==='New'?`<button class="btn s" onclick="ack(${a.id},'Acknowledged')">Acknowledge</button>`:''}${!done?`<button class="btn s" onclick="ack(${a.id},'Reviewed')">Mark as reviewed</button>`:''}</div></div>`}
function ack(id,s){alerts.find(a=>a.id===id).status=s;toast('Alert '+s.toLowerCase());closeModal();draw()}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}

/* ---- Pages ---- */
const V={
dashboard(){const a=active(),sec=items.filter(i=>!['SUSPICIOUS','MISSING','OUT_OF_VIEW'].includes(i.st)).length;
 return `<p class="sub">Here is the overall status of your store right now.</p>
 <div class="grid g4" style="margin-bottom:14px">
 <div class="card kpi"><div class="l">Tracked Items</div><div class="n">${items.length}</div><div class="t">tagged and registered</div></div>
 <div class="card kpi"><div class="l">Secure Items</div><div class="n">${sec}</div><div class="t">${items.length-sec} need attention</div></div>
 <div class="card kpi ${a.length?'hl':''}"><div class="l">Active Alerts</div><div class="n">${a.length}</div><div class="t">${a.filter(x=>x.sev==='critical').length} critical</div></div>
 <div class="card kpi"><div class="l">Cameras Online</div><div class="n">${cams.filter(c=>c.st!=='off').length}/${cams.length}</div><div class="t">${cams.filter(c=>c.st==='wa').length} warning</div></div></div>
 <div class="grid g2"><div class="card"><h3>Recent Alerts <a onclick="go('alerts')">View all</a></h3>${a.slice(0,3).map(alertCard).join('')||'<div class="empty">No active alerts. All calm.</div>'}</div>
 <div class="card"><h3>Recent Activity <a onclick="go('activity')">View all</a></h3><div id="dashEv">${events.slice(0,6).map(evRow).join('')}</div></div></div>
 <div class="grid g2" style="margin-top:14px"><div class="card"><h3>Tracking Activity</h3><div class="chartbox"><canvas id="c1"></canvas></div></div>
 <div class="card"><h3>Camera Status <a onclick="go('cameras')">Details</a></h3>${cams.map(c=>`<div class="ev" style="align-items:center"><b style="width:66px">${c.id}</b><span style="flex:1;color:var(--mu)">${c.loc}</span>${pill(c.st==='ok'?'Online':'Warning',c.st)}</div>`).join('')}</div></div>
 <div class="card" style="margin-top:14px"><h3>System Overview</h3><div class="kv" style="grid-template-columns:repeat(4,1fr);margin:0"><div><small>Detection</small>Running</div><div><small>Item registry</small>Synced</div><div><small>Avg. frame rate</small>${(cams.reduce((s,c)=>s+c.fps,0)/cams.length).toFixed(0)} FPS</div><div><small>Sale confirmation</small>Manual</div></div></div>`},
live(){return `<p class="sub">Simulated CCTV feeds. Gold boxes are decoded visual tags.</p><div class="grid g2"><div class="grid g3" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">${cams.map(camCard).join('')}</div>
 <div class="card"><h3>Live Activity <span class="pill ok"><i></i>Live</span></h3><div id="liveEv">${events.slice(0,9).map(evRow).join('')}</div></div></div>`},
map(){return `<p class="sub">Top-down floor plan. Click an item marker for details.</p><div class="card"><div class="map" id="map">
 ${ZONES.map(z=>`<div class="zone ${z.n==='Exit Zone'?'exit':z.n.startsWith('Display')?'disp':''}" style="left:${z.x[0]-3}%;top:${z.y[0]-9}%;width:${z.x[1]-z.x[0]+6}%;height:${z.y[1]-z.y[0]+14}%">${z.n.toUpperCase()}</div>`).join('')}
 ${cams.map((c,i)=>{const p=[[4,10],[96,10],[50,96],[96,96],[50,12],[4,96]][i];return `<span class="cm ${c.st==='ok'?'':'w'}" style="left:${p[0]}%;top:${p[1]}%">${c.id.slice(4)}📷</span>`}).join('')}
 ${items.map(i=>`<div class="mk ${i.st==='SUSPICIOUS'?'sus':i.st==='IN_HAND'?'in':i.st==='OUT_OF_VIEW'?'out':i.st==='SOLD'?'sold':''}" style="left:${i.px}%;top:${i.py}%" title="${i.id}" onclick="itemPop('${i.id}')"></div>`).join('')}
 </div><div class="legend"><span>🟡 On display</span><span>🔵 In hand</span><span>🟠 Out of view</span><span>🔴 Suspicious</span><span>⚪ Sold</span><span>📷 Camera</span></div></div><div id="pop" style="margin-top:14px"></div>`},
items(){const q=filt.q.toLowerCase();let L=items.filter(i=>(i.id+i.tag+i.type).toLowerCase().includes(q)&&(!filt.st||i.st===filt.st)&&(!filt.ty||i.type===filt.ty));
 L.sort((a,b)=>String(a[sortK]).localeCompare(String(b[sortK]))*sortD);
 const th=(k,l)=>`<th onclick="sortBy('${k}')">${l}${sortK===k?(sortD>0?' ▲':' ▼'):''}</th>`;
 return `<div class="bar"><input id="fq" placeholder="Search item, tag or type" value="${filt.q}" oninput="setF('q',this.value)"><select onchange="setF('st',this.value)"><option value="">All statuses</option>${Object.keys(STATES).map(s=>`<option value="${s}" ${filt.st===s?'selected':''}>${STATES[s][0]}</option>`)}</select><select onchange="setF('ty',this.value)"><option value="">All categories</option>${TYPES.map(t=>`<option ${filt.ty===t?'selected':''}>${t}</option>`)}</select></div>
 <div class="card tw">${L.length?`<table class="rt"><thead><tr>${th('id','Item ID')}${th('tag','Tag ID')}${th('type','Type')}${th('st','Status')}${th('zone','Location')}${th('cam','Camera')}${th('seen','Last Seen')}</tr></thead><tbody>${L.map(i=>`<tr class="c" onclick="itemModal('${i.id}')"><td data-l="Item"><b>${i.id}</b></td><td data-l="Tag">${i.tag}</td><td data-l="Type">${i.type}</td><td data-l="Status">${sp(i.st)}</td><td data-l="Location">${i.zone}</td><td data-l="Camera">${i.cam}</td><td data-l="Last seen">${i.seen}</td></tr>`).join('')}</tbody></table>`:'<div class="empty"><b>No items found</b><br>Try clearing the filters.</div>'}</div>`},
alerts(){const sv=filt.sv||'';let L=alerts.filter(a=>!sv||a.sev===sv);
 return `<div class="bar"><select onchange="filt.sv=this.value;draw()"><option value="">All severities</option><option value="critical" ${sv==='critical'?'selected':''}>Critical</option><option value="warning" ${sv==='warning'?'selected':''}>Warning</option><option value="info" ${sv==='info'?'selected':''}>Info</option></select></div>
 <p class="sub">An alert means "please check", not proof of theft. A person decides what to do.</p>${L.map(alertCard).join('')||'<div class="card empty">No alerts.</div>'}`},
activity(){const f=filt;let L=events.filter(e=>(!f.et||e.type===f.et)&&(!f.ei||e.item===f.ei)&&(!f.ec||e.cam===f.ec)&&(!f.es||e.sev===f.es));
 const opt=(arr,k,l)=>`<select onchange="filt.${k}=this.value;draw()"><option value="">${l}</option>${arr.map(v=>`<option ${f[k]===v?'selected':''}>${v}</option>`)}</select>`;
 return `<div class="bar">${opt([...new Set(events.map(e=>e.type))],'et','All event types')}${opt([...new Set(events.map(e=>e.item).filter(Boolean))],'ei','All items')}${opt(cams.map(c=>c.id),'ec','All cameras')}${opt(['critical','warning','info'],'es','All severities')}</div>
 <div class="card">${L.map(evRow).join('')||'<div class="empty">No events match.</div>'}</div>`},
cameras(){return `<p class="sub">Camera and system health. If a camera goes offline, "missing" alerts are paused for items it last saw.</p><div class="grid g3">${cams.map(camCard).join('')}</div>`},
analytics(){return `<p class="sub">Demo figures for presentation.</p><div class="grid g22"><div class="card"><h3>Tracked Items Over Time</h3><div class="chartbox"><canvas id="a1"></canvas></div></div><div class="card"><h3>Alerts Over Time</h3><div class="chartbox"><canvas id="a2"></canvas></div></div><div class="card"><h3>Camera Activity</h3><div class="chartbox"><canvas id="a3"></canvas></div></div><div class="card"><h3>Item Movement Activity</h3><div class="chartbox"><canvas id="a4"></canvas></div></div></div>`},
settings(){const t=(l,on)=>`<label style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--bd)">${l}<input type="checkbox" ${on?'checked':''} onchange="toast('Setting saved (demo)')"></label>`;
 return `<div class="grid g22"><div class="card"><h3>Store Information</h3><div class="kv"><div><small>Store</small>Al-Nour Gold &amp; Jewelry</div><div><small>Branch</small>Assiut</div></div></div>
 <div class="card"><h3>Monitoring Preferences</h3>${t('Show tag boxes on live feeds',1)}${t('Auto-refresh dashboard',1)}</div>
 <div class="card"><h3>Notification Preferences</h3>${t('Critical alerts',1)}${t('Camera warnings',1)}${t('Tracking events',0)}</div>
 <div class="card"><h3>Alert Preferences</h3>Out-of-view time before "missing"<br><br><select onchange="toast('Saved (demo)')"><option>2 min</option><option>5 min</option><option>10 min</option></select></div>
 <div class="card"><h3>System Information</h3><div class="kv"><div><small>Version</small>Demo 1.0</div><div><small>Data</small>Mock data only</div></div></div></div>`}};
const AFTER={
dashboard(){mkChart('c1','line',['09:00','10:00','11:00','12:00','13:00','14:00'],[{label:'Items in motion',data:[3,6,9,7,11,8]}])},
analytics(){mkChart('a1','line',['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],[{label:'Tracked',data:[22,24,24,26,26,27,27]}]);
 mkChart('a2','bar',['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],[{label:'Alerts',data:[2,1,3,0,2,4,3]}]);
 mkChart('a3','bar',cams.map(c=>c.id),[{label:'Detections',data:[84,61,47,39,22,12]}]);
 mkChart('a4','line',['9h','10h','11h','12h','13h','14h'],[{label:'Moves',data:[5,12,18,14,21,9]}])}};
function mkChart(id,type,labels,ds){if(typeof Chart==='undefined')return;
 ds.forEach(d=>{d.borderColor='#D4AF37';d.backgroundColor=type==='bar'?'#0B1F33':'#D4AF3722';d.fill=type==='line';d.tension=.35});
 charts.push(new Chart($('#'+id),{type,data:{labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#eef1f5'}},x:{grid:{display:false}}}}}))}
function setF(k,v){filt[k]=v;const p=$('#fq')&&$('#fq').selectionStart;draw();if(k==='q'){const e=$('#fq');e.focus();e.setSelectionRange(p,p)}}
function sortBy(k){sortD=sortK===k?-sortD:1;sortK=k;draw()}

/* ---- Modals ---- */
function openModal(h){$('#modalBox').innerHTML=h;$('#modal').classList.add('show')}
function closeModal(){$('#modal').classList.remove('show')}
function itemTimeline(i){const c=i.cam;return [[ago(40),'Detected at '+c],[ago(31),'Moved to '+(i.zone==='Display Zone A'?'Display Zone B':'Display Zone A')],[ago(18),'Detected at CAM-04'],[i.seen,i.st==='SUSPICIOUS'?'Entered exit zone, no sale confirmation':i.st==='OUT_OF_VIEW'?'Tag no longer visible':'Current location confirmed at '+i.zone,i.st==='SUSPICIOUS'?1:0]]}
function itemModal(id){const i=items.find(x=>x.id===id),rel=alerts.filter(a=>a.item===id);
 openModal(`<div class="mh"><h3>${i.type} · ${i.id}</h3><button class="x" onclick="closeModal()">×</button></div>
 <div class="kv"><div><small>Item ID</small>${i.id}</div><div><small>Tag ID</small>${i.tag}</div><div><small>Type</small>${i.type}</div><div><small>Status</small>${sp(i.st)}</div><div><small>Location</small>${i.zone}</div><div><small>Last camera</small>${i.cam}</div><div><small>Last seen</small>${i.seen}</div><div><small>Risk</small>${i.st==='SUSPICIOUS'?70:i.st==='OUT_OF_VIEW'?20:0}</div></div>
 <h3 style="margin-bottom:8px">Movement timeline</h3><div class="tl">${itemTimeline(i).map(e=>`<div class="it ${e[2]?'c':''}"><b>${e[1]}</b><br><small>${e[0]}</small></div>`).join('')}</div>
 <h3 style="margin:10px 0 8px">Related alerts</h3>${rel.map(alertCard).join('')||'<small style="color:var(--mu)">No alerts for this item.</small>'}`)}
function alertModal(id){const a=alerts.find(x=>x.id===id);
 openModal(`<div class="mh"><h3>${a.title}</h3><button class="x" onclick="closeModal()">×</button></div><div class="kv"><div><small>Severity</small>${sevPill(a.sev)}</div><div><small>Status</small>${a.status}</div><div><small>Camera</small>${a.cam}</div><div><small>Location</small>${a.loc}</div><div><small>Time</small>${a.time}</div><div><small>Risk score</small>${a.risk||'n/a'}</div></div>
 <div class="feed" style="margin-bottom:14px"><span class="ov">${a.cam} · evidence clip</span><span class="tagbox red" style="left:45%;top:40%;width:34px;height:26px">${a.item?a.item.slice(2):''}</span></div>
 <div class="act" style="display:flex;gap:8px;flex-wrap:wrap">${a.item?`<button class="btn p" onclick="itemModal('${a.item}')">View item</button>`:''}${a.status==='New'?`<button class="btn" onclick="ack(${a.id},'Acknowledged')">Acknowledge</button>`:''}<button class="btn" onclick="ack(${a.id},'Reviewed')">Mark as reviewed</button></div>
 <p class="sub" style="margin:12px 0 0">This is a suspicious-activity flag for human review, not proof of theft.</p>`)}
function camModal(id){const c=cams.find(x=>x.id===id);
 openModal(`<div class="mh"><h3>${c.n} · ${c.loc}</h3><button class="x" onclick="closeModal()">×</button></div>${feedHTML(c,0)}<div class="kv" style="margin-top:14px"><div><small>Status</small>${pill(c.st==='ok'?'Online':'Warning',c.st)}</div><div><small>Frame rate</small>${c.fps} FPS</div><div><small>Detection</small>${c.st==='ok'?'Running':'Reduced'}</div><div><small>Tracked items</small>${c.cnt()}</div><div><small>Last activity</small>${c.act}</div></div>`)}
function itemPop(id){const i=items.find(x=>x.id===id);$('#pop').innerHTML=`<div class="card" style="border-color:var(--gold)"><h3>Item ${i.id} <button class="btn s p" onclick="itemModal('${i.id}')">Full details</button></h3><div class="kv" style="margin:0"><div><small>Tag</small>${i.tag}</div><div><small>Status</small>${sp(i.st)}</div><div><small>Location</small>${i.zone}</div><div><small>Last seen · Camera</small>${i.seen} · ${i.cam}</div></div></div>`}

/* ---- Notifications ---- */
function renderNotif(){$('#notif').innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:6px"><b>Notifications</b><a style="color:var(--gold);cursor:pointer;font-weight:700;font-size:12px" onclick="notes.forEach(n=>n.r=1);chrome()">Mark all as read</a></div>`+notes.map((n,i)=>`<div class="ni ${n.r?'read':''}" onclick="notes[${i}].r=1;chrome()"><i class="sd s-${n.s==='critical'?'cr':n.s==='warning'?'wa':'in'}"></i>${n.t}</div>`).join('')}
function toggleNotif(e){e.stopPropagation();$('#notif').classList.toggle('show')}
document.addEventListener('click',e=>{if(!e.target.closest('.notif-wrap'))$('#notif').classList.remove('show')});
$('#gsearch').addEventListener('input',e=>{filt.q=e.target.value;if(page!=='items'){page='items'}draw()});

/* ---- Real-time simulation ---- */
const MSG=[['Item {i} detected','Detection','info'],['Item {i} moved to {z}','Movement','info'],['Camera {c} detected movement','Camera','info'],['Tracking update received for {i}','Tracking','info']];
setInterval(()=>{
 const it=items[Math.floor(Math.random()*items.length)],c=cams[Math.floor(Math.random()*5)],m=MSG[Math.floor(Math.random()*MSG.length)];
 if(it.st==='ON_DISPLAY'){it.seen=now();it.px=Math.max(5,Math.min(95,it.px+(Math.random()-.5)*4))}
 c.act=now();c.fps=Math.max(10,Math.min(15,c.fps+(Math.random()>.5?1:-1)));
 const e={t:now(),txt:m[0].replace('{i}',it.id).replace('{z}',it.zone.replace('Display ','')).replace('{c}',c.id.slice(4)),item:m[0].includes('{i}')?it.id:'',cam:c.id,sev:m[2],type:m[1]};
 events.unshift(e);if(events.length>60)events.pop();
 document.querySelectorAll('[data-ts]').forEach(n=>n.textContent=now());
 document.querySelectorAll('[data-act]').forEach(n=>{const x=cams.find(k=>k.id===n.dataset.act);n.textContent=x.act});
 document.querySelectorAll('[data-cnt]').forEach(n=>n.textContent=cams.find(k=>k.id===n.dataset.cnt).cnt());
 const l=$('#liveEv'),d=$('#dashEv');if(l)l.innerHTML=events.slice(0,9).map(evRow).join('');if(d)d.innerHTML=events.slice(0,6).map(evRow).join('');
 if(page==='live')document.querySelectorAll('.tagbox:not(.red)').forEach(t=>{t.style.left=(10+Math.random()*70)+'%';t.style.top=(25+Math.random()*45)+'%'});
 if(page==='map')document.querySelectorAll('.mk').forEach((m,k)=>{m.style.left=items[k].px+'%'});
},3500);

/* ---- Init ---- */
page=(location.hash||'#dashboard').slice(1);if(!V[page])page='dashboard';draw();
