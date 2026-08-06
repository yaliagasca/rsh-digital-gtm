(() => {
  const metricPatterns = [
    /(?:approximately\s+)?\d+(?:\.\d+)?%/i,
    /\$\d+(?:\.\d+)?\s*(?:million|billion|m|b)?/i,
    /more than\s+\d+(?:\.\d+)?\s+(?:million|thousand)?\s*[a-z-]*/i,
    /\d+(?:\.\d+)?\s*(?:million|thousand)\s+[a-z-]+/i,
    /\d+-plus-person/i,
    /\d+\+\s*[a-z-]+/i,
    /\d+\/\d+\/\d+/,
    /\d+(?:-minute|-week|-month|-year)\b/i
  ];

  const htmlEscape = value => String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[character]));

  function cleanLabel(sentence, value) {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return sentence
      .replace(new RegExp(escaped, 'i'), '')
      .replace(/^[\s,;:–—-]+|[\s,;:–—-]+$/g, '')
      .replace(/^(and|with|while|including|supporting|from|within)\s+/i, '')
      .trim();
  }

  function extractMetrics(text) {
    const sentences = text
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(Boolean);

    const metrics = [];
    sentences.forEach(sentence => {
      const match = metricPatterns.map(pattern => sentence.match(pattern)).find(Boolean);
      if (!match) return;
      const value = match[0];
      const label = cleanLabel(sentence, value);
      if (!label || metrics.some(metric => metric.value.toLowerCase() === value.toLowerCase())) return;
      metrics.push({ value, label });
    });
    return metrics.slice(0, 4);
  }

  function enhance(detail) {
    const content = detail.querySelector('.proof-detail-content');
    const body = detail.querySelector('.proof-detail-body');
    if (!content || !body) return;

    const source = (body.textContent || '').replace(/\s+/g, ' ').trim();
    const existing = content.querySelector('.proof-metrics');
    if (detail.dataset.metricsSource === source && existing) return;

    if (existing) existing.remove();
    detail.dataset.metricsSource = source;

    const metrics = extractMetrics(source);
    if (!metrics.length) return;

    const list = document.createElement('div');
    list.className = 'proof-metrics';
    list.setAttribute('aria-label', 'Documented outcomes and scale');
    list.innerHTML = metrics.map(metric => `
      <div class="proof-metric">
        <span class="proof-metric-value">${htmlEscape(metric.value)}</span>
        <span class="proof-metric-label">${htmlEscape(metric.label)}</span>
      </div>
    `).join('');
    content.appendChild(list);
  }

  function watchDetail(detail) {
    if (detail.dataset.metricsObserved === 'true') return;
    detail.dataset.metricsObserved = 'true';
    enhance(detail);
    new MutationObserver(() => enhance(detail)).observe(detail, { childList: true, subtree: true });
  }

  function scan(root = document) {
    root.querySelectorAll('.proof-selector-detail').forEach(watchDetail);
  }

  scan();
  new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return;
      if (node.matches('.proof-selector-detail')) watchDetail(node);
      scan(node);
    }));
  }).observe(document.body, { childList: true, subtree: true });
})();