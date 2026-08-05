(() => {
  const root = document.querySelector('#case-studies-content');
  const cases = Array.isArray(window.caseStudiesData) ? window.caseStudiesData : [];
  if (!root) return;

  const allTags = [...new Set(cases.flatMap(item => [...item.sectorTags, ...item.capabilityTags]))]
    .sort((a, b) => a.localeCompare(b));
  const selected = new Set();

  const iconFor = item => {
    const tags = [...item.sectorTags, ...item.capabilityTags].join(' ').toLowerCase();
    if (tags.includes('health')) return 'health';
    if (tags.includes('transport') || tags.includes('automotive') || tags.includes('fleet')) return 'mobility';
    if (tags.includes('food') || tags.includes('cpg')) return 'growth';
    if (tags.includes('financial')) return 'finance';
    return 'strategy';
  };

  const iconSvg = name => ({
    health: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"/><path d="M9 12h6M12 9v6"/></svg>',
    mobility: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16h14l-1.5-6h-11z"/><path d="M7 10l1.5-3h7L17 10M6 16v2M18 16v2"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>',
    growth: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/><path d="M16 7h3v3"/></svg>',
    finance: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v10M15 9.5c-.8-1-1.7-1.5-3-1.5-1.7 0-3 1-3 2.3 0 1.5 1.2 2 3 2.4 1.8.3 3 .8 3 2.3 0 1.4-1.3 2.5-3.2 2.5-1.4 0-2.6-.5-3.6-1.5"/></svg>',
    strategy: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m15 9 5-5M17 4h3v3"/></svg>'
  }[name] || '');

  const chip = tag => `<button class="case-filter" type="button" data-tag="${tag}" aria-pressed="false">${tag}</button>`;

  root.innerHTML = `
    <div class="case-library-intro">
      <p>Slalom brings demonstrated experience helping organizations commercialize digital services, data and AI-enabled offerings, and complex B2B solutions by connecting market strategy, product readiness, sales enablement, operating-model design, and financial modeling into actionable go-to-market plans.</p>
    </div>
    <section class="case-filter-panel" aria-labelledby="case-filter-heading">
      <div class="case-filter-heading">
        <div><p class="eyebrow blue">Explore relevant experience</p><h3 id="case-filter-heading">Filter the case-study library</h3></div>
        <div class="case-filter-actions">
          <span class="case-filter-logic">Matches any selected filter</span>
          <button class="case-clear" type="button" disabled>Clear filters</button>
        </div>
      </div>
      <div class="case-filters" role="group" aria-label="Case study filters">${allTags.map(chip).join('')}</div>
      <div class="case-result-summary" aria-live="polite"><strong>${cases.length}</strong> case studies found</div>
    </section>
    <div class="case-grid"></div>
    <div class="case-empty" hidden><h3>No case studies match those filters.</h3><p>Clear one or more filters to broaden the results.</p><button type="button" class="case-clear-empty">View all cases</button></div>
    <div class="case-dialog" hidden>
      <button class="case-dialog-backdrop" type="button" aria-label="Close case study detail"></button>
      <section class="case-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="case-dialog-title" tabindex="-1">
        <button class="case-dialog-close" type="button" aria-label="Close case study detail">×</button>
        <div class="case-dialog-content"></div>
      </section>
    </div>`;

  const grid = root.querySelector('.case-grid');
  const resultSummary = root.querySelector('.case-result-summary');
  const clearButtons = root.querySelectorAll('.case-clear, .case-clear-empty');
  const empty = root.querySelector('.case-empty');
  const dialog = root.querySelector('.case-dialog');
  const dialogPanel = root.querySelector('.case-dialog-panel');
  const dialogContent = root.querySelector('.case-dialog-content');
  let lastFocus = null;

  function tagsFor(item) { return [...item.sectorTags, ...item.capabilityTags]; }

  function card(item) {
    const tags = tagsFor(item).slice(0, 5);
    return `<article class="case-card" data-id="${item.id}">
      <div class="case-card-topline"><span class="case-card-icon case-icon-${iconFor(item)}">${iconSvg(iconFor(item))}</span><span class="case-card-sector">${item.sectorTags.join(' · ')}</span></div>
      <p class="case-card-client">${item.clientDisplayName}</p>
      <h3>${item.engagementTitle}</h3>
      <p class="case-card-summary">${item.summary}</p>
      <div class="case-card-tags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>
      <button class="case-card-open" type="button" data-open-case="${item.id}" aria-label="Open ${item.engagementTitle}">Explore case <span aria-hidden="true">↗</span></button>
    </article>`;
  }

  function render() {
    const filtered = selected.size
      ? cases.filter(item => tagsFor(item).some(tag => selected.has(tag)))
      : cases;
    grid.innerHTML = filtered.map(card).join('');
    resultSummary.innerHTML = `<strong>${filtered.length}</strong> case ${filtered.length === 1 ? 'study' : 'studies'} found`;
    empty.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
    root.querySelector('.case-clear').disabled = selected.size === 0;
    root.querySelectorAll('.case-filter').forEach(button => {
      const active = selected.has(button.dataset.tag);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    grid.querySelectorAll('[data-open-case]').forEach(button => button.addEventListener('click', () => openCase(button.dataset.openCase, button)));
  }

  function detailSection(title, content) {
    if (!content || (Array.isArray(content) && content.length === 0)) return '';
    const body = Array.isArray(content)
      ? `<ul>${content.map(item => `<li>${item}</li>`).join('')}</ul>`
      : `<p>${content}</p>`;
    return `<section class="case-detail-section"><p class="case-detail-label">${title}</p>${body}</section>`;
  }

  function openCase(id, trigger) {
    const item = cases.find(entry => entry.id === id);
    if (!item) return;
    lastFocus = trigger || document.activeElement;
    dialogContent.innerHTML = `
      <div class="case-detail-hero">
        <span class="case-card-icon case-icon-${iconFor(item)}">${iconSvg(iconFor(item))}</span>
        <div><p class="case-detail-client">${item.clientDisplayName}</p><h2 id="case-dialog-title">${item.engagementTitle}</h2><p>${item.summary}</p></div>
      </div>
      <div class="case-detail-tags">${tagsFor(item).map(tag => `<span>${tag}</span>`).join('')}</div>
      ${detailSection('Challenge', item.challenge)}
      ${detailSection('What Slalom did', item.approach)}
      ${detailSection('Outcomes', item.outcomes)}
      ${detailSection('Relevance to RS&H', item.relevanceToRSH)}
      ${item.isPublic && item.publicUrl ? `<a class="case-public-link" href="${item.publicUrl}" target="_blank" rel="noopener noreferrer">View full story ↗</a>` : ''}`;
    dialog.hidden = false;
    document.body.classList.add('case-dialog-open');
    requestAnimationFrame(() => dialog.classList.add('is-open'));
    dialogPanel.focus();
  }

  function closeCase() {
    dialog.classList.remove('is-open');
    document.body.classList.remove('case-dialog-open');
    setTimeout(() => { dialog.hidden = true; dialogContent.innerHTML = ''; }, 200);
    if (lastFocus) lastFocus.focus();
  }

  root.querySelectorAll('.case-filter').forEach(button => button.addEventListener('click', () => {
    const tag = button.dataset.tag;
    selected.has(tag) ? selected.delete(tag) : selected.add(tag);
    render();
  }));
  clearButtons.forEach(button => button.addEventListener('click', () => { selected.clear(); render(); }));
  root.querySelector('.case-dialog-close').addEventListener('click', closeCase);
  root.querySelector('.case-dialog-backdrop').addEventListener('click', closeCase);
  document.addEventListener('keydown', event => {
    if (!dialog.hidden && event.key === 'Escape') closeCase();
  });

  render();
})();