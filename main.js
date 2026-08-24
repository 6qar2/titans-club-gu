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
    const isMobile = window.innerWidth < 769;
    const hideThreshold = isMobile ? 300 : 120;

    if (!hasHero) {
      if (currentY > lastScrollY && currentY > hideThreshold) {
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
      } else if (currentY > lastScrollY && currentY > hideThreshold) {
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
   HERO PARALLAX
══════════════════════════════════════════════ */
const hero = document.querySelector('.hero');
if (hero && window.innerWidth >= 769) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroH = hero.offsetHeight;
    if (scrollY < heroH) {
      const parallax = scrollY * 0.15;
      hero.style.transform = `translateY(${parallax}px)`;
      const particles = document.getElementById('hero-particles');
      if (particles) particles.style.transform = `translateY(${parallax * 0.5}px)`;
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════ */
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobilePanel = document.getElementById('mobile-menu-panel');
const mobileClose = document.getElementById('mobile-menu-close');
let backdropTimeout = null;

function openMobileMenu() {
  if (backdropTimeout) { clearTimeout(backdropTimeout); backdropTimeout = null; }
  if (mobilePanel) mobilePanel.classList.add('open');
  if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'true');
  const backdrop = document.querySelector('.mobile-menu-backdrop');
  if (!backdrop && mobilePanel) {
    const bd = document.createElement('div');
    bd.className = 'mobile-menu-backdrop';
    bd.addEventListener('click', closeMobileMenu);
    document.body.appendChild(bd);
    requestAnimationFrame(() => bd.classList.add('open'));
  } else if (backdrop) {
    backdrop.classList.add('open');
  }
  mobilePanel._lastFocus = document.activeElement;
  const firstLink = mobilePanel ? mobilePanel.querySelector('a') : null;
  if (firstLink) setTimeout(() => firstLink.focus(), 50);
}
function closeMobileMenu() {
  if (mobilePanel) mobilePanel.classList.remove('open');
  if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
  const backdrop = document.querySelector('.mobile-menu-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    backdropTimeout = setTimeout(() => { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); backdropTimeout = null; }, 300);
  }
  if (mobilePanel && mobilePanel._lastFocus) {
    setTimeout(() => mobilePanel._lastFocus.focus(), 50);
  }
}
function trapFocus(e) {
  if (!mobilePanel || !mobilePanel.classList.contains('open')) return;
  if (e.key === 'Escape') { closeMobileMenu(); return; }
  if (e.key !== 'Tab') return;
  const focusable = mobilePanel.querySelectorAll('a, button, [tabindex]');
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
if (mobileBtn) mobileBtn.addEventListener('click', openMobileMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
if (mobilePanel) {
  mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
  mobilePanel.addEventListener('keydown', trapFocus);
  const currentPath = window.location.pathname;
  mobilePanel.querySelectorAll('a[href^="/"]').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

/* ══════════════════════════════════════════════
   BACKGROUND AUDIO (persists across pages)
══════════════════════════════════════════════ */
const bgAudio = document.getElementById('bgAudio');
const audioToggle = document.getElementById('audio-toggle');
let splash = document.getElementById('splash');
const mainContent = document.getElementById('main-content');
let audioOn = false;

function audioStoreGet(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
function audioStoreSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function syncAudioToggle() {
  if (!audioToggle) return;
  audioToggle.setAttribute('aria-pressed', String(audioOn));
  audioToggle.style.opacity = audioOn ? '1' : '.55';
}

function audioResume() {
  if (!bgAudio) return;
  bgAudio.volume = parseFloat(audioStoreGet('titans_club_audio_vol', '0.2')) || 0.2;
  const t = parseFloat(audioStoreGet('titans_club_audio_time', '0'));
  const seek = () => {
    if (!isNaN(t) && t > 0 && t < (bgAudio.duration || 1e9) - 1) {
      try { bgAudio.currentTime = t; } catch (e) {}
    }
  };
  bgAudio.load();
  if (bgAudio.readyState >= 1) seek();
  else bgAudio.addEventListener('loadedmetadata', seek, { once: true });
  const tryPlay = () => {
    bgAudio.play().then(() => { audioOn = true; syncAudioToggle(); }).catch(() => {
      bgAudio.addEventListener('canplay', () => {
        bgAudio.play().then(() => { audioOn = true; syncAudioToggle(); }).catch(() => {});
      }, { once: true });
    });
  };
  tryPlay();
}

if (audioToggle && bgAudio) {
  audioOn = audioStoreGet('titans_club_audio_on', '0') === '1';
  syncAudioToggle();

  audioToggle.addEventListener('click', () => {
    if (audioOn) {
      bgAudio.pause();
      audioOn = false;
      audioStoreSet('titans_club_audio_on', '0');
    } else {
      bgAudio.volume = parseFloat(audioStoreGet('titans_club_audio_vol', '0.2')) || 0.2;
      bgAudio.load();
      bgAudio.play().then(() => {}).catch(() => {
        bgAudio.addEventListener('canplay', () => {
          bgAudio.play().then(() => {}).catch(() => {});
        }, { once: true });
      });
      audioOn = true;
      audioStoreSet('titans_club_audio_on', '1');
    }
    syncAudioToggle();
  });

  // Resume after navigation: autoplay is blocked on a fresh document,
  // so continue on the visitor's first gesture (tap/scroll/key).
  if (audioStoreGet('titans_club_audio_on', '0') === '1') {
    const resumeOnce = () => {
      if (audioStoreGet('titans_club_audio_on', '0') === '1') audioResume();
    };
    document.addEventListener('pointerdown', resumeOnce, { once: true, capture: true });
    document.addEventListener('touchstart', resumeOnce, { once: true, capture: true });
    document.addEventListener('keydown', resumeOnce, { once: true, capture: true });
    audioResume();
  }

  let lastSave = 0;
  bgAudio.addEventListener('timeupdate', () => {
    if (bgAudio.paused) return;
    const now = Date.now();
    if (now - lastSave > 4000) {
      audioStoreSet('titans_club_audio_time', String(bgAudio.currentTime));
      lastSave = now;
    }
  });
  bgAudio.addEventListener('pause', () => audioStoreSet('titans_club_audio_on', '0'));
  bgAudio.addEventListener('play', () => { audioOn = true; audioStoreSet('titans_club_audio_on', '1'); syncAudioToggle(); });
}

/* ══════════════════════════════════════════════
   SCROLL-TRIGGERED PROGRESS BARS (event page)
══════════════════════════════════════════════ */
const xpFills = document.querySelectorAll('.xp-fill');
const xpObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('on');
      xpObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
xpFills.forEach(fill => xpObserver.observe(fill));

window.addEventListener('pagehide', () => {
  if (bgAudio) {
    audioStoreSet('titans_club_audio_time', String(bgAudio.currentTime));
    audioStoreSet('titans_club_audio_on', bgAudio.paused ? '0' : '1');
  }
  [xpObserver, sectionObserver, revealObserver, xpSectionObserver, statsObs].forEach(obs => { if (obs) obs.disconnect(); });
  if (showcaseTimer) clearInterval(showcaseTimer);
});

/* ══════════════════════════════════════════════
    BACK TO TOP & FLOATING BUTTONS
══════════════════════════════════════════════ */
const backToTop = document.getElementById('back-to-top');
const floatingJoin = document.getElementById('floating-join');
const homeBtn = document.getElementById('home-btn');
if (homeBtn) {
  homeBtn.addEventListener('click', (e) => {
    try {
      localStorage.setItem('titans_club_entered', '1');
      localStorage.setItem('titans_club_audio_on', '1');
    } catch (e) {}
  });
}
let applySection = null;
let applyTop = 0;
let applyHeight = 0;
let heroHeight = window.innerHeight;
const isApplyPage = document.getElementById('recruit-form');
const isPartnersPage = document.getElementById('partner-inquiry');
const isHomePage = !homeBtn;

function updateFloatingButtons() {
  const scrollY = window.scrollY;

  if (backToTop) {
    backToTop.classList.toggle('visible', scrollY > heroHeight);
  }
  if (floatingJoin && !isApplyPage) {
    const shouldShow = scrollY > heroHeight && (!splash || splash.style.display === 'none');
    floatingJoin.classList.toggle('visible', shouldShow);
    if (shouldShow) {
      if (isPartnersPage) {
        floatingJoin.querySelector('.join-text').textContent = 'PARTNER WITH US';
        floatingJoin.setAttribute('aria-label', 'Partner with the Titans');
        floatingJoin.href = '#partner-inquiry';
        floatingJoin.classList.add('partner-cta');
      } else {
        floatingJoin.querySelector('.join-text').textContent = 'JOIN US';
        floatingJoin.setAttribute('aria-label', 'Join the Titans');
        floatingJoin.href = '/apply';
        floatingJoin.classList.remove('partner-cta');
      }
    }
  }
  if (homeBtn && !isHomePage) {
    homeBtn.classList.toggle('visible', scrollY > heroHeight);
  }
}

if (backToTop) {
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
const scrollHint = document.getElementById('scroll-hint');
if (scrollHint) {
  scrollHint.addEventListener('click', () => {
    const arena = document.querySelector('.arena-map');
    if (arena) arena.scrollIntoView({ behavior: 'smooth' });
  });
}

window.addEventListener('scroll', updateFloatingButtons, { passive: true });
window.addEventListener('resize', () => {
  heroHeight = window.innerHeight;
});

updateFloatingButtons();

/* ══════════════════════════════════════════════
    ENTER SITE (index.html only)
══════════════════════════════════════════════ */
function titansHasEntered() {
  try { return localStorage.getItem('titans_club_entered') === '1'; } catch (e) { return false; }
}
function titansMarkEntered() {
  try { localStorage.setItem('titans_club_entered', '1'); } catch (e) {}
}

function enterSite() {
  try {
    titansMarkEntered();
    audioStoreSet('titans_club_audio_on', '1');
    if (bgAudio) { bgAudio.volume = 0.2; bgAudio.load(); }
    const tryPlay = () => {
      if (!bgAudio) return;
      bgAudio.play().then(() => {
        audioOn = true;
        if (audioToggle) { audioToggle.setAttribute('aria-pressed', 'true'); audioToggle.style.opacity = '1'; }
      }).catch(() => {
        if (!bgAudio) return;
        bgAudio.addEventListener('canplay', () => {
          bgAudio.play().then(() => {
            audioOn = true;
            if (audioToggle) { audioToggle.setAttribute('aria-pressed', 'true'); audioToggle.style.opacity = '1'; }
          }).catch(() => {});
        }, { once: true });
      });
    };
    tryPlay();

    if (splash && splash.parentNode) {
      const cloned = splash.cloneNode(true);
      splash.parentNode.replaceChild(cloned, splash);
      splash = cloned;
    }

    splash.style.transition = 'transform .15s ease, opacity .4s ease .2s';
    splash.style.transform = 'scale(1.02)';
    setTimeout(() => {
      splash.style.transition = 'transform .2s ease, opacity .3s ease';
      splash.style.transform = 'scale(1) translateY(-20px)';
      splash.style.opacity = '0';
    }, 150);
    setTimeout(() => {
      splash.style.display = 'none';
      splash.style.transform = '';
      if (mainContent) {
        mainContent.style.display = 'block';
        mainContent.style.opacity = '0';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            mainContent.style.opacity = '1';
            window.scrollTo(0, 0);
            if (stickyNav) stickyNav.classList.add('visible');
            updateFloatingButtons();
            setTimeout(initReveal, 150);
          });
        });
      }
    }, 600);
  } catch (err) {
    console.error('enterSite error:', err);
    const s = document.getElementById('splash');
    const m = document.getElementById('main-content');
    if (s) s.style.display = 'none';
    if (m) { m.style.display = 'block'; m.style.opacity = '1'; }
  }
}
window.enterSite = enterSite;

function initSplash() {
  const isMobile = window.innerWidth < 769;

  // Create splash particles (fewer on mobile)
  const splashParticles = document.getElementById('splash-particles');
  if (splashParticles) {
    const particleCount = isMobile ? 0 : 30;
    for (let i = 0; i < particleCount; i++) {
      try {
        const p = document.createElement('div');
        p.className = 'splash-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 6 + 's';
        p.style.animationDuration = (4 + Math.random() * 4) + 's';
        splashParticles.appendChild(p);
      } catch (e) { /* skip particle */ }
    }
  }

  // Typewriter effect (desktop only, safer implementation)
  if (!isMobile) {
    const splashTitle = document.getElementById('splash-title');
    if (splashTitle) {
      try {
        const text = splashTitle.innerHTML;
        splashTitle.innerHTML = '';
        splashTitle.style.opacity = '1';
        let charIdx = 0;
        const typeInterval = setInterval(() => {
          if (charIdx < text.length) {
            if (text[charIdx] === '<') {
              const closeIdx = text.indexOf('>', charIdx);
              if (closeIdx === -1) {
                splashTitle.innerHTML += text[charIdx];
                charIdx++;
              } else {
                splashTitle.innerHTML += text.substring(charIdx, closeIdx + 1);
                charIdx = closeIdx + 1;
              }
            } else {
              splashTitle.innerHTML += text[charIdx];
              charIdx++;
            }
          } else {
            clearInterval(typeInterval);
          }
        }, 40);
      } catch (e) {
        console.warn('Typewriter skipped:', e);
      }
    }
  }

  // Always show splash; only the button dismisses it
  splash.style.display = 'flex';
  mainContent.style.display = 'none';
  mainContent.style.opacity = '0';

  const handleSplashClick = (e) => {
    const target = e.target;
    if (target.closest('.btn-enter') || target === splash || splash.contains(target)) {
      e.preventDefault();
      e.stopPropagation();
      try { enterSite(); } catch (err) { console.error('Enter site error:', err); }
    }
  };
  splash.addEventListener('click', handleSplashClick, { once: false });
}

// Splash screen initialization with error boundary
if (splash && mainContent && bgAudio) {
  try {
    initSplash();
  } catch (splashError) {
    console.error('Splash init failed, bypassing splash:', splashError);
    splash.style.display = 'none';
    mainContent.style.display = 'block';
    mainContent.style.opacity = '1';
    if (stickyNav) stickyNav.classList.add('visible');
    if (floatingJoin) floatingJoin.classList.add('visible');
    if (homeBtn) homeBtn.classList.add('visible');
    setTimeout(initReveal, 100);
  }
} else if (mainContent) {
  mainContent.style.display = 'block';
  mainContent.style.opacity = '1';
  setTimeout(initReveal, 100);
}

/* Resume audio on any page if it was previously enabled */
if (audioStoreGet('titans_club_audio_on', '0') === '1' && bgAudio && !audioOn) {
  audioResume();
}

/* ══════════════════════════════════════════════
    PAGE TRANSITIONS
══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="/"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '/' || href.startsWith('//')) return;
    e.preventDefault();
    if (mainContent) {
      const loader = document.createElement('div');
      loader.className = 'page-loader';
      loader.innerHTML = '<div class="page-loader-bar"></div>';
      document.body.appendChild(loader);
      mainContent.style.transition = 'opacity .15s ease';
      mainContent.style.opacity = '0';
      setTimeout(() => {
        window.location.href = href;
      }, 150);
    } else {
      window.location.href = href;
    }
  });
});

/* ══════════════════════════════════════════════
    SINGLE-STEP APPLICATION FORM
══════════════════════════════════════════════ */
(function initApplyForm() {
  const form = document.getElementById('recruit-form');
  if (!form) return;

  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxRQMlK5QJtM7vckOdi7Cz_DQKN9O4uLqzdW9VlLWvNC-p_qVe9j6R9B4Vbc_2AV7w/exec';
  const STORAGE_KEY = 'titans_club_apply_draft';
  const fields = ['name', 'id', 'major', 'email', 'whatsapp', 'committee', 'referral', 'why'];

  function saveDraft() {
    try {
      const data = {};
      fields.forEach(id => {
        const el = form.querySelector(`[name="${id}"]`);
        if (el) data[id] = el.value;
      });
      const commitment = form.querySelector('#commitment');
      if (commitment) data.commitment = commitment.checked;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      fields.forEach(id => {
        const el = form.querySelector(`[name="${id}"]`);
        if (el && data[id]) el.value = data[id];
      });
      const commitment = form.querySelector('#commitment');
      if (commitment && data.commitment) commitment.checked = true;
    } catch (e) { /* ignore */ }
  }

  function clearDraft() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  loadDraft();

  fields.forEach(id => {
    const el = form.querySelector(`[name="${id}"]`);
    if (el) el.addEventListener('input', saveDraft);
  });

  const commitment = form.querySelector('#commitment');
  if (commitment) commitment.addEventListener('change', saveDraft);

  function showError(msg) {
    const formError = document.getElementById('form-error');
    if (formError) {
      formError.textContent = msg;
      formError.style.display = 'block';
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const formError = document.getElementById('form-error');
    if (formError) { formError.style.display = 'none'; formError.textContent = ''; }

    const hp = form.querySelector('#website');
    if (hp && hp.value.trim() !== '') return;

    let valid = true;
    let patternMsg = '';

    const requiredInputs = form.querySelectorAll('input[required]:not(#website):not(#commitment), select[required], textarea[required]');
    requiredInputs.forEach(input => {
      input.setAttribute('aria-invalid', 'false');
      const val = input.value.trim();
      if (!val) {
        valid = false;
        input.style.borderColor = 'var(--red)';
        input.setAttribute('aria-invalid', 'true');
        setTimeout(() => { input.style.borderColor = ''; input.setAttribute('aria-invalid', 'false'); }, 1500);
      }
    });

    const emailInput = form.querySelector('#email');
    if (emailInput && emailInput.value.trim()) {
      emailInput.setAttribute('aria-invalid', 'false');
      if (!/^[^\s@]+@gu\.edu\.eg$/i.test(emailInput.value.trim())) {
        valid = false;
        patternMsg = 'PLEASE USE YOUR @gu.edu.eg STUDENT EMAIL.';
        emailInput.style.borderColor = 'var(--red)';
        emailInput.setAttribute('aria-invalid', 'true');
        setTimeout(() => { emailInput.style.borderColor = ''; emailInput.setAttribute('aria-invalid', 'false'); }, 1500);
      }
    }

    const whatsappInput = form.querySelector('#whatsapp');
    if (whatsappInput && whatsappInput.value.trim()) {
      whatsappInput.setAttribute('aria-invalid', 'false');
      const pattern = whatsappInput.pattern || whatsappInput.getAttribute('pattern');
      if (pattern && !new RegExp('^' + pattern + '$').test(whatsappInput.value.trim())) {
        valid = false;
        patternMsg = 'WHATSAPP NUMBER MUST BE 8–15 DIGITS, OPTIONAL LEADING +.';
        whatsappInput.style.borderColor = 'var(--red)';
        whatsappInput.setAttribute('aria-invalid', 'true');
        setTimeout(() => { whatsappInput.style.borderColor = ''; whatsappInput.setAttribute('aria-invalid', 'false'); }, 1500);
      }
    }

    if (commitment && !commitment.checked) {
      valid = false;
      commitment.parentElement.style.outline = '1px solid var(--red)';
      setTimeout(() => { commitment.parentElement.style.outline = ''; }, 1500);
    }

    if (!valid) {
      if (formError) showError(patternMsg || 'PLEASE FILL ALL REQUIRED FIELDS BEFORE SUBMITTING.');
      return;
    }

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'TRANSMITTING...';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const params = new URLSearchParams();
    params.set('name', form.querySelector('#name')?.value || '');
    params.set('id', form.querySelector('#id')?.value || '');
    params.set('major', form.querySelector('#major')?.value || '');
    params.set('email', form.querySelector('#email')?.value || '');
    params.set('whatsapp', form.querySelector('#whatsapp')?.value || '');
    params.set('committee', form.querySelector('#committee')?.value || '');
    params.set('referral', form.querySelector('#referral')?.value || '');
    params.set('why', form.querySelector('#why')?.value || '');
    params.set('commitment', form.querySelector('#commitment')?.checked ? 'Yes' : 'No');

    fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeout);
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response;
      })
      .then(() => {
        clearDraft();
        form.style.display = 'none';
        const successMsg = document.getElementById('success-msg');
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth' });
        }
      })
      .catch(err => {
        clearTimeout(timeout);
        console.error('Submission error:', err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'RETRY SUBMISSION';
        }
        const msg = err.name === 'AbortError' ? 'REQUEST TIMED OUT. PLEASE TRY AGAIN.' : 'SUBMISSION FAILED. PLEASE CHECK YOUR CONNECTION AND TRY AGAIN.';
        if (formError) showError(msg);
      });
  });
})();

