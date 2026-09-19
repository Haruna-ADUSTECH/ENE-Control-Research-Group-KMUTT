/* ==========================================================================
   ENE-CRG  |  publications.js
   1. Publications dashboard (publications.html): totals, a per-year chart whose
      bars are buttons, search, filters, sorting, abstracts, BibTeX copy, and
      links you can share (filters live in the URL: ?area=...&type=...&year=...).
   2. Featured papers on the home page ([data-featured-publications]).
   Data comes from data/publications.json and data/research-areas.json.
   ========================================================================== */
(() => {
  'use strict';
  const ENE = window.ENE;
  if (!ENE) return;
  const { $, esc } = ENE;

  const PAGE_SIZE = 20;
  const TYPE_KEYS = ['journal', 'conference', 'preprint', 'book-chapter', 'thesis', 'patent', 'report'];
  const TYPE_ORDER = ['journal', 'conference', 'preprint', 'book-chapter'];
  const typeLabel = (t) => (TYPE_KEYS.includes(t) ? ENE.t(`type.${t}`) : (t ? t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' ') : ENE.t('type.publication')));
  const typeGroup = (t) => (t === 'journal' || t === 'conference' ? t : 'other');
  const STOP = new Set(['a', 'an', 'the', 'of', 'on', 'for', 'in', 'and', 'with', 'under', 'via', 'to', 'using', 'from', 'by', 'at']);
  const pid = (p) => String(p.id !== undefined && p.id !== '' ? p.id : p.title);   // what ?id= holds on the paper page
  const slug = (s) => String(s).replace(/[^\w-]+/g, '-');
  const authorList = (a = []) => (a.length < 3 ? a.join(' and ') : `${a.slice(0, -1).join(', ')}, and ${a[a.length - 1]}`);

  /* ---- BibTeX ---------------------------------------------------------------- */
  function bibtex(p) {
    const surname = ((p.authors && p.authors[0]) || 'anon').split(/\s+/).pop().replace(/[^A-Za-z]/g, '').toLowerCase() || 'anon';
    const word = (p.title || '').split(/\s+/).map((w) => w.replace(/[^A-Za-z]/g, '').toLowerCase())
      .find((w) => w.length > 2 && !STOP.has(w)) || 'paper';
    const kind = { journal: 'article', conference: 'inproceedings', 'book-chapter': 'incollection' }[p.type] || 'misc';
    const venueField = { article: 'journal', inproceedings: 'booktitle', incollection: 'booktitle' }[kind] || 'howpublished';
    const pages = p.pages ? String(p.pages).replace(/[\u2013\u2014]/g, '--') : (p.article ? `Art. no. ${p.article}` : '');
    const rows = [
      ['author', (p.authors || []).join(' and ')],
      ['title', `{${p.title}}`],
      [venueField, p.venue],
      ['volume', p.volume],
      ['number', p.issue],
      ['pages', pages],
      ['year', p.year],
      ['doi', p.doi],
      ['note', p.status],
    ].filter(([, v]) => v);
    return `@${kind}{${surname}${p.year || ''}${word},\n${rows.map(([k, v]) => `  ${k} = {${v}}`).join(',\n')}\n}`;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) { /* fall through to the legacy path */ }
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  /* Venue line: "Journal, vol. 10, no. 2, pp. 5-9, 2022" (any part can be missing) */
  function venueHTML(p) {
    const bits = [];
    if (p.volume) bits.push(`vol. ${esc(p.volume)}`);
    if (p.issue) bits.push(`no. ${esc(p.issue)}`);
    if (p.pages) bits.push(`${/[\u2013-]/.test(p.pages) ? 'pp.' : 'p.'} ${esc(p.pages)}`);
    else if (p.article) bits.push(`art. no. ${esc(p.article)}`);
    if (p.status) bits.push(esc(String(p.status).toLowerCase()));
    if (p.year) bits.push(esc(p.year));
    return `${esc(p.venue || '')}${bits.length ? `<span>${p.venue ? ', ' : ''}${bits.join(', ')}</span>` : ''}`;
  }

  /* ---- One publication ------------------------------------------------------------ */
  function pubHTML(p, areasById, { compact = false } = {}) {
    const uid = slug(p.id || p.title);
    const ext = ' target="_blank" rel="noopener"';
    const hint = `<span class="sr-only">${esc(ENE.t('newtab'))}</span>`;
    const L = ENE.lang === 'en' ? '' : ' lang="en"';   // titles, authors and venues stay in English on the Thai pages
    const title = `<a href="paper.html?id=${encodeURIComponent(pid(p))}">${esc(p.title)}</a>`;   // opens the paper's page here; that page links on to the publisher
    const areaTags = (p.areas || []).map((id) => areasById[id]).filter(Boolean)
      .map((a) => `<span class="pub__tag" style="--h:${Number(a.hue) || 210}">${esc(ENE.pick(a.title))}</span>`).join('');
    const n = Number(p.citations);   // shown only when there is at least one; links to the Scopus record when known
    const cited = n > 0
      ? (p.scopus
        ? `<a class="pub__cited" href="${esc(p.scopus)}"${ext} title="${esc(ENE.t('cited.title', { n }))}">${esc(ENE.t('cited', { n }))}<span class="sr-only">${esc(ENE.t('cited.sr'))}</span></a>`
        : `<span class="pub__cited">${esc(ENE.t('cited', { n }))}</span>`)
      : '';

    let actions = '';
    let abstract = '';
    if (!compact) {
      const buttons = [
        p.abstract ? `<button type="button" class="link-btn" data-action="abstract" aria-expanded="false" aria-controls="abs-${uid}">${esc(ENE.t('abstract'))}</button>` : '',
        p.doi ? `<a class="link-btn" href="https://doi.org/${esc(p.doi)}"${ext}>DOI${hint}</a>` : '',
        p.pdf ? `<a class="link-btn" href="${esc(ENE.url(p.pdf))}"${ext}>PDF${hint}</a>` : '',
        `<button type="button" class="link-btn" data-action="bibtex" data-id="${esc(p.id)}">${esc(ENE.t('copyBib'))}</button>`,
      ].join('');
      actions = `<div class="pub__actions">${buttons}</div>`;
      if (p.abstract) {
        abstract = `<div class="pub__abstract" id="abs-${uid}" hidden><p${L}>${esc(p.abstract)}</p>
          ${p.keywords && p.keywords.length ? `<p class="keywords">${esc(ENE.t('keywords'))} ${p.keywords.map(esc).join(', ')}</p>` : ''}</div>`;
      }
    }
    const h = compact ? 'h3' : 'h4';
    return `<article class="pub">
      <${h} class="pub__title"${L}>${title}</${h}>
      <p class="pub__authors"${L}>${esc(authorList(p.authors))}</p>
      <p class="pub__venue"${L}>${venueHTML(p)}</p>
      <div class="pub__tags"><span class="tag">${esc(typeLabel(p.type))}</span>${areaTags}${cited}</div>
      ${actions}${abstract}
    </article>`;
  }

  async function loadAll() {
    const [pRes, aRes] = await Promise.allSettled([ENE.loadJSON('data/publications.json'), ENE.loadJSON('data/research-areas.json')]);
    if (pRes.status !== 'fulfilled') throw pRes.reason;
    const pubs = (pRes.value.publications || []).map((p) => ({ ...p, year: parseInt(p.year, 10) || 0 }));
    const areas = aRes.status === 'fulfilled' ? (aRes.value.areas || []).slice() : [];
    const areasById = Object.fromEntries(areas.map((a) => [a.id, a]));
    pubs.forEach((p) => (p.areas || []).forEach((id) => {   // an area id used but not defined still gets a label
      if (!areasById[id]) {
        areasById[id] = { id, title: id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()), hue: 210 };
        areas.push(areasById[id]);
      }
    }));
    return { pubs, meta: pRes.value.meta || {}, areas, areasById };
  }

  /* ---- Dashboard --------------------------------------------------------------------- */
  async function initDashboard(app) {
    let data;
    try { data = await loadAll(); } catch (e) { app.innerHTML = ENE.errorNotice('err.pubs'); return; }
    const { pubs, meta, areas, areasById } = data;
    const byId = new Map(pubs.map((p) => [String(p.id), p]));
    const yearsAll = [...new Set(pubs.map((p) => p.year).filter(Boolean))].sort((a, b) => b - a);
    const typeRank = (t) => { const i = TYPE_ORDER.indexOf(t); return i < 0 ? 99 : i; };
    const types = [...new Set(pubs.map((p) => p.type).filter(Boolean))].sort((a, b) => typeRank(a) - typeRank(b) || a.localeCompare(b));
    const usedAreas = areas.filter((a) => pubs.some((p) => (p.areas || []).includes(a.id)));
    const countBy = (fn) => pubs.filter(fn).length;

    const el = {
      readout: $('[data-readout]', app), chart: $('[data-chart]', app), form: $('[data-toolbar]', app),
      q: $('[name="q"]', app), year: $('[name="year"]', app), sort: $('[name="sort"]', app),
      typeChips: $('[data-chips="type"]', app), areaChips: $('[data-chips="area"]', app),
      clear: $('.toolbar__clear', app), count: $('[data-count]', app), list: $('[data-list]', app),
      more: $('[data-more]', app), status: $('[data-status]', app),
    };
    const updated = $('[data-updated]');
    if (updated && meta.updated && ENE.formatDate(meta.updated)) updated.textContent = meta.source ? ENE.t('updated.from', { source: meta.source, date: ENE.formatDate(meta.updated) }) : ENE.t('updated', { date: ENE.formatDate(meta.updated) });

    /* Totals */
    const cites = pubs.reduce((s, p) => s + (Number(p.citations) || 0), 0);
    el.readout.innerHTML = ENE.readoutHTML([
      { value: pubs.length, label: ENE.t('lbl.publications') },
      { value: countBy((p) => p.type === 'journal'), label: ENE.t('lbl.journal') },
      { value: countBy((p) => p.type === 'conference'), label: ENE.t('lbl.conference') },
      cites ? { value: cites, label: ENE.t('lbl.citations') } : { value: areas.length, label: ENE.t('lbl.themes') },
    ]);
    if (ENE.counters) ENE.counters.observe(el.readout);

    /* State, seeded from the URL so filtered views can be shared */
    const params = new URLSearchParams(location.search);
    const pick = (key, allowed, fallback = 'all') => { const v = params.get(key); return v && allowed.includes(v) ? v : fallback; };
    const state = {
      q: (params.get('q') || '').slice(0, 200),
      type: pick('type', types),
      area: pick('area', areas.map((a) => a.id)),
      year: pick('year', yearsAll.map(String)),
      sort: pick('sort', ['newest', 'oldest', 'cited'], 'newest'),
      shown: PAGE_SIZE,
    };

    /* Controls */
    el.year.insertAdjacentHTML('beforeend', yearsAll.map((y) => `<option value="${y}">${y}</option>`).join(''));
    const chip = (attr, value, label, n, hue) => `<button type="button" class="chip" data-${attr}="${esc(value)}" aria-pressed="false"${hue != null ? ` style="--h:${Number(hue) || 210}"` : ''}>${hue != null ? '<span class="chip__dot"></span>' : ''}${esc(label)} <span class="chip__count">${n}</span></button>`;
    el.typeChips.insertAdjacentHTML('beforeend', chip('type', 'all', ENE.t('all'), pubs.length)
      + types.map((t) => chip('type', t, typeLabel(t), countBy((p) => p.type === t))).join(''));
    el.areaChips.insertAdjacentHTML('beforeend', chip('area', 'all', ENE.t('allThemes'), pubs.length)
      + usedAreas.map((a) => chip('area', a.id, ENE.pick(a.title), countBy((p) => (p.areas || []).includes(a.id)), a.hue)).join(''));
    if (!pubs.some((p) => Number(p.citations))) $('option[value="cited"]', el.sort)?.remove();
    if (usedAreas.length < 2) el.areaChips.hidden = true;

    /* Chart: publications per year, stacked by type */
    const dated = pubs.filter((p) => p.year);
    if (dated.length) {
      const y0 = Math.min(...dated.map((p) => p.year)), y1 = Math.max(...dated.map((p) => p.year));
      const cols = [];
      for (let y = y0; y <= y1; y++) {
        const list = dated.filter((p) => p.year === y);
        cols.push({ y, n: list.length, g: list.reduce((m, p) => { m[typeGroup(p.type)]++; return m; }, { journal: 0, conference: 0, other: 0 }) });
      }
      const peak = Math.max(...cols.map((c) => c.n));
      const axis = Math.max(2, Math.ceil(peak / 2) * 2);
      const mean = dated.length / cols.length;
      const present = ['journal', 'conference', 'other'].filter((g) => cols.some((c) => c.g[g]));
      const GLABEL = { journal: ENE.t('chart.journal'), conference: ENE.t('chart.conference'), other: ENE.t('chart.other') };
      const GVAR = { journal: '--bar-1', conference: '--bar-2', other: '--bar-3' };
      el.chart.innerHTML = `
        <div class="chart">
          <div class="chart__head">
            <div><h2 class="chart__title">${esc(ENE.t('chart.title'))}</h2><p class="chart__hint">${esc(ENE.t('chart.hint'))}</p></div>
            <ul class="chart__legend">
              ${present.map((g) => `<li><span class="chart__key" style="--c:var(${GVAR[g]})"></span>${GLABEL[g]}</li>`).join('')}
              <li><span class="chart__key chart__key--mean"></span>${esc(ENE.t('chart.mean', { x: mean.toFixed(1) }))}</li>
            </ul>
          </div>
          <div class="chart__scroll"><div class="chart__inner" style="--years:${cols.length}">
            <div class="chart__plot">
              <div class="chart__grid" aria-hidden="true">
                ${[0, 0.5, 1].map((f) => `<div class="chart__gridline" style="bottom:${f * 100}%"><span>${axis * f}</span></div>`).join('')}
              </div>
              <div class="chart__mean" style="--m:${(mean / axis).toFixed(4)}" aria-hidden="true"></div>
              <div class="chart__cols">
                ${cols.map((c, i) => {
                  const detail = ['journal', 'conference', 'other'].filter((g) => c.g[g]).map((g) => ENE.t('chart.part', { n: c.g[g], label: ENE.t(`chart.${g}.lc`) })).join(', ');
                  const label = ENE.tn('chart.col', c.n, { y: c.y });
                  return `<button type="button" class="chart__col" data-year="${c.y}" style="--f:${(c.n / axis).toFixed(4)};--i:${i}" aria-pressed="false"
                    aria-label="${label}" title="${label}${detail ? ` (${detail})` : ''}"${c.n ? '' : ' disabled'}>
                    ${c.n ? `<span class="chart__count">${c.n}</span><span class="chart__stack">${['journal', 'conference', 'other'].filter((g) => c.g[g]).map((g) => `<span class="chart__seg chart__seg--${g}" style="--n:${c.g[g]}"></span>`).join('')}</span>` : ''}
                  </button>`;
                }).join('')}
              </div>
            </div>
            <div class="chart__years" aria-hidden="true">${cols.map((c) => `<span class="chart__year" data-label-year="${c.y}">${c.y}</span>`).join('')}</div>
          </div></div>
        </div>`;
      const root = $('.chart', el.chart);
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { root.classList.add('is-live'); io.disconnect(); } }, { threshold: 0.25 });
        io.observe(root);
      } else {
        root.classList.add('is-live');
      }
    } else {
      el.chart.hidden = true;
    }

    /* Filtering, sorting, rendering */
    const hay = new Map(pubs.map((p) => [p, [p.title, (p.authors || []).join(' '), p.venue, p.year, (p.keywords || []).join(' '), p.abstract].join(' ').toLowerCase()]));
    const sorters = {
      newest: (a, b) => b.year - a.year,
      oldest: (a, b) => a.year - b.year,
      cited: (a, b) => (Number(b.citations) || 0) - (Number(a.citations) || 0) || b.year - a.year,
    };
    const isFiltered = () => !!(state.q || state.type !== 'all' || state.area !== 'all' || state.year !== 'all');
    const filtered = () => {
      const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      return pubs.filter((p) => (state.type === 'all' || p.type === state.type)
        && (state.area === 'all' || (p.areas || []).includes(state.area))
        && (state.year === 'all' || String(p.year) === state.year)
        && terms.every((t) => hay.get(p).includes(t))).sort(sorters[state.sort]);
    };

    function syncControls() {
      if (el.q.value !== state.q) el.q.value = state.q;
      el.year.value = state.year;
      el.sort.value = state.sort;
      app.querySelectorAll('[data-type]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === state.type)));
      app.querySelectorAll('[data-area]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.area === state.area)));
      app.querySelectorAll('.chart__col').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.year === state.year)));
      app.querySelectorAll('[data-label-year]').forEach((s) => s.classList.toggle('is-selected', s.dataset.labelYear === state.year));
    }

    function renderList() {
      const items = filtered();
      el.count.textContent = isFiltered() ? ENE.tn('pubs.matches', pubs.length, { m: items.length }) : ENE.tn('pubs.total', pubs.length);
      el.clear.hidden = !isFiltered();
      if (!items.length) {
        el.list.innerHTML = `<div class="empty"><p>${ENE.t('pubs.none')}</p>
          <button type="button" class="btn btn--ghost btn--sm" data-action="clear">${esc(ENE.t('clear'))}</button></div>`;
        el.more.hidden = true;
        return;
      }
      const shown = items.slice(0, state.shown);
      const li = (p) => `<li>${pubHTML(p, areasById)}</li>`;
      if (state.sort === 'cited') {
        el.list.innerHTML = `<ol class="entry-list entry-list--flat">${shown.map(li).join('')}</ol>`;
      } else {
        const groups = new Map();
        shown.forEach((p) => { if (!groups.has(p.year)) groups.set(p.year, []); groups.get(p.year).push(p); });
        el.list.innerHTML = [...groups].map(([y, list]) => `
          <section class="year-group" aria-labelledby="year-${y}">
            <h3 class="year-group__label" id="year-${y}">${y || esc(ENE.t('year.undated'))}</h3>
            <ol class="entry-list">${list.map(li).join('')}</ol>
          </section>`).join('');
      }
      const left = items.length - shown.length;
      el.more.hidden = left <= 0;
      if (left > 0) $('button', el.more).textContent = ENE.t('more', { n: Math.min(PAGE_SIZE, left), left });
    }

    function writeURL() {
      const u = new URLSearchParams();
      if (state.q) u.set('q', state.q);
      if (state.type !== 'all') u.set('type', state.type);
      if (state.area !== 'all') u.set('area', state.area);
      if (state.year !== 'all') u.set('year', state.year);
      if (state.sort !== 'newest') u.set('sort', state.sort);
      const qs = u.toString();
      try { history.replaceState(null, '', qs ? `?${qs}` : location.pathname); } catch (e) { /* not allowed on file:// */ }
    }

    function update({ resetPage = true } = {}) {
      if (resetPage) state.shown = PAGE_SIZE;
      syncControls(); renderList(); writeURL();
    }
    const resetFilters = () => { state.q = ''; state.type = 'all'; state.area = 'all'; state.year = 'all'; update(); };

    /* Events */
    let timer;
    el.q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = el.q.value.trim(); update(); }, 140); });
    el.form.addEventListener('submit', (e) => e.preventDefault());
    el.year.addEventListener('change', () => { state.year = el.year.value; update(); });
    el.sort.addEventListener('change', () => { state.sort = el.sort.value; update(); });
    el.form.addEventListener('click', (e) => {
      const t = e.target.closest('[data-type]'), a = e.target.closest('[data-area]');
      if (t) { state.type = state.type === t.dataset.type ? 'all' : t.dataset.type; update(); }
      if (a) { state.area = state.area === a.dataset.area ? 'all' : a.dataset.area; update(); }
      if (e.target.closest('[data-action="clear"]')) resetFilters();
    });
    el.chart.addEventListener('click', (e) => {
      const b = e.target.closest('.chart__col');
      if (!b || b.disabled) return;
      state.year = state.year === b.dataset.year ? 'all' : b.dataset.year;
      update();
    });
    el.more.addEventListener('click', () => { state.shown += PAGE_SIZE; update({ resetPage: false }); });
    el.list.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-action]');
      if (!b) return;
      const action = b.dataset.action;
      if (action === 'abstract') {
        const open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(open));
        document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
      } else if (action === 'bibtex') {
        const ok = await copyText(bibtex(byId.get(b.dataset.id)));
        const was = b.textContent;
        b.textContent = ENE.t(ok ? 'copied' : 'copyFail');
        el.status.textContent = ENE.t(ok ? 'bib.ok' : 'bib.fail');
        setTimeout(() => { b.textContent = was; }, 1600);
      } else if (action === 'clear') {
        resetFilters();
      }
    });

    update();
    ENE.publications = { bibtex, state };
  }

  /* ---- Featured papers on the home page ---------------------------------------------------- */
  async function initFeatured(list) {
    let data;
    try { data = await loadAll(); } catch (e) { list.outerHTML = ENE.errorNotice('err.featured'); return; }
    let items = data.pubs.filter((p) => p.featured);
    if (!items.length) items = data.pubs.slice();
    items.sort((a, b) => b.year - a.year);
    items = items.slice(0, Number(list.dataset.limit) || 3);
    list.innerHTML = items.map((p) => `<li>${pubHTML(p, data.areasById, { compact: true })}</li>`).join('');
  }


  /* ---- One paper on its own page (paper.html?id=...) ----------------------------------------
   * The lists link here. The page shows what the site knows about the paper (abstract when the data
   * has one) and then links on to the publisher through the DOI. */
  async function initPaper(root) {
    const slot = (name) => $(`[data-paper-${name}]`);
    const head = { tags: slot('tags'), title: slot('title'), authors: slot('authors'), venue: slot('venue'), cta: slot('cta') };
    let data;
    try { data = await loadAll(); } catch (e) { root.innerHTML = ENE.errorNotice('err.pubs'); return; }
    const key = new URLSearchParams(location.search).get('id');
    const p = data.pubs.find((x) => pid(x) === key);
    const ext = ' target="_blank" rel="noopener"';
    const hint = `<span class="sr-only">${esc(ENE.t('newtab'))}</span>`;
    const L = ENE.lang === 'en' ? '' : ' lang="en"';   // the paper's own text stays English on the Thai page

    // "Back" returns to the list with its filters when the visitor came from there
    const back = $('[data-back]');
    if (back) back.addEventListener('click', (e) => {
      try {
        const ref = document.referrer ? new URL(document.referrer) : null;
        if (ref && ref.origin === location.origin && /\/publications\.html$/.test(ref.pathname) && history.length > 1) { e.preventDefault(); history.back(); }
      } catch (err) { /* follow the link */ }
    });

    if (!p) {
      head.title.textContent = ENE.t('paper.notfound.title');
      document.title = `${ENE.t('paper.notfound.title')} | ENE-CRG`;
      root.innerHTML = `<div class="paper__main"><p>${esc(ENE.t('paper.notfound.text'))}</p>
        <p><a class="btn btn--primary" href="publications.html">${esc(ENE.t('paper.notfound.link'))}</a></p></div>`;
      return;
    }

    const abs = ENE.pick(p.abstract);
    const kws = ENE.pick(p.keywords) || [];
    document.title = `${p.title} | ENE-CRG`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', String(abs || `${authorList(p.authors)}. ${p.venue || ''}${p.year ? `, ${p.year}` : ''}`).slice(0, 300));

    head.tags.innerHTML = `<span class="tag">${esc(typeLabel(p.type))}</span>` + (p.areas || []).map((id) => data.areasById[id]).filter(Boolean)
      .map((a) => `<span class="pub__tag" style="--h:${Number(a.hue) || 210}">${esc(ENE.pick(a.title))}</span>`).join('');
    head.title.textContent = p.title;
    head.authors.textContent = authorList(p.authors);
    head.venue.innerHTML = venueHTML(p);
    if (L) [head.title, head.authors, head.venue].forEach((el) => el.setAttribute('lang', 'en'));
    const pubHref = p.doi ? `https://doi.org/${p.doi}` : (p.url ? ENE.url(p.url) : '');
    head.cta.innerHTML = [
      pubHref ? `<a class="btn btn--primary" href="${esc(pubHref)}"${ext}>${esc(ENE.t('paper.publisher'))}${hint}</a>` : '',
      p.scopus ? `<a class="btn btn--on-dark" href="${esc(p.scopus)}"${ext}>${esc(ENE.t('paper.scopus'))}${hint}</a>` : '',
      p.pdf ? `<a class="btn btn--on-dark" href="${esc(ENE.url(p.pdf))}"${ext}>PDF${hint}</a>` : '',
    ].join('');

    const n = Number(p.citations);
    const rows = [
      p.year ? [ENE.t('paper.year'), esc(p.year)] : null,
      [ENE.t('paper.type'), esc(typeLabel(p.type))],
      n > 0 ? [ENE.t('paper.cited'), p.scopus ? `<a href="${esc(p.scopus)}"${ext}>${esc(ENE.t('paper.citedVal', { n }))}${hint}</a>` : esc(ENE.t('paper.citedVal', { n }))] : null,
      p.doi ? [ENE.t('paper.doi'), `<a href="https://doi.org/${esc(p.doi)}"${ext}${L}>${esc(p.doi)}${hint}</a>`] : null,
    ].filter(Boolean);
    const mine = new Set(p.areas || []);
    const related = mine.size ? data.pubs.filter((x) => x !== p && (x.areas || []).some((a) => mine.has(a)))
      .sort((a, b) => Math.abs(a.year - p.year) - Math.abs(b.year - p.year) || (Number(b.citations) || 0) - (Number(a.citations) || 0)).slice(0, 3) : [];

    root.innerHTML = `
      <div class="paper__main">
        <h2 class="paper__h">${esc(ENE.t('paper.abstract'))}</h2>
        ${abs ? `<p class="paper__abstract"${L}>${esc(abs)}</p>` : `<p class="paper__none">${esc(ENE.t('paper.noabstract'))}</p>`}
        ${kws.length ? `<h2 class="paper__h">${esc(ENE.t('paper.keywords'))}</h2><ul class="paper__kw"${L}>${kws.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>` : ''}
      </div>
      <aside class="paper__aside" aria-labelledby="paper-details">
        <h2 id="paper-details">${esc(ENE.t('paper.details'))}</h2>
        <dl class="details">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <div class="paper__actions"><button type="button" class="btn btn--ghost btn--sm" data-action="bibtex">${esc(ENE.t('copyBib'))}</button></div>
        <p class="sr-only" role="status" data-paper-status></p>
      </aside>
      ${related.length ? `<section class="paper__related" aria-labelledby="paper-related"><h2 class="paper__h" id="paper-related">${esc(ENE.t('paper.related'))}</h2>
        <ul class="feature-list">${related.map((r) => `<li>${pubHTML(r, data.areasById, { compact: true })}</li>`).join('')}</ul></section>` : ''}`;

    const btn = $('[data-action="bibtex"]', root), status = $('[data-paper-status]', root);
    btn.addEventListener('click', async () => {
      const ok = await copyText(bibtex(p));
      const was = btn.textContent;
      btn.textContent = ENE.t(ok ? 'copied' : 'copyFail');
      status.textContent = ENE.t(ok ? 'bib.ok' : 'bib.fail');
      setTimeout(() => { btn.textContent = was; }, 1600);
    });
    ENE.publications = { bibtex };
  }

  function init() {
    const app = $('[data-publications]');
    if (app) initDashboard(app);
    const featured = $('[data-featured-publications]');
    if (featured) initFeatured(featured);
    const paper = $('[data-paper]');
    if (paper) initPaper(paper);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
