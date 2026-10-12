const state = {
  screen: 0,
  warrant: null,
  audience: null,
  motion: null,
  need: null,
  signals: [],
  responses: [],
  fallback: "Standard/default experience"
};

const screens = [...document.querySelectorAll(".screen")];
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

const labels = [
  "Overview",
  "1 / 5 · Is personalization warranted?",
  "2 / 5 · Customer context",
  "3 / 5 · Current customer need",
  "4 / 5 · Evidence & confidence",
  "5 / 5 · Personalized response",
  "Decision summary",
  "Framework architecture"
];

function showScreen(index){
  state.screen = Math.max(0, Math.min(index, screens.length - 1));
  screens.forEach((s,i)=>s.classList.toggle("active", i===state.screen));
  progressLabel.textContent = labels[state.screen];
  progressFill.style.width = ((state.screen)/(screens.length-1)*100)+"%";
  prevBtn.disabled = state.screen===0;
  nextBtn.disabled = state.screen===screens.length-1;
  nextBtn.style.visibility = state.screen>=6 ? "hidden" : "visible";
  if(state.screen===6) renderSummary();
  window.scrollTo({top:0,behavior:"smooth"});
}

function confidence(){
  const score = state.signals.reduce((sum,s)=>sum+s.weight,0);
  if(score >= 5) return {label:"High", pct:92, color:"#107c10"};
  if(score >= 3) return {label:"Medium", pct:60, color:"#ffb900"};
  return {label:"Low", pct:24, color:"#98a2b3"};
}

function updateConfidence(){
  const c=confidence();
  document.getElementById("confidenceText").textContent=c.label;
  const fill=document.getElementById("confidenceFill");
  fill.style.width=c.pct+"%";
  fill.style.background=c.color;
  const h=document.getElementById("confidenceHelp");
  h.textContent = c.label==="High"
    ? "Evidence is strong enough to support a differentiated response."
    : c.label==="Medium"
    ? "Use lighter personalization or ask the customer to clarify."
    : "Evidence is weak. Default is safer than a strong assumption.";
}

function renderSummary(){
  const c=confidence();
  const warranted=state.warrant==="yes";
  const action = !warranted
    ? "Default experience"
    : c.label==="High"
    ? (state.responses.length ? "Personalize" : "Choose a meaningful response")
    : c.label==="Medium"
    ? "Use lighter personalization or ask"
    : "Default / ask for clarification";

  document.getElementById("sumAudience").textContent=state.audience || "Not specified";
  document.getElementById("sumMotion").textContent=state.motion || "Commercial motion not specified";
  document.getElementById("sumNeed").textContent=state.need || "Not specified";
  document.getElementById("sumConfidence").textContent=c.label;
  document.getElementById("sumSignals").textContent=state.signals.length
    ? state.signals.map(s=>s.name).join(" · ")
    : "No signals selected";
  document.getElementById("sumAction").textContent=action;
  document.getElementById("sumResponses").textContent=state.responses.length
    ? state.responses.join(" · ")
    : "Fallback: "+state.fallback;

  const why = !warranted
    ? "There is no meaningful reason to change the experience, so the framework should stop rather than personalize for the sake of personalization."
    : c.label==="High"
    ? "There is both a meaningful reason to change the experience and enough supporting evidence to act with confidence."
    : c.label==="Medium"
    ? "There may be a reason to personalize, but the evidence is not strong enough for a heavy-handed response. Ask or adapt lightly."
    : "The reason may exist, but the evidence is too weak to justify a strong assumption. Use the fallback experience.";
  document.getElementById("sumWhy").textContent=why;
}

document.querySelectorAll("[data-next]").forEach(b=>b.addEventListener("click",()=>showScreen(state.screen+1)));
prevBtn.addEventListener("click",()=>showScreen(state.screen-1));
nextBtn.addEventListener("click",()=>showScreen(state.screen+1));

document.querySelectorAll(".warrant").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".warrant").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    state.warrant=btn.dataset.value;
    if(state.warrant==="no"){
      state.signals=[];
      state.responses=[];
    }
  });
});

document.querySelectorAll(".chip[data-group], .choice-card[data-group]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const group=btn.dataset.group;
    document.querySelectorAll('[data-group="'+group+'"]').forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    state[group]=btn.dataset.value;
  });
});

document.querySelectorAll(".signal-card").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const name=btn.dataset.signal;
    const weight=Number(btn.dataset.weight);
    const idx=state.signals.findIndex(s=>s.name===name);
    if(idx>=0){state.signals.splice(idx,1);btn.classList.remove("selected");}
    else{state.signals.push({name,weight});btn.classList.add("selected");}
    updateConfidence();
  });
});

document.querySelectorAll(".response-card").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const val=btn.dataset.response;
    const idx=state.responses.indexOf(val);
    if(idx>=0){state.responses.splice(idx,1);btn.classList.remove("selected");}
    else{state.responses.push(val);btn.classList.add("selected");}
  });
});

document.getElementById("fallbackSelect").addEventListener("change",e=>state.fallback=e.target.value);

document.getElementById("showArchitecture").addEventListener("click",()=>showScreen(7));
document.getElementById("architectureBtn").addEventListener("click",()=>showScreen(7));
document.getElementById("architectureBack").addEventListener("click",()=>showScreen(6));
document.getElementById("backToStart").addEventListener("click",reset);
document.getElementById("resetBtn").addEventListener("click",reset);

function reset(){
  state.warrant=null; state.audience=null; state.motion=null; state.need=null; state.signals=[]; state.responses=[]; state.fallback="Standard/default experience";
  document.querySelectorAll(".selected").forEach(el=>el.classList.remove("selected"));
  document.getElementById("fallbackSelect").value=state.fallback;
  updateConfidence();
  showScreen(0);
}

document.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight" && state.screen<6) showScreen(state.screen+1);
  if(e.key==="ArrowLeft" && state.screen>0) showScreen(state.screen-1);
});

updateConfidence();
showScreen(0);