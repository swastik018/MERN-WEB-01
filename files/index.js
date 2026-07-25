/* ==========================================================================
   INDEX.JS — hero parallax tilt for the car illustration
   ========================================================================== */

(function heroParallax(){
  const car = document.querySelector('.hero-car');
  const hero = document.querySelector('.hero');
  if (!car || !hero) return;
  if (window.matchMedia('(max-width:900px)').matches) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;

  hero.addEventListener('mousemove', (e)=>{
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tx = px * 16;
    ty = py * 10;
  });

  hero.addEventListener('mouseleave', ()=>{ tx = 0; ty = 0; });

  function raf(){
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    car.style.transform = `perspective(1000px) rotateY(${cx}deg) rotateX(${-cy}deg)`;
    requestAnimationFrame(raf);
  }
  raf();
})();

/* Title word-by-word letter drift on load, using CSS transition already
   defined via .reveal-up; here we simply ensure hero reveals fire even
   if IntersectionObserver threshold is missed on first paint (above fold). */
window.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.hero .reveal-up, .hero .reveal-fade, .hero .reveal-scale')
    .forEach(el => requestAnimationFrame(()=> el.classList.add('in')));
});
