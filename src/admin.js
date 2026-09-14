import { supabase } from './supabase.js';

const $=s=>document.querySelector(s);
let currentPage='dashboard';
const schemas={
 researchers:{label:'Researchers',fields:['name','position','email','google_scholar','orcid','bio','expertise']},
 students:{label:'Students',fields:['name','degree','status','research_topic','supervisor','start_year','graduation_year']},
 publications:{label:'Publications',fields:['year','type','title','authors','venue','doi','google_scholar','url','abstract','topics']},
 theses:{label:'Theses',fields:['year','degree','title','author','supervisor','abstract','pdf_url']},
 projects:{label:'Projects',fields:['title','status','summary','pi','funding','start_date','end_date','url']},
 news:{label:'News',fields:['title','summary','body','published_at','url']},
 gallery:{label:'Gallery',fields:['caption','image_url','storage_path']}
};

async function boot(){
 const {data:{session}}=await supabase.auth.getSession();
 if(session){showAdmin();} else {showLogin();}
 supabase.auth.onAuthStateChange((_e,s)=>s?showAdmin():showLogin());
}
function showLogin(){$('#loginPanel').hidden=false;$('#adminPanel').hidden=true}
function showAdmin(){$('#loginPanel').hidden=true;$('#adminPanel').hidden=false;loadPage('dashboard')}
$('#login').onclick=async()=>{const {error}=await supabase.auth.signInWithPassword({email:$('#email').value,password:$('#password').value});$('#loginMsg').textContent=error?error.message:''};
$('#logout').onclick=()=>supabase.auth.signOut();

document.querySelectorAll('.side[data-page]').forEach(b=>b.onclick=()=>loadPage(b.dataset.page));
$('#newRecord').onclick=()=>newRecord();

async function loadPage(page){
 currentPage=page; document.querySelectorAll('.side').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
 $('#pageTitle').textContent=schemas[page]?.label||'Dashboard';
 $('#newRecord').hidden=page==='dashboard';
 if(page==='dashboard'){renderDashboard();return}
 const {data,error}=await supabase.from(page).select('*').order('created_at',{ascending:false});
 if(error){$('#adminContent').innerHTML=`<div class="empty">${error.message}</div>`;return}
 renderTable(page,data||[]);
}
function renderDashboard(){
 $('#adminContent').innerHTML=`<div class="admin-cards"><div><b>Research archive</b><span>Manage verified group records.</span></div><div><b>Publications</b><span>DOI, publisher and Scholar links.</span></div><div><b>People</b><span>Faculty, students and alumni.</span></div><div><b>Media</b><span>Gallery and research activities.</span></div></div><div class="admin-note"><b>Security:</b> only authenticated users listed in <code>admin_users</code> can create, edit or delete records.</div>`;
}
function renderTable(page,rows){
 const fields=schemas[page].fields;
 $('#adminContent').innerHTML=`<div class="table-wrap"><table><thead><tr><th>ID</th>${fields.map(f=>`<th>${f}</th>`).join('')}<th>Actions</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.id||''}</td>${fields.map(f=>`<td>${formatCell(r[f])}</td>`).join('')}<td><button class="mini" data-edit="${r.id}">Edit</button> <button class="mini danger" data-delete="${r.id}">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editRecord(page,b.dataset.edit));
 document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteRecord(page,b.dataset.delete));
}
function formatCell(v){if(Array.isArray(v))return v.join(', ');return String(v??'').slice(0,140)}
function form(page,row={}){
 const fs=schemas[page].fields;
 $('#adminContent').innerHTML=`<form id="recordForm" class="record-form"><div class="form-grid">${fs.map(f=>{let v=row[f]??'';let area=['bio','abstract','summary','body'].includes(f);return `<label>${f.replaceAll('_',' ')}<${area?'textarea':'input'} name="${f}" ${f==='year'?'type="number"':''} placeholder="${f}">${area?v:''}</${area?'textarea':'input'}></label>`}).join('')}</div><button class="btn primary" type="submit">Save record</button> <button class="btn outline-dark" type="button" id="cancel">Cancel</button></form>`;
 const f=$('#recordForm'); fs.forEach(x=>{if(!['bio','abstract','summary','body'].includes(x)&&f[x])f[x].value=Array.isArray(row[x])?row[x].join(', '):(row[x]??'')});
 f.onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(f));if(['expertise','topics'].some(x=>x in data)) {if(data.expertise!==undefined)data.expertise=data.expertise.split(',').map(x=>x.trim()).filter(Boolean);if(data.topics!==undefined)data.topics=data.topics.split(',').map(x=>x.trim()).filter(Boolean)};let q=row.id?supabase.from(page).update(data).eq('id',row.id):supabase.from(page).insert(data);const {error}=await q;if(error)alert(error.message);else loadPage(page)};
 $('#cancel').onclick=()=>loadPage(page);
}
async function newRecord(){form(currentPage)}
async function editRecord(page,id){const {data,error}=await supabase.from(page).select('*').eq('id',id).single();if(error)alert(error.message);else form(page,data)}
async function deleteRecord(page,id){if(!confirm('Delete this record?'))return;const {error}=await supabase.from(page).delete().eq('id',id);if(error)alert(error.message);else loadPage(page)}
boot();
