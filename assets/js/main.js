/* =========================================================
   Adebiyi Thompson — portfolio motion (origin-redesign)
   GSAP 3 + ScrollTrigger + CustomEase + Lenis. Original code.
   ========================================================= */
(function () {
  'use strict';
  var root = document.documentElement;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]reduced/.test(location.search);
  var touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (reduced || !hasGsap) root.classList.add('reduced');
  if (touch) root.classList.add('touch');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // year
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- text splitting (keeps nested spans such as .hl) ---------- */
  function split(el) {
    if (el._split) return el._split;
    var words = [], chars = [];
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'word';
            Array.from(part).forEach(function (ch) {
              var c = document.createElement('span'); c.className = 'char'; c.textContent = ch;
              w.appendChild(c); chars.push(c);
            });
            frag.appendChild(w); words.push(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { walk(n); }
      });
    }
    if (!el.getAttribute('aria-label') && !el.closest('[aria-hidden="true"]')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    $$('.word', el).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
    el._split = { words: words, chars: chars };
    return el._split;
  }

  /* ---------- reduced / no-GSAP: wire basics and stop ---------- */
  function basics() {
    // menu
    var btn = $('.menu-btn'), menu = $('#menu');
    if (btn && menu) btn.addEventListener('click', function () {
      var open = !root.classList.contains('menu-open');
      root.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
      if (!hasGsap || reduced) { menu.style.visibility = open ? 'visible' : 'hidden'; menu.style.clipPath = open ? 'inset(0)' : ''; var m = $('.menu-meta'); if (m) m.style.opacity = 1; }
    });
    $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { if (root.classList.contains('menu-open')) btn.click(); }); });
    // faq
    $$('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.parentNode, ans = q.nextElementSibling, open = !item.classList.contains('open');
        $$('.faq.open').forEach(function (o) { if (o !== item) { o.classList.remove('open'); o.firstElementChild.setAttribute('aria-expanded', 'false'); if (hasGsap && !reduced) gsap.to(o.lastElementChild, { height: 0, duration: .6, ease: 'expo.inOut' }); else o.lastElementChild.style.height = '0'; } });
        item.classList.toggle('open', open); q.setAttribute('aria-expanded', open);
        if (hasGsap && !reduced) gsap.to(ans, { height: open ? 'auto' : 0, duration: .7, ease: 'expo.inOut', onComplete: function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); } });
        else ans.style.height = open ? 'auto' : '0';
      });
    });
    // contact form -> mailto
    var form = $('[data-contact-form]');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
      var svcs = $$('input[name="services"]:checked', form).map(function (i) { return i.value; });
      if (!name || !email) { (name ? form.email : form.name).focus(); return; }
      var body = 'Name: ' + name + '\nEmail: ' + email + (svcs.length ? '\nServices: ' + svcs.join(', ') : '') + '\n\n' + msg;
      location.href = 'mailto:susriter@gmail.com?subject=' + encodeURIComponent('Project enquiry from ' + name) + '&body=' + encodeURIComponent(body);
    });
  }
  basics();
  if (reduced || !hasGsap) {
    var pre = $('.preloader'); if (pre) pre.style.display = 'none';
    $$('[data-odo]').forEach(function (o) { o.querySelector('.odo-num').style.display = 'inline'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.CustomEase) { gsap.registerPlugin(CustomEase); CustomEase.create('smooth', 'M0,0 C0.488,0.02 0.467,0.286 0.5,0.5 0.532,0.712 0.58,1 1,1'); }
  var SMOOTH = window.CustomEase ? 'smooth' : 'power3.inOut';

  /* ---------- Lenis ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToTarget(target) { if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 }); else (typeof target === 'number' ? window.scrollTo(0, target) : target.scrollIntoView()); }

  /* ---------- anchor links + page transitions ---------- */
  var tr = $('.transition');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.hasAttribute('data-top') || href === '#top') { e.preventDefault(); scrollToTarget(0); return; }
    if (a.target === '_blank' || /^(mailto:|tel:|https?:)/.test(href) || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var url = new URL(href, location.href);
    if (url.origin !== location.origin) return;
    var samePage = url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
    if (samePage && url.hash) { var t = document.querySelector(url.hash); if (t) { e.preventDefault(); scrollToTarget(t); } return; }
    if (samePage && !url.hash) { e.preventDefault(); scrollToTarget(0); return; }
    e.preventDefault();
    try { sessionStorage.setItem('at-transition', '1'); } catch (err) {}
    gsap.set(tr, { transformOrigin: '50% 100%' });
    gsap.to(tr, { scaleY: 1, duration: .8, ease: 'expo.inOut', onComplete: function () { location.href = url.href; } });
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) { gsap.set(tr, { scaleY: 0 }); } });

  /* ---------- cursor ---------- */
  var cursor = $('.cursor');
  if (!touch && cursor) {
    root.classList.add('has-cursor');
    var dot = $('.cursor-dot'), ring = $('.cursor-ring');
    var dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
    var rx = gsap.quickTo(ring, 'x', { duration: .55, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .55, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { cursor.classList.remove('is-hidden'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); });
    document.addEventListener('mouseover', function (e) { var h = e.target.closest('a,button,[data-thumb],label,.client,.strip-item,[data-prism]'); cursor.classList.toggle('is-hover', !!h && !e.target.closest('[data-cursor="view"]')); cursor.classList.toggle('is-hidden', !!e.target.closest('[data-cursor="view"]')); });
  }

  /* ---------- menu ---------- */
  var menu = $('#menu'), menuTl = null;
  if (menu) {
    menuTl = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
      .set(menu, { visibility: 'visible' })
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9 })
      .fromTo('.menu-links a span', { yPercent: 110 }, { yPercent: 0, duration: .9, stagger: .06, ease: 'expo.out' }, '-=.45')
      .fromTo('.menu-meta', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, '-=.6');
    new MutationObserver(function () {
      var open = root.classList.contains('menu-open');
      if (open) { menuTl.timeScale(1).play(); if (lenis) lenis.stop(); }
      else { menuTl.timeScale(1.6).reverse(); if (lenis) lenis.start(); }
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- generic reveals ---------- */
  function blurIn(targets, trigger, stagger) {
    gsap.from(targets, { opacity: 0, filter: 'blur(16px)', y: 20, duration: 1.1, ease: 'power2.out', stagger: stagger || 0, clearProps: 'filter',
      scrollTrigger: { trigger: trigger, start: 'top 85%', once: true } });
  }
  function initReveals() {
    $$('[data-reveal]').forEach(function (el) { blurIn(el, el); });
    $$('[data-reveal-stagger]').forEach(function (el) { blurIn(el.children, el, .1); });
    $$('[data-split="blur"]').forEach(function (el) {
      var s = split(el);
      var vars = { opacity: 0, filter: 'blur(16px)', duration: .9, ease: 'power2.out', stagger: .035 };
      if (el.hasAttribute('data-split-load')) { vars.delay = introDelay + .2; gsap.from(s.chars, vars); }
      else { vars.scrollTrigger = { trigger: el, start: 'top 85%', once: true }; gsap.from(s.chars, vars); }
    });
    $$('[data-split="highlight"]').forEach(function (el) {
      var s = split(el);
      var hl = $$('.hl .char', el), plain = s.chars.filter(function (c) { return hl.indexOf(c) < 0; });
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%', once: true } });
      tl.from(plain, { opacity: 0, filter: 'blur(16px)', duration: .8, stagger: .012, ease: 'power2.out' }, 0);
      gsap.set(hl, { opacity: 0 });
      tl.to(hl, { scale: 1.4, color: '#ffffff', opacity: 1, duration: .3, ease: 'power3.in', stagger: .025 }, .3)
        .to(hl, { scale: 1, color: '#aaaaaa', duration: .4, ease: 'sine.out', stagger: .025 }, .6);
    });
    $$('[data-split="center"]').forEach(function (el) {
      var s = split(el);
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center-=10%', scrub: true } })
        .from(s.chars, { yPercent: 300, autoAlpha: 0, ease: 'sine.out', stagger: { each: .04, from: 'center' } });
    });
    $$('[data-split="center-load"]').forEach(function (el) {
      var s = split(el); el.style.overflow = 'hidden';
      gsap.from(s.chars, { yPercent: 110, duration: 1.6, ease: 'expo.out', stagger: { each: .06, from: 'center' }, delay: introDelay });
    });
    $$('[data-scrub-words]').forEach(function (el) {
      var s = split(el);
      gsap.to(s.words, { opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });
    $$('[data-parallax]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -10 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-hero-fade]').forEach(function (el, i) { gsap.from(el, { opacity: 0, y: 16, filter: 'blur(10px)', duration: 1.2, ease: 'power2.out', delay: introDelay + .9 + i * .1, clearProps: 'filter' }); });
    var giant = $('[data-giant]');
    if (giant) gsap.fromTo(giant, { yPercent: 60 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: giant.parentNode, start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- hero ---------- */
  function initHero() {
    var rollWrap = $('.hero-roll');
    if (rollWrap) {
      var lines = $$('.hero-roll-line', rollWrap).map(function (l) { return split(l).chars; });
      var all = [].concat.apply([], lines);
      gsap.set(all, { yPercent: 100 });
      var intro = gsap.timeline({ delay: introDelay + .3 });
      intro.to(all, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: { amount: .5 } });
      var loop = gsap.timeline({ repeat: -1, paused: true });
      for (var step = 1; step < lines.length; step++) {
        lines.forEach(function (chars) { loop.to(chars, { yPercent: -100 * step, duration: .9, ease: 'power3.inOut', stagger: { amount: .4 } }, (step - 1) * 2.4 + 1.6); });
      }
      loop.set(all, { yPercent: 0 }, (lines.length - 1) * 2.4 + 1.6);
      intro.add(function () { loop.play(); });
    }
    var thumbs = $$('[data-thumb]'), fulls = $$('[data-full]');
    if (!thumbs.length) return;
    gsap.fromTo(thumbs, { xPercent: 1280 }, { xPercent: 0, duration: 3, stagger: .05, ease: SMOOTH, delay: introDelay });
    var closed = 'polygon(25% 30%, 75% 30%, 75% 70%, 25% 70%)', open = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
    gsap.set(fulls, { autoAlpha: 0, clipPath: closed });
    var current = null;
    function show(i) {
      if (current === i) return;
      if (current !== null) hide(current);
      current = i; var f = fulls[i]; if (!f) return;
      gsap.killTweensOf(f);
      gsap.set(f, { autoAlpha: 0, clipPath: closed, zIndex: 2 });
      gsap.to(f, { clipPath: open, autoAlpha: 1, duration: 1, ease: SMOOTH });
      thumbs.forEach(function (t, j) { gsap.to(t, { scale: j === i ? 1 : .8, duration: .5, ease: SMOOTH }); });
    }
    function hide(i) {
      var f = fulls[i]; if (!f) return;
      gsap.killTweensOf(f); gsap.set(f, { zIndex: 1 });
      gsap.to(f, { clipPath: closed, autoAlpha: 0, duration: .7, ease: SMOOTH });
    }
    thumbs.forEach(function (t, i) {
      t.addEventListener('mouseenter', function () { show(i); });
      t.addEventListener('focus', function () { show(i); });
      t.addEventListener('mouseleave', function () { if (current !== null) hide(current); current = null; gsap.to(thumbs, { scale: 1, duration: .5, ease: SMOOTH }); });
      t.addEventListener('blur', function () { if (current !== null) hide(current); current = null; gsap.to(thumbs, { scale: 1, duration: .5 }); });
    });
    // subtle scroll-out
    gsap.to('.hero-block, .hero-thumbs', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- velocity marquees (band + strips) ---------- */
  function initLoops() {
    var tracks = $$('[data-loop]');
    if (!tracks.length) return;
    var vel = 0;
    var state = tracks.map(function (t) { return { el: t, x: 0, dir: parseFloat(t.getAttribute('data-loop')) || -1, half: t.scrollWidth / 2, speed: t.closest('.band') ? 1.1 : .7, visible: true }; });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) { vel = self.getVelocity(); } });
    window.addEventListener('resize', function () { state.forEach(function (s) { s.half = s.el.scrollWidth / 2; }); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { state.forEach(function (s) { if (s.el === e.target) s.visible = e.isIntersecting; }); }); });
      state.forEach(function (s) { io.observe(s.el); });
    }
    var boost = 0, scrollDir = 1;
    gsap.ticker.add(function (time, dt) {
      var target = Math.min(Math.abs(vel) / 200, 12);
      if (vel !== 0) scrollDir = vel > 0 ? 1 : -1;
      boost += (target - boost) * .08; vel *= .9;
      state.forEach(function (s) {
        if (!s.visible || !s.half) return;
        s.x += s.dir * s.speed * (1 + boost) * scrollDir * dt * .06;
        if (s.x <= -s.half) s.x += s.half; if (s.x > 0) s.x -= s.half;
        s.el.style.transform = 'translate3d(' + s.x + 'px,0,0)';
      });
    });
  }

  /* ---------- services: pinned stack + 3D cube ---------- */
  function initServices() {
    var sec = $('[data-services]'); if (!sec) return;
    var items = $$('[data-svc]', sec), cube = $('[data-cube]', sec), bar = $('[data-svc-bar]', sec), count = $('[data-svc-count]', sec);
    var n = items.length;
    gsap.fromTo(cube, { rotationY: -30, rotationX: -18 }, { rotationY: 330 + 90, rotationX: 22, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    items.forEach(function (it, i) {
      var chars = split($('.svc-title', it)).chars, p = $('.svc-text p', it), num = $('.svc-num', it);
      var at = i * 2;
      tl.fromTo(chars, { yPercent: 120, opacity: 0, filter: 'blur(12px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: .8, stagger: .03 }, at)
        .fromTo([num, p], { opacity: 0, y: 24, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8, stagger: .08 }, at + .15);
      if (i < n - 1) tl.to(chars, { yPercent: -120, opacity: 0, filter: 'blur(12px)', duration: .7, stagger: .02, ease: 'power3.in' }, at + 1.5)
                      .to([num, p], { opacity: 0, y: -24, filter: 'blur(10px)', duration: .6, ease: 'power3.in' }, at + 1.5);
    });
    tl.to({}, { duration: .6 });
    ScrollTrigger.create({ trigger: sec, start: 'top 25%', end: 'bottom bottom', scrub: .6, animation: tl,
      onUpdate: function (self) { if (bar) gsap.set(bar, { scaleX: self.progress }); if (count) count.textContent = String(Math.min(n, Math.floor(self.progress * n) + 1)).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'); } });
  }

  /* ---------- works: clip-path morph + curved text marquee + tag ---------- */
  function initWorks() {
    $$('[data-work]').forEach(function (w) {
      var media = $('.work-media', w), img = $('img', media), tp = $('[data-textpath]', w), tag = $('[data-work-tag]', w);
      gsap.set(media, { clipPath: 'polygon(25% 25%, 75% 40%, 100% 100%, 0% 100%)' });
      var tl = gsap.timeline({ defaults: { ease: 'none' } })
        .to(media, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' })
        .to(media, { clipPath: 'polygon(0% 0%, 100% 0%, 75% 60%, 25% 75%)' });
      ScrollTrigger.create({ trigger: w, start: 'top bottom', end: 'bottom top', scrub: .5, animation: tl, invalidateOnRefresh: true });
      var info = $('.work-info', w);
      if (info && window.innerWidth <= 767) blurIn(info, info);
      if (info && window.innerWidth > 767) gsap.timeline({ scrollTrigger: { trigger: w, start: 'top 65%', end: 'bottom 75%', scrub: .4 } })
        .fromTo(info, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .25, ease: 'power2.out' })
        .to(info, { opacity: 1, duration: .5 })
        .to(info, { opacity: 0, y: -30, duration: .25, ease: 'power2.in' });
      gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: true } });
      // curved text
      if (tp) {
        var st = { scroll: 0, drift: 0, speed: 0, target: 0, unit: 0 };
        var measure = function () { try { st.unit = tp.getComputedTextLength() / 14; } catch (e) { st.unit = 0; } };
        measure(); window.addEventListener('resize', measure);
        var render = function () {
          if (!st.unit) return;
          var total = st.scroll + st.drift;
          var off = -(((-total) % st.unit) + st.unit) % st.unit;
          tp.setAttribute('startOffset', off - st.unit);
        };
        gsap.to(st, { scroll: -1515 * 0.82, ease: 'none', onUpdate: render, scrollTrigger: { trigger: w, start: 'top bottom', end: '+=1200', scrub: 1.1 } });
        gsap.ticker.add(function (t, dt) { st.speed += (st.target - st.speed) * .06; if (Math.abs(st.speed) > .01) { st.drift -= st.speed * dt * .25; render(); } });
        media.addEventListener('mouseenter', function () { st.target = 1; });
        media.addEventListener('mouseleave', function () { st.target = 0; });
        render();
      }
      // follow tag
      if (tag && !touch) {
        var xTo = gsap.quickTo(tag, 'x', { duration: .8, ease: 'power3' }), yTo = gsap.quickTo(tag, 'y', { duration: .8, ease: 'power3' });
        gsap.set(tag, { xPercent: -50, yPercent: -50 });
        media.addEventListener('mouseenter', function (e) { var r = w.getBoundingClientRect(); gsap.set(tag, { x: e.clientX - r.left, y: e.clientY - r.top }); gsap.to(tag, { opacity: 1, scale: 1, duration: .4 }); });
        media.addEventListener('mouseleave', function () { gsap.to(tag, { opacity: 0, scale: .8, duration: .4 }); });
        media.addEventListener('mousemove', function (e) { var r = w.getBoundingClientRect(); xTo(e.clientX - r.left); yTo(e.clientY - r.top); });
      }
    });
  }

  /* ---------- odometer counters ---------- */
  function initOdometers() {
    $$('[data-odo]').forEach(function (o) {
      var val = o.getAttribute('data-odo'), num = $('.odo-num', o);
      var holder = document.createElement('span'); holder.style.display = 'flex'; holder.setAttribute('aria-hidden', 'true');
      var cols = [];
      Array.from(val).forEach(function (d, i) {
        var col = document.createElement('span'); col.className = 'odo-col';
        var html = ''; for (var k = 0; k < 20; k++) html += '<span>' + (k % 10) + '</span>';
        col.innerHTML = html; holder.appendChild(col); cols.push({ el: col, d: parseInt(d, 10) });
      });
      num.replaceWith(holder);
      var line = o.parentNode.querySelector('.metric-line i');
      var tl = gsap.timeline({ scrollTrigger: { trigger: o, start: 'top 85%', once: true } });
      cols.forEach(function (c, i) { tl.fromTo(c.el, { yPercent: 0 }, { yPercent: -((10 + c.d) / 20) * 100, duration: 2.4 + i * .35, ease: 'expo.inOut' }, 0); });
      if (line) tl.to(line, { scaleX: 1, duration: 1.6, ease: 'expo.inOut' }, .2);
    });
  }

  /* ---------- apps glow ---------- */
  function initGlow() {
    $$('[data-glow]').forEach(function (c) {
      c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
  }

  /* ---------- process hover image ---------- */
  function initSteps() {
    var box = $('[data-hover-img]'), steps = $('[data-steps]');
    if (!box || !steps || touch) return;
    var imgs = $$('img', box);
    var xTo = gsap.quickTo(box, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(box, 'y', { duration: .6, ease: 'power3' });
    var rTo = gsap.quickTo(box, 'rotation', { duration: .8, ease: 'power3' });
    var lastX = 0;
    steps.addEventListener('mouseenter', function (e) { gsap.set(box, { x: e.clientX + 24, y: e.clientY - 96 }); gsap.to(box, { opacity: 1, scale: 1, duration: .5, ease: 'power3.out' }); });
    steps.addEventListener('mouseleave', function () { gsap.to(box, { opacity: 0, scale: .6, duration: .4, ease: 'power3.in' }); });
    steps.addEventListener('mousemove', function (e) { xTo(e.clientX + 24); yTo(e.clientY - 96); rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * .6)); lastX = e.clientX; });
    $$('.step', steps).forEach(function (s, i) { s.addEventListener('mouseenter', function () { imgs.forEach(function (im, j) { im.classList.toggle('on', i === j); }); }); });
  }

  /* ---------- CTA grid (pinned 3D fly-in) ---------- */
  function initCTA() {
    $$('.cta-pin').forEach(function (pin) {
      var imgs = $$('[data-cta-img]', pin).filter(function (el) { return el.offsetParent !== null; });
      var title = $('[data-cta-title]', pin), btns = $$('[data-cta-btn]', pin), overlay = $('[data-cta-overlay]', pin);
      var chars = split(title).chars;
      gsap.timeline({ defaults: { ease: 'sine.inOut' }, scrollTrigger: { trigger: pin, start: 'top top', end: '+=220%', pin: true, scrub: .3, anticipatePin: 1 } })
        .from(imgs, { y: function () { return window.innerHeight; }, rotationX: 70, z: 900, transformOrigin: '50% 0%', autoAlpha: 0, stagger: { amount: .4, from: 'random' } })
        .from(overlay, { opacity: 0 }, '>')
        .from(chars, { yPercent: 300, autoAlpha: 0, stagger: { each: .02, from: 'random' } }, '<')
        .from(btns, { opacity: 0, yPercent: 40, stagger: .1 }, '>');
    });
  }

  /* ---------- studio: draggable hexagonal prism ---------- */
  function initPrism() {
    var prism = $('[data-prism]'); if (!prism) return;
    var faces = $$('figure', prism), n = faces.length;
    var layout = function () {
      var w = prism.offsetWidth, r = (w / 2) / Math.tan(Math.PI / n) + 2;
      faces.forEach(function (f, i) { f.style.transform = 'rotateY(' + (i * 360 / n) + 'deg) translateZ(' + r + 'px)'; });
    };
    layout(); window.addEventListener('resize', layout);
    gsap.from(prism, { scale: .2, rotationX: 40, opacity: 0, duration: 2.2, ease: 'expo.out', delay: introDelay + .2 });
    var rot = { y: 0 }, auto = true, dragging = false, startX = 0, startY = 0, vel = 0;
    var apply = function () { prism.style.transform = 'rotateX(-8deg) rotateY(' + rot.y + 'deg)'; };
    gsap.ticker.add(function (t, dt) { if (!dragging) { rot.y += (auto ? .012 * dt : 0) + vel; vel *= .94; } apply(); });
    prism.addEventListener('pointerdown', function (e) { dragging = true; startX = e.clientX; startY = e.clientY; prism.setPointerCapture(e.pointerId); });
    prism.addEventListener('pointermove', function (e) { if (!dragging) return; var d = e.clientX - startX; startX = e.clientX; rot.y += d * .25; vel = d * .25; });
    var end = function () { dragging = false; };
    prism.addEventListener('pointerup', end); prism.addEventListener('pointercancel', end);
    gsap.to('.prism-wrap', { yPercent: -20, opacity: .3, ease: 'none', scrollTrigger: { trigger: '.studio-hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- studio: horizontal scroll text with flying chars ---------- */
  function initScrollText() {
    var sec = $('[data-scroll-sec]'), text = $('[data-scroll-text]'); if (!sec || !text) return;
    var chars = split(text).chars;
    var init = chars.map(function () { return Math.random() < .5 ? 128 : -128; });
    gsap.set(chars, { y: function (i) { return init[i]; }, opacity: 0 });
    var offs = [];
    var measure = function () { offs = chars.map(function (c) { return c.offsetLeft + c.offsetWidth / 2; }); };
    measure(); window.addEventListener('resize', measure);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: function (self) {
        var vw = window.innerWidth, tw = text.offsetWidth;
        var x = vw - self.progress * (vw + tw + 40);
        text.style.transform = 'translate3d(' + x + 'px,-50%,0)';
        chars.forEach(function (c, i) {
          var sx = x + offs[i];
          var p = gsap.utils.clamp(0, 1, (vw * .95 - sx) / (vw * .3));
          c.style.transform = 'translate3d(0,' + (init[i] * (1 - p)) + 'px,0)'; c.style.opacity = p;
        });
      } });
    gsap.fromTo('.scroll-img', { scale: .8 }, { scale: 1.05, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- intro (preloader or transition) ---------- */
  var introDelay = 0;
  var pre = $('.preloader'), panel = $('.preloader-panel'), logo = $('.preloader-logo'), countEl = $('.preloader-count'), page = $('.page');
  var fromTransition = false;
  try { fromTransition = sessionStorage.getItem('at-transition') === '1'; sessionStorage.removeItem('at-transition'); } catch (e) {}
  var seen = false; try { seen = sessionStorage.getItem('at-seen') === '1'; sessionStorage.setItem('at-seen', '1'); } catch (e) {}
  if (lenis) lenis.stop();
  if (!seen && !fromTransition) {
    introDelay = 2.2;
    gsap.set(page, { clipPath: 'polygon(9% 90%, 90% 90%, 90% 90%, 9% 90%)' });
    var c = { v: 0 };
    gsap.to(logo, { opacity: 1, duration: 1.2, ease: 'power2.out' });
    gsap.to(c, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: function () { countEl.textContent = String(Math.round(c.v)).padStart(3, '0'); } });
    gsap.to(panel, { scaleY: 0, duration: 1.5, delay: 1.5, ease: 'expo.inOut' });
    gsap.to([logo, countEl], { opacity: 0, duration: .3, delay: 1.7 });
    gsap.to(page, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 2, delay: 1, ease: 'expo.inOut', onComplete: function () { gsap.set(page, { clearProps: 'clipPath' }); } });
    gsap.set(pre, { autoAlpha: 0, delay: 3 });
    gsap.delayedCall(2.4, function () { if (lenis) lenis.start(); });
  } else {
    introDelay = .55;
    gsap.set(pre, { autoAlpha: 0 });
    gsap.set(tr, { scaleY: 1, transformOrigin: '50% 0%' });
    gsap.to(tr, { scaleY: 0, duration: .9, ease: 'expo.inOut', delay: .05 });
    gsap.delayedCall(.5, function () { if (lenis) lenis.start(); });
  }

  /* ---------- boot ---------- */
  function boot() {
    initHero(); initReveals(); initLoops(); initServices(); initWorks(); initOdometers(); initGlow(); initSteps(); initCTA(); initPrism(); initScrollText();
    if (location.hash) { var t = document.querySelector(location.hash); if (t) gsap.delayedCall(introDelay + .3, function () { scrollToTarget(t); }); }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
})();
