/* ==========================================================================
   ENE-CRG  |  particles.js  |  the hero network
   A formation of agents. Each agent is a damped second-order system held on
   its target by a controller, and coupled to its neighbours through the
   communication graph (consensus-style coupling). Push the network with the
   cursor, or click / tap to send a disturbance through it, and watch it
   recover. Cyan means on target; amber means off target and being corrected.

   Reduced motion: no ambient drift, no packets, no automatic demo. The
   network still answers the visitor's own input, then goes fully idle.
   ========================================================================== */
(() => {
  'use strict';
  const ENE = (window.ENE = window.ENE || {});
  ENE.networks = [];

  const TRACE = [124, 212, 255];   // on target
  const SETPT = [255, 179, 71];    // off target
  const STEPS = 24;
  const PALETTE = Array.from({ length: STEPS + 1 }, (_, i) => {
    const k = i / STEPS;
    return `rgb(${TRACE.map((v, j) => Math.round(v + (SETPT[j] - v) * k)).join(',')})`;
  });
  const mulberry32 = (a) => () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  class Network {
    constructor(root, canvas) {
      this.root = root;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.nodes = []; this.edges = []; this.rings = []; this.packets = [];
      this.pointer = { x: 0, y: 0, active: false };
      this.time = 0; this.last = 0; this.raf = 0; this.visible = true; this.nextPacket = 0.6;
      this.energy = 0;
      this.reduced = ENE.reducedMotion ? ENE.reducedMotion() : false;
      // kp, kd: each agent's own controller. ke: coupling to neighbours.
      this.k = { kp: 26, kd: 3.4, ke: 9, reach: 160, push: 2600, shock: 480, shockR: 300 };
      this.frame = this.frame.bind(this);
      this.resize();
      this.bind();
      this.kick();
      if (!this.reduced) setTimeout(() => { if (this.visible) this.disturb(this.w * 0.68, this.h * 0.44, 0.9); }, 1500);
    }

    resize() {
      const r = this.root.getBoundingClientRect();
      this.w = Math.max(1, Math.round(r.width));
      this.h = Math.max(1, Math.round(r.height));
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.w * this.dpr);
      this.canvas.height = Math.round(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.k.reach = this.w < 700 ? 115 : 160;
      this.build();
      this.draw();
    }

    /* Hex-ish lattice with seeded jitter and dropped links, so the layout is stable across resizes */
    build() {
      const { w, h } = this;
      const rand = mulberry32(42);
      const cell = w < 700 ? 74 : Math.max(86, Math.min(116, Math.sqrt((w * h) / 170)));
      const dx = cell, dy = cell * Math.sqrt(3) / 2;
      const cols = Math.ceil(w / dx) + 3, rows = Math.ceil(h / dy) + 3;
      const grid = new Map();
      const nodes = [];
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const x = c * dx + (r & 1 ? dx / 2 : 0) + (rand() - 0.5) * cell * 0.42;
          const y = r * dy + (rand() - 0.5) * cell * 0.42;
          if (x < -cell * 0.6 || x > w + cell * 0.6 || y < -cell * 0.6 || y > h + cell * 0.6) continue;
          grid.set(`${c},${r}`, nodes.length);
          nodes.push({
            bx: x, by: y, x, y, vx: 0, vy: 0, tx: x, ty: y, ex: 0, ey: 0, fx: 0, fy: 0, glow: 0,
            ax0: 4 + rand() * 6, ay0: 4 + rand() * 6, wx: 0.25 + rand() * 0.35, wy: 0.25 + rand() * 0.35,
            px: rand() * 6.283, py: rand() * 6.283,
          });
        }
      }
      const edges = [];
      const link = (a, b) => { if (a !== undefined && b !== undefined && rand() > 0.28) edges.push([a, b]); };
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const a = grid.get(`${c},${r}`);
          if (a === undefined) continue;
          link(a, grid.get(`${c + 1},${r}`));
          if (r & 1) { link(a, grid.get(`${c},${r + 1}`)); link(a, grid.get(`${c + 1},${r + 1}`)); }
          else { link(a, grid.get(`${c - 1},${r + 1}`)); link(a, grid.get(`${c},${r + 1}`)); }
        }
      }
      this.nodes = nodes; this.edges = edges; this.packets = []; this.rings = [];
    }

    bind() {
      const root = this.root, ptr = this.pointer;
      const local = (e) => { const r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      root.addEventListener('pointermove', (e) => { [ptr.x, ptr.y] = local(e); ptr.active = true; this.kick(); });
      root.addEventListener('pointerleave', () => { ptr.active = false; });
      root.addEventListener('pointercancel', () => { ptr.active = false; });
      root.addEventListener('pointerdown', (e) => {
        if (e.target.closest('a,button')) return;
        const [x, y] = local(e);
        this.disturb(x, y, 1);
      });
      new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; if (this.visible) this.kick(); }).observe(root);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.kick(); });
      new ResizeObserver(debounce(() => { if (this.root.clientWidth) this.resize(); }, 120)).observe(root);
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq.addEventListener) mq.addEventListener('change', (e) => { this.reduced = e.matches; if (e.matches) this.time = 0; this.kick(); });
    }

    /* A shockwave: an impulse that decays with distance, plus a visible ring */
    disturb(x, y, strength = 1) {
      const { shock, shockR } = this.k;
      for (const p of this.nodes) {
        const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy);
        if (d < shockR) {
          const k = Math.pow(1 - d / shockR, 1.4) * shock * strength, u = d || 1;
          p.vx += (dx / u) * k; p.vy += (dy / u) * k;
        }
      }
      this.rings.push({ x, y, t: 0 });
      this.kick();
    }

    step(dt) {
      const { kp, kd, ke, reach, push } = this.k;
      const n = this.nodes, e = this.edges, ptr = this.pointer;
      const drift = this.reduced ? 0 : 1;
      if (!this.reduced) this.time += dt;
      const t = this.time;
      const sub = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / sub;
      let energy = 0;
      for (let s = 0; s < sub; s++) {
        for (const p of n) {
          p.tx = p.bx + drift * p.ax0 * Math.sin(p.wx * t + p.px);
          p.ty = p.by + drift * p.ay0 * Math.sin(p.wy * t + p.py);
          p.ex = p.x - p.tx; p.ey = p.y - p.ty;
          p.fx = -kp * p.ex - kd * p.vx;
          p.fy = -kp * p.ey - kd * p.vy;
        }
        for (const ed of e) {          // neighbours pull each other's errors together
          const a = n[ed[0]], b = n[ed[1]];
          const dx = b.ex - a.ex, dy = b.ey - a.ey;
          a.fx += ke * dx; a.fy += ke * dy; b.fx -= ke * dx; b.fy -= ke * dy;
        }
        if (ptr.active) {
          const R2 = reach * reach;
          for (const p of n) {
            const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) || 1, k = 1 - d / reach, f = push * k * k;
              p.fx += (f * dx) / d; p.fy += (f * dy) / d;
            }
          }
        }
        for (const p of n) {
          p.vx = Math.max(-1400, Math.min(1400, p.vx + p.fx * h));
          p.vy = Math.max(-1400, Math.min(1400, p.vy + p.fy * h));
          p.x += p.vx * h; p.y += p.vy * h;
        }
      }
      for (const p of n) {
        p.glow = Math.max(0, p.glow - dt * 2.2);
        energy += Math.abs(p.ex) + Math.abs(p.ey) + Math.abs(p.vx) * 0.05 + Math.abs(p.vy) * 0.05;
      }
      this.energy = energy / (n.length || 1);
      for (const r of this.rings) r.t += dt;
      this.rings = this.rings.filter((r) => r.t < 0.9);
      // Data packets hopping along links (ambient, off in reduced motion)
      if (!this.reduced && e.length) {
        if (this.time >= this.nextPacket && this.packets.length < 14) {
          this.packets.push({ e: e[(Math.random() * e.length) | 0], dir: Math.random() < 0.5 ? 1 : -1, t: 0, v: 0.7 + Math.random() * 0.9 });
          this.nextPacket = this.time + 0.2 + Math.random() * 0.45;
        }
        for (const p of this.packets) {
          p.t += p.v * dt;
          if (p.t >= 1) n[p.dir > 0 ? p.e[1] : p.e[0]].glow = 1;
        }
        this.packets = this.packets.filter((p) => p.t < 1);
      }
    }

    draw() {
      const c = this.ctx, n = this.nodes, e = this.edges;
      c.clearRect(0, 0, this.w, this.h);
      const ptr = this.pointer;
      if (ptr.active) {
        const g = c.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, this.k.reach);
        g.addColorStop(0, 'rgba(124,212,255,.10)'); g.addColorStop(1, 'rgba(124,212,255,0)');
        c.fillStyle = g; c.beginPath(); c.arc(ptr.x, ptr.y, this.k.reach, 0, 6.2832); c.fill();
      }
      // links
      c.lineWidth = 1; c.strokeStyle = 'rgba(124,212,255,.17)'; c.beginPath();
      for (const ed of e) { const a = n[ed[0]], b = n[ed[1]]; c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); }
      c.stroke();
      // strained links glow amber
      c.lineWidth = 1.4;
      for (const ed of e) {
        const a = n[ed[0]], b = n[ed[1]];
        const s = Math.hypot(a.ex - b.ex, a.ey - b.ey);
        if (s > 5) {
          c.strokeStyle = `rgba(255,179,71,${Math.min(0.6, s / 55).toFixed(3)})`;
          c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
        }
      }
      // tether from each displaced agent back to its target
      for (const p of n) {
        const err = Math.hypot(p.ex, p.ey);
        if (err > 6) {
          c.strokeStyle = `rgba(255,179,71,${Math.min(0.4, err / 110).toFixed(3)})`;
          c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.tx, p.ty); c.stroke();
          c.strokeStyle = 'rgba(255,179,71,.45)'; c.beginPath(); c.arc(p.tx, p.ty, 3, 0, 6.2832); c.stroke();
        }
      }
      // packets
      for (const p of this.packets) {
        const a = n[p.e[0]], b = n[p.e[1]], s = p.dir > 0 ? p.t : 1 - p.t;
        const x = a.x + (b.x - a.x) * s, y = a.y + (b.y - a.y) * s;
        c.fillStyle = 'rgba(190,235,255,.2)'; c.beginPath(); c.arc(x, y, 5, 0, 6.2832); c.fill();
        c.fillStyle = 'rgba(233,247,255,.95)'; c.beginPath(); c.arc(x, y, 1.9, 0, 6.2832); c.fill();
      }
      // agents
      for (const p of n) {
        const err = Math.hypot(p.ex, p.ey), k = Math.min(1, err / 30);
        c.fillStyle = PALETTE[Math.round(k * STEPS)];
        c.beginPath(); c.arc(p.x, p.y, 2.3 + 1.7 * k + p.glow * 1.4, 0, 6.2832); c.fill();
        if (p.glow > 0.02) {
          c.strokeStyle = `rgba(124,212,255,${(p.glow * 0.5).toFixed(3)})`; c.lineWidth = 1;
          c.beginPath(); c.arc(p.x, p.y, 4 + (1 - p.glow) * 9, 0, 6.2832); c.stroke();
        }
      }
      // shockwave rings
      for (const r of this.rings) {
        const q = r.t / 0.9, rad = this.k.shockR * (1 - Math.pow(1 - q, 3));
        c.strokeStyle = `rgba(255,179,71,${((1 - q) * 0.55).toFixed(3)})`; c.lineWidth = 1.5;
        c.beginPath(); c.arc(r.x, r.y, rad, 0, 6.2832); c.stroke();
      }
    }

    settled() {
      return this.reduced && !this.pointer.active && !this.rings.length && this.energy < 0.25;
    }

    frame(now) {
      this.raf = 0;
      if (!this.visible || document.hidden) { this.last = 0; return; }
      const dt = this.last ? Math.min(0.033, (now - this.last) / 1000) : 1 / 60;
      this.last = now;
      this.step(dt);
      this.draw();
      if (this.settled()) { this.last = 0; return; }   // idle until the next input
      this.raf = requestAnimationFrame(this.frame);
    }

    kick() { if (!this.raf && this.visible) this.raf = requestAnimationFrame(this.frame); }
  }

  function init() {
    if (!window.ResizeObserver || !window.IntersectionObserver) return;
    document.querySelectorAll('[data-network]').forEach((root) => {
      const canvas = root.querySelector('canvas');
      if (canvas && canvas.getContext) ENE.networks.push(new Network(root, canvas));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
