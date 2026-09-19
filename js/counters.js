/* ==========================================================================
   ENE-CRG  |  counters.js
   Counts numbers up from zero the first time they scroll into view.
   Markup: <dd><span class="sr-only">18</span><span aria-hidden="true" data-count-to="18">18</span></dd>
   The real value is always in the page for screen readers and no-script; only
   the visual copy counts up.
   Optional: data-count-decimals, data-count-prefix, data-count-suffix.
   ========================================================================== */
(() => {
  'use strict';
  const ENE = (window.ENE = window.ENE || {});
  const seen = new WeakSet();
  let io = null;

  const format = (el, v) => {
    const d = Number(el.dataset.countDecimals) || 0;
    return (el.dataset.countPrefix || '')
      + v.toLocaleString((window.ENE && window.ENE.locale) || undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
      + (el.dataset.countSuffix || '');
  };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const still = () => (ENE.reducedMotion ? ENE.reducedMotion() : false);

  function run(el) {
    const to = parseFloat(el.dataset.countTo);
    if (!Number.isFinite(to)) return;
    if (still()) { el.textContent = format(el, to); return; }
    const dur = Math.min(1500, 700 + Math.abs(to) * 12);
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = format(el, p < 1 ? to * easeOut(p) : to);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function observe(root = document) {
    const els = Array.from(root.querySelectorAll('[data-count-to]')).filter((el) => !seen.has(el));
    els.forEach((el) => seen.add(el));
    if (!('IntersectionObserver' in window)) return;   // final values are already in the markup
    io = io || new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { obs.unobserve(e.target); run(e.target); } });
    }, { threshold: 0.6 });
    els.forEach((el) => {
      if (!still()) el.textContent = format(el, 0);
      io.observe(el);
    });
  }

  ENE.counters = { observe };
  const start = () => observe(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