/* ══════════════════════════════════════════════
    COUNTDOWN TIMER
══════════════════════════════════════════════ */
(function initCountdown() {
  const targetDate = new Date('2026-09-01T00:00:00').getTime();
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');
  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function update() {
    const now = Date.now();
    const diff = Math.max(0, targetDate - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }
  update();
  const countdownInterval = setInterval(update, 1000);

  window.addEventListener('pagehide', () => { clearInterval(countdownInterval); });
})();

/* ══════════════════════════════════════════════
    TREE CARD TILT EFFECT
══════════════════════════════════════════════ */
document.querySelectorAll('.tree-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ══════════════════════════════════════════════
    SECTION TRANSITIONS
══════════════════════════════════════════════ */
const sectionTransitions = document.querySelectorAll('.section-transition');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('on');
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
sectionTransitions.forEach(st => sectionObserver.observe(st));

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
let revealInitialized = false;
let revealObserver = null;
function initReveal() {
  if (revealInitialized) return;
  revealInitialized = true;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));
}

const xpSection = document.getElementById('experience');
let xpSectionObserver = null;
if (xpSection) {
  xpSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.xp-fill').forEach(bar => bar.classList.add('on'));
        xpSectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  xpSectionObserver.observe(xpSection);
}

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
    PARTNERSHIP INQUIRY FORM
