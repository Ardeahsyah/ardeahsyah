(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const pages       = $$('.page');
  const navLinks    = $$('.nav-link[data-page]');
  const menu        = $('#navLinks');
  const nav         = $('.nav');
  const menuToggle  = $('#menuToggle');
  const themeToggle = $('#themeToggle');
  const typingTarget = $('#typingText');

  /* =========================================================
     SCROLL PROGRESS BAR
  ========================================================= */
  const progress = Object.assign(document.createElement('div'), { className: 'scroll-progress' });
  document.body.appendChild(progress);

  /* =========================================================
     NAV: SLIDING ACTIVE PILL
  ========================================================= */
  const indicator = Object.assign(document.createElement('span'), { className: 'nav-indicator' });
  indicator.setAttribute('aria-hidden', 'true');
  menu.appendChild(indicator);

  function moveIndicator(instant = false) {
    const active = navLinks.find((l) => l.classList.contains('active'));
    if (!active || getComputedStyle(indicator).display === 'none') return;
    if (instant) indicator.style.transition = 'none';
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
    indicator.style.opacity = 1;
    if (instant) { indicator.offsetWidth; indicator.style.transition = ''; }
  }

  /* =========================================================
     MOBILE MENU
  ========================================================= */
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menuToggle.textContent = open ? '✕' : '☰';
    menuToggle.setAttribute('aria-expanded', open);
  }
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenu(!menu.classList.contains('open'));
  });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setMenu(false); });

  /* =========================================================
     SCROLL REVEAL + COUNT-UP
  ========================================================= */
  const REVEAL = '.kicker, .page-title, .container > .lead, .hero-actions, .hero-panel, .profile-avatar, ' +
                 '.profile-card h2, .role-tagline, .chip, .floating-stat, .card, .timeline-entry, ' +
                 '.contact-card, .footer-note';

  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((entry, i) => {
      const el = entry.target;
      let depth = 0;
      for (let p = el.parentElement; p; p = p.parentElement) if (p.matches(REVEAL)) depth++;
      const step = el.classList.contains('chip') ? 45 : 90;
      const delay = depth * 140 + Math.min(i * step, 540);
      el.style.setProperty('--d', delay + 'ms');
      el.classList.add('in');
      io.unobserve(el);
      if (el.classList.contains('floating-stat')) countUp($('strong', el), delay);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  function prepareReveals(page) {
    $$(REVEAL, page).forEach((el) => {
      io.unobserve(el);
      el.classList.add('reveal');
      el.classList.remove('in');
      if (reduceMotion) {
        el.classList.add('in');
        if (el.classList.contains('floating-stat')) countUp($('strong', el));
      } else {
        io.observe(el);
      }
    });
  }

  function countUp(el, delay = 0) {
    if (!el) return;
    cancelAnimationFrame(el._raf);
    const final = el.dataset.final || (el.dataset.final = el.textContent.trim());
    if (reduceMotion || !/\d/.test(final)) { el.textContent = final; return; }
    const parts = final.split(/(\d+)/);           // odd indexes are numbers
    const start = performance.now() + delay;
    const tick = (now) => {
      const t = Math.min(Math.max((now - start) / 1400, 0), 1);
      const ease = 1 - Math.pow(1 - t, 4);
      el.textContent = parts.map((p, i) => (i % 2 ? Math.round(+p * ease) : p)).join('');
      if (t < 1) el._raf = requestAnimationFrame(tick);
    };
    tick(start - 1);
  }

  /* =========================================================
     HERO HEADLINE: WORD-BY-WORD REVEAL
  ========================================================= */
  function splitWords(root) {
    if (!root || root.dataset.split) return;
    root.dataset.split = '1';
    root.setAttribute('aria-label', root.textContent.replace(/\s+/g, ' ').trim());
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const words = child.textContent.split(/\s+/).filter(Boolean);
          if (!words.length) return;
          const frag = document.createDocumentFragment();
          words.forEach((w) => {
            const outer = Object.assign(document.createElement('span'), { className: 'w' });
            const inner = document.createElement('span');
            inner.textContent = w;
            inner.style.setProperty('--i', i++);
            outer.appendChild(inner);
            frag.append(outer, ' ');
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(root);
  }

  /* =========================================================
     EXECUTIVE PROFILE TYPING EFFECT (click text to skip)
  ========================================================= */
  const heroText = `Enterprise Process Excellence Leader with a proven track record of driving large-scale transformation, operational excellence and performance improvement across complex, multi-business environments spanning financial services, e-commerce, manufacturing and aviation. Proven ability to translate business strategy into measurable improvements in productivity, cost efficiency, service quality, customer experience, operational resilience and governance.

Experienced in leading enterprise process transformation, operating model and workflow redesign, Lean Six Sigma, digitalisation, automation, AI and data-driven performance management. Proven ability to establish transformation governance, lead cross-functional and regional initiatives, strengthen KPI and performance management, and partner with senior leadership to deliver sustainable business outcomes.

Combines strategic transformation leadership with deep hands-on expertise in process improvement and structured problem solving, with a track record of eliminating waste, reducing process variation, improving turnaround time, strengthening quality and controls, and building continuous improvement capabilities. Brings a customer-centric and data-driven approach to transforming complex operations, with the ability to translate improvement opportunities into scalable solutions that enhance stakeholder value and organisational performance.`;

  let typed = false;
  function startTyping() {
    if (!typingTarget || typed) return;
    typed = true;
    if (reduceMotion) { typingTarget.textContent = heroText; return; }

    // Reserve the final height so the buttons below don't jump while typing
    typingTarget.textContent = heroText;
    const h = typingTarget.offsetHeight;
    if (h) typingTarget.style.minHeight = h + 'px';
    typingTarget.textContent = '';
    typingTarget.classList.add('typing');

    let raf, shown = 0;
    const t0 = performance.now();
    const finish = () => {
      typingTarget.classList.remove('typing');
      typingTarget.style.minHeight = '';
      typingTarget.removeEventListener('click', skip);
    };
    const skip = () => { cancelAnimationFrame(raf); typingTarget.textContent = heroText; finish(); };
    const step = (now) => {
      const n = Math.min(heroText.length, Math.floor((now - t0) / 8));
      if (n !== shown) { typingTarget.textContent = heroText.slice(0, n); shown = n; }
      n < heroText.length ? (raf = requestAnimationFrame(step)) : finish();
    };
    typingTarget.addEventListener('click', skip);
    raf = requestAnimationFrame(step);
  }

  /* =========================================================
     PAGE NAVIGATION (with fade-out / fade-in)
  ========================================================= */
  let current = pages.find((p) => p.classList.contains('active')) || null;
  let pending = null;

  function activate(target) {
    pages.forEach((p) => p.classList.remove('active', 'leaving'));
    target.classList.add('active');
    current = target;
    window.scrollTo({ top: 0 });
    prepareReveals(target);
    if (target.id === 'profile') {
      splitWords($('.hero-copy h1'));
      startTyping();
    }
    updateScroll();
  }

  function showPage(pageId, { instant = false } = {}) {
    const target = pages.find((p) => p.id === pageId) || $('#profile');

    if (pending) pending();                        // finish a half-done transition

    navLinks.forEach((l) => l.classList.toggle('active', l.dataset.page === target.id));
    moveIndicator();
    setMenu(false);

    if (target === current && !instant) { window.scrollTo({ top: 0 }); return; }

    if (current && !instant && !reduceMotion) {
      const leaving = current;
      leaving.classList.add('leaving');
      const timer = setTimeout(() => { pending = null; activate(target); }, 220);
      pending = () => {
        clearTimeout(timer);
        leaving.classList.remove('leaving', 'active');
        current = null;
        pending = null;
      };
    } else {
      activate(target);
    }
  }

  // Any in-page link that points at a page (nav, brand, hero buttons)
  $$('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    if (!pages.some((p) => p.id === id)) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
      showPage(id);
    });
  });

  window.addEventListener('popstate', () => showPage(location.hash.replace('#', '') || 'profile'));

  /* =========================================================
     SCROLL EFFECTS: progress bar, nav shrink, timeline
  ========================================================= */
  function updateScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav.classList.toggle('scrolled', scrollY > 20);

    const tl = current && $('.timeline', current);
    if (tl) {
      const r = tl.getBoundingClientRect();
      const mid = innerHeight * 0.55;
      tl.style.setProperty('--tl', Math.max(0, Math.min(r.height - 12, mid - r.top - 6)) + 'px');
      $$('.timeline-entry', tl).forEach((en) =>
        en.classList.toggle('passed', en.getBoundingClientRect().top + 30 < mid));
    }
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; updateScroll(); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { onScroll(); moveIndicator(true); });
  if (document.fonts) document.fonts.ready.then(() => moveIndicator(true));

  /* =========================================================
     POINTER EFFECTS (mouse devices only)
  ========================================================= */
  if (finePointer && !reduceMotion) {

    // Soft glow that trails the cursor
    const glow = Object.assign(document.createElement('div'), { className: 'cursor-glow' });
    document.body.appendChild(glow);
    let gx = 0, gy = 0, tx = 0, ty = 0, running = false;
    const follow = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) requestAnimationFrame(follow);
      else running = false;
    };
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add('on');
      if (!running) { running = true; requestAnimationFrame(follow); }

      // Spotlight inside cards
      const host = e.target.closest && e.target.closest('.card, .timeline-entry, .glass');
      if (host) {
        const r = host.getBoundingClientRect();
        host.style.setProperty('--mx', e.clientX - r.left + 'px');
        host.style.setProperty('--my', e.clientY - r.top + 'px');
      }
    });
    document.addEventListener('mouseleave', () => glow.classList.remove('on'));

    // 3D tilt on the profile panel
    const panel = $('.hero-panel');
    if (panel) {
      panel.addEventListener('mousemove', (e) => {
        const r = panel.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        panel.style.transform = `perspective(1100px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
      });
      panel.addEventListener('mouseleave', () => { panel.style.transform = ''; });
    }

    // Magnetic buttons
    $$('.btn, .icon-btn').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.22}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
      });
      el.addEventListener('mouseleave', () => { el.style.translate = ''; });
    });
  }

  /* =========================================================
     THEME TOGGLE (circular reveal where supported)
  ========================================================= */
  let spin = 0;
  themeToggle.addEventListener('click', () => {
    const apply = () => {
      document.body.classList.toggle('light');
      spin += 180;
      themeToggle.style.rotate = spin + 'deg';
    };
    if (!document.startViewTransition || reduceMotion) { apply(); return; }

    const r = themeToggle.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  });

  /* =========================================================
     CONTACT FORM
  ========================================================= */
  window.sendMessage = function (event) {
    event.preventDefault();

    const name    = document.getElementById('name').value;
    const email   = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    const subject = encodeURIComponent('Website Enquiry from ' + name);
    const body = encodeURIComponent(
`Name: ${name}
Email: ${email}

Message:
${message}`
    );

    const btn = event.target.querySelector('button[type="submit"]');
    if (btn) {
      const label = btn.textContent;
      btn.textContent = 'Opening your email app…';
      setTimeout(() => { btn.textContent = label; }, 2500);
    }

    window.location.href = 'mailto:ardeahsyah@gmail.com' + '?subject=' + subject + '&body=' + body;
  };

  /* =========================================================
     INIT
  ========================================================= */
  /* =========================================================
     PROCESS EXCELLENCE IN MOTION (animated method cards)
  ========================================================= */
  const nodes = (labels, pos) => labels.map((l, i) => {
    const [x, y] = pos(i);
    return `<g class="dm-node" style="--i:${i}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12"/>` +
           `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${l}</text></g>`;
  }).join('');

  const dmaic = nodes(['D', 'M', 'A', 'I', 'C'], (i) => {
    const a = (-90 + 72 * i) * Math.PI / 180;
    return [120 + 50 * Math.cos(a), 75 + 50 * Math.sin(a)];
  });
  const stages = ['Empathise', 'Define', 'Ideate', 'Prototype', 'Test'];
  const dtNodes = nodes(['1', '2', '3', '4', '5'], (i) => [28 + 46 * i, 50]);
  const dtLabels = stages.map((s, i) => `<text class="lbl" x="${28 + 46 * i}" y="80">${s}</text>`).join('');
  const kbCards = [0, 1, 2].map((i) =>
    `<rect class="kb-card" style="--i:${i}" x="16" y="${34 + i * 28}" width="48" height="18" rx="3"/>`).join('');

  const methodHTML = `
  <div class="container method-strip">
    <div class="kicker">Process Excellence in Motion</div>
    <h2 class="page-title method-title">The frameworks behind the results</h2>
    <div class="method-grid">

      <div class="card method-card">
        <svg viewBox="0 0 240 150" aria-hidden="true">
          <circle class="dm-ring" cx="120" cy="75" r="50"/>
          ${dmaic}
          <g class="dm-orbit"><circle class="dm-dot" cx="120" cy="25" r="3.5"/></g>
          <text class="lbl" x="120" y="73">CONTINUOUS</text><text class="lbl" x="120" y="84">IMPROVEMENT</text>
        </svg>
        <h3>DMAIC</h3>
        <p>Define, Measure, Analyse, Improve, Control: the Lean Six Sigma loop behind every improvement programme.</p>
      </div>

      <div class="card method-card">
        <svg viewBox="0 0 240 150" aria-hidden="true">
          <line class="cc-mean" x1="8" y1="75" x2="232" y2="75"/>
          <line class="cc-limit" x1="8" y1="35" x2="232" y2="35"/>
          <line class="cc-limit" x1="8" y1="115" x2="232" y2="115"/>
          <text class="lbl lbl-l" x="10" y="31">UCL</text><text class="lbl lbl-l" x="10" y="125">LCL</text>
          <polyline class="cc-line" id="ccLine" points=""/>
          <circle class="cc-dot" id="ccDot" r="3.5" cx="232" cy="75"/>
        </svg>
        <h3>Statistical Process Control</h3>
        <p>Live control chart: variation tightens as the process is brought under control, the 95%+ reduction achieved in manufacturing.</p>
      </div>

      <div class="card method-card">
        <svg viewBox="0 0 240 150" aria-hidden="true">
          <rect class="kb-col" x="10" y="24" width="60" height="118" rx="5"/>
          <rect class="kb-col" x="90" y="24" width="60" height="118" rx="5"/>
          <rect class="kb-col" x="170" y="24" width="60" height="118" rx="5"/>
          <text class="lbl" x="40" y="17">BACKLOG</text><text class="lbl" x="120" y="17">DOING</text><text class="lbl" x="200" y="17">DONE</text>
          ${kbCards}
        </svg>
        <h3>Agile Delivery</h3>
        <p>Work flows from backlog to done in short sprints, as applied in the GeMS and iGuarantee programmes.</p>
      </div>

      <div class="card method-card">
        <svg viewBox="0 0 240 150" aria-hidden="true" style="--dur:7.5s;--step:1.5s">
          <line class="dt-line" x1="28" y1="50" x2="212" y2="50"/>
          ${dtNodes}${dtLabels}
          <path class="dt-loop" d="M212 64 C212 135 28 135 28 64"/>
          <text class="lbl" x="120" y="132">ITERATE</text>
        </svg>
        <h3>Design Thinking</h3>
        <p>Empathise, define, ideate, prototype, test, then iterate. Applied at RHB for Premier Relationship Managers.</p>
      </div>

    </div>
  </div>`;

  $('#profile').insertAdjacentHTML('beforeend', methodHTML);

  // Live control chart: new points stream in, variation shrinks, then the cycle restarts
  const ccLine = $('#ccLine'), ccDot = $('#ccDot');
  const ccVals = [];
  let ccTick = 0;
  const ccSigma = (t) => { const k = Math.min(1, (t % 300) / 225); return 52 - 44 * k * k * (3 - 2 * k); };
  const ccStep = () => {
    const s = ccSigma(ccTick++);
    ccVals.push((Math.random() + Math.random() + Math.random() - 1.5) / 1.5 * s);
    if (ccVals.length > 44) ccVals.shift();
    const dx = 224 / 43;
    const y = (v) => Math.max(12, Math.min(138, 75 - v));
    ccLine.setAttribute('points', ccVals.map((v, i) => `${(232 - (ccVals.length - 1 - i) * dx).toFixed(1)},${y(v).toFixed(1)}`).join(' '));
    const last = ccVals[ccVals.length - 1];
    ccDot.setAttribute('cy', y(last));
    ccDot.classList.toggle('out', Math.abs(last) > 40);
  };
  for (let i = 0; i < 44; i++) ccStep();
  if (!reduceMotion) {
    setInterval(() => {
      if (!document.hidden && ccLine.getClientRects().length) ccStep();   // only while visible
    }, 100);
  }

  showPage(location.hash.replace('#', '') || 'profile', { instant: true });
  moveIndicator(true);
})();
