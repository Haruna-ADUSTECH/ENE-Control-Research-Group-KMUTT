/* ==========================================================================
   ENE-CRG  |  main.js
   Shared helpers and behaviour used on every page, plus the small pages that
   need a little script: home (research themes and numbers), students (alumni
   list) and contact (mail form).

   Other scripts: counters.js (animated numbers), particles.js (hero network),
   publications.js (publications dashboard and featured papers).
   Load order matters: main.js first, because it creates window.ENE.
   ========================================================================== */
(() => {
  'use strict';

  /* ---- SITE SETTINGS ------------------------------------------------------
   * sampleContent: while true, every page shows a small "sample content"
   * notice. Set it to false once you have replaced the placeholder text,
   * team, contact details and the files in /data. */
  const SETTINGS = { sampleContent: false };

  const ENE = (window.ENE = window.ENE || {});
  ENE.settings = SETTINGS;

  /* ---- Helpers ---------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Object.assign(ENE, { $, $$, esc, reducedMotion });

  const jsonCache = new Map();
  ENE.loadJSON = (url) => {
    if (!jsonCache.has(url)) {
      const p = fetch(url, { cache: 'no-cache' }).then((r) => {
        if (!r.ok) throw new Error(`${url} returned ${r.status}`);
        return r.json();
      });
      p.catch(() => jsonCache.delete(url));
      jsonCache.set(url, p);
    }
    return jsonCache.get(url);
  };

  ENE.errorNotice = (what) => `
    <div class="notice" role="alert">
      <p><strong>Couldn\u2019t load ${esc(what)}.</strong></p>
      <p>The site reads its content from the <code>data/</code> folder, so it has to be served over HTTP.
      GitHub Pages does this automatically. To preview on your computer, run <code>python3 -m http.server</code>
      in the project folder and open <code>http://localhost:8000</code>.</p>
    </div>`;

  ENE.readoutHTML = (items) => items.map((i) => `
    <div class="readout__cell">
      <dt class="readout__label">${esc(i.label)}</dt>
      <dd class="readout__value"><span class="sr-only">${Number(i.value) || 0}</span><span aria-hidden="true" data-count-to="${Number(i.value) || 0}">${Number(i.value) || 0}</span></dd>
    </div>`).join('');

  ENE.formatDate = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  /* ---- Theme ------------------------------------------------------------
   * The inline script in <head> sets data-theme before first paint. */
  function initTheme() {
    const root = document.documentElement;
    const buttons = $$('[data-theme-toggle]');
    const apply = (theme) => {
      root.dataset.theme = theme;
      buttons.forEach((b) => b.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'));
    };
    apply(root.dataset.theme === 'light' ? 'light' : 'dark');
    buttons.forEach((b) => b.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('ene-theme', next); } catch (e) { /* private mode: fine */ }
    }));
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const follow = (e) => {
      try { if (localStorage.getItem('ene-theme')) return; } catch (err) { /* ignore */ }
      apply(e.matches ? 'light' : 'dark');
    };
    if (mq.addEventListener) mq.addEventListener('change', follow);
  }

  /* ---- Header: solid once the dark top band scrolls away; mobile menu ---- */
  function initHeader() {
    const header = $('.site-header');
    if (!header) return;
    const sentinel = $('[data-nav-sentinel]');
    const setSolid = (v) => header.classList.toggle('is-solid', v);
    if (sentinel && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => setSolid(!entry.isIntersecting),
        { rootMargin: `-${header.offsetHeight}px 0px 0px 0px`, threshold: 0 });
      io.observe(sentinel);
    } else {
      setSolid(true);
    }

    const toggle = $('.nav-toggle', header);
    const nav = $('#site-nav');
    if (!toggle || !nav) return;
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    const mq = window.matchMedia('(min-width: 901px)');
    if (mq.addEventListener) mq.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---- Hero video: stay still for people who asked for less motion ------- */
  function initHeroVideo() {
    const video = $('.hero__video');
    if (!video) return;
    const saveData = navigator.connection && navigator.connection.saveData;
    if (reducedMotion() || saveData) {
      video.removeAttribute('autoplay');
      video.pause();
    }
  }

  /* ---- Notice shown while the site still contains sample content --------- */
  function initSampleNotice() {
    if (!SETTINGS.sampleContent) return;
    try { if (sessionStorage.getItem('ene-sample-dismissed')) return; } catch (e) { /* ignore */ }
    const el = document.createElement('div');
    el.className = 'sample-banner';
    el.setAttribute('role', 'note');
    el.innerHTML = `
      <p><strong>Sample content.</strong> Replace the placeholder text and data before you publish. The README lists every place to edit.</p>
      <button type="button" class="sample-banner__close" aria-label="Dismiss this notice">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>`;
    $('button', el).addEventListener('click', () => {
      el.remove();
      try { sessionStorage.setItem('ene-sample-dismissed', '1'); } catch (e) { /* ignore */ }
    });
    (document.querySelector('main') || document.body).appendChild(el);   // inside <main>: keeps every visible element in a landmark
  }

  /* ---- Block diagrams for the research themes -----------------------------
   * Drawn in control-engineering notation: r reference, u input, y output,
   * C controller, P plant, L learning block, tau delay. */
  const head = (x, y, d) => ({
    r: `M${x - 7} ${y - 4}L${x} ${y}L${x - 7} ${y + 4}`,
    l: `M${x + 7} ${y - 4}L${x} ${y}L${x + 7} ${y + 4}`,
    u: `M${x - 4} ${y + 7}L${x} ${y}L${x + 4} ${y + 7}`,
    d: `M${x - 4} ${y - 7}L${x} ${y}L${x + 4} ${y - 7}`,
  })[d];
  const svg = (inner) => `<svg viewBox="0 0 320 160" role="presentation" focusable="false">${inner}</svg>`;

  const DIAGRAMS = {
    /* Feedback loop with a learning block that watches y and adapts C */
    intelligent: () => svg(`
      <path class="dg-line" d="M8 96H48${head(48, 96, 'r')}"/>
      <text class="dg-text dg-text--sm" x="14" y="84">r</text>
      <circle class="dg-node" cx="60" cy="96" r="12"/>
      <text class="dg-text dg-text--sm" x="46" y="84">+</text>
      <text class="dg-text dg-text--sm" x="73" y="120">\u2212</text>
      <path class="dg-line" d="M72 96H104${head(104, 96, 'r')}"/>
      <rect class="dg-block" x="104" y="76" width="56" height="40" rx="3"/>
      <text class="dg-text" x="132" y="96">C</text>
      <path class="dg-line" d="M160 96H196${head(196, 96, 'r')}"/>
      <text class="dg-text dg-text--sm" x="178" y="84">u</text>
      <rect class="dg-block" x="196" y="76" width="56" height="40" rx="3"/>
      <text class="dg-text" x="224" y="96">P</text>
      <path class="dg-line" d="M252 96H312${head(312, 96, 'r')}"/>
      <text class="dg-text dg-text--sm" x="302" y="84">y</text>
      <circle class="dg-fill" cx="280" cy="96" r="3"/>
      <path class="dg-line" d="M280 96V140H60V108${head(60, 108, 'u')}"/>
      <rect class="dg-block" x="104" y="12" width="56" height="32" rx="3"/>
      <text class="dg-text dg-text--sig" x="132" y="28">L</text>
      <path class="dg-sig" d="M132 44V76${head(132, 76, 'd')}"/>
      <path class="dg-line dg-dash" d="M280 96V28H164${head(164, 28, 'l')}"/>`),

    /* Cyber layer over physical layer, with sensing (attacked) and actuation */
    cps: () => {
      let wave = 'M140 126';
      for (let x = 144; x <= 280; x += 4) wave += `L${x} ${(126 + 12 * Math.sin(((x - 140) / 140) * Math.PI * 4)).toFixed(1)}`;
      return svg(`
        <rect class="dg-block" x="24" y="8" width="272" height="52" rx="3"/>
        <text class="dg-text" x="68" y="34">cyber</text>
        <path class="dg-line" d="M150 34L196 20M150 34L196 48M196 20L246 34M196 48L246 34M196 20V48"/>
        <circle class="dg-node" cx="150" cy="34" r="5"/><circle class="dg-node" cx="196" cy="20" r="5"/>
        <circle class="dg-node" cx="196" cy="48" r="5"/><circle class="dg-fill" cx="246" cy="34" r="5.5"/>
        <rect class="dg-block" x="24" y="100" width="272" height="52" rx="3"/>
        <text class="dg-text" x="74" y="126">physical</text>
        <path class="dg-line" d="${wave}"/>
        <path class="dg-line" d="M96 100V60${head(96, 60, 'u')}"/>
        <text class="dg-text dg-text--sm" x="112" y="84">y</text>
        <path class="dg-sig" d="M100 68L92 81H99L92 94"/>
        <path class="dg-line" d="M224 60V100${head(224, 100, 'd')}"/>
        <text class="dg-text dg-text--sm" x="238" y="84">u</text>`);
    },

    /* Agents on a graph; one link is lossy and delayed (tau), a packet in flight */
    networked: () => svg(`
      <path class="dg-line" d="M46 112L108 44M46 112L150 128M108 44L190 72M108 44L150 128M190 72L150 128M190 72L256 36M150 128L280 116M256 36L280 116"/>
      <path class="dg-sig dg-dash" d="M190 72L280 116"/>
      <text class="dg-text dg-text--sig" x="226" y="82">\u03C4</text>
      <circle class="dg-node" cx="46" cy="112" r="9"/><circle class="dg-node" cx="190" cy="72" r="9"/>
      <circle class="dg-node" cx="150" cy="128" r="9"/><circle class="dg-node" cx="256" cy="36" r="9"/>
      <circle class="dg-node" cx="280" cy="116" r="9"/><circle class="dg-fill" cx="108" cy="44" r="9"/>
      <circle class="dg-fill" cx="145" cy="56.6" r="3.5"/>`),
  };

  ENE.diagram = (name) => {
    if (typeof name === 'string' && /[/.]/.test(name)) return `<img src="${esc(name)}" alt="" loading="lazy">`;
    return (DIAGRAMS[name] || DIAGRAMS.networked)();
  };

  /* ---- Degrees: ordering and counting (Ph.D. / PhD / M.S. / MSc ... all work) ---- */
  const DEGREE_RANK = ['phd', 'dphil', 'msc', 'ms', 'meng', 'bsc', 'bs', 'beng'];
  const degreeRank = (d) => { const i = DEGREE_RANK.indexOf(String(d).toLowerCase().replace(/[^a-z]/g, '')); return i < 0 ? 99 : i; };
  const degreeCounts = (list) => {
    const m = new Map();
    list.forEach((g) => { if (g.degree) m.set(g.degree, (m.get(g.degree) || 0) + 1); });
    return [...m].sort((a, b) => degreeRank(a[0]) - degreeRank(b[0]) || a[0].localeCompare(b[0]));
  };

  /* ---- Home: research themes and numbers ---------------------------------- */
  const themeHTML = (a, n) => `
    <article class="theme" style="--h:${Number(a.hue) || 210}">
      <div class="theme__diagram" aria-hidden="true">${ENE.diagram(a.diagram)}</div>
      <h3 class="theme__title">${esc(a.title)}</h3>
      <p class="theme__summary">${esc(a.summary)}</p>
      ${a.keywords && a.keywords.length ? `<p class="theme__keywords">${a.keywords.map(esc).join(', ')}</p>` : ''}
      <a class="theme__link" href="publications.html?area=${encodeURIComponent(a.id)}">${n ? `View ${n} publication${n === 1 ? '' : 's'}` : 'View publications'}</a>
    </article>`;

  async function initHome() {
    const themesEl = $('[data-themes]');
    const readoutEl = $('[data-readout="home"]');
    if (!themesEl && !readoutEl) return;
    const [areasRes, pubsRes, gradsRes] = await Promise.allSettled([
      ENE.loadJSON('data/research-areas.json'),
      ENE.loadJSON('data/publications.json'),
      ENE.loadJSON('data/graduates.json'),
    ]);
    const ok = (r) => r.status === 'fulfilled';
    const areas = ok(areasRes) ? areasRes.value.areas || [] : null;
    const pubs = ok(pubsRes) ? pubsRes.value.publications || [] : null;
    const grads = ok(gradsRes) ? gradsRes.value.graduates || [] : null;

    if (themesEl) {
      if (!areas) {
        themesEl.outerHTML = ENE.errorNotice('the research themes');
      } else {
        const counts = {};
        (pubs || []).forEach((p) => (p.areas || []).forEach((id) => { counts[id] = (counts[id] || 0) + 1; }));
        themesEl.innerHTML = areas.map((a) => themeHTML(a, counts[a.id] || 0)).join('');
      }
    }
    if (readoutEl) {
      if (pubs && grads && areas) {
        const cites = pubs.reduce((sum, p) => sum + (Number(p.citations) || 0), 0);
        const cells = [
          { value: pubs.length, label: 'Publications' },
          cites ? { value: cites, label: 'Citations' } : { value: pubs.filter((p) => p.type === 'journal').length, label: 'Journal articles' },
          ...degreeCounts(grads).slice(0, 2).map(([d, n]) => ({ value: n, label: `${d} graduates` })),
        ];
        if (cells.length < 4) cells.push({ value: areas.length, label: 'Research themes' });
        readoutEl.innerHTML = ENE.readoutHTML(cells);
        if (ENE.counters) ENE.counters.observe(readoutEl);
      } else {
        readoutEl.closest('section').hidden = true;
      }
    }
  }

  /* ---- Students: alumni list ------------------------------------------------ */
  const SECTOR_LABELS = { academia: 'Academia', industry: 'Industry', government: 'Government and public research', study: 'Further study' };

  async function initAlumni() {
    const app = $('[data-alumni]');
    if (!app) return;
    let data;
    try { data = await ENE.loadJSON('data/graduates.json'); } catch (e) { app.innerHTML = ENE.errorNotice('the alumni list'); return; }
    const all = (data.graduates || []).slice();
    const state = { q: '', degree: 'all' };
    const counts = degreeCounts(all);
    const degrees = counts.map(([d]) => d);
    const countDegree = (d) => all.filter((g) => g.degree === d).length;
    const noun = (n) => (n === 1 ? 'entry' : 'entries');

    // One number per degree (a person who earned two degrees counts once for each)
    $('[data-readout]', app).innerHTML = ENE.readoutHTML(counts.length
      ? counts.slice(0, 4).map(([d, n]) => ({ value: n, label: `${d} graduates` }))
      : [{ value: all.length, label: 'Graduates' }]);
    if (ENE.counters) ENE.counters.observe(app);

    // Where graduates go next (only drawn when the data has a sector for people)
    const sectors = Object.entries(all.reduce((m, g) => { if (g.sector) m[g.sector] = (m[g.sector] || 0) + 1; return m; }, {}))
      .sort((a, b) => b[1] - a[1]);
    const sectorEl = $('[data-sector]', app);
    if (sectorEl && sectors.length) {
      const label = ([k]) => SECTOR_LABELS[k] || k;
      const summary = sectors.map((s) => `${label(s)} ${s[1]}`).join(', ');
      sectorEl.innerHTML = `
        <h3 class="sector__title">Where graduates go next</h3>
        <div class="sector__bar" role="img" aria-label="${esc(summary)}">
          ${sectors.map((s, i) => `<span class="sector__seg" style="--n:${s[1]};--c:var(--bar-${Math.min(i + 1, 4)})"></span>`).join('')}
        </div>
        <ul class="sector__legend">
          ${sectors.map((s, i) => `<li><span class="sector__key" style="--c:var(--bar-${Math.min(i + 1, 4)})"></span>${esc(label(s))} ${s[1]}</li>`).join('')}
        </ul>`;
    }

    // Filters
    const chips = $('[data-chips="degree"]', app);
    chips.insertAdjacentHTML('beforeend', [{ v: 'all', l: 'All', n: all.length }, ...degrees.map((d) => ({ v: d, l: d, n: countDegree(d) }))]
      .map((c) => `<button type="button" class="chip" data-degree="${esc(c.v)}" aria-pressed="${c.v === 'all'}">${esc(c.l)} <span class="chip__count">${c.n}</span></button>`).join(''));
    const search = $('[data-alumni-search]', app);
    const list = $('[data-alumni-list]', app);
    const count = $('[data-alumni-count]', app);

    const matches = (g) => {
      if (state.degree !== 'all' && g.degree !== state.degree) return false;
      if (!state.q) return true;
      const hay = [g.name, g.degree, g.year, g.note, g.thesis, g.position, g.organization].join(' ').toLowerCase();
      return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.includes(t));
    };
    const nameOf = (g) => (g.url
      ? `<a href="${esc(g.url)}" target="_blank" rel="noopener">${esc(g.name)}<span class="sr-only"> (opens in a new tab)</span></a>` : esc(g.name));
    const nowOf = (g) => [g.position, g.organization].filter(Boolean).map(esc).join(', ');
    // With a photo: a card, as on the Ph.D. candidates. Without: a compact row.
    const cardHTML = (g) => `<li class="person">
        <div class="avatar avatar--photo"><img src="${esc(g.photo)}" alt="" width="256" height="256" loading="lazy" decoding="async"></div>
        <h4 class="person__name">${nameOf(g)}</h4>
        <p class="person__role">${esc([g.degree, g.year].filter(Boolean).join(', '))}</p>
        ${g.note ? `<p class="person__focus">${esc(g.note)}</p>` : ''}
        ${g.thesis ? `<p class="person__focus"><em>${esc(g.thesis)}</em></p>` : ''}
        ${nowOf(g) ? `<p class="person__focus">Now: ${nowOf(g)}</p>` : ''}
      </li>`;
    const rowHTML = (g) => `<li class="alumnus">
        <div class="alumnus__head"><h4 class="alumnus__name">${nameOf(g)}</h4>${g.degree ? `<span class="tag">${esc(g.degree)}</span>` : ''}${g.note ? `<span class="alumnus__note">${esc(g.note)}</span>` : ''}</div>
        ${g.thesis ? `<p class="alumnus__thesis">${esc(g.thesis)}</p>` : ''}
        ${nowOf(g) ? `<p class="alumnus__now">Now: ${nowOf(g)}</p>` : ''}
      </li>`;
    const render = () => {
      const items = all.filter(matches);
      chips.querySelectorAll('[data-degree]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.degree === state.degree)));
      count.textContent = items.length === all.length ? `${all.length} ${noun(all.length)}` : `${items.length} of ${all.length} ${noun(all.length)} match`;
      if (!items.length) {
        list.innerHTML = `<div class="empty"><p><strong>No graduates match these filters.</strong> Try a different word or choose All.</p>
          <button type="button" class="btn btn--ghost btn--sm" data-alumni-clear>Clear filters</button></div>`;
        return;
      }
      // Entries with no year are listed first, under "Recent"
      const groups = new Map();
      [...items].sort((a, b) => (b.year || 9999) - (a.year || 9999)).forEach((g) => {
        const k = g.year || 'Recent';
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(g);
      });
      list.innerHTML = [...groups].map(([k, gs]) => {
        const cards = gs.filter((g) => g.photo), rows = gs.filter((g) => !g.photo);
        return `<section class="year-group" aria-labelledby="grad-${esc(k)}">
          <h3 class="year-group__label" id="grad-${esc(k)}">${esc(k)}</h3>
          <div class="year-group__body">
            ${cards.length ? `<ul class="lattice people people--compact">${cards.map(cardHTML).join('')}</ul>` : ''}
            ${rows.length ? `<ol class="entry-list">${rows.map(rowHTML).join('')}</ol>` : ''}
          </div>
        </section>`;
      }).join('');
    };

    chips.addEventListener('click', (e) => {
      const b = e.target.closest('[data-degree]');
      if (b) { state.degree = b.dataset.degree; render(); }
    });
    let timer;
    search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = search.value.trim(); render(); }, 120); });
    list.addEventListener('click', (e) => {
      if (e.target.closest('[data-alumni-clear]')) { state.q = ''; state.degree = 'all'; search.value = ''; render(); }
    });
    render();
  }

  /* ---- Contact: builds an email in the visitor's own mail app -------------- */
  function initContact() {
    const form = $('[data-contact-form]');
    if (!form) return;
    const status = $('[data-form-status]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const fd = new FormData(form);
      const to = form.dataset.to;
      const subject = `[${fd.get('topic')}] Message from ${fd.get('name')}`;
      const body = `${fd.get('message')}\n\n\u2014\n${fd.get('name')}\n${fd.get('email')}`;
      status.textContent = `Your email app should open with the message ready to send. If nothing happens, write to ${to} directly.`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* ---- Init ------------------------------------------------------------------ */
  function init() {
    initTheme();
    initHeader();
    initHeroVideo();
    initSampleNotice();
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
    initHome();
    initAlumni();
    initContact();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
