/* ============================================
   CyberPlus GmbH — V2 Engine
   3D · Bilingual · Cinematic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initLang();
  initReveal();
  initParticles3D();
  initTiltCards();
  initCounters();
  initForm();
});

/* ═══════ NAVIGATION ═══════ */
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const menu = document.querySelector('.nav-menu');
  const overlay = document.querySelector('.nav-overlay');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      menu.classList.toggle('open');
      overlay?.classList.toggle('show');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });
  }
  overlay?.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    menu?.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      hamburger?.classList.remove('open');
      menu.classList.remove('open');
      overlay?.classList.remove('show');
      document.body.style.overflow = '';
    }
  }));

  // Active link
  const page = location.pathname.split('/').pop() || 'index.html';
  menu?.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') ||
        href?.endsWith('/' + page)) {
      a.classList.add('active');
    }
  });
}

/* ═══════ LANGUAGE SWITCHER ═══════ */
function initLang() {
  const saved = localStorage.getItem('cp-lang') || 'en';
  setLang(saved);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLang(lang);
      localStorage.setItem('cp-lang', lang);
    });
  });
}

function setLang(lang) {
  document.body.classList.toggle('lang-de', lang === 'de');
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.documentElement.lang = lang === 'de' ? 'de' : 'en';
}

/* ═══════ REVEAL ON SCROLL ═══════ */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger')
    .forEach(el => obs.observe(el));
}

/* ═══════ 3D PARTICLE FIELD ═══════ */
function initParticles3D() {
  const canvas = document.getElementById('hero-3d');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouse = { x: 0, y: 0 };
  const COUNT = Math.min(120, Math.floor(window.innerWidth / 12));

  function resize() {
    w = canvas.width = canvas.parentElement.clientWidth;
    h = canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create particles
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      z: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.5 + 0.2,
    });
  }

  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.parentElement.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 160, 255, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw & move particles
    particles.forEach(p => {
      // Mouse influence
      const mdx = mouse.x - p.x;
      const mdy = mouse.y - p.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < 200 && mDist > 0) {
        p.vx += (mdx / mDist) * 0.02;
        p.vy += (mdy / mDist) * 0.02;
      }

      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.99; p.vy *= 0.99;

      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

      const size = p.r * p.z;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 160, 255, ${p.o * p.z * 0.5})`;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 160, 255, ${p.o * 0.03})`;
      ctx.fill();
    });

    // Scanning line effect
    const scanY = (Date.now() * 0.03) % h;
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(w, scanY);
    const grad = ctx.createLinearGradient(0, scanY, w, scanY);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.3, 'rgba(0, 160, 255, 0.04)');
    grad.addColorStop(0.7, 'rgba(0, 160, 255, 0.04)');
    grad.addColorStop(1, 'transparent');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.stroke();

    requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════ 3D TILT CARDS ═══════ */
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

/* ═══════ COUNTERS ═══════ */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

function animateCount(el) {
  const target = parseInt(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const dur = 2200;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + target.toLocaleString() + suffix;
  })(start);
}

/* ═══════ CONTACT FORM ═══════ */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="spin-icon">⟳</span> Encrypting...';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '✓ Sent Securely';
      btn.style.background = 'linear-gradient(135deg, #00E98F, #00B86B)';
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.style.background = ''; form.reset(); }, 3000);
    }, 2000);
  });
}

/* Spin icon */
const s = document.createElement('style');
s.textContent = `.spin-icon { display: inline-block; animation: spinI 0.8s linear infinite; }
@keyframes spinI { to { transform: rotate(360deg); } }`;
document.head.appendChild(s);
