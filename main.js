/* ══════════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════════ */
const progressBar = document.getElementById('progress-bar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });
}

/* ══════════════════════════════════════════════
   CURSOR SPOTLIGHT
══════════════════════════════════════════════ */
document.addEventListener('mousemove', e => {
  document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
  document.documentElement.style.setProperty('--my', `${e.clientY}px`);
}, { passive: true });

/* ══════════════════════════════════════════════
   STICKY NAV
══════════════════════════════════════════════ */
const stickyNav = document.getElementById('sticky-nav');
const hasHero = document.querySelector('.hero');
let cachedHeroHeight = window.innerHeight * 0.6;

if (stickyNav) {
  let lastScrollY = 0;
  let navHidden = false;

  if (!hasHero) {
    stickyNav.classList.add('visible');
  }

  function updateStickyNav() {
    const currentY = window.scrollY;

    if (!hasHero) {
      if (currentY > lastScrollY && currentY > 120) {
        stickyNav.classList.add('nav-hidden');
        stickyNav.classList.remove('visible');
        navHidden = true;
      } else if (currentY < lastScrollY && navHidden) {
        stickyNav.classList.remove('nav-hidden');
        stickyNav.classList.add('visible');
        navHidden = false;
      }
    } else {
      if (currentY < cachedHeroHeight) {
        stickyNav.classList.remove('visible', 'nav-hidden');
      } else if (currentY > lastScrollY && currentY > 120) {
        stickyNav.classList.add('nav-hidden');
        stickyNav.classList.remove('visible');
        navHidden = true;
      } else if (currentY < lastScrollY && navHidden) {
        stickyNav.classList.remove('nav-hidden');
        stickyNav.classList.add('visible');
        navHidden = false;
      } else if (!navHidden && currentY >= cachedHeroHeight) {
        stickyNav.classList.add('visible');
      }
    }

    lastScrollY = currentY;
  }

  window.addEventListener('scroll', updateStickyNav, { passive: true });
  window.addEventListener('resize', () => {
    cachedHeroHeight = window.innerHeight * 0.6;
  });
  updateStickyNav();
}

/* ══════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════ */
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobilePanel = document.getElementById('mobile-menu-panel');
const mobileClose = document.getElementById('mobile-menu-close');

function openMobileMenu() {
  if (mobilePanel) mobilePanel.classList.add('open');
  if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'true');
}
function closeMobileMenu() {
  if (mobilePanel) mobilePanel.classList.remove('open');
  if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
}
if (mobileBtn) mobileBtn.addEventListener('click', openMobileMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
if (mobilePanel) {
  mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
}

/* ══════════════════════════════════════════════
   AUDIO TOGGLE
══════════════════════════════════════════════ */
const bgAudio = document.getElementById('bgAudio');
const audioToggle = document.getElementById('audio-toggle');
let audioOn = false;
if (audioToggle && bgAudio) {
  audioToggle.addEventListener('click', () => {
    if (audioOn) {
      bgAudio.pause();
      audioOn = false;
    } else {
      bgAudio.volume = 0.2;
      bgAudio.play().catch(() => {});
      audioOn = true;
    }
    audioToggle.setAttribute('aria-pressed', String(audioOn));
    audioToggle.style.opacity = audioOn ? '1' : '.55';
  });
  audioToggle.style.opacity = '.55';
}

/* ══════════════════════════════════════════════
   ENTER SITE (index.html only)
══════════════════════════════════════════════ */
const splash = document.getElementById('splash');
const mainContent = document.getElementById('main-content');

function titansHasEntered() {
  try { return localStorage.getItem('titans_entered') === '1'; } catch (e) { return false; }
}
function titansMarkEntered() {
  try { localStorage.setItem('titans_entered', '1'); } catch (e) {}
}

if (splash && mainContent && bgAudio) {
  if (titansHasEntered()) {
    // Returning visitor — skip the splash, reveal content immediately
    splash.style.display = 'none';
    mainContent.style.display = 'block';
    mainContent.style.opacity = '1';
    window.scrollTo(0, 0);
    if (stickyNav) stickyNav.classList.add('visible');
    setTimeout(initReveal, 100);
  } else {
    const btnEnter = document.querySelector('.btn-enter');
    if (btnEnter) {
      btnEnter.addEventListener('click', () => {
        titansMarkEntered();
        bgAudio.volume = 0.2;
        bgAudio.play().then(() => {
          audioOn = true;
          if (audioToggle) {
            audioToggle.setAttribute('aria-pressed', 'true');
            audioToggle.style.opacity = '1';
          }
        }).catch(() => {});

        splash.style.opacity = '0';
        splash.style.transform = 'scale(1.04)';

        setTimeout(() => {
          splash.style.display = 'none';
          splash.style.transform = '';
          mainContent.style.display = 'block';
          mainContent.style.opacity = '0';

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              mainContent.style.opacity = '1';
              window.scrollTo(0, 0);
              if (stickyNav) stickyNav.classList.add('visible');
              setTimeout(initReveal, 150);
            });
          });
        }, 600);
      });
    }
  }
} else if (mainContent) {
  mainContent.style.display = 'block';
  mainContent.style.opacity = '1';
  setTimeout(initReveal, 100);
}

