/* ==========================================================================
   MODELS.JS — filter tabs for the showroom grid
   ========================================================================== */

(function initFilters(){
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.car-card');
  const countEl = document.getElementById('result-count');
  const noResults = document.getElementById('no-results');

  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=> t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      let visible = 0;

      cards.forEach(card=>{
        const match = filter === 'all' || card.dataset.cat === filter;
        if (match){
          card.classList.remove('filtered-out');
          visible++;
        } else {
          card.classList.add('filtered-out');
        }
      });

      countEl.textContent = visible;
      noResults.hidden = visible !== 0;
    });
  });

  /* Deep-link support: #electric / #m-series / #sedans from index.html cards */
  const hash = window.location.hash.replace('#','');
  if (hash){
    const match = [...tabs].find(t => t.dataset.filter === hash);
    if (match) match.click();
  }
})();
