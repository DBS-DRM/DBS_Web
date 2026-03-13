/* ============================================================
   DreamBigStudio — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     Smooth scroll for nav links
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------
     Sticky nav — add shadow on scroll
     ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.style.boxShadow = '0 1px 12px rgba(26,26,26,0.06)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  /* ----------------------------------------------------------
     Scroll-reveal animation for sections and project cards
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll(
    '.proj, .about-grid, .hero-title, .hero-right, .contact-grid, .stats'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.05}s, transform 0.6s ease ${i * 0.05}s`;
    observer.observe(el);
  });

  document.addEventListener('animationend', () => {}, false);

  // Apply revealed class via JS (cleaner than adding CSS class in HTML)
  document.querySelectorAll('.revealed').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });

  // Patch: override IntersectionObserver callback to apply styles directly
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------
     Contact form — basic validation + success message
     ---------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = form.querySelector('#name').value.trim();
      const email   = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();

      if (!name || !email || !message) {
        // Simple shake on empty required fields
        [form.querySelector('#name'), form.querySelector('#email'), form.querySelector('#message')]
          .forEach(field => {
            if (!field.value.trim()) {
              field.style.borderBottomColor = '#F07A5A';
            }
          });
        return;
      }

      // In production, replace this with a real form submission (e.g. Formspree, EmailJS, etc.)
      // Example with Formspree:
      // fetch('https://formspree.io/f/YOUR_FORM_ID', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, message })
      // });

      form.reset();
      successMsg.classList.add('visible');

      setTimeout(() => {
        successMsg.classList.remove('visible');
      }, 5000);
    });

    // Reset field border color on input
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.style.borderBottomColor = '';
      });
    });
  }

});
