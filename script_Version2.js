// Basic interactions: modal, form handlers, sample local behaviour
document.addEventListener('DOMContentLoaded', ()=> {
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Modal controls
  const modal = document.getElementById('modal');
  const buyBtns = document.querySelectorAll('#buy, #buyTop, .buy-now');
  const close = document.getElementById('closeModal');

  function openModal(){ modal.setAttribute('aria-hidden','false'); }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); }

  buyBtns.forEach(b=> b.addEventListener('click', (e)=> {
    e.preventDefault();
    openModal();
  }));
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=> { if(e.target===modal) closeModal(); });

  // Lead form (email capture) — demo: shows a thank you message
  const leadForm = document.getElementById('leadForm');
  leadForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = leadForm.querySelector('input[name="email"]').value;
    alert('Thanks! A free sample will be sent to: ' + email);
    leadForm.reset();
  });

  // Checkout form — demo placeholder
  const checkoutForm = document.getElementById('checkoutForm');
  checkoutForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    // Here integrate real payment gateway (Stripe / PayPal) server-side
    const name = checkoutForm.querySelector('input[name="name"]').value;
    const email = checkoutForm.querySelector('input[name="email"]').value;
    alert(`Thank you ${name}! (demo) Purchase receipt sent to ${email}`);
    checkoutForm.reset();
    closeModal();
  });
});