══════════════════════════════════════════════ */
(function initPartnerForm() {
  const form = document.getElementById('partner-form');
  if (!form) return;

  const submitBtn = form.querySelector('.btn-partner-submit');
  const successMsg = document.getElementById('partner-success-msg');
  const formError = document.getElementById('partner-form-error');

  function showError(msg) {
    if (formError) {
      formError.textContent = msg;
      formError.style.display = 'block';
    }
  }

  const iframe = document.getElementById('partner-form-iframe');

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'SENDING...';
    }
    if (formError) { formError.style.display = 'none'; formError.textContent = ''; }

    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let valid = true;
    requiredInputs.forEach(input => {
      input.setAttribute('aria-invalid', 'false');
      const val = input.value.trim();
      if (!val) {
        valid = false;
        input.style.borderColor = 'var(--red)';
        input.setAttribute('aria-invalid', 'true');
        setTimeout(() => { input.style.borderColor = ''; input.setAttribute('aria-invalid', 'false'); }, 1500);
      }
    });

    const phoneInput = form.querySelector('#partner-phone');
    if (phoneInput && phoneInput.value.trim()) {
      phoneInput.setAttribute('aria-invalid', 'false');
      const pattern = phoneInput.pattern || phoneInput.getAttribute('pattern');
      if (pattern && !new RegExp('^' + pattern + '$').test(phoneInput.value.trim())) {
        valid = false;
        showError('PHONE NUMBER MUST BE 8–15 DIGITS, OPTIONAL LEADING +.');
        phoneInput.style.borderColor = 'var(--red)';
        phoneInput.setAttribute('aria-invalid', 'true');
        setTimeout(() => { phoneInput.style.borderColor = ''; phoneInput.setAttribute('aria-invalid', 'false'); }, 1500);
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'SEND INQUIRY'; }
        return;
      }
    }

    if (!valid) {
      showError('PLEASE FILL ALL REQUIRED FIELDS BEFORE SUBMITTING.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'SEND INQUIRY'; }
      return;
    }

    if (iframe) {
      iframe.addEventListener('load', () => {
        form.style.display = 'none';
        if (successMsg) { successMsg.style.display = 'block'; successMsg.scrollIntoView({ behavior: 'smooth' }); }
      }, { once: true });
    }

    form.submit();
  });
})();

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


