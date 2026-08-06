const header=document.querySelector('.site-header');
const menuToggle=document.querySelector('.menu-toggle');
const mainNav=document.querySelector('.main-nav');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>40));
menuToggle.addEventListener('click',()=>{const open=mainNav.classList.toggle('open');document.body.classList.toggle('menu-open',open);menuToggle.setAttribute('aria-expanded',String(open));});
document.querySelectorAll('.main-nav a').forEach(link=>link.addEventListener('click',()=>{mainNav.classList.remove('open');document.body.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false');}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const esc=value=>value.replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));

const editorialInstructions=[/^5–6 pages\./,/^Address each of the five areas below\./,/^\[Paragraph 2/,/^\[Response\./,/^Reframe as partnership/,/^Section [AB] —/,/^8–10 pages/,/^How structured interviews/,/^How digital offerings/,/^Primary and secondary research methods/,/^How RS&H retains/,/^How findings are organized/,/^Map activities, deliverables/,/^\[Workplan narrative/,/^Workplan intro paragraph/,/^State what is assumed/];
const cleanItems=items=>items.filter(item=>!editorialInstructions.some(pattern=>pattern.test(item)));

function renderText(text){const safe=esc(text);if(/^\d+\.\s/.test(text))return `<h5 class="content-step">${safe}</h5>`;if(/^(Delivery Excellence|Delivery Methodology|Deliverables|Expected Outcome|Assumptions|Dependencies|Risk Management|Representative Examples:?|Phase Deliverables:|Our knowledge-transfer approach includes:)$/.test(text))return `<h5 class="content-label">${safe}</h5>`;if(/^(Key deliverables:|Example Outputs:)/.test(text))return `<div class="evidence-item interactive-highlight"><strong>${safe.split(':')[0]}:</strong>${safe.slice(safe.indexOf(':')+1)}</div>`;if(/^How this benefits RS&H:/.test(text))return `<div class="benefit-callout interactive-highlight">${safe}</div>`;if(/^\[/.test(text)||text==='TBD')return `<div class="pending-note interactive-highlight">${safe}</div>`;if(text.includes(':')&&text.length<260){const i=text.indexOf(':');return `<div class="evidence-item interactive-highlight"><strong>${esc(text.slice(0,i+1))}</strong>${esc(text.slice(i+1))}</div>`;}return `<p>${safe}</p>`;}
function parseGroups(source,prefix){const paragraphs=source.split(/\n\s*\n/).map(v=>v.trim()).filter(Boolean);const groups=[];let current=null;paragraphs.forEach(p=>{if(new RegExp(`^${prefix}\\.\\d+\\s`).test(p)){if(current)groups.push(current);current={title:p,items:[]};}else if(current){current.items.push(p);}});if(current)groups.push(current);return groups;}
function splitSubsections(items,prefix){const intro=[];const sections=[];let current=null;cleanItems(items).forEach(item=>{if(new RegExp(`^${prefix}\\.\\d+\\.\\d+\\s`).test(item)){if(current)sections.push(current);current={title:item,items:[]};}else if(current){current.items.push(item);}else{intro.push(item);}});if(current)sections.push(current);return{intro,sections};}
function accordion(section,index){const match=section.title.match(/^([AB]\.\d+\.\d+)\s+(.+)$/);const number=match?match[1]:'';const title=match?match[2]:section.title;const id=`panel-${number.replaceAll('.','-')}`;const open=index===0;return `<article class="content-accordion ${open?'is-open':''}"><button class="accordion-button" type="button" aria-expanded="${open}" aria-controls="${id}"><span class="accordion-number">${esc(number)}</span><span class="accordion-title">${esc(title)}</span><span class="accordion-icon">${open?'−':'+'}</span></button><div class="accordion-panel" id="${id}"><div class="accordion-inner">${cleanItems(section.items).map(renderText).join('')}</div></div></article>`;}

function representativeExamples(items){const clean=cleanItems(items);const marker=clean.findIndex(x=>/^Representative Examples:?$/.test(x));if(marker<0)return null;const before=clean.slice(0,marker);const after=clean.slice(marker+1);let closing=[];while(after.length&&/^(Together,|These examples)/.test(after[after.length-1]))closing.unshift(after.pop());const examples=[];after.forEach(item=>{const lines=item.split('\n').map(x=>x.trim()).filter(Boolean);if(lines.length>1&&lines[0].includes('—')){examples.push({title:lines[0],body:lines.slice(1).join(' ')});return;}if(item.includes('—')){const sentenceBreak=item.search(/\n|(?<=\))\s+Slalom|(?<=Strategy)\s+Slalom|(?<=Services)\s+Slalom|(?<=Platform)\s+Slalom|(?<=Prioritization)\s+Slalom|(?<=Twin)\s+Slalom|(?<=Systems)\s+As prime|(?<=Operations)\s+Slalom|(?<=Governance)\s+Slalom|(?<=Cybersecurity)\s+Slalom/);if(sentenceBreak>0)examples.push({title:item.slice(0,sentenceBreak).trim(),body:item.slice(sentenceBreak).trim()});else examples.push({title:item,body:''});}else if(examples.length&&!examples[examples.length-1].body){examples[examples.length-1].body=item;}else before.push(item);});
const cards=examples.map((ex,i)=>`<article class="rep-example ${i===0?'is-open':''}"><button class="rep-example-button" type="button" aria-expanded="${i===0}"><span class="rep-example-index">${String(i+1).padStart(2,'0')}</span><span class="rep-example-title">${esc(ex.title.replace(/ \(Public Slalom\.com Story\)$/,''))}</span><span class="rep-example-icon">${i===0?'−':'+'}</span></button><div class="rep-example-panel"><div class="rep-example-body">${ex.title.includes('(Public Slalom.com Story)')?'<span class="rep-public-badge">Public story</span>':''}${ex.body?`<p>${esc(ex.body)}</p>`:''}</div></div></article>`).join('');
return {before,html:`<section class="representative-examples"><div class="rep-examples-heading"><div><p class="eyebrow blue">Selected proof points</p><h4>Representative Examples</h4></div><p>Select an example to explore the relevant experience.</p></div><div class="rep-examples-grid">${cards}</div></section>${closing.map(renderText).join('')}`};}

function iconFor(number,title){const key=`${number} ${title}`.toLowerCase();let paths='<circle cx="12" cy="12" r="7"/><path d="M12 8v8M8 12h8"/>';if(key.includes('firm')||key.includes('qualification'))paths='<path d="M4 20h16M6 20V8l6-4 6 4v12M9 11h2M13 11h2M9 15h2M13 15h2"/>';else if(key.includes('current state')||key.includes('assessment'))paths='<circle cx="12" cy="12" r="8"/><path d="m12 12 5-3M12 6v2M6 12h2M16 16l1.5 1.5"/>';else if(key.includes('market'))paths='<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.3 3.5 5 3.5 8S14.5 17.7 12 20M12 4c-2.5 2.3-3.5 5-3.5 8s1 5.7 3.5 8"/>';else if(key.includes('financial')||key.includes('business model'))paths='<path d="M5 19V9M10 19V5M15 19v-7M20 19V8"/><path d="m4 7 5-3 5 4 6-5"/>';else if(key.includes('offering')||key.includes('strategy'))paths='<path d="M9 18h6M10 21h4"/><path d="M8 14c-1.5-1.2-2.5-3-2.5-5A6.5 6.5 0 0 1 18.5 9c0 2-1 3.8-2.5 5-1 .8-1 1.5-1 2H9c0-.5 0-1.2-1-2z"/>';else if(key.includes('knowledge'))paths='<path d="M3 6h7c2 0 2 2 2 2s0-2 2-2h7v12h-7c-2 0-2 2-2 2s0-2-2-2H3z"/>';else if(key.includes('presentation')||key.includes('readout'))paths='<path d="M4 4h16v11H4zM8 20l4-5 4 5"/>';else if(key.includes('workplan')||key.includes('timeline'))paths='<rect x="4" y="5" width="16" height="15" rx="1"/><path d="M8 3v4M16 3v4M4 9h16M8 13h3M13 13h3M8 17h3"/>';else if(key.includes('risk')||key.includes('assumption'))paths='<path d="M12 3 20 7v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7z"/><path d="M12 8v5M12 16h.01"/>';else if(key.includes('delivery')||key.includes('methodology'))paths='<path d="M4 17 9 6l4 5 3-4 4 10z"/><path d="M4 20h16"/>';return `<svg class="ribbon-icon" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;}

function riskMatrix(){const rows=[['Stakeholder Participation May Vary','Assessments and recommendations may not fully represent all parties across the organization.','To be confirmed','TBD'],['Timeline Assumes Coordinated Responsiveness','An 11-week project requires consistent momentum. Delays in stakeholder access, documentation, or approvals in the early weeks may compress downstream milestones. We should be cognizant of holiday timing, RS&H’s fiscal year-end, and demands on key resources.','To be confirmed','The full engagement calendar is published at kick-off with asynchronous review options available throughout. AI accelerators reduce dependency on sequential inputs. Milestone reviews provide early visibility if pace adjustment is needed.'],['Incomplete Documentation or Data','Current-state assessment accuracy and financial modeling depend on access to current-state information that may be distributed across entities or inconsistently maintained.','To be confirmed','Findings are validated through multiple sources, stakeholder input, workshops, and iterative review rather than relying on a single data source. Our accelerators produce defensible outputs even with incomplete inputs.'],['TBD','TBD','To be confirmed','TBD']];return `<div class="risk-matrix-wrap"><div class="risk-matrix-title">Risk management matrix</div><div class="risk-table" role="table" aria-label="Risk management matrix"><div class="risk-table-header" role="row"><div role="columnheader">Risk</div><div role="columnheader">Potential impact</div><div role="columnheader">Impact level</div><div role="columnheader">How we address it</div></div>${rows.map((r,i)=>`<div class="risk-table-row risk-row-${i+1}" role="row"><div class="risk-cell risk-name" role="cell">${esc(r[0])}</div><div class="risk-cell" role="cell">${esc(r[1])}</div><div class="risk-cell risk-level" role="cell"><span>${esc(r[2])}</span></div><div class="risk-cell" role="cell">${esc(r[3])}</div></div>`).join('')}</div></div>`;}

function buildSection(source,prefix){const groups=parseGroups(source,prefix);const tabs=groups.map((g,i)=>{const m=g.title.match(/^([AB]\.\d+)\s+(.+)$/);const number=m?m[1]:'';const title=m?m[2]:g.title;return `<button class="section-tab ${i===0?'is-active':''}" type="button" data-tab="${prefix}-tab-${i}" title="${esc(title)}">${iconFor(number,title)}<span class="tab-number">${esc(number)}</span><span class="tab-title">${esc(title)}</span></button>`;}).join('');const panels=groups.map((g,i)=>{const m=g.title.match(/^([AB]\.\d+)\s+(.+)$/);const number=m?m[1]:'';const title=m?m[2]:g.title;const{intro,sections}=splitSubsections(g.items,prefix);const reps=prefix==='A'&&!sections.length?representativeExamples(intro):null;const introItems=reps?reps.before:intro;const extra=prefix==='B'&&number==='B.10'?riskMatrix():'';return `<section class="section-tab-panel ${i===0?'is-active':''}" id="${prefix}-tab-${i}"><div class="proposal-block-heading"><span>${esc(number)}</span><h3>${esc(title)}</h3></div><div class="proposal-content">${introItems.length?`<div class="intro-copy interactive-highlight">${introItems.map(renderText).join('')}</div>`:''}${sections.length?`<div class="accordion-list">${sections.map(accordion).join('')}</div>`:''}${reps?reps.html:''}${extra}</div></section>`;}).join('');return `<div class="section-tabs" aria-label="${prefix} section navigation">${tabs}</div>${panels}`;}
function bind(container){const tabs=container.querySelectorAll('.section-tab');const panels=container.querySelectorAll('.section-tab-panel');tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(t=>t.classList.remove('is-active'));panels.forEach(p=>p.classList.remove('is-active'));tab.classList.add('is-active');document.getElementById(tab.dataset.tab).classList.add('is-active');}));container.querySelectorAll('.accordion-button,.rep-example-button').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.content-accordion,.rep-example');const open=card.classList.toggle('is-open');btn.setAttribute('aria-expanded',String(open));const icon=btn.querySelector('.accordion-icon,.rep-example-icon');if(icon)icon.textContent=open?'−':'+';}));}
async function loadSection(target,files,prefix){try{const parts=await Promise.all(files.map(file=>fetch(file).then(r=>{if(!r.ok)throw new Error(`Unable to load ${file}`);return r.text();})));const container=document.querySelector(target);container.innerHTML=buildSection(parts.join('\n\n'),prefix);bind(container);if(prefix==='A')enhanceRepresentativeExamples(container);}catch(error){document.querySelector(target).innerHTML=`<div class="pending-note">${esc(error.message)}</div>`;}}
loadSection('#section-a-content',['section-a.txt'],'A');
loadSection('#section-b-content',['section-b-1.txt','section-b-2.txt','section-b-3.txt','section-b-4.txt'],'B');

function enhanceRepresentativeExamples(container){
  if(!document.getElementById('proof-point-selector-styles')){
    const style=document.createElement('style');
    style.id='proof-point-selector-styles';
    style.textContent=`
      .representative-examples.proof-selector{padding:34px;background:linear-gradient(145deg,#f8fbff 0%,#fff 70%)}
      .proof-selector .rep-examples-heading{align-items:center;margin-bottom:26px}
      .proof-selector-meta{display:flex;align-items:center;gap:12px;color:#667085;font-size:.82rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
      .proof-selector-count{color:var(--blue)}
      .proof-selector-tabs{display:grid;grid-template-columns:repeat(var(--proof-count),minmax(0,1fr));gap:10px;margin-bottom:18px}
      .proof-selector-tab{position:relative;display:flex;flex-direction:column;justify-content:space-between;min-height:128px;padding:18px;border:1px solid #dbe3f1;background:#fff;color:var(--navy);text-align:left;cursor:pointer;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease,background .22s ease}
      .proof-selector-tab::after{content:"";position:absolute;left:0;right:100%;bottom:-1px;height:4px;background:var(--blue);transition:right .25s ease}
      .proof-selector-tab:hover{transform:translateY(-3px);border-color:#9db9f6;box-shadow:0 14px 28px rgba(15,66,200,.09)}
      .proof-selector-tab:hover::after,.proof-selector-tab.is-active::after{right:0}
      .proof-selector-tab.is-active{border-color:var(--blue);background:#f1f6ff;box-shadow:0 14px 32px rgba(15,66,200,.1)}
      .proof-selector-tab:focus-visible{outline:3px solid var(--lime);outline-offset:3px}
      .proof-selector-number{color:var(--blue);font-size:.7rem;font-weight:800;letter-spacing:.12em}
      .proof-selector-company{font-family:Manrope,Inter,sans-serif;font-size:.9rem;font-weight:800;line-height:1.3}
      .proof-selector-arrow{align-self:flex-end;color:var(--blue);font-size:1.1rem;transition:transform .22s ease}
      .proof-selector-tab.is-active .proof-selector-arrow{transform:translateX(3px)}
      .proof-selector-detail{position:relative;min-height:210px;padding:34px 38px 32px;border:1px solid #cfd9eb;background:#fff;overflow:hidden}
      .proof-selector-detail::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--blue)}
      .proof-detail-kicker{margin-bottom:10px;color:var(--blue);font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
      .proof-detail-title{max-width:920px;margin:0 0 18px;color:var(--navy);font-family:Manrope,Inter,sans-serif;font-size:clamp(1.35rem,2vw,2rem);line-height:1.2}
      .proof-detail-body{max-width:980px;color:#475467;line-height:1.75}
      .proof-detail-body p{margin:0}
      .proof-detail-content{animation:proofFade .28s ease both}
      @keyframes proofFade{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
      @media(max-width:1150px){.proof-selector-tabs{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:760px){.representative-examples.proof-selector{padding:22px 16px}.proof-selector-tabs{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}.proof-selector-tab{flex:0 0 78%;min-height:116px;scroll-snap-align:start}.proof-selector-detail{padding:26px 22px 24px}.proof-selector .rep-examples-heading{align-items:flex-start}.proof-selector-meta{margin-top:4px}}
    `;
    document.head.appendChild(style);
  }

  container.querySelectorAll('.representative-examples:not(.proof-selector)').forEach(section=>{
    const cards=[...section.querySelectorAll('.rep-example')].map((card,index)=>{
      const title=card.querySelector('.rep-example-title')?.textContent.trim()||`Example ${index+1}`;
      const body=card.querySelector('.rep-example-body')?.innerHTML||'';
      const company=title.includes('—')?title.split('—')[0].trim():title;
      return{title,company,body,index};
    });
    if(!cards.length)return;

    section.classList.add('proof-selector');
    section.style.setProperty('--proof-count',Math.min(cards.length,5));
    const heading=section.querySelector('.rep-examples-heading');
    if(heading){
      const helper=heading.querySelector(':scope > p');
      if(helper)helper.outerHTML=`<div class="proof-selector-meta"><span class="proof-selector-count">01 / ${String(cards.length).padStart(2,'0')}</span><span>Explore selected experience</span></div>`;
    }

    const oldGrid=section.querySelector('.rep-examples-grid');
    const tabs=document.createElement('div');
    tabs.className='proof-selector-tabs';
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label','Representative examples');
    cards.forEach((card,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className=`proof-selector-tab${index===0?' is-active':''}`;
      button.setAttribute('role','tab');
      button.setAttribute('aria-selected',String(index===0));
      button.innerHTML=`<span class="proof-selector-number">${String(index+1).padStart(2,'0')}</span><span class="proof-selector-company">${esc(card.company)}</span><span class="proof-selector-arrow" aria-hidden="true">→</span>`;
      tabs.appendChild(button);
    });

    const detail=document.createElement('div');
    detail.className='proof-selector-detail';
    detail.setAttribute('role','tabpanel');
    const renderDetail=index=>{
      const card=cards[index];
      detail.innerHTML=`<div class="proof-detail-content"><div class="proof-detail-kicker">Selected proof point ${String(index+1).padStart(2,'0')}</div><h5 class="proof-detail-title">${esc(card.title)}</h5><div class="proof-detail-body">${card.body||'<p>Additional detail pending.</p>'}</div></div>`;
      section.querySelector('.proof-selector-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
      [...tabs.children].forEach((tab,tabIndex)=>{
        const active=tabIndex===index;
        tab.classList.toggle('is-active',active);
        tab.setAttribute('aria-selected',String(active));
      });
    };
    [...tabs.children].forEach((tab,index)=>tab.addEventListener('click',()=>renderDetail(index)));
    renderDetail(0);
    oldGrid.replaceWith(tabs);
    tabs.insertAdjacentElement('afterend',detail);
  });
}
