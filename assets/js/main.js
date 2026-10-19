(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Thanh tiến độ + header thu gọn + nút lên đầu trang
  var bar = d.querySelector('.progress i');
  var header = d.querySelector('.site-header');
  var totop = d.querySelector('.totop');
  var art = d.querySelector('.hero-art');
  var ticking = false;
  function onScroll() {
    var y = w.pageYOffset || d.documentElement.scrollTop;
    var h = d.documentElement.scrollHeight - w.innerHeight;
    if (bar) bar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    if (header) header.classList.toggle('is-small', y > 40);
    if (totop) totop.classList.toggle('show', y > 600);
    if (art && !reduce && y < 900) art.style.setProperty('--py', (y * 0.06).toFixed(1) + 'px');
    ticking = false;
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; w.requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (totop) totop.addEventListener('click', function () { w.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  // Menu di động + dropdown
  var burger = d.querySelector('.burger');
  var nav = d.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
      d.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('open')) {
        nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); d.body.style.overflow = '';
      }
    });
  }
  d.querySelectorAll('.dd > .dd-toggle').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var dd = b.parentElement, open = dd.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  d.addEventListener('click', function (e) {
    d.querySelectorAll('.dd.open').forEach(function (dd) { if (!dd.contains(e.target)) { dd.classList.remove('open'); dd.querySelector('.dd-toggle').setAttribute('aria-expanded', 'false'); } });
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      d.querySelectorAll('.dd.open').forEach(function (dd) { dd.classList.remove('open'); dd.querySelector('.dd-toggle').setAttribute('aria-expanded', 'false'); });
      if (nav && nav.classList.contains('open')) burger.click();
    }
  });

  // Hiện dần khi cuộn
  var rv = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  // Đếm số
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  var counters = d.querySelectorAll('[data-count]');
  function runCount(el) {
    var end = parseFloat(el.getAttribute('data-count')), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = pre + fmt(end) + suf; return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(end * e) + suf;
      if (p < 1) w.requestAnimationFrame(step);
    }
    w.requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in w) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  // Tab lọc bài viết
  var tabs = d.querySelectorAll('.tab');
  if (tabs.length) {
    var cards = d.querySelectorAll('.post-card');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-tab');
        tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        cards.forEach(function (c) {
          var show = k === 'all' || c.getAttribute('data-tab') === k;
          c.hidden = !show;
          if (show) { c.classList.remove('in'); void c.offsetWidth; c.classList.add('in'); }
        });
      });
    });
  }

  // Mục lục: trên máy tính luôn mở, trên điện thoại có thể thu gọn
  var tocD = d.querySelector('.toc details');
  if (tocD && w.matchMedia) {
    var tmq = w.matchMedia('(max-width: 1100px)');
    tocD.querySelector('summary').addEventListener('click', function (e) { if (!tmq.matches) e.preventDefault(); });
  }

  // Mục lục có scroll-spy
  var tocLinks = d.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in w) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('on'); });
          var a = map[en.target.id]; if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-90px 0px -65% 0px' });
    d.querySelectorAll('.article h2[id]').forEach(function (h) { so.observe(h); });
  }

  // Slide banner đầu trang: tự chuyển, dừng khi rê chuột/focus/chạm, vuốt để đổi, ngừng khi tab ẩn
  d.querySelectorAll('.bn').forEach(function (bn) {
    var slides = bn.querySelectorAll('.bn-slide');
    var dots = bn.querySelectorAll('.bn-dots button');
    var n = slides.length, cur = 0, timer = null, ms = parseInt(bn.getAttribute('data-autoplay'), 10) || 5500;
    bn.style.setProperty('--bn-t', ms + 'ms');
    function show(i) {
      cur = (i + n) % n;
      slides.forEach(function (s, k) {
        var on = k === cur;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        s.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      });
      dots.forEach(function (b, k) { b.classList.toggle('on', k === cur); b.setAttribute('aria-selected', k === cur ? 'true' : 'false'); });
      if (bn.classList.contains('playing')) { bn.classList.remove('playing'); void bn.offsetWidth; bn.classList.add('playing'); }
    }
    function stop() { clearTimeout(timer); bn.classList.add('paused'); }
    function play() {
      if (reduce) return;
      clearTimeout(timer); bn.classList.remove('paused'); bn.classList.add('playing');
      timer = setTimeout(function () { show(cur + 1); play(); }, ms);
    }
    function restart() { bn.classList.remove('playing'); play(); }
    bn.querySelector('.prev').addEventListener('click', function () { show(cur - 1); restart(); });
    bn.querySelector('.next').addEventListener('click', function () { show(cur + 1); restart(); });
    dots.forEach(function (b, k) { b.addEventListener('click', function () { show(k); restart(); }); });
    bn.addEventListener('mouseenter', stop);
    bn.addEventListener('mouseleave', function () { restart(); });
    bn.addEventListener('focusin', stop);
    bn.addEventListener('focusout', function () { restart(); });
    var x0 = null;
    bn.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    bn.addEventListener('touchend', function (e) {
      if (x0 !== null) { var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); }
      x0 = null; restart();
    });
    d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else restart(); });
    play();
  });

  // Hiệu ứng gợn sóng khi bấm nút
  d.addEventListener('click', function (e) {
    var b = e.target.closest('.btn, .tab, .seg button');
    if (!b || reduce) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    var sp = d.createElement('span');
    sp.className = 'ripple';
    sp.style.width = sp.style.height = s + 'px';
    sp.style.left = (e.clientX - r.left - s / 2) + 'px';
    sp.style.top = (e.clientY - r.top - s / 2) + 'px';
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    b.style.overflow = 'hidden';
    b.appendChild(sp);
    setTimeout(function () { sp.remove(); }, 650);
  });
})();
