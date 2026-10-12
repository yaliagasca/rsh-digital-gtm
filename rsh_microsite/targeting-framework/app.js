const state = {
  screen: 0,
  warrant: null,
  audience: null,
  motion: null,
  need: null,
  signals: [],
  responses: [],
  fallback: "Standard/default experience",
  tipIndex: 0
};

const screens = [...document.querySelectorAll(".screen")];
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const progressHint = document.getElementById("progressHint");

const labels = [
  ["Overview","Start the interactive walkthrough"],
  ["Checkpoint 1 of 5","Decide whether personalization is warranted"],
  ["Checkpoint 2 of 5","Identify only the context that matters"],
  ["Checkpoint 3 of 5","Clarify the customer's current need"],
  ["Checkpoint 4 of 5","Build the evidence set"],
  ["Checkpoint 5 of 5","Choose the smallest meaningful response"],
  ["Decision summary","Review the resulting decision"],
  ["Framework architecture","See the reusable logic behind the experience"]
];

const tips = [
  {
    rule:"Working rule 1",
    title:"Start with the decision — not the data.",
    text:"Do not personalize just because a signal exists. First ask whether a different response would meaningfully help the customer."
  },
  {
    rule:"Working rule 2",
    title:"Default is a valid outcome.",
    text:"If there is no meaningful reason to change the experience, stop. A good framework should prevent unnecessary personalization."
  },
  {
    rule:"Working rule 3",
    title:"Availability does not equal relevance.",
    text:"Use only customer or account context that can materially change the need, proof, path, offer, or next action."
  },
  {
    rule:"Working rule 4",
    title:"Current need matters more than a static persona.",
    text:"The same audience can arrive with different goals. When the customer declares what they need now, that should usually outweigh a broad inference for the current session."
  },
  {
    rule:"Working rule 5",
    title:"A signal is evidence — not a decision.",
    text:"Combine relevant signals and favor stronger, more recent evidence. One page view should not automatically become a journey-stage or purchase-intent conclusion."
  },
  {
    rule:"Working rule 6",
    title:"Match the response to confidence.",
    text:"High confidence can support a stronger differentiated experience. Medium confidence may call for lighter personalization or a question. Low confidence should fall back safely."
  },
  {
    rule:"Working rule 7",
    title:"Every targeting rule needs a fallback.",
    text:"The experience should still work when data is missing, eligibility fails, or signals conflict. Default is part of the design, not an exception."
  },
  {
    rule:"Working rule 8",
    title:"Framework and matrix do different jobs.",
    text:"The framework is reusable decision logic. The matrix applies that logic to a specific product, audience, journey, and available signal set."
  }
];

function showScreen(index){
  state.screen = Math.max(0, Math.min(index, screens.length - 1));
  screens.forEach((s,i)=>s.classList.toggle("active", i===state.screen));
  progressLabel.textContent = labels[state.screen][0];
  progressHint.textContent = labels[state.screen][1];
  progressFill.style.width = ((state.screen)/(screens.length-1)*100)+"%";
  prevBtn.disabled = state.screen===0;
  nextBtn.disabled = state.screen===screens.length-1;
  nextBtn.style.visibility = state.screen>=6 ? "hidden" : "visible";
  if(state.screen===6) renderSummary();
  syncTipToScreen();
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
    ? "Consider lighter personalization or asking the customer to clarify."
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
    document.getElementById("earlyExit").classList.toggle("show", state.warrant==="no");
    if(state.warrant==="no"){
      state.signals=[];
      state.responses=[];
    }
  });
});

document.getElementById("skipToSummary").addEventListener("click",()=>showScreen(6));

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
    if(idx>=0){
      state.signals.splice(idx,1);
      btn.classList.remove("selected");
    } else {
      state.signals.push({name,weight});
      btn.classList.add("selected");
    }
    updateConfidence();
  });
});

document.querySelectorAll(".response-card").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const val=btn.dataset.response;
    const idx=state.responses.indexOf(val);
    if(idx>=0){
      state.responses.splice(idx,1);
      btn.classList.remove("selected");
    } else {
      state.responses.push(val);
      btn.classList.add("selected");
    }
  });
});

document.getElementById("fallbackSelect").addEventListener("change",e=>state.fallback=e.target.value);

document.getElementById("showArchitecture").addEventListener("click",()=>showScreen(7));
document.getElementById("architectureBtn").addEventListener("click",()=>showScreen(7));
document.getElementById("architectureBack").addEventListener("click",()=>showScreen(6));
document.getElementById("architectureHome").addEventListener("click",()=>showScreen(0));
document.getElementById("backToStart").addEventListener("click",()=>showScreen(0));
document.getElementById("homeBtn").addEventListener("click",()=>showScreen(0));
document.getElementById("resetBtn").addEventListener("click",reset);

function reset(){
  state.warrant=null;
  state.audience=null;
  state.motion=null;
  state.need=null;
  state.signals=[];
  state.responses=[];
  state.fallback="Standard/default experience";
  document.querySelectorAll(".selected").forEach(el=>el.classList.remove("selected"));
  document.getElementById("fallbackSelect").value=state.fallback;
  document.getElementById("earlyExit").classList.remove("show");
  updateConfidence();
  showScreen(0);
}

/* Clippy-style contextual guide */
const clippyPanel=document.getElementById("clippyPanel");
const clippyButton=document.getElementById("clippyButton");
const clippyNudge=document.getElementById("clippyNudge");
const clippyRuleNumber=document.getElementById("clippyRuleNumber");
const clippyRuleTitle=document.getElementById("clippyRuleTitle");
const clippyRuleText=document.getElementById("clippyRuleText");

function syncTipToScreen(){
  state.tipIndex=Math.min(state.screen,tips.length-1);
  renderTip();
  clippyNudge.style.display="block";
  clippyNudge.textContent = state.screen>0
    ? "Need a hint for this checkpoint? ↓"
    : "Need a hint? Click me ↓";
}

function renderTip(){
  const tip=tips[state.tipIndex];
  clippyRuleNumber.textContent=tip.rule;
  clippyRuleTitle.textContent=tip.title;
  clippyRuleText.textContent=tip.text;
}

clippyButton.addEventListener("click",()=>{
  clippyPanel.classList.toggle("open");
  clippyNudge.style.display="none";
  renderTip();
});
document.getElementById("clippyClose").addEventListener("click",()=>clippyPanel.classList.remove("open"));
document.getElementById("clippyPrev").addEventListener("click",()=>{
  state.tipIndex=(state.tipIndex-1+tips.length)%tips.length;
  renderTip();
});
document.getElementById("clippyNext").addEventListener("click",()=>{
  state.tipIndex=(state.tipIndex+1)%tips.length;
  renderTip();
});

document.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight" && state.screen<6) showScreen(state.screen+1);
  if(e.key==="ArrowLeft" && state.screen>0) showScreen(state.screen-1);
  if(e.key==="Escape") clippyPanel.classList.remove("open");
});

updateConfidence();
showScreen(0);