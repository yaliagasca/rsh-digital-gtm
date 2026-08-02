const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40));

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  document.body.classList.toggle('menu-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const escapeHtml = value => value.replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
}[char]));

const labels = new Set([
  'Representative Experience:',
  'How this benefits RS&H:',
  'Core capabilities include:',
  'Transportation & Aviation',
  'Federal Defense',
  'OT/ICS/Cybersecurity',
  'Digital twins, data/analytics, AI, smart infrastructure, and asset-lifecycle solutions',
  'Firms transitioning from cost-center digital to revenue-generating digital business units'
]);

const evidencePrefixes = [
  'Account segmentation', 'Buyer persona', 'Sales motion', 'Sales-enablement', 'Alliance and partner-channel', 'Integration of digital offerings',
  'Total Addressable Market', 'Customer, buyer', 'Market attractiveness', 'Competitive and adjacent-market', 'Customer demand signals', 'Revenue opportunity',
  'Digital business and operating model', 'Governance, decision-rights', 'Organizational design', 'Managed services operating models', 'Product, platform', 'Commercialization and growth',
  'Revenue model design', 'EBITDA/EBBIT', 'Investment and ROI', 'Pricing, packaging', 'Cost-to-serve', 'Portfolio investment prioritization',
  'Designing digital advisory', 'Developing commercialization frameworks', 'Establishing business cases',
  'Colorado Department', 'California Department', 'Nevada Department', 'King County', 'Massachusetts Department', 'New York State', 'United Airlines', 'Alaska Airlines', 'Aerospace digital twin',
  'U.S. Air Force', 'DHS USCIS', 'FDIC', 'Global Food Manufacturer', 'North American Midstream', 'European Energy Provider', 'Maritime Technology Company',
  'Industrial and Automotive Organizations', 'Regulated Utility', 'Alternative Energy Provider', 'Major Energy Company', 'Industrial Organization', 'Major Utility Company', 'Power Distribution Utility'
];

function renderParagraph(text) {
  const safe = escapeHtml(text);
  if (labels.has(text) || text.startsWith('Risk, procurement, and contracting')) {
    return `<h5 class="content-label">${safe}</h5>`;
  }
  if (text.startsWith('How this benefits RS&H:') && text.length > 25) {
    return `<div class="benefit-callout interactive-highlight">${safe}</div>`;
  }
  if ((text.startsWith('[') && text.includes(']')) || text === 'Representative Experience:' || text === 'How this benefits RS&H:') {
    return `<div class="pending-note interactive-highlight">${safe}</div>`;
  }
  if (evidencePrefixes.some(prefix => text.startsWith(prefix))) {
    const colon = text.indexOf(':');
    if (colon > 0) {
      return `<div class="evidence-item interactive-highlight"><strong>${escapeHtml(text.slice(0, colon + 1))}</strong>${escapeHtml(text.slice(colon + 1))}</div>`;
    }
    return `<div class="evidence-item interactive-highlight">${safe}</div>`;
  }
  return `<p>${safe}</p>`;
}

function splitSubsections(items) {
  const intro = [];
  const subsections = [];
  let current = null;

  items.forEach(item => {
    if (/^A\.\d\.\d\s/.test(item)) {
      if (current) subsections.push(current);
      current = { title: item, items: [] };
    } else if (current) {
      current.items.push(item);
    } else {
      intro.push(item);
    }
  });

  if (current) subsections.push(current);
  return { intro, subsections };
}

function buildAccordion(subsection, index) {
  const match = subsection.title.match(/^(A\.\d\.\d)\s+(.+)$/);
  const number = match ? match[1] : '';
  const title = match ? match[2] : subsection.title;
  const panelId = `accordion-${number.replaceAll('.', '-')}`;
  const isOpen = index === 0;

  return `<article class="content-accordion ${isOpen ? 'is-open' : ''}">
    <button class="accordion-button" type="button" aria-expanded="${isOpen}" aria-controls="${panelId}">
      <span class="accordion-number">${escapeHtml(number)}</span>
      <span class="accordion-title">${escapeHtml(title)}</span>
      <span class="accordion-icon" aria-hidden="true">${isOpen ? '−' : '+'}</span>
    </button>
    <div class="accordion-panel" id="${panelId}">
      <div class="accordion-inner">${subsection.items.map(renderParagraph).join('')}</div>
    </div>
  </article>`;
}

function buildSectionA(source) {
  const paragraphs = source.split(/\n\s*\n/).map(item => item.trim()).filter(Boolean);
  const groups = [];
  let current = null;

  paragraphs.forEach(paragraph => {
    if (/^A\.[1-4]\s/.test(paragraph)) {
      if (current) groups.push(current);
      current = { title: paragraph, items: [] };
    } else if (current) {
      current.items.push(paragraph);
    }
  });
  if (current) groups.push(current);

  const tabs = groups.map((group, index) => {
    const match = group.title.match(/^(A\.\d)\s+(.+)$/);
    return `<button class="section-tab ${index === 0 ? 'is-active' : ''}" type="button" role="tab" aria-selected="${index === 0}" data-tab="section-panel-${index}">
      <span>${escapeHtml(match ? match[1] : '')}</span>${escapeHtml(match ? match[2] : group.title)}
    </button>`;
  }).join('');

  const panels = groups.map((group, index) => {
    const match = group.title.match(/^(A\.\d)\s+(.+)$/);
    const number = match ? match[1] : '';
    const title = match ? match[2] : group.title;
    const { intro, subsections } = splitSubsections(group.items);

    return `<section class="section-tab-panel ${index === 0 ? 'is-active' : ''}" id="section-panel-${index}" role="tabpanel">
      <div class="proposal-block-heading">
        <span>${escapeHtml(number)}</span>
        <h3>${escapeHtml(title)}</h3>
      </div>
      <div class="proposal-content">
        ${intro.length ? `<div class="intro-copy interactive-highlight">${intro.map(renderParagraph).join('')}</div>` : ''}
        ${subsections.length ? `<div class="accordion-list">${subsections.map(buildAccordion).join('')}</div>` : ''}
      </div>
    </section>`;
  }).join('');

  return `<div class="section-tabs" role="tablist" aria-label="Section A navigation">${tabs}</div>${panels}`;
}

function bindSectionInteractions(container) {
  const tabs = container.querySelectorAll('.section-tab');
  const panels = container.querySelectorAll('.section-tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(item => {
        item.classList.remove('is-active');
        item.setAttribute('aria-selected', 'false');
      });
      panels.forEach(panel => panel.classList.remove('is-active'));
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(tab.dataset.tab).classList.add('is-active');
    });
  });

  container.querySelectorAll('.accordion-button').forEach(button => {
    button.addEventListener('click', () => {
      const accordion = button.closest('.content-accordion');
      const isOpen = accordion.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      button.querySelector('.accordion-icon').textContent = isOpen ? '−' : '+';
    });
  });
}

fetch('section-a.txt')
  .then(response => {
    if (!response.ok) throw new Error('Unable to load Section A content.');
    return response.text();
  })
  .then(source => {
    const container = document.querySelector('#section-a-content');
    container.innerHTML = buildSectionA(source);
    bindSectionInteractions(container);
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  })
  .catch(error => {
    document.querySelector('#section-a-content').innerHTML = `<div class="pending-note">${escapeHtml(error.message)}</div>`;
  });
