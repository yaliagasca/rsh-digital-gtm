(() => {
  const root = document.querySelector('#case-studies-content');
  const cases = Array.isArray(window.caseStudiesData) ? window.caseStudiesData : [];
  if (!root) return;

  const sectorTags = [...new Set(cases.flatMap(item => item.sectorTags))].sort((a,b)=>a.localeCompare(b));
  const capabilityTags = [...new Set(cases.flatMap(item => item.capabilityTags))].sort((a,b)=>a.localeCompare(b));
  const selected = new Set();

  const iconSvg = name => ({
    health:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"/><path d="M9 12h6M12 9v6"/></svg>',
    mobility:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16h14l-1.5-6h-11z"/><path d="M7 10l1.5-3h7L17 10M6 16v2M18 16v2"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>',
    growth:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/><path d="M16 7h3v3"/></svg>',
    finance:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v10M15 9.5c-.8-1-1.7-1.5-3-1.5-1.7 0-3 1-3 2.3 0 1.5 1.2 2 3 2.4 1.8.3 3 .8 3 2.3 0 1.4-1.3 2.5-3.2 2.5-1.4 0-2.6-.5-3.6-1.5"/></svg>',
    strategy:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m15 9 5-5M17 4h3v3"/></svg>',
    software:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8M8 13h5"/></svg>'
  }[name]||'');

  const iconFor = item => {
    const t=[...item.sectorTags,...item.capabilityTags].join(' ').toLowerCase();
    if(t.includes('health')) return 'health';
    if(t.includes('software')) return 'software';
    if(t.includes('transport')||t.includes('automotive')||t.includes('fleet')) return 'mobility';
    if(t.includes('food')||t.includes('cpg')) return 'growth';
    if(t.includes('financial')) return 'finance';
    return 'strategy';
  };

  const coverData = item => ({
    'walgreens-clinical-services': {label:'Clinical services',stat:'GTM',sub:'Roadmap · Sales enablement'},
    'ford-data-monetization': {label:'Connected mobility',stat:'DATA',sub:'Monetization · Consent'},
    'fortune-100-cpg-growth': {label:'Opportunity sizing',stat:'$1.4B',sub:'Potential sales'},
    'tier-1-fleet-growth-planning': {label:'Long-term planning',stat:'200%',sub:'Projected growth in 5 years'},
    'human-performance-market-research': {label:'New market opportunity',stat:'4',sub:'Research · Geography · Sizing'},
    'financial-services-software-gtm': {label:'Value-led commercialization',stat:'GTM',sub:'Product · Pricing · Packaging'}
  }[item.id] || {label:'Client story',stat:'GTM',sub:'Strategy · Growth'});

  const filterIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h8M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="18" r="2"/></svg>';
  const chip = tag => `<button class="case-filter" type="button" data-tag="${tag}" aria-pressed="false">${tag}</button>`;

  root.innerHTML=`
    <div class="case-library-intro"><p>Slalom brings demonstrated experience helping organizations commercialize digital services, data and AI-enabled offerings, and complex B2B solutions by connecting market strategy, product readiness, sales enablement, operating-model design, and financial modeling into actionable go-to-market plans.</p></div>
    <section class="case-filter-panel" aria-label="Filter case studies">
      <div class="case-filter-bar">
        <button class="case-filter-toggle" type="button" aria-expanded="false" aria-controls="case-filter-menu">${filterIcon}<span>Filter cases</span><strong class="case-active-count" hidden>0</strong><span class="case-filter-chevron">⌄</span></button>
        <div class="case-result-summary" aria-live="polite"><strong>${cases.length}</strong> case studies</div>
        <button class="case-clear" type="button" disabled>Clear</button>
      </div>
      <div class="case-active-filters" aria-live="polite"></div>
      <div class="case-filter-menu" id="case-filter-menu" hidden>
        <div class="case-filter-menu-head"><div><p class="eyebrow blue">Explore relevant experience</p><h3>Select one or more filters</h3></div><span>Matches any selected filter</span></div>
        <div class="case-filter-groups">
          <section><p class="case-filter-group-label">Industries</p><div class="case-filters" role="group" aria-label="Industry filters">${sectorTags.map(chip).join('')}</div></section>
          <section><p class="case-filter-group-label">Capabilities</p><div class="case-filters" role="group" aria-label="Capability filters">${capabilityTags.map(chip).join('')}</div></section>
        </div>
      </div>
    </section>
    <div class="case-grid"></div>
    <div class="case-empty" hidden><h3>No case studies match those filters.</h3><p>Clear one or more filters to broaden the results.</p><button type="button" class="case-clear-empty">View all cases</button></div>
    <div class="case-dialog" hidden><button class="case-dialog-backdrop" type="button" aria-label="Close case study detail"></button><section class="case-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="case-dialog-title" tabindex="-1"><button class="case-dialog-close" type="button" aria-label="Close case study detail">×</button><div class="case-dialog-content"></div></section></div>`;

  const grid=root.querySelector('.case-grid');
  const resultSummary=root.querySelector('.case-result-summary');
  const empty=root.querySelector('.case-empty');
  const dialog=root.querySelector('.case-dialog');
  const dialogPanel=root.querySelector('.case-dialog-panel');
  const dialogContent=root.querySelector('.case-dialog-content');
  const toggle=root.querySelector('.case-filter-toggle');
  const menu=root.querySelector('.case-filter-menu');
  const activeFilters=root.querySelector('.case-active-filters');
  const activeCount=root.querySelector('.case-active-count');
  let lastFocus=null;

  const tagsFor=item=>[...item.sectorTags,...item.capabilityTags];
  const card=item=>{const cover=coverData(item);return `<article class="case-card case-cover-${iconFor(item)}" data-id="${item.id}">
    <div class="case-card-cover"><span class="case-cover-label">${cover.label}</span><span class="case-cover-stat">${cover.stat}</span><span class="case-cover-sub">${cover.sub}</span><span class="case-cover-icon">${iconSvg(iconFor(item))}</span></div>
    <div class="case-card-body"><p class="case-card-sector">${item.sectorTags.join(' · ')}</p><p class="case-card-client">${item.clientDisplayName}</p><h3>${item.engagementTitle}</h3><p class="case-card-summary">${item.summary}</p><div class="case-card-tags">${item.capabilityTags.slice(0,3).map(tag=>`<span>${tag}</span>`).join('')}</div><button class="case-card-open" type="button" data-open-case="${item.id}" aria-label="Open ${item.engagementTitle}">Explore case <span aria-hidden="true">↗</span></button></div>
  </article>`;};

  function renderActiveFilters(){activeFilters.innerHTML=[...selected].map(tag=>`<button type="button" class="case-active-chip" data-remove-tag="${tag}" aria-label="Remove ${tag} filter"><span>${tag}</span>×</button>`).join('');activeFilters.hidden=selected.size===0;activeCount.textContent=selected.size;activeCount.hidden=selected.size===0;activeFilters.querySelectorAll('[data-remove-tag]').forEach(btn=>btn.addEventListener('click',()=>{selected.delete(btn.dataset.removeTag);render();}));}
  function render(){const filtered=selected.size?cases.filter(item=>tagsFor(item).some(tag=>selected.has(tag))):cases;grid.innerHTML=filtered.map(card).join('');resultSummary.innerHTML=`<strong>${filtered.length}</strong> case ${filtered.length===1?'study':'studies'}`;empty.hidden=filtered.length!==0;grid.hidden=filtered.length===0;root.querySelector('.case-clear').disabled=selected.size===0;root.querySelectorAll('.case-filter').forEach(button=>{const active=selected.has(button.dataset.tag);button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});renderActiveFilters();grid.querySelectorAll('[data-open-case]').forEach(button=>button.addEventListener('click',()=>openCase(button.dataset.openCase,button)));}
  function detailSection(title,content){if(!content||(Array.isArray(content)&&!content.length))return'';const body=Array.isArray(content)?`<ul>${content.map(item=>`<li>${item}</li>`).join('')}</ul>`:`<p>${content}</p>`;return`<section class="case-detail-section"><p class="case-detail-label">${title}</p>${body}</section>`;}
  function openCase(id,trigger){const item=cases.find(entry=>entry.id===id);if(!item)return;lastFocus=trigger||document.activeElement;dialogContent.innerHTML=`<div class="case-detail-hero"><span class="case-card-icon case-icon-${iconFor(item)}">${iconSvg(iconFor(item))}</span><div><p class="case-detail-client">${item.clientDisplayName}</p><h2 id="case-dialog-title">${item.engagementTitle}</h2><p>${item.summary}</p></div></div><div class="case-detail-tags">${tagsFor(item).map(tag=>`<span>${tag}</span>`).join('')}</div>${detailSection('Challenge',item.challenge)}${detailSection('What Slalom did',item.approach)}${detailSection('Outcomes',item.outcomes)}${detailSection('Relevance to RS&H',item.relevanceToRSH)}${item.isPublic&&item.publicUrl?`<a class="case-public-link" href="${item.publicUrl}" target="_blank" rel="noopener noreferrer">View full story ↗</a>`:''}`;dialog.hidden=false;document.body.classList.add('case-dialog-open');requestAnimationFrame(()=>dialog.classList.add('is-open'));dialogPanel.focus();}
  function closeCase(){dialog.classList.remove('is-open');document.body.classList.remove('case-dialog-open');setTimeout(()=>{dialog.hidden=true;dialogContent.innerHTML='';},200);if(lastFocus)lastFocus.focus();}
  function clearAll(){selected.clear();render();}

  toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('is-open',open);});
  root.querySelectorAll('.case-filter').forEach(button=>button.addEventListener('click',()=>{const tag=button.dataset.tag;selected.has(tag)?selected.delete(tag):selected.add(tag);render();}));
  root.querySelector('.case-clear').addEventListener('click',clearAll);
  root.querySelector('.case-clear-empty').addEventListener('click',clearAll);
  root.querySelector('.case-dialog-close').addEventListener('click',closeCase);
  root.querySelector('.case-dialog-backdrop').addEventListener('click',closeCase);
  document.addEventListener('keydown',event=>{if(!dialog.hidden&&event.key==='Escape')closeCase();else if(!menu.hidden&&event.key==='Escape'){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.classList.remove('is-open');toggle.focus();}});
  document.addEventListener('click',event=>{if(!menu.hidden&&!root.querySelector('.case-filter-panel').contains(event.target)){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.classList.remove('is-open');}});
  render();
})();