import { getRows, publicStorageUrl } from './supabase.js';
import { supabase } from './supabase.js';

const $=s=>document.querySelector(s);
$('#year').textContent=new Date().getFullYear();
$('#menuBtn')?.addEventListener('click',()=>$('#mainNav').classList.toggle('open'));

let publications=[];

async function load(){
  try{
    const [researchers,students,pubs,theses,projects,news,gallery]=await Promise.all([
      getRows('researchers',{order:'created_at'}),getRows('students',{order:'created_at'}),
      getRows('publications',{order:'year'}),getRows('theses',{order:'year'}),
      getRows('projects',{order:'created_at'}),getRows('news',{order:'published_at'}),
      getRows('gallery',{order:'created_at'})
    ]);
    publications=pubs;
    $('#metricPubs').textContent=pubs.length;
    $('#metricResearchers').textContent=researchers.length;
    $('#metricStudents').textContent=students.filter(x=>x.status==='Current').length;
    $('#metricProjects').textContent=projects.filter(x=>x.status!=='Completed').length;
    renderResearchers(researchers); renderStudents(students); setupPubFilters(pubs); renderPubs(pubs);
    renderTheses(theses); renderProjects(projects); renderNews(news); renderGallery(gallery);
  }catch(e){ console.error(e); showFallback(); }
}

function renderResearchers(rows){
 $('#researcherGrid').innerHTML=rows.map(r=>`<article class="profile"><img src="${r.photo_url||'https://placehold.co/600x500/eaf4f8/0b5cab?text=Researcher'}"><div><span class="role">${r.position||'Researcher'}</span><h3>${esc(r.name)}</h3><p>${esc(r.bio||'')}</p><div class="chips">${(r.expertise||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="links">${r.google_scholar?`<a href="${r.google_scholar}" target="_blank">Google Scholar ↗</a>`:''}${r.orcid?`<a href="${r.orcid}" target="_blank">ORCID ↗</a>`:''}${r.email?`<a href="mailto:${r.email}">Email</a>`:''}</div></div></article>`).join('');
}
function renderStudents(rows){
 const current=rows.filter(r=>r.status==='Current');
 $('#studentGrid').innerHTML=current.map(r=>`<article class="student"><div class="student-avatar">${initials(r.name)}</div><div><span class="role">${esc(r.degree||'Postgraduate')}</span><h3>${esc(r.name)}</h3><p>${esc(r.research_topic||'')}</p><small>${esc(r.start_year||'')} • ${esc(r.supervisor||'')}</small></div></article>`).join('')||empty('No current student records yet.');
}
function setupPubFilters(rows){
 const years=[...new Set(rows.map(r=>r.year).filter(Boolean))].sort((a,b)=>b-a);
 $('#pubYear').innerHTML='<option value="">All years</option>'+years.map(y=>`<option>${y}</option>`).join('');
 const topics=[...new Set(rows.flatMap(r=>r.topics||[]))].sort();
 $('#pubTopic').innerHTML='<option value="">All topics</option>'+topics.map(x=>`<option>${esc(x)}</option>`).join('');
 ['pubSearch','pubYear','pubType','pubTopic'].forEach(id=>$('#'+id).addEventListener('input',filterPubs));
}
function filterPubs(){
 const q=$('#pubSearch').value.toLowerCase(), y=$('#pubYear').value, t=$('#pubType').value, topic=$('#pubTopic').value;
 renderPubs(publications.filter(p=>(!q||[p.title,p.authors,p.abstract,(p.topics||[]).join(' ')].join(' ').toLowerCase().includes(q))&&(!y||String(p.year)===y)&&(!t||p.type===t)&&(!topic||(p.topics||[]).includes(topic))));
}
function renderPubs(rows){
 $('#publicationList').innerHTML=rows.map(p=>`<article class="publication"><b>${p.year||''}</b><div><h3>${esc(p.title)}</h3><p>${esc(p.authors||'')}</p><small>${esc(p.venue||'')} ${p.volume?`• Vol. ${esc(p.volume)}`:''}</small><div class="links">${p.doi?`<a href="https://doi.org/${encodeURIComponent(p.doi)}" target="_blank">DOI ↗</a>`:''}${p.google_scholar?`<a href="${p.google_scholar}" target="_blank">Google Scholar ↗</a>`:''}${p.url?`<a href="${p.url}" target="_blank">Publisher ↗</a>`:''}</div></div></article>`).join('')||empty('No publications match your filters.');
}
function renderTheses(rows){$('#thesisList').innerHTML=rows.map(t=>`<article class="archive-item"><span>${t.year||''}</span><div><h3>${esc(t.title)}</h3><p>${esc(t.author)} • ${esc(t.degree||'')}</p><small>Supervisor: ${esc(t.supervisor||'')}</small>${t.pdf_url?`<a class="text-link" href="${t.pdf_url}" target="_blank">Open thesis ↗</a>`:''}</div></article>`).join('')||empty('No thesis records yet.');}
function renderProjects(rows){$('#projectGrid').innerHTML=rows.map(p=>`<article class="project-card"><span class="status">${esc(p.status||'Active')}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary||'')}</p><small>PI: ${esc(p.pi||'')}</small></article>`).join('')||empty('No project records yet.');}
function renderNews(rows){$('#newsGrid').innerHTML=rows.map(n=>`<article class="news-card"><div class="news-date">${n.published_at?new Date(n.published_at).toLocaleDateString():''}</div><h3>${esc(n.title)}</h3><p>${esc(n.summary||'')}</p>${n.url?`<a class="text-link" href="${n.url}" target="_blank">Read more ↗</a>`:''}</article>`).join('')||empty('No news items yet.');}
function renderGallery(rows){$('#galleryGrid').innerHTML=rows.map(g=>`<figure><img src="${g.image_url||publicStorageUrl(g.storage_path)||'https://placehold.co/800x550/eaf4f8/0b5cab?text=KMUTT+Control+Lab'}"><figcaption>${esc(g.caption||'')}</figcaption></figure>`).join('')||empty('No gallery items yet.');}
function showFallback(){['researcherGrid','studentGrid','publicationList','thesisList','projectGrid','newsGrid','galleryGrid'].forEach(id=>{if($( '#'+id)) $('#'+id).innerHTML=empty('Connect Supabase and run the database schema to load records.')});}
function empty(t){return `<div class="empty">${t}</div>`}
function initials(n=''){return n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

$('#exportPubs')?.addEventListener('click',()=>{
 const cols=['year','type','title','authors','venue','doi','url'];
 const csv=[cols.join(','),...publications.map(p=>cols.map(c=>`"${String(p[c]??'').replaceAll('"','""')}"`).join(','))].join('\\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='kmutt-control-publications.csv';a.click();
});
load();
