(()=>{
  const sections=[
    {id:'cover-letter',label:'Note'},
    {id:'section-a',label:'A'},
    {id:'section-b',label:'B'},
    {id:'team',label:'C'},
    {id:'case-studies',label:'D'}
  ].filter(item=>document.getElementById(item.id));

  const homeIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20h-6v-5h-4v5H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

  sections.forEach(current=>{
    const section=document.getElementById(current.id);
    if(!section||section.querySelector(':scope > .section-jump-nav')) return;

    const nav=document.createElement('nav');
    nav.className='section-jump-nav';
    nav.setAttribute('aria-label',`Navigation after ${current.label}`);
    nav.innerHTML=`
      <a class="section-jump-home" href="#top">
        <span class="section-jump-home-icon">${homeIcon}</span>
        <span>Back to main menu</span>
      </a>
      <div class="section-jump-links">
        ${sections.map(item=>`<a class="section-jump-link ${item.id===current.id?'current':''}" href="#${item.id}" ${item.id===current.id?'aria-current="page"':''}>${item.label}</a>`).join('')}
      </div>`;
    section.appendChild(nav);
  });
})();