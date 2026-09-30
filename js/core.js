/* ============================================================
   CORE — shared helpers available to every feature script
============================================================ */
window.ML = (function(){
  "use strict";
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasWebGL = (()=>{ try{ const c=document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl')||c.getContext('experimental-webgl'))); }catch(e){return false;} })();

  /* generic: is element on-screen, for pausing rAF loops */
  function onScreenGate(el, onEnter, onExit){
    const io = new IntersectionObserver(([e])=>{ e.isIntersecting?onEnter():onExit(); },{threshold:0.05});
    io.observe(el);
  }

  return { reduceMotion, hasWebGL, onScreenGate };
})();
