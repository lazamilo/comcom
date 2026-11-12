// ComCom redesign — interactions and motion
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
    }));
  }

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const mega = $('#mega');
  let megaTimer;
  const openMega = li => { clearTimeout(megaTimer); $$('[data-mega]').forEach(l => l.classList.toggle('is-open', l === li)); mega.classList.add('is-open'); nav.classList.add('is-scrolled'); };
  const closeMega = () => { megaTimer = setTimeout(() => { mega.classList.remove('is-open'); $$('[data-mega]').forEach(l => l.classList.remove('is-open')); onScroll(); }, 160); };
  $$('[data-mega]').forEach(li => { li.addEventListener('mouseenter', () => openMega(li)); li.addEventListener('mouseleave', closeMega); });
  if (mega) { mega.addEventListener('mouseenter', () => clearTimeout(megaTimer)); mega.addEventListener('mouseleave', closeMega); }
  $$('.nav__links > li:not([data-mega])').forEach(li => li.addEventListener('mouseenter', () => { clearTimeout(megaTimer); mega.classList.remove('is-open'); $$('[data-mega]').forEach(l => l.classList.remove('is-open')); }));

  const mobile = $('#mobile');
  $('.burger')?.addEventListener('click', () => mobile.classList.add('is-open'));
  $('.mobile__close')?.addEventListener('click', () => mobile.classList.remove('is-open'));
  $$('#mobile a').forEach(a => a.addEventListener('click', () => mobile.classList.remove('is-open')));

  /* ---------- Ribbons: one line that fans out ---------- */
  const PALETTE = ['#F44C34', '#F6643F', '#F98457', '#FBA67A', '#F7C9AE', '#E9DED3', '#C9E7EE', '#A6DCE8', '#8FD3E3'];
  function ribbons(canvas) {
    const mini = canvas.dataset.ribbons === 'mini';
    const ctx = canvas.getContext('2d');
    const N = mini ? 8 : 14;
    const state = { draw: reduce ? 1 : 0, spread: reduce ? 0.6 : 0, extra: 0 };
    let W = 0, H = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size(); addEventListener('resize', size);
    const colorAt = k => { const c = Math.abs(k / N - 0.5) * 2; return PALETTE[Math.round((1 - c) * (PALETTE.length - 1))]; };
    const frame = time => {
      const t = time / 1000;
      ctx.clearRect(0, 0, W, H);
      const narrow = W < 720;
      const y0 = mini ? H * 0.5 : H * (narrow ? 0.58 : 0.52);
      const xs = mini ? W * 0.18 : W * (narrow ? 0.22 : 0.4);
      const spread = (state.spread + state.extra) * (mini ? 1.6 : 1.0);
      const lineEnd = Math.min(xs, W * state.draw / 0.45);
      // incoming signal line, with a small notch like a price tick
      ctx.beginPath();
      ctx.moveTo(-10, y0);
      const nx = xs * 0.35;
      if (lineEnd > nx - 14) {
        ctx.lineTo(nx - 14, y0);
        ctx.quadraticCurveTo(nx - 7, y0, nx, y0 - 14);
        ctx.quadraticCurveTo(nx + 7, y0, Math.min(lineEnd, nx + 14), y0);
      }
      ctx.lineTo(lineEnd, y0);
      ctx.strokeStyle = '#F44C34'; ctx.lineWidth = 2; ctx.stroke();
      if (state.draw < 0.45) { requestAnimationFrame(frame); return; }
      // ribbons
      const ends = [];
      for (let k = 0; k <= N; k++) {
        const u = k / N - 0.5;
        const wave = Math.sin(t * 0.8 + k * 0.55) * (mini ? 3 : 7) * spread;
        ends.push(y0 + u * H * 1.25 * spread + wave);
      }
      const cx1 = xs + (W - xs) * 0.42, cx2 = xs + (W - xs) * 0.5;
      const curve = (k, rev) => {
        if (!rev) ctx.bezierCurveTo(cx1, y0, cx2, ends[k], W + 20, ends[k]);
        else ctx.bezierCurveTo(cx2, ends[k], cx1, y0, xs, y0);
      };
      for (let k = 0; k < N; k++) {
        ctx.beginPath();
        ctx.moveTo(xs, y0);
        curve(k, false);
        ctx.lineTo(W + 20, ends[k + 1]);
        curve(k + 1, true);
        ctx.closePath();
        ctx.fillStyle = colorAt(k + 0.5);
        ctx.globalAlpha = mini ? 0.85 : 0.94;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // fine highlight seams
      ctx.strokeStyle = mini ? 'rgba(13,15,18,.35)' : 'rgba(255,255,255,.55)';
      ctx.lineWidth = 1;
      for (let k = 1; k < N; k++) { ctx.beginPath(); ctx.moveTo(xs, y0); curve(k, false); ctx.stroke(); }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return state;
  }
  const heroCanvas = $('#ribbons');
  const heroRib = heroCanvas ? ribbons(heroCanvas) : null;
  $$('canvas[data-ribbons="mini"]').forEach(c => { const s = ribbons(c); s.draw = 1; s.spread = 0.5; });

  /* ---------- Text reveals ---------- */
  if (hasGsap && !reduce) {
    $$('[data-split]').forEach(el => {
      const lines = $$('.line > span', el);
      const inHero = el.closest('.hero, .phero');
      gsap.from(lines, {
        yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.09, delay: inHero ? 0.15 : 0,
        scrollTrigger: inHero ? null : { trigger: el, start: 'top 88%' }
      });
    });
    $$('[data-fade]').forEach(el => {
      const inHero = el.closest('.hero, .phero');
      gsap.from(el, { y: 24, opacity: 0, duration: 1.1, ease: 'expo.out', delay: inHero ? 0.45 : 0, scrollTrigger: inHero ? null : { trigger: el, start: 'top 90%' } });
    });
    $$('[data-reveal]').forEach(el => gsap.fromTo(el, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  }

  /* ---------- Hero choreography ---------- */
  if (heroRib && hasGsap && !reduce) {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to(heroRib, { draw: 0.45, duration: 1.1, ease: 'power2.inOut' })
      .set(heroRib, { draw: 1 })
      .to(heroRib, { spread: 0.5, duration: 1.8, ease: 'expo.out' })
      .from('[data-chip]', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.15 }, '-=1.4')
      .add(() => $$('.chip__bar i').forEach(i => gsap.to(i, { width: i.dataset.w + '%', duration: 1.6, ease: 'expo.out' })), '-=1');
    gsap.to(heroRib, { extra: 0.45, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('[data-chip]', { y: (i) => -40 - i * 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    $$('[data-chip]').forEach((c, i) => gsap.to(c, { yPercent: 10, duration: 2.4 + i * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  } else if (heroRib) {
    $$('.chip__bar i').forEach(i => i.style.width = i.dataset.w + '%');
  }

  // ticker: duplicate content for seamless loop
  $$('.ticker__track').forEach(t => t.innerHTML += t.innerHTML);

  /* ---------- SAP bricks ---------- */
  const bricks = $('#bricks');
  if (bricks) {
    const data = [
      ['FI', 'Finance', 'ink', 8, 10, -6], ['CO', 'Kontroling', 'brand', 40, 4, 4], ['SD', 'Prodaja', 'soft', 64, 24, -3],
      ['MM', 'Materialno poslovanje', 'bg', 4, 42, 3], ['HCM', 'Človeški viri', 'cool', 44, 40, -5], ['PP', 'Proizvodnja', 'ink', 26, 72, 2],
      ['BI', 'Poslovna analitika', 'brand', 60, 68, -4]
    ];
    bricks.innerHTML = data.map(([c, n, k, x, y, r]) => `<div class="brick brick--${k}" style="left:${x}%;top:${y}%;--r:${r}deg;transform:rotate(${r}deg)"><span class="mono">${c}</span>${n}</div>`).join('');
    if (hasGsap && !reduce) {
      gsap.from($$('.brick', bricks), {
        y: -260, opacity: 0, rotation: (i) => (i % 2 ? 18 : -18), duration: 1.3, ease: 'back.out(1.3)', stagger: 0.09,
        scrollTrigger: { trigger: bricks, start: 'top 80%' }
      });
      const card = bricks.closest('.practice');
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect(); const mx = (e.clientX - r.left) / r.width - 0.5, my = (e.clientY - r.top) / r.height - 0.5;
        $$('.brick', bricks).forEach((b, i) => gsap.to(b, { x: mx * (14 + i * 4), y: my * (10 + i * 3), duration: 0.8, ease: 'power3.out' }));
      });
    }
  }

  /* ---------- Small helpers for SVG charts ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };
  const pathFrom = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const smooth = (pts) => {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const cx = (x0 + x1) / 2; d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`; }
    return d;
  };

  /* ---------- Story: pinned numbers with imagery ---------- */
  const story = $('#story');
  if (story) {
    const VALUES = [{ v: '1992' }, { v: '13' }, { v: '60', u: '+' }, { v: '5,3', u: 'M€' }];
    const num = $('#storyNum'), caps = $$('.story__cap', story), rail = $$('.story__rail button', story), imgs = $$('.story__img', story);
    const make = ({ v, u }) => {
      const d = document.createElement('div'); d.className = 'v';
      d.innerHTML = [...v].map(c => `<span class="c">${c}</span>`).join('') + (u ? `<span class="c u">${u}</span>` : '');
      return d;
    };
    let cur = 0, curEl = make(VALUES[0]); curEl.dataset.settled = '1'; num.appendChild(curEl);
    // image k is shown when k <= chapter; reveal or hide only the images between old and new chapter
    const showImages = (from, to) => {
      imgs.forEach((f, k) => {
        if (k === 0) return;
        const on = k <= to, wasOn = k <= from;
        if (on === wasOn) return;
        const img = $('img', f);
        if (!hasGsap || reduce) { f.style.clipPath = on ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)'; return; }
        gsap.killTweensOf([f, img]);
        if (on) {
          gsap.fromTo(f, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.inOut' });
          gsap.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.4, ease: 'expo.out' });
        } else {
          gsap.to(f, { clipPath: 'inset(100% 0 0 0)', duration: 0.9, ease: 'expo.inOut' });
        }
      });
    };
    const go = i => {
      if (i === cur) return;
      const dir = i > cur ? 1 : -1;
      const next = make(VALUES[i]); num.appendChild(next);
      const out = curEl;
      caps.forEach((c, k) => c.classList.toggle('is-active', k === i));
      rail.forEach((b, k) => b.classList.toggle('is-active', k === i));
      showImages(cur, i);
      // drop any number still mid-exit from an earlier quick change
      $$('.v', num).forEach(v => { if (v !== out && v !== next) { hasGsap && gsap.killTweensOf($$('.c', v)); v.remove(); } });
      if (hasGsap && !reduce) {
        const outChars = $$('.c', out), shift = num.getBoundingClientRect().height * 1.15;
        gsap.killTweensOf(outChars);
        let wait = 0.32;
        if (out.dataset.settled) {
          // fully shown: roll it out, then roll the new one in
          wait = 0.3 + 0.02 * (outChars.length - 1);
          gsap.to(outChars, { y: -shift * dir, duration: 0.3, ease: 'power2.in', stagger: 0.02, onComplete: () => out.remove() });
        } else out.remove(); // never fully arrived (fast scroll): drop it so it can't sweep across
        gsap.fromTo($$('.c', next), { y: shift * dir }, { y: 0, duration: 0.75, ease: 'expo.out', stagger: 0.04, delay: wait, onComplete: () => { next.dataset.settled = '1'; } });
      } else out.remove();
      curEl = next; cur = i;
    };
    rail[0].classList.add('is-active');
    const steps = imgs.length - 1;
    if (hasGsap && !reduce) {
      // each chapter owns a quarter of the pin; its rail line fills while you scroll through it
      const n = imgs.length;
      const st = ScrollTrigger.create({
        trigger: story, start: 'top top', end: () => '+=' + innerHeight * 3.2, pin: '.story__pin', invalidateOnRefresh: true,
        snap: { snapTo: 1 / n, directional: false, duration: { min: 0.3, max: 0.7 }, delay: 0.08, ease: 'power2.inOut' },
        onUpdate: self => {
          const q = self.progress * n;
          go(Math.min(n - 1, Math.floor(q + 0.001)));
          rail.forEach((b, k) => b.querySelector('i').style.setProperty('--p', Math.max(0, Math.min(1, q - k))));
        }
      });
      rail.forEach((b, k) => b.addEventListener('click', () => {
        const y = st.start + (st.end - st.start) * (k / n);
        lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: 'smooth' });
      }));
    } else {
      rail.forEach((b, k) => b.addEventListener('click', () => go(k)));
      rail.forEach((b, k) => b.querySelector('i').style.setProperty('--p', 1));
    }
  }

  /* ---------- Practice chart (analytics card) ---------- */
  const pchart = $('#pchart');
  if (pchart) {
    const W = 600, H = 300;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none' }, pchart);
    const defs = el('defs', {}, svg);
    const g = el('linearGradient', { id: 'pg', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': '#F44C34', 'stop-opacity': '.45' }, g);
    el('stop', { offset: '1', 'stop-color': '#F44C34', 'stop-opacity': '0' }, g);
    for (let i = 1; i < 5; i++) el('line', { x1: 0, x2: W, y1: i * H / 5, y2: i * H / 5, stroke: 'rgba(255,255,255,.08)', 'stroke-dasharray': '3 6' }, svg);
    const pts = [], base = [];
    for (let i = 0; i <= 24; i++) {
      const x = i / 24 * W;
      const v = 0.5 + Math.sin(i / 3.2) * 0.18 + Math.sin(i / 1.3) * 0.06 + i * 0.012;
      pts.push([x, H - v * H * 0.9]);
      base.push([x, H - (0.42 + Math.sin(i / 3.2) * 0.14 + Math.sin(i / 1.7) * 0.05) * H * 0.9]);
    }
    el('path', { d: smooth(base), fill: 'none', stroke: 'rgba(255,255,255,.28)', 'stroke-width': 1.5, 'stroke-dasharray': '4 6', 'vector-effect': 'non-scaling-stroke' }, svg);
    const area = el('path', { d: smooth(pts) + ` L${W} ${H} L0 ${H} Z`, fill: 'url(#pg)', opacity: 0 }, svg);
    const line = el('path', { d: smooth(pts), fill: 'none', stroke: '#F44C34', 'stroke-width': 2.5, 'vector-effect': 'non-scaling-stroke' }, svg);
    const last = pts[pts.length - 1];
    const dot = el('circle', { cx: last[0], cy: last[1], r: 6, fill: '#F44C34', opacity: 0 }, svg);
    const len = line.getTotalLength();
    line.style.strokeDasharray = len; line.style.strokeDashoffset = reduce ? 0 : len;
    if (hasGsap && !reduce) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: pchart, start: 'top 80%' } });
      tl.to(line.style, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' })
        .to(area, { attr: { opacity: 1 }, duration: 1 }, '-=1')
        .to(dot, { attr: { opacity: 1 }, duration: 0.3 }, '-=0.3');
    } else { area.setAttribute('opacity', 1); dot.setAttribute('opacity', 1); }
  }

  /* ---------- Count up ---------- */
  $$('[data-count]').forEach(n => {
    const to = parseFloat(n.dataset.count), from = parseFloat(n.dataset.from || 0), dec = +(n.dataset.dec || 0);
    const fmt = v => dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toString();
    if (!hasGsap || reduce) { n.textContent = fmt(to); return; }
    const o = { v: from }; n.textContent = fmt(from);
    gsap.to(o, { v: to, duration: 2, ease: 'expo.out', onUpdate: () => n.textContent = fmt(o.v), scrollTrigger: { trigger: n, start: 'top 85%' } });
  });

  /* ---------- SAP module orbit ---------- */
  const orbitNodes = $('#orbitNodes');
  if (orbitNodes) {
    const groups = [
      { key: 'fin', name: 'Finance', color: '#F44C34', ring: 0, mods: [['FI', 'Finance in računovodstvo'], ['CO', 'Kontroling'], ['IM', 'Upravljanje z investicijami']] },
      { key: 'ppl', name: 'Ljudje in stranke', color: '#0D0F12', ring: 1, mods: [['HCM', 'Upravljanje s človeškimi viri'], ['CRM', 'Upravljanje odnosov s strankami']] },
      { key: 'bi', name: 'Analitika', color: '#8FD3E3', ring: 1, mods: [['BI', 'Poslovna analitika']] },
      { key: 'log', name: 'Logistika in proizvodnja', color: '#9A9CA0', ring: 2, mods: [['SD', 'Prodaja in distribucija'], ['MM', 'Materialno poslovanje'], ['WM', 'Skladiščno poslovanje'], ['PP', 'Proizvodnja'], ['QM', 'Upravljanje s kakovostjo'], ['PM', 'Vzdrževanje in servis'], ['PS', 'Projektni sistemi']] }
    ];
    const RINGS = [{ r: 0.36, speed: 0.07 }, { r: 0.62, speed: -0.045 }, { r: 0.9, speed: 0.028 }];
    const mods = [];
    groups.forEach(g => g.mods.forEach(([code, name]) => mods.push({ code, name, g })));
    // spread nodes evenly on each ring
    RINGS.forEach((ring, ri) => {
      const on = mods.filter(m => m.g.ring === ri);
      on.forEach((m, k) => { m.ring = ri; m.a0 = (k / on.length) * Math.PI * 2 + ri * 0.7; });
    });
    orbitNodes.innerHTML = mods.map(m => `<div class="node node--${m.g.key}" data-code="${m.code}"><b>${m.code}</b><em>${m.name}</em></div>`).join('');
    $('#modlist').innerHTML = groups.map(g => `<div class="mgroup"><h6><i style="background:${g.color}"></i>${g.name}</h6>` +
      g.mods.map(([c, n]) => `<div class="mrow" data-code="${c}"><span class="mono">${c}</span><span>${n}</span><svg><use href="#i-arrow"/></svg></div>`).join('') + '</div>').join('');
    mods.forEach(m => { m.el = $(`.node[data-code="${m.code}"]`, orbitNodes); m.row = $(`.mrow[data-code="${m.code}"]`); });

    const svg = $('#orbitSvg'), box = orbitNodes.parentElement;
    let W = 0, H = 0, RX = 0, RY = 0;
    const ringEls = RINGS.map(() => el('circle', { fill: 'none', stroke: 'rgba(13,15,18,.12)', 'stroke-dasharray': '2 6' }, svg));
    const lineEls = mods.map(() => el('line', { stroke: 'rgba(13,15,18,.1)', 'stroke-width': 1 }, svg));
    const size = () => { const r = box.getBoundingClientRect(); W = r.width; H = r.height; RX = W / 2 * 0.84; RY = H / 2 * 0.8; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); ringEls.forEach((c, i) => { c.setAttribute('cx', W / 2); c.setAttribute('cy', H / 2); c.setAttribute('r', RINGS[i].r * RY); }); };
    size(); addEventListener('resize', size);

    let active = null, hovering = false, speed = 1, intro = reduce ? 1 : 0;
    const setActive = code => {
      active = code;
      mods.forEach((m, i) => {
        const on = m.code === code;
        m.el.classList.toggle('is-active', on); m.row.classList.toggle('is-active', on);
        lineEls[i].setAttribute('stroke', on ? '#F44C34' : 'rgba(13,15,18,.1)');
        lineEls[i].setAttribute('stroke-width', on ? 2 : 1);
      });
    };
    const hoverOn = code => { hovering = true; setActive(code); };
    const hoverOff = () => { hovering = false; };
    mods.forEach(m => [m.el, m.row].forEach(n => { n.addEventListener('mouseenter', () => hoverOn(m.code)); n.addEventListener('mouseleave', hoverOff); n.addEventListener('click', () => hoverOn(m.code)); }));

    // auto-cycle through modules while nobody is hovering
    let ci = 0; setActive(mods[0].code);
    setInterval(() => { if (!hovering) { ci = (ci + 1) % mods.length; setActive(mods[ci].code); } }, 2400);

    let last = performance.now(), t = 0;
    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      speed += ((hovering ? 0 : 1) - speed) * 0.06;
      if (!reduce) t += dt * speed;
      mods.forEach((m, i) => {
        const ring = RINGS[m.ring];
        const a = m.a0 + t * ring.speed * 2;
        const k = ring.r * (0.4 + 0.6 * intro);
        const x = W / 2 + Math.cos(a) * k * RX, y = H / 2 + Math.sin(a) * k * RY;
        m.el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${0.3 + 0.7 * intro})`;
        m.el.style.opacity = intro;
        const L = lineEls[i]; L.setAttribute('x1', W / 2); L.setAttribute('y1', H / 2); L.setAttribute('x2', x); L.setAttribute('y2', y);
      });
      requestAnimationFrame(tick);
    };
    // rings as ellipses to match node paths
    ringEls.forEach((c, i) => { const e = el('ellipse', { fill: 'none', stroke: 'rgba(13,15,18,.14)', 'stroke-dasharray': '2 6' }); svg.replaceChild(e, c); ringEls[i] = e; });
    const sizeE = () => ringEls.forEach((c, i) => { c.setAttribute('cx', W / 2); c.setAttribute('cy', H / 2); c.setAttribute('rx', RINGS[i].r * RX); c.setAttribute('ry', RINGS[i].r * RY); });
    sizeE(); addEventListener('resize', () => { size(); sizeE(); });
    requestAnimationFrame(tick);
    if (hasGsap && !reduce) { const o = { v: 0 }; gsap.to(o, { v: 1, duration: 1.6, ease: 'expo.out', onUpdate: () => intro = o.v, scrollTrigger: { trigger: box, start: 'top 80%' } }); }
  }

  /* ---------- VPP terminal ---------- */
  const tchart = $('#tchart');
  if (tchart) {
    const W = 800, H = 320, P = 48;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none' }, tchart);
    const defs = el('defs', {}, svg);
    const g = el('linearGradient', { id: 'tg', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': '#F44C34', 'stop-opacity': '.38' }, g);
    el('stop', { offset: '1', 'stop-color': '#F44C34', 'stop-opacity': '0' }, g);
    for (let i = 0; i <= 4; i++) el('line', { x1: 0, x2: W, y1: i * H / 4, y2: i * H / 4, stroke: 'rgba(255,255,255,.07)', 'vector-effect': 'non-scaling-stroke' }, svg);
    const bars = []; for (let i = 0; i < P; i++) bars.push(el('rect', { x: i * W / P + 3, width: W / P - 6, y: H, height: 0, rx: 2, fill: 'rgba(143,211,227,.5)' }, svg));
    const baseP = el('path', { fill: 'none', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 1.5, 'stroke-dasharray': '4 6', 'vector-effect': 'non-scaling-stroke' }, svg);
    const areaP = el('path', { fill: 'url(#tg)' }, svg);
    const lineP = el('path', { fill: 'none', stroke: '#F44C34', 'stroke-width': 2.5, 'vector-effect': 'non-scaling-stroke' }, svg);
    const streams = [true, true, false];
    let range = 0;
    const freq = [1, 0.35, 0.12];
    const series = () => {
      const base = [], opt = [];
      for (let i = 0; i < P; i++) {
        const f = freq[range];
        const b = 0.32 + Math.sin(i / (5 / f + 2)) * 0.1 + Math.sin(i / 1.9 + range) * 0.04 + (range ? Math.sin(i / 2.7) * 0.05 : 0);
        let o = b;
        if (streams[0]) o += 0.07 + Math.max(0, Math.sin(i / 3 + 1)) * 0.05;
        if (streams[1]) o += 0.05 + Math.sin(i / 6) * 0.015;
        if (streams[2]) o += 0.06 + Math.max(0, Math.sin(i / 2.2)) * 0.09;
        base.push(b); opt.push(Math.min(o, 0.95));
      }
      return { base, opt };
    };
    let cur = { base: Array(P).fill(0.3), opt: Array(P).fill(0.3) };
    const render = s => {
      const toPts = arr => arr.map((v, i) => [i / (P - 1) * W, H - v * H]);
      baseP.setAttribute('d', smooth(toPts(s.base)));
      const op = toPts(s.opt);
      lineP.setAttribute('d', smooth(op));
      areaP.setAttribute('d', smooth(op) + ` L${W} ${H} L0 ${H} Z`);
      s.opt.forEach((v, i) => { const h = Math.max(0, (v - s.base[i]) * H * 0.55); bars[i].setAttribute('y', H - h); bars[i].setAttribute('height', h); });
    };
    const kRev = $('#kRev'), kUp = $('#kUp');
    const kpi = { rev: 0, up: 0 };
    const update = (instant) => {
      const next = series();
      const sum = a => a.reduce((x, y) => x + y, 0);
      const mult = [1, 7, 30][range];
      const rev = sum(next.opt) * 1150 * mult, up = (sum(next.opt) / sum(next.base) - 1) * 100;
      const from = { base: [...cur.base], opt: [...cur.opt] };
      const o = { p: 0 };
      const step = () => { const s = { base: from.base.map((v, i) => v + (next.base[i] - v) * o.p), opt: from.opt.map((v, i) => v + (next.opt[i] - v) * o.p) }; render(s); cur = s; };
      const kstep = () => { kRev.textContent = '€ ' + Math.round(kpi.rev).toLocaleString('sl-SI'); kUp.textContent = '+' + kpi.up.toFixed(1).replace('.', ',') + ' % glede na izhodišče'; };
      if (instant || !hasGsap) { o.p = 1; step(); kpi.rev = rev; kpi.up = up; kstep(); return; }
      gsap.to(o, { p: 1, duration: 1.1, ease: 'expo.out', onUpdate: step });
      gsap.to(kpi, { rev, up, duration: 1.1, ease: 'expo.out', onUpdate: kstep });
    };
    $$('#streams .stream').forEach(s => s.addEventListener('click', () => { const i = +s.dataset.stream; streams[i] = !streams[i]; s.classList.toggle('is-active', streams[i]); update(); }));
    $$('#ttabs button').forEach(b => b.addEventListener('click', () => { $$('#ttabs button').forEach(x => x.classList.remove('is-active')); b.classList.add('is-active'); range = +b.dataset.range; update(); }));
    render(cur);
    if (hasGsap && !reduce) ScrollTrigger.create({ trigger: tchart, start: 'top 80%', once: true, onEnter: () => update() });
    else update(true);
  }

  /* ---------- Bento: data hub and report ---------- */
  const hub = $('#hub');
  if (hub) {
    const W = 700, H = 420, cx = W / 2, cy = H * 0.62;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' }, hub);
    const names = ['SAP', 'SQL Server', 'Oracle', 'Excel', 'PostgreSQL', 'Snowflake', 'Salesforce', 'Google BigQuery', 'MySQL', 'Amazon Redshift', 'CSV', 'R', 'Python'];
    const nodes = names.map((n, i) => {
      const a = Math.PI + (i / (names.length - 1)) * Math.PI;
      const r = i % 2 ? 250 : 300;
      return { n, x: cx + Math.cos(a) * r * 1.05, y: cy + Math.sin(a) * r * 0.78 };
    });
    const links = nodes.map(p => el('path', { d: `M${p.x} ${p.y} Q${(p.x + cx) / 2} ${cy - 10} ${cx} ${cy}`, fill: 'none', stroke: '#F44C34', 'stroke-opacity': .35, 'stroke-width': 1.2 }, svg));
    const pulses = nodes.map(() => el('circle', { r: 3.5, fill: '#F44C34' }, svg));
    nodes.forEach(p => {
      const w = p.n.length * 8.6 + 26;
      const g = el('g', {}, svg);
      el('rect', { x: p.x - w / 2, y: p.y - 17, width: w, height: 34, rx: 10, fill: '#F3F2EE' }, g);
      const t = el('text', { x: p.x, y: p.y + 5, 'text-anchor': 'middle', 'font-family': 'MaisonMono, monospace', 'font-size': 13, fill: '#0D0F12' }, g); t.textContent = p.n;
    });
    el('circle', { cx, cy, r: 46, fill: '#0D0F12' }, svg);
    el('circle', { cx, cy, r: 62, fill: 'none', stroke: '#0D0F12', 'stroke-opacity': .12 }, svg);
    const tt = el('text', { x: cx, y: cy + 5, 'text-anchor': 'middle', 'font-family': 'Maison, sans-serif', 'font-size': 15, fill: '#fff' }, svg); tt.textContent = 'Tableau';
    if (!reduce) {
      const lens = links.map(l => l.getTotalLength());
      const tick = t => {
        pulses.forEach((c, i) => { const p = ((t / 2600) + i * 0.17) % 1; const pt = links[i].getPointAtLength(p * lens[i]); c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.setAttribute('opacity', Math.sin(p * Math.PI)); });
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }
  const report = $('#report');
  if (report) {
    const v = [38, 52, 44, 61, 57, 72, 66, 84, 78, 92];
    report.innerHTML = v.map((h, i) => `<i class="${i === v.length - 1 ? 'hi' : ''}" style="height:${h}%"></i>`).join('');
    if (hasGsap && !reduce) gsap.from($$('i', report), { scaleY: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: report, start: 'top 90%' } });
  }

  /* ---------- Contour line art ---------- */
  $$('svg[data-contour]').forEach(svg => {
    const seed = +svg.dataset.contour, color = svg.dataset.color;
    svg.setAttribute('viewBox', '0 0 400 400'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const g = el('g', {}, svg);
    const cx = 200 + Math.sin(seed) * 40, cy = 210 + Math.cos(seed) * 30;
    for (let k = 1; k <= 26; k++) {
      const r = k * 11, pts = [];
      for (let a = 0; a <= 120; a++) {
        const th = a / 120 * Math.PI * 2;
        const n = Math.sin(th * 3 + seed) * 0.12 + Math.sin(th * 5 - seed * 0.7 + k * 0.15) * 0.06 + Math.cos(th * 2 + k * 0.08) * 0.08;
        pts.push([cx + Math.cos(th) * r * (1 + n), cy + Math.sin(th) * r * (1 + n) * 0.82]);
      }
      el('path', { d: pathFrom(pts) + 'Z', fill: 'none', stroke: color, 'stroke-opacity': k % 5 === 0 ? 0.9 : 0.38, 'stroke-width': k % 5 === 0 ? 1.4 : 0.8 }, g);
    }
    if (hasGsap && !reduce) gsap.fromTo(g, { rotation: -6, transformOrigin: '50% 50%', scale: 1.1 }, { rotation: 6, scale: 1, ease: 'none', scrollTrigger: { trigger: svg, start: 'top bottom', end: 'bottom top', scrub: true, containerAnimation: null } });
  });

  /* ---------- Projects: expanding panels ---------- */
  const panels = $$('[data-panel]');
  if (panels.length) {
    const activate = p => panels.forEach(x => x.classList.toggle('is-active', x === p));
    panels.forEach(p => {
      p.addEventListener('mouseenter', () => matchMedia('(min-width: 901px)').matches && activate(p));
      p.addEventListener('click', () => activate(p));
      p.addEventListener('focus', () => activate(p));
    });
    if (hasGsap && !reduce) gsap.fromTo(panels, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '#panels', start: 'top 85%' } });
  }

  /* ---------- Clients ---------- */
  const clients = $('#clients');
  if (clients) {
    const list = 'krka lek telekom gorenje mercator hse banka_slo sparkase luka slo-zeleznice bsh danfoss renault aramco kolektor trimo jub belinka sava podravka radenska droga ljub-mlekarne medis eta hit-1 intereuropa letrika mehanizmi-iskra kovinoplastika spar nis starkraft telemah financna-uprava purs zdi dui pbi rak st-1 splion tehnounion concero delta at ptuj obcina-idrija ibm-1 sap-1'.split(' ');
    clients.innerHTML = list.map(c => `<div class="client"><img src="assets/clients/${c}.jpg" alt="" loading="lazy"></div>`).join('');
    if (hasGsap && !reduce) gsap.from($$('.client', clients), { opacity: 0, y: 20, duration: 0.8, ease: 'expo.out', stagger: { each: 0.015, from: 'random' }, scrollTrigger: { trigger: clients, start: 'top 85%' } });
  }

  /* ---------- Parallax ---------- */
  if (hasGsap && !reduce) $$('[data-parallax]').forEach(img => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

  /* ---------- Form ---------- */
  $$('[data-form]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    $('.form__ok', f).style.display = 'block';
    $('button[type=submit]', f).style.display = 'none';
  }));

  // fonts can shift layout; refresh triggers once loaded
  if (hasGsap && document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
