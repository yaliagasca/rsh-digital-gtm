const header=document.querySelector('.site-header');
const menuToggle=document.querySelector('.menu-toggle');
const mainNav=document.querySelector('.main-nav');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>40));
menuToggle.addEventListener('click',()=>{const open=mainNav.classList.toggle('open');document.body.classList.toggle('menu-open',open);menuToggle.setAttribute('aria-expanded',String(open));});
document.querySelectorAll('.main-nav a').forEach(link=>link.addEventListener('click',()=>{mainNav.classList.remove('open');document.body.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false');}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const esc=value=>value.replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));

const editorialInstructions=[
  /^5–6 pages\./,/^Address each of the five areas below\./,/^\[Paragraph 2/,/^\[Response\./,/^Reframe as partnership/,/^Section [AB] —/,/^8–10 pages/,/^How structured interviews/,/^How digital offerings/,/^Primary and secondary research methods/,/^How RS&H retains/,/^How findings are organized/,/^Map activities, deliverables/,/^\[Workplan narrative/,/^Workplan intro paragraph/,/^State what is assumed/
];
const cleanItems=items=>items.filter(item=>!editorialInstructions.some(pattern=>pattern.test(item)));

function renderText(text){
  const safe=esc(text);
  if(/^\d+\.\s/.test(text)) return `<h5 class="content-step">${safe}</h5>`;
  if(/^(Delivery Excellence|Delivery Methodology|Deliverables|Expected Outcome|Assumptions|Dependencies|Risk Management|Representative Examples:|Phase Deliverables:|Our knowledge-transfer approach includes:)$/.test(text)) return `<h5 class="content-label">${safe}</h5>`;
  if(/^(Key deliverables:|Example Outputs:)/.test(text)) return `<div class="evidence-item interactive-highlight"><strong>${safe.split(':')[0]}:</strong>${safe.slice(safe.indexOf(':')+1)}</div>`;
  if(/^How this benefits RS&H:/.test(text)) return `<div class="benefit-callout interactive-highlight">${safe}</div>`;
  if(/^\[/.test(text)||text==='TBD') return `<div class="pending-note interactive-highlight">${safe}</div>`;
  if(text.includes(':')&&text.length<260){const i=text.indexOf(':');return `<div class="evidence-item interactive-highlight"><strong>${esc(text.slice(0,i+1))}</strong>${esc(text.slice(i+1))}</div>`;}
  return `<p>${safe}</p>`;
}

function parseGroups(source,prefix){
  const paragraphs=source.split(/\n\s*\n/).map(v=>v.trim()).filter(Boolean);
  const groups=[];let current=null;
  paragraphs.forEach(p=>{if(new RegExp(`^${prefix}\\.\\d+\\s`).test(p)){if(current)groups.push(current);current={title:p,items:[]};}else if(current){current.items.push(p);}});
  if(current)groups.push(current);return groups;
}

function splitSubsections(items,prefix){
  const intro=[];const sections=[];let current=null;
  cleanItems(items).forEach(item=>{if(new RegExp(`^${prefix}\\.\\d+\\.\\d+\\s`).test(item)){if(current)sections.push(current);current={title:item,items:[]};}else if(current){current.items.push(item);}else{intro.push(item);}});
  if(current)sections.push(current);return{intro,sections};
}

function accordion(section,index){
  const match=section.title.match(/^([AB]\.\d+\.\d+)\s+(.+)$/);const number=match?match[1]:'';const title=match?match[2]:section.title;const id=`panel-${number.replaceAll('.','-')}`;const open=index===0;
  return `<article class="content-accordion ${open?'is-open':''}"><button class="accordion-button" type="button" aria-expanded="${open}" aria-controls="${id}"><span class="accordion-number">${esc(number)}</span><span class="accordion-title">${esc(title)}</span><span class="accordion-icon">${open?'−':'+'}</span></button><div class="accordion-panel" id="${id}"><div class="accordion-inner">${cleanItems(section.items).map(renderText).join('')}</div></div></article>`;
}

function riskMatrix(){
  const rows=[
    ['Stakeholder Participation May Vary','Assessments and recommendations may not fully represent all parties across the organization.','To be confirmed','TBD'],
    ['Timeline Assumes Coordinated Responsiveness','An 11-week project requires consistent momentum. Delays in stakeholder access, documentation, or approvals in the early weeks may compress downstream milestones. We should be cognizant of holiday timing, RS&H’s fiscal year-end, and demands on key resources.','To be confirmed','The full engagement calendar is published at kick-off with asynchronous review options available throughout. AI accelerators reduce dependency on sequential inputs. Milestone reviews provide early visibility if pace adjustment is needed.'],
    ['Incomplete Documentation or Data','Current-state assessment accuracy and financial modeling depend on access to current-state information that may be distributed across entities or inconsistently maintained.','To be confirmed','Findings are validated through multiple sources, stakeholder input, workshops, and iterative review rather than relying on a single data source. Our accelerators produce defensible outputs even with incomplete inputs.'],
    ['TBD','TBD','To be confirmed','TBD']
  ];
  return `<div class="risk-matrix-wrap"><div class="risk-toolbar"><span>Risk management matrix</span><button type="button" class="risk-toggle">Show all details</button></div><div class="risk-grid">${rows.map((r,i)=>`<article class="risk-card" data-expanded="false"><div class="risk-card-top"><span class="risk-index">0${i+1}</span><span class="impact-chip">${esc(r[2])}</span></div><h4>${esc(r[0])}</h4><div class="risk-detail"><strong>Potential impact</strong><p>${esc(r[1])}</p><strong>How we address it</strong><p>${esc(r[3])}</p></div><button class="risk-expand" type="button">View details</button></article>`).join('')}</div></div>`;
}

function buildSection(source,prefix){
  const groups=parseGroups(source,prefix);
  const tabs=groups.map((g,i)=>{const m=g.title.match(/^([AB]\.\d+)\s+(.+)$/);return `<button class="section-tab ${i===0?'is-active':''}" type="button" data-tab="${prefix}-tab-${i}"><span>${esc(m?m[1]:'')}</span>${esc(m?m[2]:g.title)}</button>`;}).join('');
  const panels=groups.map((g,i)=>{const m=g.title.match(/^([AB]\.\d+)\s+(.+)$/);const number=m?m[1]:'';const title=m?m[2]:g.title;const{intro,sections}=splitSubsections(g.items,prefix);const extra=prefix==='B'&&number==='B.10'?riskMatrix():'';return `<section class="section-tab-panel ${i===0?'is-active':''}" id="${prefix}-tab-${i}"><div class="proposal-block-heading"><span>${esc(number)}</span><h3>${esc(title)}</h3></div><div class="proposal-content">${intro.length?`<div class="intro-copy interactive-highlight">${intro.map(renderText).join('')}</div>`:''}${sections.length?`<div class="accordion-list">${sections.map(accordion).join('')}</div>`:''}${extra}</div></section>`;}).join('');
  return `<div class="section-tabs">${tabs}</div>${panels}`;
}

function bind(container){
  const tabs=container.querySelectorAll('.section-tab');const panels=container.querySelectorAll('.section-tab-panel');
  tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(t=>t.classList.remove('is-active'));panels.forEach(p=>p.classList.remove('is-active'));tab.classList.add('is-active');document.getElementById(tab.dataset.tab).classList.add('is-active');}));
  container.querySelectorAll('.accordion-button').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.content-accordion');const open=card.classList.toggle('is-open');btn.setAttribute('aria-expanded',String(open));btn.querySelector('.accordion-icon').textContent=open?'−':'+';}));
  container.querySelectorAll('.risk-expand').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.risk-card');const open=card.dataset.expanded!=='true';card.dataset.expanded=String(open);btn.textContent=open?'Hide details':'View details';}));
  const toggle=container.querySelector('.risk-toggle');if(toggle)toggle.addEventListener('click',()=>{const cards=[...container.querySelectorAll('.risk-card')];const open=cards.some(c=>c.dataset.expanded!=='true');cards.forEach(c=>{c.dataset.expanded=String(open);c.querySelector('.risk-expand').textContent=open?'Hide details':'View details';});toggle.textContent=open?'Collapse all':'Show all details';});
}

async function loadSection(target,files,prefix){
  try{const parts=await Promise.all(files.map(file=>fetch(file).then(r=>{if(!r.ok)throw new Error(`Unable to load ${file}`);return r.text();})));const container=document.querySelector(target);container.innerHTML=buildSection(parts.join('\n\n'),prefix);bind(container);}catch(error){document.querySelector(target).innerHTML=`<div class="pending-note">${esc(error.message)}</div>`;}
}
loadSection('#section-a-content',['section-a.txt'],'A');
loadSection('#section-b-content',['section-b-1.txt','section-b-2.txt','section-b-3.txt','section-b-4.txt'],'B');