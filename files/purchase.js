/* ==========================================================================
   PURCHASE.JS — multi-step configure & purchase form
   ========================================================================== */

const MODELS_BY_LINE = {
  'i4-gran-coupe': ['i4 eDrive40', 'i4 M50 xDrive'],
  'ix-xdrive50':   ['iX xDrive50', 'iX M60'],
  'm3-competition':['M3 Competition', 'M3 Competition xDrive', 'M3 CS'],
  'm5':            ['M5 Sedan', 'M5 Touring'],
  '3-series':      ['330i', '330i xDrive', '340i xDrive'],
  'x5':            ['X5 xDrive40i', 'X5 M60i', 'X5 M Competition'],
};

const CAR_LINE_LABELS = {
  'i4-gran-coupe':'i4 Gran Coupé', 'ix-xdrive50':'iX xDrive50',
  'm3-competition':'M3 Competition', 'm5':'M5',
  '3-series':'3 Series', 'x5':'X5',
};

(function purchaseForm(){
  const form = document.getElementById('purchase-form');
  if (!form) return;

  const steps = [...document.querySelectorAll('.form-step')];
  const progressSteps = [...document.querySelectorAll('.progress-step')];
  const progressFill = document.getElementById('progress-fill');
  let current = 1;

  const carLineSelect  = document.getElementById('car-line');
  const carModelSelect = document.getElementById('car-model');
  const selectedPreview = document.getElementById('selected-preview');
  const selectedPreviewText = document.getElementById('selected-preview-text');

  /* ---------- Prefill from ?car=&model= (arriving from models.html) ---------- */
  const params = new URLSearchParams(window.location.search);
  const qCar = params.get('car');
  const qModel = params.get('model');
  if (qCar && MODELS_BY_LINE[qCar]){
    carLineSelect.value = qCar;
    populateModels(qCar, qModel);
  }

  carLineSelect.addEventListener('change', ()=> populateModels(carLineSelect.value));
  carModelSelect.addEventListener('change', updateSelectedPreview);

  function populateModels(line, preselect){
    carModelSelect.innerHTML = '';
    const models = MODELS_BY_LINE[line] || [];
    if (!models.length){
      carModelSelect.innerHTML = '<option value="" disabled selected>Select a car line first</option>';
      selectedPreview.hidden = true;
      return;
    }
    const placeholder = document.createElement('option');
    placeholder.value = ''; placeholder.disabled = true; placeholder.textContent = 'Select a model / trim';
    carModelSelect.appendChild(placeholder);

    models.forEach(m=>{
      const opt = document.createElement('option');
      opt.value = m; opt.textContent = m;
      carModelSelect.appendChild(opt);
    });

    if (preselect && models.includes(preselect)){
      carModelSelect.value = preselect;
    } else {
      placeholder.selected = true;
    }
    updateSelectedPreview();
  }

  function updateSelectedPreview(){
    const line = carLineSelect.value;
    const model = carModelSelect.value;
    if (line && model){
      selectedPreview.hidden = false;
      selectedPreviewText.textContent = `${CAR_LINE_LABELS[line]} — ${model}`;
    } else {
      selectedPreview.hidden = true;
    }
  }

  /* ---------- Payment method toggle ---------- */
  const loanFields = document.getElementById('loan-fields');
  const directFields = document.getElementById('direct-pay-fields');
  form.querySelectorAll('input[name="payment_method"]').forEach(radio=>{
    radio.addEventListener('change', ()=>{
      const isLoan = radio.value === 'loan' && radio.checked;
      if (radio.checked){
        loanFields.hidden = radio.value !== 'loan';
        directFields.hidden = radio.value !== 'direct_pay';
      }
    });
  });

  /* ---------- Step navigation ---------- */
  function goToStep(n){
    steps.forEach(s=> s.classList.toggle('active', Number(s.dataset.step) === n));
    progressSteps.forEach(p=>{
      const i = Number(p.dataset.step);
      p.classList.toggle('active', i === n);
      p.classList.toggle('done', i < n);
    });
    progressFill.style.width = `${((n-1)/(steps.length-1))*100}%`;
    current = n;
    if (n === 4) buildReview();
    document.querySelector('.form-section').scrollIntoView({ behavior:'smooth', block:'start' });
  }

  document.querySelectorAll('.next-step').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if (validateStep(current)) goToStep(current + 1);
    });
  });
  document.querySelectorAll('.prev-step').forEach(btn=>{
    btn.addEventListener('click', ()=> goToStep(current - 1));
  });

  /* ---------- Validation ---------- */
  function validateStep(n){
    const stepEl = steps.find(s => Number(s.dataset.step) === n);
    const requiredFields = stepEl.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(input=>{
      const field = input.closest('.field') || input.closest('.consent-field');
      let ok = true;

      if (input.type === 'checkbox'){
        ok = input.checked;
      } else if (input.type === 'email'){
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      } else if (input.type === 'tel'){
        ok = input.value.trim().replace(/[^0-9]/g,'').length >= 7;
      } else {
        ok = input.value.trim().length > 0;
      }

      if (field) field.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });

    return valid;
  }

  /* Clear invalid state as user types/selects */
  form.addEventListener('input', (e)=>{
    const field = e.target.closest('.field');
    if (field) field.classList.remove('invalid');
  });
  form.addEventListener('change', (e)=>{
    const field = e.target.closest('.field') || e.target.closest('.consent-field');
    if (field) field.classList.remove('invalid');
  });

  /* ---------- Review summary ---------- */
  function buildReview(){
    const grid = document.getElementById('review-grid');
    const fd = new FormData(form);
    const paymentMethod = fd.get('payment_method') === 'loan' ? 'Financed (Loan)' : 'Direct Pay';

    const rows = [
      ['Full Name', fd.get('full_name')],
      ['Email', fd.get('email')],
      ['Phone', fd.get('phone')],
      ['Address', [fd.get('address'), fd.get('city'), fd.get('state'), fd.get('zip_code'), fd.get('country')].filter(Boolean).join(', ')],
      ['Car Line', CAR_LINE_LABELS[fd.get('car_line')] || '—'],
      ['Model / Trim', fd.get('car_model') || '—'],
      ['Exterior Colour', fd.get('exterior_color') || '—'],
      ['Quantity', fd.get('quantity') || '1'],
      ['Payment Method', paymentMethod],
    ];

    if (fd.get('payment_method') === 'loan'){
      rows.push(
        ['Loan Amount', fd.get('loan_amount') ? `$${fd.get('loan_amount')}` : '—'],
        ['Down Payment', fd.get('down_payment') ? `$${fd.get('down_payment')}` : '—'],
        ['Loan Term', fd.get('loan_term') ? `${fd.get('loan_term')} months` : '—'],
      );
    } else {
      rows.push(
        ['Payment Type', fd.get('direct_pay_method') || '—'],
        ['Preferred Date', fd.get('preferred_payment_date') || '—'],
      );
    }

    grid.innerHTML = rows.map(([label,val])=>`
      <div class="review-item">
        <span>${label}</span>
        <b>${val && String(val).trim() ? val : '—'}</b>
      </div>
    `).join('');
  }

  /* ---------- Submit ---------- */
  form.addEventListener('submit', (e)=>{
    if (!validateStep(4)){
      e.preventDefault();
      return;
    }
    // Native submission proceeds to action="/user-details" method="POST".
    // We briefly show a confirming state; if the endpoint doesn't exist in
    // this preview environment, the browser will navigate accordingly.
    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Sending…';
    btn.disabled = true;
  });

  goToStep(1);
})();
