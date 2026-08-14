const roleIcons={leadership:'◈',commercial:'↗',market:'◎',finance:'▥',technology:'⌘'};

function teamInitials(name=''){
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
}

function photoMarkup(key,name,cls=''){
  const knownPhoto=window.TEAM_PHOTOS&&window.TEAM_PHOTOS[key];
  if(knownPhoto){return `<img class="${cls}" src="${knownPhoto}" alt="${name}" loading="lazy" decoding="async">`;}
  return `<span class="team-photo-fallback ${cls}" aria-label="${name}">${teamInitials(name)}</span>`;
}

function roleCards(rows,title){
  return `<section class="role-group"><div class="role-group-heading"><div><p class="eyebrow blue">${title}</p></div></div><div class="role-card-list">${rows.map(r=>`<article class="role-card role-${r[4]}" data-category="${r[4]}"><button class="role-card-trigger" type="button" aria-expanded="false"><span class="role-icon" aria-hidden="true">${roleIcons[r[4]]||'•'}</span><span class="role-card-summary"><strong>${r[0]}</strong><small>${r[1]}</small></span><span class="role-card-toggle">+</span></button><div class="role-card-panel"><div class="role-detail-grid"><div><span class="role-detail-label">Named individual</span><strong>${r[1]}</strong></div><div><span class="role-detail-label">Role description</span><p>${r[2]||''}</p></div></div>${r[3]?`<button class="role-profile-link" type="button" data-profile="${r[3]}">View résumé →</button>`:''}</div></article>`).join('')}</div></section>`;
}

function renderProfile(key){
  const p=window.teamProfiles&&window.teamProfiles[key];
  const panel=document.querySelector('#profile-panel');
  if(!p||!panel)return;
  document.querySelectorAll('.profile-selector').forEach(b=>b.classList.toggle('is-active',b.dataset.profile===key));
  panel.innerHTML=`<div class="profile-identity"><div class="profile-photo">${photoMarkup(key,p.name,'profile-photo-img')}</div><div><p class="profile-kicker">${p.role}</p><h3>${p.name}</h3><p class="profile-subtitle">${p.bio||''}</p></div></div><div class="profile-body"><section><p class="profile-label">Relevant Experience</p><div class="experience-stack">${(p.exp||[]).map((e,i)=>`<article class="profile-experience color-${i%4+1}"><span>${String(i+1).padStart(2,'0')}</span><div><h4>${e[0]}</h4><p>${e[1]}</p></div></article>`).join('')}</div></section><section><p class="profile-label">Skills</p><div class="skill-cloud">${(p.skills||[]).map((s,i)=>`<span class="skill-chip chip-${i%5+1}">${s}</span>`).join('')}</div></section></div>`;
}

function buildTeam(){
  const target=document.querySelector('#team-content');
  const profiles=window.teamProfiles||{};
  const keyRows=window.keyRows||[];
  const additionalRows=window.additionalRows||[];
  if(!target)return;

  const filters=[['all','All'],['leadership','Leadership'],['commercial','Commercial'],['market','Market'],['finance','Finance'],['technology','Technology']];
  target.innerHTML=`<div class="team-intro reveal"><p>Our multidisciplinary team brings diverse skills along with ongoing collaboration and dedicated ownership of every deliverable from discovery through final presentation. Detailed team qualifications, experience, and profiles can be found in Section C.2.</p></div><div class="role-overview"><div><strong>${keyRows.length}</strong><span>Named key personnel</span></div><div><strong>${additionalRows.length}</strong><span>Additional roles</span></div><div><strong>${Object.keys(profiles).length}</strong><span>Résumés</span></div></div><div class="role-filters">${filters.map((f,i)=>`<button class="role-filter ${i===0?'is-active':''}" type="button" data-filter="${f[0]}">${f[1]}</button>`).join('')}</div>${roleCards(keyRows,'C.1 Named Key Personnel')}${roleCards(additionalRows,'Additional Roles')}<aside class="team-note"><strong>Note:</strong> The named team reflects expected availability for the anticipated October start and may be adjusted only prior to contract execution; once the engagement begins, Slalom commits to maintaining these named key personnel throughout and will not substitute any of them without RS&amp;H's prior written approval, consistent with §6.4.</aside><div class="team-explorer" id="c2-resumes"><div class="team-explorer-heading"><p class="eyebrow blue">C.2 Résumés</p><h3>Meet the proposed team</h3><p>Select a profile to explore relevant experience and skills without leaving the proposal.</p></div><div class="profile-selectors">${Object.entries(profiles).map(([k,p])=>`<button class="profile-selector" data-profile="${k}"><span class="selector-avatar">${photoMarkup(k,p.name,'selector-avatar-img')}</span><span><strong>${p.name}</strong><small>${p.role}</small></span></button>`).join('')}</div><div id="profile-panel" class="profile-panel"></div></div>`;

  target.querySelectorAll('.role-card-trigger').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.role-card');const open=card.classList.toggle('is-open');btn.setAttribute('aria-expanded',String(open));btn.querySelector('.role-card-toggle').textContent=open?'−':'+';}));
  target.querySelectorAll('.role-filter').forEach(btn=>btn.addEventListener('click',()=>{target.querySelectorAll('.role-filter').forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');const filter=btn.dataset.filter;target.querySelectorAll('.role-card').forEach(card=>card.hidden=filter!=='all'&&card.dataset.category!==filter);}));
  target.querySelectorAll('[data-profile]').forEach(el=>el.addEventListener('click',()=>{renderProfile(el.dataset.profile);if(el.classList.contains('role-profile-link'))document.querySelector('.team-explorer').scrollIntoView({behavior:'smooth',block:'start'});}));
  if(profiles.darin)renderProfile('darin'); else {const first=Object.keys(profiles)[0];if(first)renderProfile(first);}
}

buildTeam();