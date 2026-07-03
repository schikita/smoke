(function () {
  'use strict';

  // ===== SMOKE PARTICLES =====
  const canvas = document.getElementById('smoke-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100;
      this.size = Math.random() * 80 + 40;
      this.speedY = Math.random() * 0.8 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.15 + 0.05;
      this.life = 0;
      this.maxLife = Math.random() * 200 + 150;
    }

    update() {
      this.life++;
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.life * 0.02) * 0.3;
      this.size += 0.15;
      this.opacity *= 0.998;

      if (this.life > this.maxLife || this.opacity < 0.01) {
        this.reset();
      }
    }

    draw() {
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size
      );
      gradient.addColorStop(0, `rgba(180, 190, 200, ${this.opacity})`);
      gradient.addColorStop(0.5, `rgba(120, 130, 140, ${this.opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(80, 90, 100, 0)');

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(40, Math.floor(window.innerWidth / 40));
    particles = Array.from({ length: count }, () => new Particle());
  }

  function animateSmoke() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animationId = requestAnimationFrame(animateSmoke);
  }

  function startSmoke() {
    resizeCanvas();
    initParticles();
    animateSmoke();
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    startSmoke();
  }

  // ===== HEADER SCROLL =====
  const header = document.getElementById('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
  }, { passive: true });

  // ===== MOBILE NAV =====
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  const navLinks = nav.querySelectorAll('.nav__link');

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ===== SIREN EFFECT =====
  const sirenBtn = document.getElementById('siren-btn');
  const sirenOverlay = document.querySelector('.siren-overlay');
  let sirenActive = false;
  let sirenInterval;
  let audioCtx;

  function playSirenTone() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // Audio not available
    }
  }

  function toggleSiren() {
    sirenActive = !sirenActive;
    document.body.classList.toggle('siren-active', sirenActive);
    sirenBtn.classList.toggle('active', sirenActive);

    if (sirenActive) {
      playSirenTone();
      sirenInterval = setInterval(() => {
        sirenOverlay.classList.toggle('active');
        playSirenTone();
      }, 800);
      sirenOverlay.classList.add('active');
    } else {
      clearInterval(sirenInterval);
      sirenOverlay.classList.remove('active');
    }
  }

  sirenBtn.addEventListener('click', toggleSiren);

  // ===== SCROLL REVEAL =====
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el, i) => {
    el.dataset.delay = (i % 4) * 80;
    revealObserver.observe(el);
  });

  // ===== ACTIVE NAV LINK =====
  const sections = document.querySelectorAll('section[id]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href').slice(1);
            const isActive =
              href === id ||
              (id === 'intro' && href === 'gadgets') ||
              (id === 'hero' && false);
            link.classList.toggle('active', isActive);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
  );

  sections.forEach(section => sectionObserver.observe(section));

  // ===== SMOOTH SCROLL OFFSET =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== DEFERRED IMAGES =====
  document.querySelectorAll('img[data-defer-src]').forEach((img) => {
    const src = img.getAttribute('data-defer-src');
    if (!src) return;
    img.removeAttribute('data-defer-src');
    img.src = src;
  });

  // ===== KITCHEN FLAME INTERACTION =====
  const kitchenCard = document.querySelector('.danger-card--kitchen');
  if (kitchenCard) {
    kitchenCard.addEventListener('mouseenter', () => {
      const flame = kitchenCard.querySelector('.kitchen-flame');
      if (flame) flame.style.opacity = '1';
    });
    kitchenCard.addEventListener('mouseleave', () => {
      const flame = kitchenCard.querySelector('.kitchen-flame');
      if (flame) flame.style.opacity = '0.8';
    });
  }

  // ===== GALLERY LIGHTBOX =====
  const galleryLightbox = document.getElementById('gallery-lightbox');
  const galleryItems = [...document.querySelectorAll('.mini-gallery__item')];

  if (galleryLightbox && galleryItems.length) {
    const galleryImg = galleryLightbox.querySelector('.gallery-lightbox__img');
    const galleryCaption = galleryLightbox.querySelector('.gallery-lightbox__caption');
    const galleryCounter = galleryLightbox.querySelector('.gallery-lightbox__counter');
    const galleryCloseBtns = galleryLightbox.querySelectorAll('[data-gallery-close]');
    const galleryPrevBtn = galleryLightbox.querySelector('[data-gallery-prev]');
    const galleryNextBtn = galleryLightbox.querySelector('[data-gallery-next]');
    let currentIndex = 0;
    let lastFocusedEl = null;

    const slides = galleryItems.map((item) => {
      const img = item.querySelector('img');
      return {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
      };
    });

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      const slide = slides[currentIndex];
      galleryImg.src = slide.src;
      galleryImg.alt = slide.alt;
      galleryCaption.textContent = slide.alt;
      galleryCounter.textContent = `${currentIndex + 1} / ${slides.length}`;
    }

    function openGallery(index) {
      lastFocusedEl = document.activeElement;
      showSlide(index);
      galleryLightbox.hidden = false;
      galleryLightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      galleryLightbox.querySelector('.gallery-lightbox__close').focus();
    }

    function closeGallery() {
      galleryLightbox.hidden = true;
      galleryLightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      galleryImg.removeAttribute('src');
      if (lastFocusedEl) lastFocusedEl.focus();
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openGallery(index));
    });

    galleryCloseBtns.forEach((btn) => {
      btn.addEventListener('click', closeGallery);
    });

    galleryPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(currentIndex - 1);
    });

    galleryNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(currentIndex + 1);
    });

    document.addEventListener('keydown', (e) => {
      if (galleryLightbox.hidden) return;

      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
    });
  }
})();
