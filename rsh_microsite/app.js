const header=document.querySelector('.site-header');
const menuToggle=document.querySelector('.menu-toggle');
const mainNav=document.querySelector('.main-nav');

window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>40));

menuToggle.addEventListener('click',()=>{
  const isOpen=mainNav.classList.toggle('open');
  document.body.classList.toggle('menu-open',isOpen);
  menuToggle.setAttribute('aria-expanded',String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach(link=>link.addEventListener('click',()=>{
  mainNav.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded','false');
}));

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.08});

document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const escapeHtml=value=>value.replace(/[&<>'"]/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'
}[char]));

const labels=new Set([
  'Representative Experience:',
  'How this benefits RS&H:',
  'Core capabilities include:',
  'Transportation & Aviation',
  'Federal Defense',
  'OT/ICS/Cybersecurity',
  'Digital twins, data/analytics, AI, smart infrastructure, and asset-lifecycle solutions',
  'Firms transitioning from cost-center digital to revenue-generating digital business units'
]);

const evidencePrefixes=[
  'Account segmentation','Buyer persona','Sales motion','Sales-enablement','Alliance and partner-channel','Integration of digital offerings',
  'Total Addressable Market','Customer, buyer','Market attractiveness','Competitive and adjacent-market','Customer demand signals','Revenue opportunity',
  'Digital business and operating model','Governance, decision-rights','Organizational design','Managed services operating models','Product, platform','Commercialization and growth',
  'Revenue model design','EBITDA/EBBIT','Investment and ROI','Pricing, packaging','Cost-to-serve','Portfolio investment prioritization',
  'Designing digital advisory','Developing commercialization frameworks','Establishing business cases',
  'Colorado Department','California Department','Nevada Department','King County','Massachusetts Department','New York State','United Airlines','Alaska Airlines','Aerospace digital twin',
  'U.S. Air Force','DHS USCIS','FDIC','Global Food Manufacturer','North American Midstream','European Energy Provider','Maritime Technology Company',
  'Industrial and Automotive Organizations','Regulated Utility','Alternative Energy Provider','Major Energy Company','Industrial Organization','Major Utility Company','Power Distribution Utility'
];

function renderParagraph(text){
  const safe=escapeHtml(text);
  if(/^A\.\d\.\d\s/.test(text)) return `<h4 class="subsection-title">${safe}</h4>`;
  if(labels.has(text)||text.startsWith('Risk, procurement, and contracting')) return `<h4 class="content-label">${safe}</h4>`;
  if(text.startsWith('How this benefits RS&H:')&&text.length>25) return `<div class="benefit-callout">${safe}</div>`;
  if((text.startsWith('[')&&text.includes(']'))||text==='Representative Experience:'||text==='How this benefits RS&H:') return `<div class="pending-note">${safe}</div>`;
  if(evidencePrefixes.some(prefix=>text.startsWith(prefix))){
    const colon=text.indexOf(':');
    if(colon>0) return `<div class="evidence-item"><strong>${escapeHtml(text.slice(0,colon+1))}</strong>${escapeHtml(text.slice(colon+1))}</div>`;
    return `<div class="evidence-item">${safe}</div>`;
  }
  return `<p>${safe}</p>`;
}

function buildSectionA(source){
  const paragraphs=source.split(/\n\s*\n/).map(item=>item.trim()).filter(Boolean);
  const groups=[];
  let current=null;
  paragraphs.forEach(paragraph=>{
    if(/^A\.[1-4]\s/.test(paragraph)){
      if(current) groups.push(current);
      current={title:paragraph,items:[]};
    }else if(current){
      current.items.push(paragraph);
    }
  });
  if(current) groups.push(current);

  return groups.map(group=>{
    const match=group.title.match(/^(A\.\d)\s+(.+)$/);
    const number=match?match[1]:'';
    const title=match?match[2]:group.title;
    return `<article class="proposal-block reveal">
      <div class="proposal-block-heading"><span>${escapeHtml(number)}</span><h3>${escapeHtml(title)}</h3></div>
      <div class="proposal-content">${group.items.map(renderParagraph).join('')}</div>
    </article>`;
  }).join('');
}

fetch('section-a.txt')
  .then(response=>{
    if(!response.ok) throw new Error('Unable to load Section A content.');
    return response.text();
  })
  .then(source=>{
    const container=document.querySelector('#section-a-content');
    container.innerHTML=buildSectionA(source);
    container.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  })
  .catch(error=>{
    document.querySelector('#section-a-content').innerHTML=`<div class="pending-note">${escapeHtml(error.message)}</div>`;
  });
