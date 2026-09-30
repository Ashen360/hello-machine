/* ============================================================
   06 — DENSE GRID
============================================================ */
(function(){
  "use strict";
  const items = [
    ['2001','Wikipedia — knowledge as an open repository'],
    ['2003','WordPress — software installed by anyone'],
    ['2004','GitHub predecessors — code kept in version control'],
    ['2006','AWS — a server you rent for minutes'],
    ['2007','iPhone — a computer that fits in a pocket'],
    ['2008','App Store — software distributed instantly'],
    ['2008','GitHub — collaboration becomes public'],
    ['2010s','REST APIs — programs that talk to programs'],
    ['2013','Docker — software that carries its own machine'],
    ['2015','Kubernetes — thousands of programs, orchestrated'],
  ];
  const grid = document.getElementById('dense-grid');
  items.forEach(([k,v],i)=>{
    const cell=document.createElement('div'); cell.className='dense-cell';
    cell.style.setProperty('--i', i);
    cell.innerHTML = `<div class="k">${k}</div><div class="v">${v}</div>`;
    grid.appendChild(cell);
  });
  if(!ML.reduceMotion){
    grid.classList.add('armed');
    ML.onScreenGate(grid, ()=>grid.classList.add('in'), ()=>{});
  }
})();
