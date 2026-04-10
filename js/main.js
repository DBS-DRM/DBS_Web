/* ============================================================
   DreamBigStudio — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Smooth scroll — offset by navbar height so headings aren't hidden */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* Hero background slideshow */
  const heroBg = document.getElementById('heroBg');
  if (heroBg) {
    // Collect every image from every project gallery
    const allImages = [];
    document.querySelectorAll('.proj[data-gallery]').forEach(proj => {
      try { JSON.parse(proj.dataset.gallery).forEach(src => allImages.push(src)); }
      catch (e) {}
    });

    if (allImages.length > 0) {
      // First image is always the same (deterministic anchor)
      const first = allImages[0];
      // Shuffle the rest randomly
      const rest = allImages.slice(1);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      // Cap total slides at 12 for performance
      const slides = [first, ...rest].slice(0, 12);

      slides.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'hero-bg-slide' + (i === 0 ? ' active' : '');
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        if (i > 0) img.loading = 'lazy';
        slide.appendChild(img);
        heroBg.appendChild(slide);
      });

      let current = 0;
      setInterval(() => {
        const slideEls = heroBg.querySelectorAll('.hero-bg-slide');
        slideEls[current].classList.remove('active');
        current = (current + 1) % slideEls.length;
        slideEls[current].classList.add('active');
      }, 5000);
    }
  }

  /* Sticky nav shadow */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10 ? '0 1px 12px rgba(26,26,26,0.06)' : 'none';
  });

  /* Mobile nav toggle */
  const navToggle = document.getElementById('navToggle');
  const navRight  = document.getElementById('navRight');
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('open');
    navRight.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navRight.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navRight.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
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
     Project Panel
     ---------------------------------------------------------- */
  const panel      = document.getElementById('projectPanel');
  const panelClose = document.getElementById('panelClose');
  const panelImg   = document.getElementById('panelImg');
  const panelCounter = document.getElementById('panelCounter');
  const panelPrev  = document.getElementById('panelPrev');
  const panelNext  = document.getElementById('panelNext');
  const panelTitle = document.getElementById('panelTitle');
  const panelType  = document.getElementById('panelType');
  const panelDesc  = document.getElementById('panelDesc');

  let gallery = [];
  let idx = 0;

  function openPanel(images, title, type, description) {
    gallery = images;
    idx = 0;
    panelTitle.textContent = title;
    panelType.textContent  = type;
    panelDesc.textContent  = description;
    showImage(0);
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => panel.classList.add('visible'));
  }

  function closePanel() {
    panel.classList.remove('visible');
    setTimeout(() => {
      panel.classList.remove('active');
      document.body.style.overflow = '';
      panelImg.classList.remove('loaded');
    }, 350);
  }

  function showImage(i) {
    panelImg.classList.remove('loaded');
    panelImg.src = gallery[i];
    panelImg.onload = () => panelImg.classList.add('loaded');
    panelCounter.textContent = `${i + 1} / ${gallery.length}`;
    panelPrev.style.opacity = gallery.length > 1 ? '1' : '0';
    panelNext.style.opacity = gallery.length > 1 ? '1' : '0';
  }

  function prev() { idx = (idx - 1 + gallery.length) % gallery.length; showImage(idx); }
  function next() { idx = (idx + 1) % gallery.length; showImage(idx); }

  document.querySelectorAll('.proj[data-gallery]').forEach(proj => {
    proj.addEventListener('click', () => {
      const images      = JSON.parse(proj.dataset.gallery);
      const title       = proj.querySelector('.proj-name').textContent;
      const type        = proj.querySelector('.proj-type').textContent;
      const description = proj.dataset.description || '';
      openPanel(images, title, type, description);
    });
  });

  panelClose.addEventListener('click', closePanel);
  panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
  panelPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  panelNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  document.addEventListener('keydown', (e) => {
    if (!panel.classList.contains('active')) return;
    if (e.key === 'Escape')     closePanel();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  /* Touch swipe for panel gallery */
  let touchStartX = 0;
  const panelGallery = panel.querySelector('.panel-gallery');
  panelGallery.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  panelGallery.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  }, { passive: true });

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
