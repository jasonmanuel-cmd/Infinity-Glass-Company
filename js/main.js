/* ============================================
   INFINITY GLASS COMPANY - Main JavaScript
   Mobile nav, FAQ accordion, forms, animations
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- Header scroll effect ---
  var header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  // --- Mobile menu toggle (accessible) ---
  var menuToggle = document.querySelector('.menu-toggle');
  var navMobile = document.querySelector('.nav-mobile');
  if (menuToggle && navMobile) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('active');
      navMobile.classList.toggle('active');
      document.body.style.overflow = navMobile.classList.contains('active') ? 'hidden' : '';

      var isExpanded = navMobile.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', String(isExpanded));

      if (isExpanded) {
        var firstLink = navMobile.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMobile.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });

    // Close on link click
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- FAQ accordion (accessible) ---
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    var item = btn.closest('.faq-item');
    var answer = item.querySelector('.faq-answer');
    var answerId = 'faq-answer-' + Math.random().toString(36).substr(2, 9);
    answer.setAttribute('id', answerId);
    btn.setAttribute('aria-controls', answerId);
    answer.setAttribute('aria-hidden', 'true');

    btn.addEventListener('click', function () {
      var isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item.active').forEach(function (openItem) {
        openItem.classList.remove('active');
        openItem.querySelector('.faq-answer').style.maxHeight = '0';
        openItem.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // --- Scroll animations ---
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(function (el) {
    observer.observe(el);
  });

  // --- Form handling (accessible) ---
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous errors
      form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
      form.querySelectorAll('[aria-invalid]').forEach(function (el) {
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
      });
      var existingSummary = form.querySelector('.form-error-summary');
      if (existingSummary) existingSummary.remove();

      var errors = [];
      var firstErrorField = null;

      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          var label = form.querySelector('label[for="' + field.id + '"]');
          var labelText = label ? label.textContent.replace(/\*/g, '').trim() : 'This field';
          var errorId = field.id + '-error';

          field.setAttribute('aria-invalid', 'true');
          field.setAttribute('aria-describedby', errorId);

          var errorEl = document.createElement('div');
          errorEl.className = 'field-error';
          errorEl.id = errorId;
          errorEl.setAttribute('role', 'alert');
          errorEl.textContent = labelText + ' is required.';
          field.parentNode.appendChild(errorEl);

          errors.push(labelText + ' is required');
          if (!firstErrorField) firstErrorField = field;
        }
      });

      if (errors.length > 0) {
        var summary = document.createElement('div');
        summary.className = 'form-error-summary';
        summary.setAttribute('role', 'alert');
        summary.innerHTML = '<strong>Please fix the following errors:</strong><ul>' +
          errors.map(function (err) { return '<li>' + err + '</li>'; }).join('') + '</ul>';
        form.insertBefore(summary, form.firstChild);
        summary.focus();
        return;
      }

      // Show success message
      var successMsg = form.querySelector('.form-success');
      if (successMsg) {
        form.style.display = 'none';
        successMsg.style.display = 'block';
        successMsg.setAttribute('tabindex', '-1');
        successMsg.focus();
      }

      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });
    });
  });

  // --- Gallery lightbox (accessible) ---
  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    var imgAlt = item.querySelector('img') ? item.querySelector('img').alt : 'gallery photo';
    item.setAttribute('aria-label', 'View larger image: ' + imgAlt);

    function openLightbox() {
      var img = item.querySelector('img');
      if (!img) return;

      var overlay = document.createElement('div');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', 'Image lightbox');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;padding:2rem;';

      var fullImg = document.createElement('img');
      fullImg.src = img.src;
      fullImg.alt = img.alt;
      fullImg.style.cssText = 'max-width:90%;max-height:90vh;object-fit:contain;border-radius:8px;';

      var closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close lightbox');
      closeBtn.style.cssText = 'position:absolute;top:1rem;right:1.5rem;background:none;border:none;color:white;font-size:2rem;cursor:pointer;';

      overlay.appendChild(fullImg);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      closeBtn.focus();

      function closeLightbox() {
        overlay.remove();
        document.body.style.overflow = '';
        item.focus();
      }

      closeBtn.addEventListener('click', closeLightbox);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeLightbox();
      });

      var escHandler = function (e) {
        if (e.key === 'Escape') {
          closeLightbox();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    }

    item.addEventListener('click', openLightbox);
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox();
      }
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Phone number click tracking ---
  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click_to_call', { event_category: 'engagement' });
      }
    });
  });

});
