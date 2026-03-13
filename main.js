// ===== Custom Cursor =====
(function () {
  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -100, my = -100;   // mouse position
  let rx = -100, ry = -100;   // ring position (lerped)

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  // Smooth trailing ring
  function animate() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animate);
  }
  animate();

  // Hover effect on interactive elements
  const hoverTargets = 'a, button, .btn, .project-card, .nav-toggle, .skill-item--clickable, input, textarea, [role="button"]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add('hover');
      ring.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    }
  });

  // Hide when cursor leaves window
  document.addEventListener('mouseleave', () => {
    dot.classList.add('hidden');
    ring.classList.add('hidden');
  });
  document.addEventListener('mouseenter', () => {
    dot.classList.remove('hidden');
    ring.classList.remove('hidden');
  });
})();

// ===== Loading Screen =====
(function () {
  const loader = document.getElementById('loadingScreen');
  if (!loader) return;

  if (sessionStorage.getItem('visited')) {
    loader.classList.add('skip');
    document.body.classList.add('loaded');
    return;
  }

  requestAnimationFrame(() => loader.classList.add('active'));

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hide');
      document.body.classList.add('loaded');
      sessionStorage.setItem('visited', '1');
    }, 1400);
  });
})();

// ===== Scroll Reveal =====
(function () {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
})();

// ===== Navbar Scroll Effect =====
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
})();

// ===== Mobile Menu Toggle =====
(function () {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });
})();

// ===== Flow Showcase Animation =====
(function () {
  const showcases = document.querySelectorAll('.flow-showcase');
  if (!showcases.length) return;

  showcases.forEach((showcase) => {
    const steps = showcase.querySelectorAll('.flow-step');
    const connectors = showcase.querySelectorAll('.flow-connector');
    const viewport = showcase.querySelector('.flow-image-viewport');
    const img = viewport ? viewport.querySelector('img') : null;
    const progressFill = showcase.querySelector('.flow-progress-fill');
    const playBtn = showcase.querySelector('.flow-play-btn');
    const counter = showcase.querySelector('.flow-step-counter');
    const speed = parseInt(showcase.dataset.speed) || 2200;
    const totalSteps = steps.length;

    let currentStep = 0;
    let playing = true;
    let interval = null;

    function updateStep(index) {
      currentStep = index;

      // Update step states
      steps.forEach((step, i) => {
        step.classList.remove('active', 'done');
        if (i < index) step.classList.add('done');
        if (i === index) step.classList.add('active');
      });

      // Fill connectors
      connectors.forEach((conn, i) => {
        conn.classList.toggle('filled', i < index);
      });

      // Move image to show the active screen via object-position
      if (img && steps[index]) {
        const pos = steps[index].dataset.pos || '50% 50%';
        img.style.objectPosition = pos;
      }

      // Update progress bar
      if (progressFill) {
        progressFill.style.width = ((index + 1) / totalSteps) * 100 + '%';
      }

      // Update counter
      if (counter) {
        counter.textContent = (index + 1) + ' / ' + totalSteps;
      }
    }

    function nextStep() {
      updateStep((currentStep + 1) % totalSteps);
    }

    function startAutoPlay() {
      if (interval) clearInterval(interval);
      interval = setInterval(nextStep, speed);
      playing = true;
      if (playBtn) {
        playBtn.textContent = '⏸ 暫停';
        playBtn.dataset.playing = 'true';
      }
    }

    function stopAutoPlay() {
      if (interval) clearInterval(interval);
      interval = null;
      playing = false;
      if (playBtn) {
        playBtn.textContent = '▶ 播放';
        playBtn.dataset.playing = 'false';
      }
    }

    // Click on steps to jump
    steps.forEach((step) => {
      step.addEventListener('click', () => {
        updateStep(parseInt(step.dataset.index));
        if (playing) {
          stopAutoPlay();
          startAutoPlay();
        }
      });
    });

    // Play/Pause button
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        playing ? stopAutoPlay() : startAutoPlay();
      });
    }

    // Initialize first step
    updateStep(0);

    // Auto-play when visible, pause when not
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.isIntersecting ? startAutoPlay() : stopAutoPlay();
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(showcase);
  });
})();

// ===== Skill Modals =====
(function () {
  const triggers = document.querySelectorAll('[data-modal]');
  if (!triggers.length) return;

  function openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(trigger.dataset.modal);
    });
  });

  document.querySelectorAll('.skill-modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });

    const closeBtn = overlay.querySelector('.skill-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(overlay));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.skill-modal-overlay.active').forEach(closeModal);
    }
  });
})();

// ===== Lightbox =====
(function () {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<img src="" alt="">';
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('img');

  document.addEventListener('click', (e) => {
    if (e.target.matches('.gallery img, .flow-images img')) {
      lbImg.src = e.target.src;
      lbImg.alt = e.target.alt;
      lightbox.classList.add('active');
    }
  });

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
    lbImg.src = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lightbox.classList.remove('active');
      lbImg.src = '';
    }
  });
})();
