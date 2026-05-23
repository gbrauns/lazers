/**
 * Lāzers 3 — Main Application
 */

(function () {
  'use strict';

  let content = null;
  let currentLang = localStorage.getItem('lang') || 'lv';

  // ============ INIT ============
  async function init() {
    try {
      const resp = await fetch('content.json');
      content = await resp.json();
    } catch (e) {
      console.error('Failed to load content.json', e);
      return;
    }

    applyLanguage(currentLang);
    initHeader();
    initMobileMenu();
    initWeapons();
    initPricing();
    initTestimonials();
    initFAQ();
    initContactForm();
    initScrollAnimations();
    initSmoothScroll();
    initLightbox();
  }

  // ============ i18n ============
  function getNestedValue(obj, path) {
    return path.split('.').reduce((o, key) => o && o[key], obj);
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    const data = content[lang];
    if (!data) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(data, key);
      if (value !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = value;
        } else {
          el.textContent = value;
        }
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.documentElement.lang = lang;

    if (content) {
      renderWeapons();
      renderPricing();
      renderTestimonials();
      renderFAQ();
    }
  }

  window.setLang = function (lang) {
    applyLanguage(lang);
  };

  // ============ HEADER ============
  function initHeader() {
    const header = document.getElementById('header');
    function checkScroll() {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  // ============ MOBILE MENU ============
  function initMobileMenu() {
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');
    const menuIcon = btn.querySelector('.menu-icon');
    const closeIcon = btn.querySelector('.close-icon');

    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      menuIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    });

    menu.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      });
    });
  }

  // ============ WEAPONS CAROUSEL ============
  let weaponIndex = 0;

  function initWeapons() {
    renderWeapons();
    document.getElementById('weaponPrev').addEventListener('click', () => slideWeapon(-1));
    document.getElementById('weaponNext').addEventListener('click', () => slideWeapon(1));

    let touchStartX = 0;
    const carousel = document.getElementById('weaponCarousel');
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) slideWeapon(diff > 0 ? 1 : -1);
    });
  }

  function renderWeapons() {
    const data = content[currentLang].weapons;
    const carousel = document.getElementById('weaponCarousel');
    const dots = document.getElementById('weaponDots');

    carousel.innerHTML = data.list.map(w => `
      <div class="weapon-card">
        <div class="weapon-visual">
          <img src="${w.image}" alt="${w.name}">
        </div>
        <div class="flex-1 text-center md:text-left">
          <h3 class="font-heading font-bold text-2xl mb-2">${w.name}</h3>
          <p class="text-white/60 mb-6">${w.desc}</p>
          <div class="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
            <span class="px-3 py-1 bg-white/5 rounded-lg text-sm text-white/70">${w.length}</span>
            <span class="px-3 py-1 bg-white/5 rounded-lg text-sm text-white/70">${w.weight}</span>
            <span class="px-3 py-1 bg-white/5 rounded-lg text-sm text-white/70">${w.range}</span>
          </div>
          <div class="space-y-3 max-w-sm mx-auto md:mx-0">
            <div>
              <div class="flex justify-between text-xs text-white/50 mb-1">
                <span>${data.stats.accuracy}</span><span>${w.accuracy}%</span>
              </div>
              <div class="stat-bar"><div class="stat-bar-fill" data-width="${w.accuracy}"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs text-white/50 mb-1">
                <span>${data.stats.mobility}</span><span>${w.mobility}%</span>
              </div>
              <div class="stat-bar"><div class="stat-bar-fill" data-width="${w.mobility}"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs text-white/50 mb-1">
                <span>${data.stats.firepower}</span><span>${w.firepower}%</span>
              </div>
              <div class="stat-bar"><div class="stat-bar-fill" data-width="${w.firepower}"></div></div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    dots.innerHTML = data.list.map((_, i) =>
      `<button class="carousel-dot ${i === weaponIndex ? 'active' : ''}" onclick="goToWeapon(${i})"></button>`
    ).join('');

    updateWeaponPosition(false);
    animateStatBars();
  }

  function slideWeapon(dir) {
    const total = content[currentLang].weapons.list.length;
    weaponIndex = (weaponIndex + dir + total) % total;
    updateWeaponPosition(true);
    animateStatBars();
  }

  window.goToWeapon = function (i) {
    weaponIndex = i;
    updateWeaponPosition(true);
    animateStatBars();
  };

  function updateWeaponPosition(animate) {
    const carousel = document.getElementById('weaponCarousel');
    carousel.style.transition = animate ? 'transform 0.5s ease-out' : 'none';
    carousel.style.transform = `translateX(-${weaponIndex * 100}%)`;

    document.querySelectorAll('#weaponDots .carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === weaponIndex);
    });
  }

  function animateStatBars() {
    setTimeout(() => {
      document.querySelectorAll('.stat-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }, 100);
  }

  // ============ PRICING ============
  function initPricing() {
    renderPricing();
  }

  function renderPricing() {
    const data = content[currentLang].pricing;
    const container = document.getElementById('pricingCards');

    container.innerHTML = data.packages.map(pkg => `
      <div class="pricing-card bg-white p-6 md:p-8 ${pkg.recommended ? 'recommended' : ''}">
        ${pkg.recommended ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">' + (currentLang === 'lv' ? 'Ieteicams' : currentLang === 'en' ? 'Recommended' : 'Рекомендуем') + '</div>' : ''}
        <div class="text-center mb-6">
          <h3 class="font-heading font-bold text-lg mb-3 text-dark">${pkg.name}</h3>
          <div class="flex items-baseline justify-center gap-1">
            <span class="font-heading font-black text-4xl text-primary">${pkg.price}</span>
            <span class="text-gray-500 text-sm">${pkg.per}</span>
          </div>
          <p class="text-gray-400 text-sm mt-1">${pkg.duration}</p>
        </div>
        <ul class="space-y-3 mb-8">
          ${pkg.features.map(f => `
            <li class="flex items-start gap-3 text-sm text-gray-600">
              <svg class="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              ${f}
            </li>
          `).join('')}
        </ul>
        <a href="#contact" class="block text-center ${pkg.recommended ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-beige hover:bg-gray-200 text-dark'} font-semibold py-3 rounded-full transition-colors text-sm">
          ${pkg.cta}
        </a>
      </div>
    `).join('');
  }

  // ============ TESTIMONIALS ============
  let testimonialIndex = 0;

  function initTestimonials() {
    renderTestimonials();

    setInterval(() => {
      const total = content[currentLang].testimonials.list.length;
      testimonialIndex = (testimonialIndex + 1) % total;
      updateTestimonialPosition();
    }, 6000);

    // Swipe support
    let touchStartX = 0;
    const el = document.getElementById('testimonialCarousel');
    el.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        const total = content[currentLang].testimonials.list.length;
        testimonialIndex = (testimonialIndex + (diff > 0 ? 1 : -1) + total) % total;
        updateTestimonialPosition();
      }
    });
  }

  function renderTestimonials() {
    const data = content[currentLang].testimonials;
    const slides = document.getElementById('testimonialSlides');
    const dots = document.getElementById('testimonialDots');

    slides.innerHTML = data.list.map(t => `
      <div class="testimonial-slide">
        <p class="testimonial-text">${t.text}</p>
        <div class="flex items-center justify-center gap-3 mt-4">
          ${t.avatar ? `<img src="${t.avatar}" alt="${t.author}" class="w-12 h-12 rounded-full object-cover border-2 border-white/20">` : ''}
          <div class="text-left">
            <p class="font-semibold text-white">${t.author}</p>
            ${t.type ? `<p class="text-white/50 text-sm">${t.type}</p>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    dots.innerHTML = data.list.map((_, i) =>
      `<button class="carousel-dot ${i === testimonialIndex ? 'active' : ''}" onclick="goToTestimonial(${i})"></button>`
    ).join('');

    updateTestimonialPosition();
  }

  window.goToTestimonial = function (i) {
    testimonialIndex = i;
    updateTestimonialPosition();
  };

  function updateTestimonialPosition() {
    const slides = document.getElementById('testimonialSlides');
    slides.style.transform = `translateX(-${testimonialIndex * 100}%)`;

    document.querySelectorAll('#testimonialDots .carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === testimonialIndex);
    });
  }

  // ============ FAQ ============
  function initFAQ() {
    renderFAQ();
  }

  function renderFAQ() {
    const data = content[currentLang].faq;
    const container = document.getElementById('faqList');

    container.innerHTML = data.list.map((item, i) => `
      <div class="faq-item" data-faq="${i}">
        <div class="faq-question" onclick="toggleFAQ(${i})">
          <span>${item.q}</span>
          <svg class="faq-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <div class="faq-answer">
          <p class="text-gray-600 leading-relaxed">${item.a}</p>
        </div>
      </div>
    `).join('');
  }

  window.toggleFAQ = function (index) {
    const item = document.querySelector(`[data-faq="${index}"]`);
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
  };

  // ============ CONTACT FORM ============
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = '...';

      try {
        const resp = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (resp.ok) {
          status.textContent = content[currentLang].contact.form.success;
          status.className = 'text-center py-3 text-sm font-medium success';
          form.reset();
        } else {
          throw new Error();
        }
      } catch {
        status.textContent = content[currentLang].contact.form.error;
        status.className = 'text-center py-3 text-sm font-medium error';
      }

      submitBtn.disabled = false;
      submitBtn.textContent = content[currentLang].contact.form.submit;
      setTimeout(() => { status.className = 'hidden'; }, 5000);
    });
  }

  // ============ SCROLL ANIMATIONS ============
  function initScrollAnimations() {
    document.querySelectorAll('section:not(#hero)').forEach(section => {
      const children = section.querySelectorAll('h2, .grid > div, .pricing-card, .faq-item, form, .space-y-6 > div');
      children.forEach((el, i) => {
        el.classList.add('fade-up');
        el.style.transitionDelay = `${i * 0.1}s`;
      });
    });

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  }

  // ============ SMOOTH SCROLL + URL HASH ============
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = document.getElementById('header').offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top, behavior: 'smooth' });
          // Update URL hash so link is shareable
          history.pushState(null, '', href);
        }
      });
    });

    // Handle direct hash URL on page load
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          const headerHeight = document.getElementById('header').offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 500);
    }
  }

  // ============ LIGHTBOX ============
  let lightboxImages = [];
  let lightboxIndex = 0;

  function initLightbox() {
    const items = document.querySelectorAll('.gallery-item');
    lightboxImages = Array.from(items).map(item => {
      const img = item.querySelector('img');
      return { src: img.src, alt: img.alt };
    });

    items.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      const lb = document.getElementById('lightbox');
      if (lb.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightboxFn();
      if (e.key === 'ArrowLeft') lightboxNavFn(-1);
      if (e.key === 'ArrowRight') lightboxNavFn(1);
    });

    // Swipe support
    let touchStartX = 0;
    const lb = document.getElementById('lightbox');
    lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) lightboxNavFn(diff > 0 ? 1 : -1);
    });
  }

  function openLightbox(index) {
    lightboxIndex = index;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lbImage');
    img.src = lightboxImages[index].src;
    img.alt = lightboxImages[index].alt;
    lb.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightboxFn() {
    document.getElementById('lightbox').classList.add('hidden');
    document.body.style.overflow = '';
  }

  function lightboxNavFn(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
    const img = document.getElementById('lbImage');
    img.src = lightboxImages[lightboxIndex].src;
    img.alt = lightboxImages[lightboxIndex].alt;
  }

  // Global handlers for onclick in HTML
  window.closeLightbox = function (e) {
    if (e && e.target !== e.currentTarget) return;
    closeLightboxFn();
  };
  window.lightboxNav = function (dir) {
    lightboxNavFn(dir);
  };

  // ============ START ============
  document.addEventListener('DOMContentLoaded', init);
})();
