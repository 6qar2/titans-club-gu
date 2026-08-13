/* ══════════════════════════════════════════════
   ARENA MAP NAVIGATION
══════════════════════════════════════════════ */
function initArenaMap() {
  const gates = document.querySelectorAll('.arena-gate');
  let sharedAudioCtx = null;

  gates.forEach(gate => {
    const particleContainer = gate.querySelector('.gate-particles');
    const link = gate.querySelector('a');

    if (!particleContainer || !link) return;

    const particles = [];
    const isMobile = window.matchMedia('(max-width:768px)').matches;
    const particleCount = isMobile ? 0 : 8;
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
          if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const audioCtx = sharedAudioCtx;
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

      // Create shockwave effect
      const shockwave = document.createElement('div');
      shockwave.style.cssText = `
        position:absolute;
        top:50%; left:50%;
        width:20px; height:20px;
        border-radius:50%;
        border:2px solid rgba(192,0,26,.8);
        transform:translate(-50%,-50%) scale(0);
        animation:shockwave .6s ease-out forwards;
        pointer-events:none;
        z-index:100;
      `;
      gate.appendChild(shockwave);

      setTimeout(() => {
        shockwave.remove();
        window.location.href = href;
      }, 400);
    });
  });
}

/* ══════════════════════════════════════════════
   CREATIVE MAP ENHANCEMENTS
══════════════════════════════════════════════ */
(function enhanceArenaMap() {
  const map = document.querySelector('.arena-map');
  if (!map) return;
  const isMobile = window.matchMedia('(max-width:768px)').matches;

  // Star field
  const starsContainer = document.getElementById('arena-stars');
  if (starsContainer) {
    for (let i = 0; i < (isMobile ? 15 : 50); i++) {
      const star = document.createElement('div');
      star.className = 'arena-star';
      star.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation-delay:${Math.random() * 3}s;
        animation-duration:${2 + Math.random() * 2}s;
        width:${Math.random() > .7 ? 2 : 1}px;
        height:${Math.random() > .7 ? 2 : 1}px;
      `;
      starsContainer.appendChild(star);
    }
  }

  // Connection lines between gates
  const connectionsSvg = document.getElementById('arena-connections');
  if (connectionsSvg) {
    const gates = Array.from(document.querySelectorAll('.arena-gate'));

    const drawConnections = () => {
      connectionsSvg.innerHTML = '';
      const rect = map.getBoundingClientRect();
      connectionsSvg.setAttribute('width', rect.width);
      connectionsSvg.setAttribute('height', rect.height);
      connectionsSvg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';

      const connections = isMobile
        ? [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]
        : [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4], [2, 5]];

      connections.forEach(([from, to], idx) => {
        if (from >= gates.length || to >= gates.length) return;
        const g1 = gates[from];
        const g2 = gates[to];
        if (!g1 || !g2) return;

        const r1 = g1.getBoundingClientRect();
        const r2 = g2.getBoundingClientRect();
        const mr = map.getBoundingClientRect();

        const x1 = r1.left + r1.width / 2 - mr.left;
        const y1 = r1.top + r1.height / 2 - mr.top;
        const x2 = r2.left + r2.width / 2 - mr.left;
        const y2 = r2.top + r2.height / 2 - mr.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', isMobile ? 'rgba(212,175,55,0.05)' : 'rgba(212,175,55,0.08)');
        line.setAttribute('stroke-width', '1');
        line.style.animation = `connectionPulse ${3 + (idx % 3)}s ease-in-out infinite`;
        line.style.animationDelay = `${idx * 0.2}s`;
        connectionsSvg.appendChild(line);
      });
    };

    // Wait for gates to be positioned
    setTimeout(drawConnections, 100);
    window.addEventListener('resize', () => setTimeout(drawConnections, 100));
  }

  // Data stream particles
  const particleCount = isMobile ? 5 : 15;
  const dataStream = document.createElement('div');
  dataStream.className = 'arena-data-stream';
  map.appendChild(dataStream);

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'data-particle';
    particle.style.cssText = `
      left:${10 + Math.random() * 80}%;
      top:${20 + Math.random() * 60}%;
      animation-delay:${Math.random() * 4}s;
      animation-duration:${3 + Math.random() * 3}s;
    `;
    dataStream.appendChild(particle);
  }

  // Mouse parallax on map
  let mouseX = 0, mouseY = 0;
  map.addEventListener('mousemove', (e) => {
    const rect = map.getBoundingClientRect();
    mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
    mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;

    const crest = document.querySelector('.arena-crest-wrap');
    if (crest) {
      crest.style.transform = `translate(calc(-50% + ${mouseX * 10}px), calc(-50% + ${mouseY * 10}px))`;
    }
  });

  // Magnetic hover effect on gates
  gates.forEach(gate => {
    gate.addEventListener('mousemove', (e) => {
      const rect = gate.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 200;
      if (distance < maxDistance) {
        const strength = (1 - distance / maxDistance) * 0.3;
        const moveX = x * strength;
        const moveY = y * strength;
        gate.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
      }
    });

    gate.addEventListener('mouseleave', () => {
      gate.style.transform = '';
    });
  });
})();
