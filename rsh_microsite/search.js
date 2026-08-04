(() => {
  const search = document.querySelector('.site-search');
  const input = document.querySelector('#site-search-input');
  const count = document.querySelector('.site-search-count');
  const prev = document.querySelector('[data-search-prev]');
  const next = document.querySelector('[data-search-next]');
  const clear = document.querySelector('[data-search-clear]');
  let marks = [];
  let current = -1;
  let timer;

  const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function clearMarks() {
    document.querySelectorAll('mark.search-mark').forEach(mark => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
    marks = [];
    current = -1;
    updateControls();
  }

  function eligible(node) {
    const parent = node.parentElement;
    if (!parent || !node.nodeValue.trim()) return false;
    return !parent.closest('script,style,noscript,textarea,input,select,option,.site-search,mark');
  }

  function highlight(query) {
    clearMarks();
    if (query.length < 2) return;
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT, {
      acceptNode: node => eligible(node) && regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      regex.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      node.nodeValue.split(regex).forEach((part, index) => {
        if (index % 2) {
          const mark = document.createElement('mark');
          mark.className = 'search-mark';
          mark.textContent = part;
          fragment.appendChild(mark);
        } else if (part) fragment.appendChild(document.createTextNode(part));
      });
      node.parentNode.replaceChild(fragment, node);
    });
    marks = [...document.querySelectorAll('mark.search-mark')];
    current = marks.length ? 0 : -1;
    updateControls();
    if (marks.length) goTo(0);
    else {
      search.classList.remove('search-empty');
      void search.offsetWidth;
      search.classList.add('search-empty');
    }
  }

  function reveal(mark) {
    const panel = mark.closest('.section-tab-panel');
    if (panel && !panel.classList.contains('is-active')) {
      const container = panel.closest('.section-a-content');
      const tab = container?.querySelector(`.section-tab[data-tab="${panel.id}"]`);
      tab?.click();
    }
    const accordion = mark.closest('.content-accordion');
    if (accordion && !accordion.classList.contains('is-open')) accordion.querySelector('.accordion-button')?.click();
  }

  function goTo(index) {
    if (!marks.length) return;
    marks.forEach(mark => mark.classList.remove('is-current'));
    current = (index + marks.length) % marks.length;
    const mark = marks[current];
    reveal(mark);
    requestAnimationFrame(() => {
      mark.classList.add('is-current');
      mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      updateControls();
    });
  }

  function updateControls() {
    count.textContent = marks.length ? `${current + 1} / ${marks.length}` : '0 results';
    prev.disabled = !marks.length;
    next.disabled = !marks.length;
    clear.disabled = !input.value;
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => highlight(input.value.trim()), 180);
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      goTo(event.shiftKey ? current - 1 : current + 1);
    }
    if (event.key === 'Escape') {
      input.value = '';
      clearMarks();
      input.blur();
    }
  });
  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  clear.addEventListener('click', () => {
    input.value = '';
    clearMarks();
    input.focus();
  });

  const refresh = new MutationObserver(() => {
    if (input.value.trim().length >= 2) {
      clearTimeout(timer);
      timer = setTimeout(() => highlight(input.value.trim()), 250);
    }
  });
  refresh.observe(document.querySelector('main'), { childList: true, subtree: true });
  updateControls();
})();