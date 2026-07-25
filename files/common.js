/* ==========================================================================
   COMMON.JS — cursor, particle engine, nav, scroll reveal, mobile drawer
   Shared across index.html / models.html / purchase.html
   ========================================================================== */

/* ---------------------------------------------------------------
   1. CUSTOM VELOCITY CURSOR
   A thin ring + dot. The ring stretches into an ellipse aligned to
   direction of travel, proportional to speed — like motion blur.
--------------------------------------------------------------- */
(function initCursor(){
  if (window.matchMedia('(max-width:900px)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = window.innerWidth/2, my = window.innerHeight/2;
  let rx = mx, ry = my;
  let lastX = mx, lastY = my;

  window.addEventListener('mousemove', (e)=>{
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;

    const target = e.target.closest('a, button, input, textarea, select, .hoverable, [data-cursor="hover"]');
    ring.classList.toggle('hover', !!target);
  });

  function raf(){
    const dx = mx - rx, dy = my - ry;
    rx += dx * 0.16;
    ry += dy * 0.16;

    const vx = mx - lastX, vy = my - lastY;
    lastX = mx; lastY = my;
    const speed = Math.min(Math.hypot(vx,vy), 40);
    const angle = Math.atan2(vy,vx) * 180/Math.PI;
    const stretch = 1 + speed/40*0.9;

    ring.style.transform =
      `translate(${rx}px, ${ry}px) translate(-50%,-50%) rotate(${angle}deg) scale(${stretch}, ${1/Math.sqrt(stretch)})`;

    requestAnimationFrame(raf);
  }
  raf();
})();

/* ---------------------------------------------------------------
   2. HIGHWAY LIGHT-STREAK PARTICLE ENGINE
   Simulates headlights / taillights blurring past on a night
   highway. Streaks travel left->right at varied depth/speed,
   parallax-shift with cursor Y, and occasionally "flash" bright
   as they pass — evoking BMW's after-dark performance imagery.
--------------------------------------------------------------- */
(function initParticles(){
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  let streaks = [];
  let pointerY = 0.5;
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLORS = [
    'rgba(61,139,255,ALPHA)',   // blue-bright
    'rgba(0,160,225,ALPHA)',    // m-cyan
    'rgba(255,255,255,ALPHA)',  // white headlight
    'rgba(226,35,26,ALPHA)'     // m-red taillight (rare)
  ];

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width  = window.innerWidth  * DPR;
    H = canvas.height = window.innerHeight * DPR;
    canvas.style.width  = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    seed();
  }

  function seed(){
    const count = Math.round((window.innerWidth * window.innerHeight) / 26000);
    streaks = Array.from({length: count}, spawn);
  }

  function spawn(existing){
    const depth = Math.random();               // 0 = far / slow, 1 = near / fast
    const colorTpl = COLORS[Math.random() < 0.08 ? 3 : Math.floor(Math.random()*3)];
    return {
      x: Math.random() * -W,
      y: Math.random() * H,
      depth,
      len: (40 + depth*160) * DPR,
      speed: (1.4 + depth*6.5) * DPR,
      thickness: (0.6 + depth*2.2) * DPR,
      baseAlpha: 0.12 + depth*0.35,
      flash: 0,
      color: colorTpl,
    };
  }

  window.addEventListener('mousemove', (e)=>{
    pointerY = e.clientY / window.innerHeight;
  });

  function tick(){
    ctx.clearRect(0,0,W,H);
    const parallax = (pointerY - 0.5) * 40 * DPR;

    for (const s of streaks){
      s.x += s.speed;
      if (Math.random() < 0.0025) s.flash = 1;
      s.flash *= 0.92;

      const alpha = Math.min(s.baseAlpha + s.flash*0.6, 1);
      const y = s.y + parallax * s.depth;

      const grad = ctx.createLinearGradient(s.x, y, s.x + s.len, y);
      grad.addColorStop(0,   s.color.replace('ALPHA','0'));
      grad.addColorStop(0.85, s.color.replace('ALPHA', String(alpha)));
      grad.addColorStop(1,   s.color.replace('ALPHA','0'));

      ctx.strokeStyle = grad;
      ctx.lineWidth = s.thickness;
      ctx.beginPath();
      ctx.moveTo(s.x, y);
      ctx.lineTo(s.x + s.len, y);
      ctx.stroke();

      if (s.x > W + s.len){
        Object.assign(s, spawn());
        s.x = -s.len;
      }
    }
    if (!reduced) requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);
  if (reduced){
    ctx.clearRect(0,0,W,H); // static empty canvas, respect reduced motion
  } else {
    requestAnimationFrame(tick);
  }
})();

/* ---------------------------------------------------------------
   3. NAV — scrolled background state + scroll-progress bar
--------------------------------------------------------------- */
(function initNav(){
  const nav = document.querySelector('.site-nav');
  const bar = document.getElementById('scroll-progress');

  function onScroll(){
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (bar){
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      const pct = scrollable > 0 ? y / scrollable : 0;
      bar.style.transform = `scaleX(${pct})`;
    }
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (toggle && drawer){
    toggle.addEventListener('click', ()=>{
      drawer.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    drawer.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=> drawer.classList.remove('open'));
    });
  }
})();

/* ---------------------------------------------------------------
   4. SCROLL REVEAL — IntersectionObserver driven
--------------------------------------------------------------- */
(function initReveal(){
  const targets = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-scale, .stagger');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.18, rootMargin:'0px 0px -60px 0px' });

  targets.forEach(t=> io.observe(t));

  document.querySelectorAll('.stagger').forEach(group=>{
    [...group.children].forEach((child,i)=>{
      child.classList.add('stagger-item');
      child.style.setProperty('--i', i);
    });
  });
})();

/* ---------------------------------------------------------------
   5. COUNT-UP UTILITY (used for HUD stat readouts)
--------------------------------------------------------------- */
function animateCount(el, target, duration=1400, decimals=0, suffix=''){
  const start = performance.now();
  const from = 0;
  function frame(now){
    const p = Math.min((now-start)/duration, 1);
    const eased = 1 - Math.pow(1-p, 3);
    const val = from + (target-from)*eased;
    el.textContent = val.toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function initCountUps(){
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting){
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix = el.dataset.suffix || '';
        animateCount(el, target, 1500, decimals, suffix);
        io.unobserve(el);
      }
    });
  }, { threshold:0.6 });
  els.forEach(el=> io.observe(el));
}
document.addEventListener('DOMContentLoaded', initCountUps);