/* ----------------------------------------------
    NEWS ARTICLE EXPAND
---------------------------------------------- */
document.querySelectorAll('.news-read-more').forEach(btn => {
  btn.addEventListener('click', () => {
    const article = btn.closest('.news-article');
    if (!article) return;
    const isExpanded = article.classList.contains('expanded');
    if (isExpanded) {
      article.classList.remove('expanded');
      btn.textContent = 'READ MORE';
    } else {
      article.classList.add('expanded');
      btn.textContent = 'COLLAPSE';
      article.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ══════════════════════════════════════════════
   START.IO AD INTEGRATION
   ⚠️ REPLACE '207691742' WITH YOUR ACTUAL APP ID
══════════════════════════════════════════════ */
(function initStartIOAds() {
  const STARTIO_APP_ID = '207691742';

  function loadStartIO() {
    if (!STARTIO_APP_ID || STARTIO_APP_ID === 'YOUR_STARTIO_APP_ID_HERE') {
      console.warn('Start.io App ID not configured. Edit main.js to set your App ID.');
      return;
    }

    const adContainer = document.getElementById('startio-ad-container');
    if (!adContainer) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.start.io/js/sdk.js';
    script.async = true;
    script.onload = function() {
      if (window.startIO) {
        window.startIO.push(['setAppId', STARTIO_APP_ID]);
        window.startIO.push(['init']);
      }
    };
    script.onerror = function() {
      console.warn('Failed to load Start.io SDK');
    };
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStartIO);
  } else {
    loadStartIO();
  }
})();