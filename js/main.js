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

  /* ---- Language --------------------------------------------------------------
   * The page's <html lang> decides. English pages are in the site root and Thai pages in /th/, so
   * <html data-root> holds the way back to the root ("" or "../"). Text made by scripts lives in
   * STRINGS below. Data files may hold text as a plain string or as { "en": "...", "th": "..." }. */
  const LANG = String(document.documentElement.lang || 'en').toLowerCase().startsWith('th') ? 'th' : 'en';
  const ROOT = document.documentElement.dataset.root || '';
  const STRINGS = {
    en: {
      'err.title': 'Couldn\u2019t load {what}.',
      'err.body': 'The site reads its content from the <code>data/</code> folder, so it has to be served over HTTP. GitHub Pages does this automatically. To preview on your computer, run <code>python3 -m http.server</code> in the project folder and open <code>http://localhost:8000</code>.',
      'err.themes': 'the research themes', 'err.alumni': 'the alumni list', 'err.pubs': 'the publications', 'err.featured': 'the featured publications',
      'theme.toLight': 'Switch to light theme', 'theme.toDark': 'Switch to dark theme',
      'menu.open': 'Open menu', 'menu.close': 'Close menu',
      'sample.text': '<strong>Sample content.</strong> Replace the placeholder text and data before you publish. The README lists every place to edit.',
      'sample.dismiss': 'Dismiss this notice',
      'newtab': ' (opens in a new tab)', 'all': 'All', 'allThemes': 'All themes', 'clear': 'Clear filters',
      'lbl.publications': 'Publications', 'lbl.citations': 'Citations', 'lbl.journal': 'Journal articles', 'lbl.conference': 'Conference papers',
      'lbl.themes': 'Research themes', 'lbl.graduates': '{degree} graduates', 'lbl.graduatesAll': 'Graduates',
      'theme.view': 'View publications', 'theme.viewN_one': 'View {n} publication', 'theme.viewN_other': 'View {n} publications',
      'dg.cyber': 'cyber', 'dg.physical': 'physical',
      'sector.title': 'Where graduates go next', 'sector.academia': 'Academia', 'sector.industry': 'Industry',
      'sector.government': 'Government and public research', 'sector.study': 'Further study',
      'alumni.count_one': '{n} entry', 'alumni.count_other': '{n} entries',
      'alumni.matches_one': '{m} of {n} entry match', 'alumni.matches_other': '{m} of {n} entries match',
      'alumni.none': '<strong>No graduates match these filters.</strong> Try a different word or choose All.',
      'alumni.recent': 'Recent', 'alumni.now': 'Now: {x}',
      'contact.subject': '[{topic}] Message from {name}',
      'contact.status': 'Your email app should open with the message ready to send. If nothing happens, write to {to} directly.',
      'type.journal': 'Journal article', 'type.conference': 'Conference paper', 'type.preprint': 'Preprint', 'type.book-chapter': 'Book chapter',
      'type.thesis': 'Thesis', 'type.patent': 'Patent', 'type.report': 'Report', 'type.publication': 'Publication',
      'cited': 'Cited {n}', 'cited.title': 'Cited by {n} on Scopus', 'cited.sr': ' on Scopus (opens in a new tab)',
      'abstract': 'Abstract', 'copyBib': 'Copy BibTeX', 'keywords': 'Keywords:',
      'updated.from': 'Data from {source}, last updated {date}', 'updated': 'Data last updated {date}',
      'pubs.total_one': '{n} publication', 'pubs.total_other': '{n} publications',
      'pubs.matches_one': '{m} of {n} publication match', 'pubs.matches_other': '{m} of {n} publications match',
      'pubs.none': '<strong>No publications match these filters.</strong> Try removing a filter or searching for a different word.',
      'more': 'Show {n} more ({left} remaining)', 'copied': 'Copied', 'copyFail': 'Copy failed',
      'bib.ok': 'BibTeX copied to clipboard.', 'bib.fail': 'Could not copy the BibTeX entry.', 'year.undated': 'Undated',
      'chart.title': 'Publications per year', 'chart.hint': 'Select a year to filter the list below.',
      'chart.journal': 'Journal', 'chart.conference': 'Conference', 'chart.other': 'Other',
      'chart.journal.lc': 'journal', 'chart.conference.lc': 'conference', 'chart.other.lc': 'other',
      'chart.part': '{n} {label}', 'chart.mean': 'Mean {x} per year',
      'chart.col_one': '{y}: {n} publication', 'chart.col_other': '{y}: {n} publications',
      'paper.publisher': 'Read at the publisher', 'paper.scopus': 'View on Scopus',
      'paper.abstract': 'Abstract', 'paper.noabstract': 'The abstract is available on the publisher\u2019s page.', 'paper.keywords': 'Keywords',
      'paper.details': 'Paper details', 'paper.year': 'Year', 'paper.type': 'Type', 'paper.cited': 'Cited by', 'paper.citedVal': '{n} on Scopus', 'paper.doi': 'DOI',
      'paper.related': 'Related papers',
      'paper.notfound.title': 'Paper not found', 'paper.notfound.text': 'This paper is not in the list. The link may be out of date.', 'paper.notfound.link': 'See all publications',
    },
    th: {
      'err.title': 'ไม่สามารถโหลด{what}ได้',
      'err.body': 'เว็บไซต์อ่านเนื้อหาจากโฟลเดอร์ <code>data/</code> จึงต้องเปิดผ่าน HTTP ซึ่ง GitHub Pages ทำให้โดยอัตโนมัติ หากต้องการดูตัวอย่างบนคอมพิวเตอร์ ให้รัน <code>python3 -m http.server</code> ในโฟลเดอร์โครงการ แล้วเปิด <code>http://localhost:8000</code>',
      'err.themes': 'หัวข้อวิจัย', 'err.alumni': 'รายชื่อศิษย์เก่า', 'err.pubs': 'ผลงานตีพิมพ์', 'err.featured': 'ผลงานตีพิมพ์คัดสรร',
      'theme.toLight': 'เปลี่ยนเป็นธีมสว่าง', 'theme.toDark': 'เปลี่ยนเป็นธีมมืด',
      'menu.open': 'เปิดเมนู', 'menu.close': 'ปิดเมนู',
      'sample.text': '<strong>เนื้อหาตัวอย่าง</strong> โปรดแทนที่ข้อความและข้อมูลตัวอย่างก่อนเผยแพร่ ไฟล์ README ระบุทุกจุดที่ต้องแก้ไข',
      'sample.dismiss': 'ปิดประกาศนี้',
      'newtab': ' (เปิดในแท็บใหม่)', 'all': 'ทั้งหมด', 'allThemes': 'ทุกหัวข้อ', 'clear': 'ล้างตัวกรอง',
      'lbl.publications': 'ผลงานตีพิมพ์', 'lbl.citations': 'การอ้างอิง', 'lbl.journal': 'บทความวารสาร', 'lbl.conference': 'บทความการประชุมวิชาการ',
      'lbl.themes': 'หัวข้อวิจัย', 'lbl.graduates': 'บัณฑิต{degree}', 'lbl.graduatesAll': 'บัณฑิต',
      'theme.view': 'ดูผลงานตีพิมพ์', 'theme.viewN_other': 'ดูผลงานตีพิมพ์ {n} รายการ',
      'dg.cyber': 'ไซเบอร์', 'dg.physical': 'กายภาพ',
      'sector.title': 'ก้าวต่อไปของบัณฑิต', 'sector.academia': 'สถาบันการศึกษาและงานวิชาการ', 'sector.industry': 'อุตสาหกรรม',
      'sector.government': 'ภาครัฐและงานวิจัยสาธารณะ', 'sector.study': 'ศึกษาต่อ',
      'alumni.count_other': '{n} รายการ', 'alumni.matches_other': 'พบ {m} จาก {n} รายการ',
      'alumni.none': '<strong>ไม่พบบัณฑิตที่ตรงกับตัวกรองเหล่านี้</strong> ลองใช้คำอื่นหรือเลือก “ทั้งหมด”',
      'alumni.recent': 'ล่าสุด', 'alumni.now': 'ปัจจุบัน: {x}',
      'contact.subject': '[{topic}] ข้อความจาก {name}',
      'contact.status': 'แอปอีเมลของคุณควรเปิดขึ้นพร้อมข้อความที่เตรียมไว้ หากไม่มีอะไรเกิดขึ้น กรุณาส่งอีเมลถึง {to} โดยตรง',
      'type.journal': 'บทความวารสาร', 'type.conference': 'บทความการประชุมวิชาการ', 'type.preprint': 'พรีปรินต์', 'type.book-chapter': 'บทในหนังสือ',
      'type.thesis': 'วิทยานิพนธ์', 'type.patent': 'สิทธิบัตร', 'type.report': 'รายงาน', 'type.publication': 'ผลงาน',
      'cited': 'อ้างอิง {n}', 'cited.title': 'อ้างอิงโดย {n} รายการใน Scopus', 'cited.sr': ' ใน Scopus (เปิดในแท็บใหม่)',
      'abstract': 'บทคัดย่อ', 'copyBib': 'คัดลอก BibTeX', 'keywords': 'คำสำคัญ:',
      'updated.from': 'ข้อมูลจาก {source} อัปเดตล่าสุด {date}', 'updated': 'ข้อมูลอัปเดตล่าสุด {date}',
      'pubs.total_other': 'ผลงานตีพิมพ์ {n} รายการ', 'pubs.matches_other': 'พบ {m} จาก {n} รายการ',
      'pubs.none': '<strong>ไม่พบผลงานตีพิมพ์ที่ตรงกับตัวกรองเหล่านี้</strong> ลองเอาตัวกรองออกหรือค้นหาด้วยคำอื่น',
      'more': 'แสดงเพิ่ม {n} รายการ (เหลืออีก {left} รายการ)', 'copied': 'คัดลอกแล้ว', 'copyFail': 'คัดลอกไม่สำเร็จ',
      'bib.ok': 'คัดลอก BibTeX ไปยังคลิปบอร์ดแล้ว', 'bib.fail': 'ไม่สามารถคัดลอก BibTeX ได้', 'year.undated': 'ไม่ระบุปี',
      'chart.title': 'จำนวนผลงานตีพิมพ์ต่อปี', 'chart.hint': 'เลือกปีเพื่อกรองรายการด้านล่าง',
      'chart.journal': 'วารสาร', 'chart.conference': 'การประชุม', 'chart.other': 'อื่น ๆ',
      'chart.journal.lc': 'วารสาร', 'chart.conference.lc': 'การประชุม', 'chart.other.lc': 'อื่น ๆ',
      'chart.part': '{label} {n}', 'chart.mean': 'เฉลี่ย {x} ต่อปี', 'chart.col_other': '{y}: {n} รายการ',
      'paper.publisher': 'อ่านที่สำนักพิมพ์', 'paper.scopus': 'ดูใน Scopus',
      'paper.abstract': 'บทคัดย่อ', 'paper.noabstract': 'บทคัดย่อมีอยู่ในหน้าของสำนักพิมพ์', 'paper.keywords': 'คำสำคัญ',
      'paper.details': 'รายละเอียดผลงาน', 'paper.year': 'ปี', 'paper.type': 'ประเภท', 'paper.cited': 'อ้างอิงโดย', 'paper.citedVal': '{n} รายการใน Scopus', 'paper.doi': 'DOI',
      'paper.related': 'ผลงานที่เกี่ยวข้อง',
      'paper.notfound.title': 'ไม่พบผลงานตีพิมพ์', 'paper.notfound.text': 'ไม่พบผลงานนี้ในรายการ ลิงก์อาจล้าสมัย', 'paper.notfound.link': 'ดูผลงานตีพิมพ์ทั้งหมด',
    },
  };
  ENE.lang = LANG; ENE.root = ROOT;
  ENE.locale = LANG === 'th' ? 'th-TH-u-ca-gregory' : 'en-US';       // Gregorian years in both languages
  ENE.url = (p) => (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(p) ? p : ROOT + p);   // project-relative path -> URL from this page
  ENE.t = (key, vars) => {
    let s = STRINGS[LANG] && STRINGS[LANG][key];
    if (s === undefined) s = STRINGS.en[key];
    if (s === undefined) return key;
    return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m)) : s;
  };
  ENE.tn = (key, n, vars) => {                                          // plural-aware: key_one / key_other
    const one = STRINGS[LANG] && STRINGS[LANG][key + '_one'];
    return ENE.t(n === 1 && one !== undefined ? key + '_one' : key + '_other', { n, ...vars });
  };
  ENE.pick = (v) => (v && typeof v === 'object' && !Array.isArray(v)
    ? (v[LANG] !== undefined ? v[LANG] : (v.en !== undefined ? v.en : Object.values(v)[0])) : v);

  /* ---- Helpers ---------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Object.assign(ENE, { $, $$, esc, reducedMotion });

  const jsonCache = new Map();
  ENE.loadJSON = (path) => {
    const url = ENE.url(path);
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

  ENE.errorNotice = (key) => `
    <div class="notice" role="alert">
      <p><strong>${esc(ENE.t('err.title', { what: ENE.t(key) }))}</strong></p>
      <p>${ENE.t('err.body')}</p>
    </div>`;

  ENE.readoutHTML = (items) => items.map((i) => `
    <div class="readout__cell">
      <dt class="readout__label">${esc(i.label)}</dt>
      <dd class="readout__value"><span class="sr-only">${Number(i.value) || 0}</span><span aria-hidden="true" data-count-to="${Number(i.value) || 0}">${Number(i.value) || 0}</span></dd>
    </div>`).join('');

  ENE.formatDate = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(ENE.locale, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  /* ---- Theme ------------------------------------------------------------
   * The inline script in <head> sets data-theme before first paint. */
  function initTheme() {
    const root = document.documentElement;
    const buttons = $$('[data-theme-toggle]');
    const apply = (theme) => {
      root.dataset.theme = theme;
      buttons.forEach((b) => b.setAttribute('aria-label', ENE.t(theme === 'dark' ? 'theme.toLight' : 'theme.toDark')));
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
      toggle.setAttribute('aria-label', ENE.t(open ? 'menu.close' : 'menu.open'));
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
      <p>${ENE.t('sample.text')}</p>
      <button type="button" class="sample-banner__close" aria-label="${esc(ENE.t('sample.dismiss'))}">
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
        <text class="dg-text" x="68" y="34">${ENE.t('dg.cyber')}</text>
        <path class="dg-line" d="M150 34L196 20M150 34L196 48M196 20L246 34M196 48L246 34M196 20V48"/>
        <circle class="dg-node" cx="150" cy="34" r="5"/><circle class="dg-node" cx="196" cy="20" r="5"/>
        <circle class="dg-node" cx="196" cy="48" r="5"/><circle class="dg-fill" cx="246" cy="34" r="5.5"/>
        <rect class="dg-block" x="24" y="100" width="272" height="52" rx="3"/>
        <text class="dg-text" x="74" y="126">${ENE.t('dg.physical')}</text>
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
    if (typeof name === 'string' && /[/.]/.test(name)) return `<img src="${esc(ENE.url(name))}" alt="" loading="lazy">`;
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

  /* ---- Degree names in Thai (Ph.D. / M.S. / ...); anything else is shown as written ---- */
  const DEGREE_TH = { phd: 'ปริญญาเอก', dphil: 'ปริญญาเอก', msc: 'ปริญญาโท', ms: 'ปริญญาโท', meng: 'ปริญญาโท', bsc: 'ปริญญาตรี', bs: 'ปริญญาตรี', beng: 'ปริญญาตรี' };
  const degreeLabel = (d) => (LANG === 'th' && DEGREE_TH[String(d).toLowerCase().replace(/[^a-z]/g, '')]) || d;
  const gradLabel = (d) => ENE.t('lbl.graduates', { degree: degreeLabel(d) });

  /* ---- Home: research themes and numbers ---------------------------------- */
  const themeHTML = (a, n) => `
    <article class="theme" style="--h:${Number(a.hue) || 210}">
      <div class="theme__diagram" aria-hidden="true">${ENE.diagram(a.diagram)}</div>
      <h3 class="theme__title">${esc(ENE.pick(a.title))}</h3>
      <p class="theme__summary">${esc(ENE.pick(a.summary))}</p>
      ${ENE.pick(a.keywords) && ENE.pick(a.keywords).length ? `<p class="theme__keywords">${ENE.pick(a.keywords).map(esc).join(', ')}</p>` : ''}
      <a class="theme__link" href="publications.html?area=${encodeURIComponent(a.id)}">${n ? ENE.tn('theme.viewN', n) : ENE.t('theme.view')}</a>
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
        themesEl.outerHTML = ENE.errorNotice('err.themes');
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
          { value: pubs.length, label: ENE.t('lbl.publications') },
          cites ? { value: cites, label: ENE.t('lbl.citations') } : { value: pubs.filter((p) => p.type === 'journal').length, label: ENE.t('lbl.journal') },
          ...degreeCounts(grads).slice(0, 2).map(([d, n]) => ({ value: n, label: gradLabel(d) })),
        ];
        if (cells.length < 4) cells.push({ value: areas.length, label: ENE.t('lbl.themes') });
        readoutEl.innerHTML = ENE.readoutHTML(cells);
        if (ENE.counters) ENE.counters.observe(readoutEl);
      } else {
        readoutEl.closest('section').hidden = true;
      }
    }
  }

  /* ---- Students: alumni list ------------------------------------------------ */
  const SECTOR_KEYS = ['academia', 'industry', 'government', 'study'];
  const sectorLabel = (k) => (SECTOR_KEYS.includes(k) ? ENE.t('sector.' + k) : k);

  async function initAlumni() {
    const app = $('[data-alumni]');
    if (!app) return;
    let data;
    try { data = await ENE.loadJSON('data/graduates.json'); } catch (e) { app.innerHTML = ENE.errorNotice('err.alumni'); return; }
    const all = (data.graduates || []).slice();
    const state = { q: '', degree: 'all' };
    const counts = degreeCounts(all);
    const degrees = counts.map(([d]) => d);
    const countDegree = (d) => all.filter((g) => g.degree === d).length;

    // One number per degree (a person who earned two degrees counts once for each)
    $('[data-readout]', app).innerHTML = ENE.readoutHTML(counts.length
      ? counts.slice(0, 4).map(([d, n]) => ({ value: n, label: gradLabel(d) }))
      : [{ value: all.length, label: ENE.t('lbl.graduatesAll') }]);
    if (ENE.counters) ENE.counters.observe(app);

    // Where graduates go next (only drawn when the data has a sector for people)
    const sectors = Object.entries(all.reduce((m, g) => { if (g.sector) m[g.sector] = (m[g.sector] || 0) + 1; return m; }, {}))
      .sort((a, b) => b[1] - a[1]);
    const sectorEl = $('[data-sector]', app);
    if (sectorEl && sectors.length) {
      const summary = sectors.map((s) => `${sectorLabel(s[0])} ${s[1]}`).join(', ');
      sectorEl.innerHTML = `
        <h3 class="sector__title">${esc(ENE.t('sector.title'))}</h3>
        <div class="sector__bar" role="img" aria-label="${esc(summary)}">
          ${sectors.map((s, i) => `<span class="sector__seg" style="--n:${s[1]};--c:var(--bar-${Math.min(i + 1, 4)})"></span>`).join('')}
        </div>
        <ul class="sector__legend">
          ${sectors.map((s, i) => `<li><span class="sector__key" style="--c:var(--bar-${Math.min(i + 1, 4)})"></span>${esc(sectorLabel(s[0]))} ${s[1]}</li>`).join('')}
        </ul>`;
    }

    // Filters
    const chips = $('[data-chips="degree"]', app);
    chips.insertAdjacentHTML('beforeend', [{ v: 'all', l: ENE.t('all'), n: all.length }, ...degrees.map((d) => ({ v: d, l: degreeLabel(d), n: countDegree(d) }))]
      .map((c) => `<button type="button" class="chip" data-degree="${esc(c.v)}" aria-pressed="${c.v === 'all'}">${esc(c.l)} <span class="chip__count">${c.n}</span></button>`).join(''));
    const search = $('[data-alumni-search]', app);
    const list = $('[data-alumni-list]', app);
    const count = $('[data-alumni-count]', app);

    const matches = (g) => {
      if (state.degree !== 'all' && g.degree !== state.degree) return false;
      if (!state.q) return true;
      const hay = [ENE.pick(g.name), g.degree, degreeLabel(g.degree), g.year, ENE.pick(g.note), ENE.pick(g.thesis), ENE.pick(g.position), ENE.pick(g.organization)].join(' ').toLowerCase();
      return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.includes(t));
    };
    const nameOf = (g) => (g.url
      ? `<a href="${esc(g.url)}" target="_blank" rel="noopener">${esc(ENE.pick(g.name))}<span class="sr-only">${esc(ENE.t('newtab'))}</span></a>` : esc(ENE.pick(g.name)));
    const nowOf = (g) => [ENE.pick(g.position), ENE.pick(g.organization)].filter(Boolean).map(esc).join(', ');
    // With a photo: a card, as on the Ph.D. candidates. Without: a compact row.
    const cardHTML = (g) => `<li class="person">
        <div class="avatar avatar--photo"><img src="${esc(ENE.url(g.photo))}" alt="" width="256" height="256" loading="lazy" decoding="async"></div>
        <h4 class="person__name">${nameOf(g)}</h4>
        <p class="person__role">${esc([degreeLabel(g.degree), g.year].filter(Boolean).join(', '))}</p>
        ${g.note ? `<p class="person__focus">${esc(ENE.pick(g.note))}</p>` : ''}
        ${g.thesis ? `<p class="person__focus"><em>${esc(ENE.pick(g.thesis))}</em></p>` : ''}
        ${nowOf(g) ? `<p class="person__focus">${ENE.t('alumni.now', { x: nowOf(g) })}</p>` : ''}
      </li>`;
    const rowHTML = (g) => `<li class="alumnus">
        <div class="alumnus__head"><h4 class="alumnus__name">${nameOf(g)}</h4>${g.degree ? `<span class="tag">${esc(degreeLabel(g.degree))}</span>` : ''}${g.note ? `<span class="alumnus__note">${esc(ENE.pick(g.note))}</span>` : ''}</div>
        ${g.thesis ? `<p class="alumnus__thesis">${esc(ENE.pick(g.thesis))}</p>` : ''}
        ${nowOf(g) ? `<p class="alumnus__now">${ENE.t('alumni.now', { x: nowOf(g) })}</p>` : ''}
      </li>`;
    const render = () => {
      const items = all.filter(matches);
      chips.querySelectorAll('[data-degree]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.degree === state.degree)));
      count.textContent = items.length === all.length ? ENE.tn('alumni.count', all.length) : ENE.tn('alumni.matches', all.length, { m: items.length });
      if (!items.length) {
        list.innerHTML = `<div class="empty"><p>${ENE.t('alumni.none')}</p>
          <button type="button" class="btn btn--ghost btn--sm" data-alumni-clear>${esc(ENE.t('clear'))}</button></div>`;
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
          <h3 class="year-group__label" id="grad-${esc(k)}">${esc(k === 'Recent' ? ENE.t('alumni.recent') : k)}</h3>
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
      const subject = ENE.t('contact.subject', { topic: fd.get('topic'), name: fd.get('name') });
      const body = `${fd.get('message')}\n\n\u2014\n${fd.get('name')}\n${fd.get('email')}`;
      status.textContent = ENE.t('contact.status', { to });
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* ---- Language switch: keep the filters and the section when changing language ---- */
  function initLangSwitch() {
    $$('[data-lang-switch]').forEach((a) => {
      const base = a.getAttribute('href');
      const sync = () => a.setAttribute('href', base + location.search + location.hash);
      ['pointerdown', 'focus', 'mouseenter', 'touchstart', 'click'].forEach((ev) => a.addEventListener(ev, sync, { passive: true }));
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
    initLangSwitch();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
