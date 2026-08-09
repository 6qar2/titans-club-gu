/* ══════════════════════════════════════════════
   ARENA MAP NAVIGATION
══════════════════════════════════════════════ */
function initArenaMap() {
  const gates = document.querySelectorAll('.arena-gate');

  gates.forEach(gate => {
    const particleContainer = gate.querySelector('.gate-particles');
    const link = gate.querySelector('a');

    if (!particleContainer || !link) return;

    const particles = [];
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'gate-particle';
      particle.style.cssText = `
        left:${20 + Math.random() * 60}%;
        bottom:${10 + Math.random() * 30}%;
        animation-delay:${Math.random() * 2}s;
        animation-duration:${1.5 + Math.random() * 1.5}s;
        --drift-x:${-20 + Math.random() * 40}px;
      `;
      particleContainer.appendChild(particle);
      particles.push(particle);
    }

    gate.addEventListener('mouseenter', () => {
      particles.forEach(p => p.style.animationPlayState = 'running');
    });

    gate.addEventListener('mouseleave', () => {
      particles.forEach(p => p.style.animationPlayState = 'paused');
    });

    gate.addEventListener('touchstart', () => {
      particles.forEach(p => p.style.animationPlayState = 'running');
    }, { passive: true });

    gate.addEventListener('touchend', () => {
      setTimeout(() => {
        particles.forEach(p => p.style.animationPlayState = 'paused');
      }, 2000);
    });

    gate.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const isExternal = href && (href.startsWith('http://') || href.startsWith('https://') || link.target === '_blank');

      if (isExternal) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3);
          oscillator.type = 'sawtooth';
          gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.4);
        } catch (err) {
          console.log('Audio not supported');
        }
        return;
      }

      e.preventDefault();
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.4);
      } catch (err) {
        console.log('Audio not supported');
      }

      gate.style.transition = 'all 0.4s ease';
      gate.style.transform = 'scale(0.95)';
      gate.style.opacity = '0';

      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArenaMap);
} else {
  initArenaMap();
}
