const popup=document.querySelector('#term-tooltip');
let active=null, pinned=false, closeTimer;
const cancelClose=()=>clearTimeout(closeTimer);
function hide() {
  cancelClose();
  active?.removeAttribute('aria-describedby');
  active=null;pinned=false;popup.hidden=true;
}
function position() {
  if(!active)return;
  const anchor=active.getBoundingClientRect(), box=popup.getBoundingClientRect();
  const left=Math.max(12,Math.min(anchor.left,window.innerWidth-box.width-12));
  const below=anchor.bottom+8;
  const top=below+box.height<=window.innerHeight-12 ? below : Math.max(12,anchor.top-box.height-8);
  popup.style.left=`${left}px`;popup.style.top=`${top}px`;
}
function show(button, pin=false) {
  cancelClose();
  if(active!==button)active?.removeAttribute('aria-describedby');
  active=button;pinned=pin;
  const title=document.createElement('strong'),description=document.createElement('p');
  title.textContent=button.dataset.term;description.textContent=button.dataset.explanation;
  popup.replaceChildren(title,description);popup.hidden=false;
  button.setAttribute('aria-describedby',popup.id);position();
}
function scheduleClose(){cancelClose();closeTimer=setTimeout(()=>{if(!pinned && document.activeElement!==active)hide();},160);}
for(const button of document.querySelectorAll('.term-help')){
  // Keep native title as the no-JavaScript fallback, avoid duplicate popups after initialization.
  button.removeAttribute('title');
  button.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')show(button);});
  button.addEventListener('pointerleave',scheduleClose);
  button.addEventListener('focus',()=>show(button));
  button.addEventListener('blur',()=>{if(!pinned)scheduleClose();});
  button.addEventListener('click',()=>{if(active===button && pinned)hide();else show(button,true);});
}
popup.addEventListener('pointerenter',cancelClose);
popup.addEventListener('pointerleave',scheduleClose);
document.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
document.addEventListener('click',event=>{if(!event.target.closest('.term-help') && !popup.contains(event.target))hide();});
document.addEventListener('focusin',event=>{if(active && !event.target.closest('.term-help'))hide();});
window.addEventListener('resize',position);
window.addEventListener('scroll',position,{passive:true});
