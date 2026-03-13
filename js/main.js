/* ============================================================
   DreamBigStudio — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* Sticky nav shadow */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10 ? '0 1px 12px rgba(26,26,26,0.06)' : 'none';
  });

  /* Scroll-reveal */
  const revealEls = document.querySelectorAll('.proj, .about-grid, .hero-title, .hero-right, .contact-grid, .stats');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.05}s, transform 0.6s ease ${i * 0.05}s`;
    revealObserver.observe(el);
  });

  /* ----------------------------------------------------------
     Lightbox
     ---------------------------------------------------------- */
  const lightbox  = document.getElementById('lightbox');
  const backdrop  = document.getElementById('lbBackdrop');
  const lbImg     = document.getElementById('lbImg');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');

  let gallery = [];
  let idx = 0;

  function open(g, i) {
    gallery = g; idx = i;
    show(idx);
    lightbox.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.classList.remove('loaded');
  }

  function show(i) {
    lbImg.classList.remove('loaded');
    lbImg.src = gallery[i];
    lbImg.onload = () => lbImg.classList.add('loaded');
    lbCounter.textContent = `${i + 1} / ${gallery.length}`;
    lbPrev.style.opacity = i === 0 ? '0.3' : '1';
    lbNext.style.opacity = i === gallery.length - 1 ? '0.3' : '1';
  }

  function prev() { if (idx > 0) show(--idx); }
  function next() { if (idx < gallery.length - 1) show(++idx); }

  document.querySelectorAll('.proj[data-gallery]').forEach(proj => {
    proj.addEventListener('click', () => open(JSON.parse(proj.dataset.gallery), 0));
  });

  lbClose.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  /* Contact form validation */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      const n = form.querySelector('#name').value.trim();
      const em = form.querySelector('#email').value.trim();
      const m = form.querySelector('#message').value.trim();
      if (!n || !em || !m) {
        e.preventDefault();
        [form.querySelector('#name'), form.querySelector('#email'), form.querySelector('#message')]
          .forEach(f => { if (!f.value.trim()) f.style.borderBottomColor = '#F07A5A'; });
      }
    });
    form.querySelectorAll('input, textarea').forEach(f => {
      f.addEventListener('input', () => { f.style.borderBottomColor = ''; });
    });
  }

});