/* ══════════════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════════════ */
const PHRASES = ['AUTHENTIC · DOMINANT · ELITE', 'VENI · VIDI · VICI', 'EVENTS · CULTURE · COMMUNITY', 'RISE · BUILD · CONQUER', 'FORTITUDO ET HONOR'];
let phraseIdx = 0, charIdx = 0, deleting = false;
const taglineEl = document.getElementById('hero-tagline');

function typewriter() {
  if (!taglineEl) return;
  const cur = PHRASES[phraseIdx];
  if (!deleting) {
    taglineEl.textContent = cur.slice(0, ++charIdx);
    if (charIdx === cur.length) { deleting = true; setTimeout(typewriter, 2200); return; }
  } else {
    taglineEl.textContent = cur.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % PHRASES.length; }
  }
  setTimeout(typewriter, deleting ? 35 : 70);
}
setTimeout(typewriter, 900);

/* ══════════════════════════════════════════════
   HERO PARTICLES
══════════════════════════════════════════════ */
(function spawnParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left:${Math.random()*100}%;
      bottom:${Math.random()*30}%;
      animation-duration:${6 + Math.random()*10}s;
      animation-delay:${Math.random()*8}s;
      width:${Math.random()>.5?2:3}px;
      height:${Math.random()>.5?2:3}px;
    `;
    container.appendChild(p);
  }
})();

/* ══════════════════════════════════════════════
   HERO PARALLAX (desktop only)
══════════════════════════════════════════════ */
const heroLogo = document.getElementById('hero-logo');
const heroH1 = document.querySelector('.hero h1');
if (window.innerWidth >= 769) {
  document.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    if (heroLogo) heroLogo.style.transform = `translate(${cx*10}px,${cy*8}px)`;
    if (heroH1) heroH1.style.transform = `translate(${cx*5}px,${cy*4}px)`;
  });
}

/* ══════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════ */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

const xpObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.xp-fill').forEach(bar => bar.classList.add('on'));
      xpObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.35 });
const xpSection = document.getElementById('experience');
if (xpSection) xpObserver.observe(xpSection);

/* ══════════════════════════════════════════════
   STAT COUNTERS
══════════════════════════════════════════════ */
function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '+';
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 2000, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  });
}
const statsObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); statsObs.disconnect(); } });
}, { threshold: 0.3 });
const statsGrid = document.querySelector('.stats-grid');
if (statsGrid) statsObs.observe(statsGrid);

/* ══════════════════════════════════════════════
   CARD 3D TILT
══════════════════════════════════════════════ */
document.querySelectorAll('.value-card').forEach(card => {
  if (window.innerWidth < 769) return;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-10px) rotateX(${-y*10}deg) rotateY(${x*10}deg)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

/* ══════════════════════════════════════════════
   SHOWCASE CAROUSEL
══════════════════════════════════════════════ */
const showcaseTrack = document.getElementById('showcase-track');
const showcasePrev = document.getElementById('showcase-prev');
const showcaseNext = document.getElementById('showcase-next');
const showcaseDots = Array.from(document.querySelectorAll('#showcase-dots .showcase-dot'));
let showcaseIndex = 0;
let showcaseTimer = null;

function renderShowcase() {
  if (!showcaseTrack) return;
  showcaseTrack.style.transform = `translateX(-${showcaseIndex * 100}%)`;
  showcaseDots.forEach((dot, idx) => dot.classList.toggle('active', idx === showcaseIndex));
}
function stepShowcase(direction = 1) {
  const total = showcaseDots.length || 1;
  showcaseIndex = (showcaseIndex + direction + total) % total;
  renderShowcase();
}
function startShowcaseAuto() {
  if (showcaseTimer) clearInterval(showcaseTimer);
  showcaseTimer = setInterval(() => stepShowcase(1), 5000);
}
if (showcaseTrack && showcasePrev && showcaseNext && showcaseDots.length) {
  showcasePrev.addEventListener('click', () => { stepShowcase(-1); startShowcaseAuto(); });
  showcaseNext.addEventListener('click', () => { stepShowcase(1); startShowcaseAuto(); });
  showcaseDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showcaseIndex = idx;
      renderShowcase();
      startShowcaseAuto();
    });
  });
  renderShowcase();
  startShowcaseAuto();
}

/* ══════════════════════════════════════════════
   FORM SUBMISSION
══════════════════════════════════════════════ */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxRQMlK5QJtM7vckOdi7Cz_DQKN9O4uLqzdW9VlLWvNC-p_qVe9j6R9B4Vbc_2AV7w/exec';
const recruitForm = document.getElementById('recruit-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('success-msg');
const formError = document.getElementById('form-error');

if (recruitForm && submitBtn && successMsg && formError) {
  const formLoadTime = Date.now();

  function showError(msg) {
    formError.textContent = msg;
    formError.style.display = 'block';
  }

  recruitForm.addEventListener('submit', e => {
    e.preventDefault();
    formError.style.display = 'none';

    const hp = recruitForm.querySelector('#website');
    if (hp && hp.value.trim() !== '') {
      return;
    }

    if (Date.now() - formLoadTime < 2000) {
      showError('PLEASE TAKE A MOMENT TO REVIEW YOUR APPLICATION BEFORE SUBMITTING.');
      return;
    }

    if (!recruitForm.checkValidity()) {
      recruitForm.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'TRANSMITTING...';

    fetch(SHEET_URL, { method: 'POST', body: new FormData(recruitForm) })
      .then(() => {
        recruitForm.style.display = 'none';
        successMsg.style.display = 'block';
        successMsg.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(err => {
        console.error('Submission error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'RETRY SUBMISSION';
        showError('SUBMISSION FAILED. PLEASE CHECK YOUR CONNECTION AND TRY AGAIN.');
      });
  });
}

/* ══════════════════════════════════════════════
   CURSOR GLOW TRAIL (desktop only)
══════════════════════════════════════════════ */
if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = 'position:fixed;width:300px;height:300px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(192,0,26,.06),transparent 60%);transition:transform .15s ease-out,opacity .3s;opacity:0;transform:translate(-50%,-50%);';
  document.body.appendChild(glow);
  let glowX = 0, glowY = 0;
  document.addEventListener('mousemove', e => {
    glowX = e.clientX; glowY = e.clientY;
    glow.style.opacity = '1';
    glow.style.transform = `translate(${glowX - 150}px,${glowY - 150}px)`;
  }, { passive: true });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

/* ══════════════════════════════════════════════
   MAGNETIC BUTTONS (desktop only)
══════════════════════════════════════════════ */
if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
  document.querySelectorAll('.btn-enter, .btn-merch, .btn-submit, .nav-apply, .showcase-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ══════════════════════════════════════════════
   SWIPE GESTURE SUPPORT (showcase carousel)
══════════════════════════════════════════════ */
(function addSwipe() {
  const track = document.getElementById('showcase-track');
  if (!track) return;
  let startX = 0, isDragging = false;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { stepShowcase(diff > 0 ? 1 : -1); startShowcaseAuto(); }
    isDragging = false;
  }, { passive: true });
})();

/* ══════════════════════════════════════════════
   BACK TO TOP & FLOATING APPLY
══════════════════════════════════════════════ */
const backToTop = document.getElementById('back-to-top');
const floatingApply = document.getElementById('floating-apply');
let applySection = null;
let applyTop = 0;
let applyHeight = 0;
let heroHeight = window.innerHeight;

function cacheApplySection() {
  applySection = document.getElementById('apply');
  if (applySection) {
    applyTop = applySection.offsetTop - heroHeight;
    applyHeight = applySection.offsetHeight;
  }
}

function updateFloatingButtons() {
  const scrollY = window.scrollY;

  if (backToTop) {
    backToTop.classList.toggle('visible', scrollY > heroHeight);
  }
  if (floatingApply && applySection) {
    floatingApply.classList.toggle('visible', scrollY > applyTop && scrollY < applyTop + applyHeight);
  }
}

if (backToTop) {
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

window.addEventListener('scroll', updateFloatingButtons, { passive: true });
window.addEventListener('resize', () => {
  heroHeight = window.innerHeight;
  cacheApplySection();
});

cacheApplySection();
updateFloatingButtons();
