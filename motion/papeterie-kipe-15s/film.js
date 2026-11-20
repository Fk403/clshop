// GRANDE PAPETERIE DE KIPÉ — the film. Every visual is a pure function of t, timed from score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { BEAT, ev, clock, T } = S;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H;
  const k = W / 1080; // designed on 1080x1920
  const IMG = {};

  // brand palette (from the shop's logo and posters)
  const C = { blue: '#1F5BB8', blue2: '#2F74E0', navy: '#0A1D4A', white: '#FFFFFF', yellow: '#FFC93C', red: '#E8352B', green: '#25D366', ink: '#0A1D4A', sky: '#EAF2FF' };

  const inv = (t, t0, d) => clamp((t - t0) / d);
  const pop = (t, t0, d = 0.28, s = 2.2) => (t < t0 ? 0 : ease.outBack(inv(t, t0, d), s));
  const beatKick = (t) => Math.exp(-clock.phase(t) * BEAT * 9); // 1 on every beat, decays

  function txt(ctx, s, x, y, o = {}) {
    G.text(ctx, s, x, y, { size: 64, fam: 'Inter', weight: 800, color: C.white, align: 'center', boil: 0, ...o });
  }
  function marker(ctx, s, x, y, o = {}) {
    G.text(ctx, s, x, y, { size: 120, fam: 'Permanent Marker', weight: 400, color: C.white, align: 'center', boil: 0, ...o });
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  // a painted brush stroke (like the shop's posters), revealed left → right by p
  function brush(ctx, cx, cy, w, h, color, p, seed = 1, tilt = -0.04) {
    if (p <= 0) return;
    const r = U.mulberry32(seed);
    const top = [], bot = [];
    const n = 26;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      if (u > p) break;
      const x = -w / 2 + u * w;
      const end = Math.min(u, 1 - u) < 0.06 ? 0.55 : 1;
      top.push([x, -h / 2 * end + (r() - 0.5) * h * 0.18]);
      bot.push([x, h / 2 * end + (r() - 0.5) * h * 0.18]);
    }
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); ctx.fillStyle = color;
    ctx.beginPath(); top.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
    ctx.closePath(); ctx.fill();
    // dry-brush streaks
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    for (let i = 0; i < 5; i++) { const yy = (r() - 0.5) * h * 0.7, xx = -w / 2 + r() * w * p * 0.8; ctx.fillRect(xx, yy, w * 0.2 * r(), 2); }
    ctx.restore();
  }

  // ---------- floating stationery in the background (seeded, drifting) ----------
  const DECOR = (() => {
    const r = U.mulberry32(42), out = [];
    for (let i = 0; i < 16; i++) out.push({ x: r() * 1080, y: r() * 1920, s: 30 + r() * 50, kind: i % 4, sp: 20 + r() * 40, rot: r() * 6, vr: (r() - 0.5) * 0.6 });
    return out;
  })();
  function pencil(ctx, s) {
    ctx.fillRect(-s, -s * 0.18, s * 1.6, s * 0.36);
    ctx.beginPath(); ctx.moveTo(s * 0.6, -s * 0.18); ctx.lineTo(s, 0); ctx.lineTo(s * 0.6, s * 0.18); ctx.fill();
  }
  function decor(ctx, t, color = '#FFFFFF', alpha = 0.1) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 6;
    for (const d of DECOR) {
      const y = ((d.y - t * d.sp) % 2100 + 2100) % 2100 - 90;
      ctx.save(); ctx.translate(d.x, y); ctx.rotate(d.rot + t * d.vr);
      if (d.kind === 0) pencil(ctx, d.s);
      else if (d.kind === 1) { ctx.beginPath(); ctx.arc(0, 0, d.s * 0.5, 0, 6.29); ctx.stroke(); }
      else if (d.kind === 2) { ctx.beginPath(); ctx.moveTo(-d.s * 0.6, d.s * 0.5); ctx.lineTo(d.s * 0.6, d.s * 0.5); ctx.lineTo(-d.s * 0.6, -d.s * 0.6); ctx.closePath(); ctx.stroke(); }
      else { ctx.fillRect(-d.s * 0.4, -d.s * 0.5, d.s * 0.8, d.s); }
      ctx.restore();
    }
    ctx.restore();
  }
  function grad(ctx, a, b) {
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  }

  // ---------- the logo (circular badge, clipped from the shop's artwork) ----------
  function logo(ctx, cx, cy, R, reveal = 1) {
    const img = IMG.logo; if (!img) return;
    const icx = 540, icy = 482, iR = 452; // the badge inside logo.jpg
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath();
    if (reveal < 1) { ctx.moveTo(cx, cy); ctx.arc(cx, cy, R + 2, -Math.PI / 2, -Math.PI / 2 + reveal * 6.2832); ctx.closePath(); }
    else ctx.arc(cx, cy, R, 0, 6.2832);
    ctx.clip();
    const s = R / iR;
    ctx.drawImage(img, cx - icx * s, cy - icy * s, img.width * s, img.height * s);
    ctx.restore();
  }

  // ================= SCENES =================
  // 1. HOOK — CAHIERS / FINIS ? / ON EST LÀ !
  function sceneHook(ctx, t) {
    grad(ctx, C.blue2, C.navy);
    decor(ctx, t);
    const [a, b, c] = ev.stamps;
    const stamp = (t0) => { const p = inv(t, t0, 0.14); return t < t0 ? 0 : lerp(1.7, 1, ease.outCubic(p)); };
    const words = [['CAHIERS', a, 520, 150, C.white], ['FINIS ?', b, 690, 170, C.yellow]];
    for (const [w, t0, y, size, col] of words) {
      const s = stamp(t0); if (!s) continue;
      ctx.save(); ctx.translate(540, y); ctx.scale(s, s); txt(ctx, w, 0, 0, { size, color: col }); ctx.restore();
    }
    const s = stamp(c);
    if (s) {
      ctx.save(); ctx.translate(540, 900); ctx.scale(s, s); ctx.rotate(-0.05);
      brush(ctx, 0, -40, 840, 210, C.yellow, ease.outCubic(inv(t, c, 0.12)), 7, 0);
      marker(ctx, 'ON EST LÀ !', 0, 12, { size: 124, color: C.navy });
      ctx.restore();
    }
    // tagline, word by word on the beats of bar 1
    const tag = [["Tout pour l'école", 0], ['et le bureau', 1], ["toute l'année", 2]];
    const y0 = 1130;
    tag.forEach(([w, bt], i) => {
      const t0 = S.L.tagline + bt * BEAT; const p = pop(t, t0, 0.3);
      if (!p) return;
      ctx.save(); ctx.translate(540, y0 + i * 95); ctx.scale(p, p);
      if (i === 2) { ctx.fillStyle = C.white; rr(ctx, -270, -70, 540, 92, 46); ctx.fill(); txt(ctx, w, 0, 0, { size: 62, color: C.blue }); }
      else txt(ctx, w, 0, 0, { size: 66 });
      ctx.restore();
    });
    // a pencil underlines the whole thing on beat 3
    const pu = inv(t, S.L.tagline + 3 * BEAT, BEAT * 0.8);
    if (pu > 0) {
      const x1 = lerp(250, 830, ease.outCubic(pu));
      ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(250, 1350); ctx.quadraticCurveTo((250 + x1) / 2, 1366, x1, 1346); ctx.stroke();
      ctx.translate(x1, 1320); ctx.rotate(-0.7); ctx.fillStyle = C.yellow; pencil(ctx, 50); ctx.restore();
    }
  }

  // 2. LOGO — the ring draws itself note by note, then the badge lands
  function sceneLogo(ctx, t) {
    // white iris opening from the centre on the bar line
    grad(ctx, C.sky, '#FFFFFF');
    decor(ctx, t, C.blue, 0.07);
    const cx = 540, cy = 760, R = 330;
    const landed = t >= ev.logoPop;
    if (landed) {
      const a = t - ev.logoPop;
      G.rays(ctx, cx, cy, { n: 28, r0: R + 20, r1: 1400, color: C.blue, lw: 14, alpha: 0.12 + 0.1 * Math.exp(-a * 3), spin: a * 0.25, seed: 3 });
      // shockwave
      if (a < 0.6) { ctx.save(); ctx.strokeStyle = C.blue; ctx.globalAlpha = 1 - a / 0.6; ctx.lineWidth = 18 * (1 - a / 0.6); ctx.beginPath(); ctx.arc(cx, cy, R + a * 600, 0, 6.29); ctx.stroke(); ctx.restore(); }
    }
    // the ring segments, one per arpeggio note
    let reveal = 0;
    for (const n of S.logoArp) if (t >= n.t) reveal = Math.min(1, reveal + 1 / S.logoArp.length * ease.outCubic(inv(t, n.t, BEAT / 2)));
    const sc = landed ? lerp(0.82, 1, ease.outBack(inv(t, ev.logoPop, 0.2), 2)) * (1 + 0.025 * beatKick(t)) : 0.82;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    ctx.save(); ctx.shadowColor = 'rgba(10,29,74,0.25)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.29); ctx.fillStyle = landed ? '#fff' : 'rgba(255,255,255,0.6)'; ctx.fill(); ctx.restore();
    logo(ctx, cx, cy, R, landed ? 1 : reveal);
    if (!landed) { // the leading pen-tip of the ring
      const a = -Math.PI / 2 + reveal * 6.2832;
      ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, R + 4, -Math.PI / 2, a); ctx.stroke();
      ctx.translate(cx + Math.cos(a) * (R + 4), cy + Math.sin(a) * (R + 4)); ctx.rotate(a + Math.PI / 2 + 0.6); ctx.fillStyle = C.navy; pencil(ctx, 46); ctx.restore();
    }
    ctx.restore();
    if (!landed) txt(ctx, 'Votre papeterie…', 540, 1260, { size: 60, color: C.navy, alpha: inv(t, S.L.logoHint, 0.3) });
    // name
    const p1 = pop(t, ev.title, 0.3), p2 = pop(t, S.L.title2, 0.3), p3 = inv(t, S.L.title3, 0.3);
    if (p1) { ctx.save(); ctx.translate(540, 1215); ctx.scale(p1, p1); txt(ctx, 'GRANDE PAPETERIE', 0, 0, { size: 76, color: C.navy }); ctx.restore(); }
    if (p2) { ctx.save(); ctx.translate(540, 1335); ctx.scale(p2, p2); ctx.fillStyle = C.blue; rr(ctx, -260, -88, 520, 118, 24); ctx.fill(); txt(ctx, 'DE KIPÉ', 0, 0, { size: 96 }); ctx.restore(); }
    if (p3 > 0) txt(ctx, 'Votre partenaire scolaire et de bureau', 540, 1450, { size: 40, weight: 700, color: C.blue, alpha: p3 });
  }

  // 3. AUDIENCES
  function sceneCibles(ctx, t) {
    grad(ctx, C.blue, C.navy);
    decor(ctx, t);
    const pt = pop(t, ev.cibleTitle, 0.3);
    if (pt) {
      ctx.save(); ctx.translate(540, 340); ctx.scale(pt, pt);
      brush(ctx, 0, -38, 700, 150, C.yellow, ease.outCubic(inv(t, ev.cibleTitle, 0.15)), 11, -0.03);
      marker(ctx, 'POUR TOUS', 0, 0, { size: 100, color: C.navy });
      ctx.restore();
    }
    S.cibles.forEach((c, i) => {
      if (t < c.t) return;
      const side = i % 2 ? 1 : -1;
      const u = ease.outBack(inv(t, c.t, 0.32), 1.6);
      const y = 520 + i * 158;
      const x = 540 + side * (1 - u) * 900;
      const w = 640, h = 118;
      ctx.save(); ctx.translate(x, y); ctx.rotate(side * 0.015);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(ctx, -w / 2 + 8, -h / 2 + 10, w, h, h / 2); ctx.fill();
      ctx.fillStyle = C.white; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
      ctx.fillStyle = i % 2 ? C.yellow : C.blue2; ctx.beginPath(); ctx.arc(-w / 2 + 62, 0, 40, 0, 6.29); ctx.fill();
      ctx.strokeStyle = i % 2 ? C.navy : C.white; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const ck = inv(t, c.t + 0.15, 0.2);
      ctx.beginPath(); ctx.moveTo(-w / 2 + 44, 2); ctx.lineTo(-w / 2 + 44 + 14 * Math.min(1, ck * 2), 2 + 14 * Math.min(1, ck * 2));
      if (ck > 0.5) ctx.lineTo(-w / 2 + 58 + 26 * (ck - 0.5) * 2, 16 - 34 * (ck - 0.5) * 2);
      ctx.stroke();
      txt(ctx, c.label, 40, 22, { size: 58, color: C.navy });
      ctx.restore();
    });
  }

  // 4. PRODUCTS — a cut every half bar
  const BGS = [[C.yellow, '#FFB000'], [C.blue2, C.navy], ['#FFFFFF', C.sky], [C.red, '#9E1A12']];
  function sceneProduit(ctx, t, p) {
    const [a, b] = BGS[p.i % 4];
    grad(ctx, a, b);
    const light = p.i % 4 === 0 || p.i % 4 === 2;
    decor(ctx, t, light ? C.navy : '#fff', 0.08);
    const ink = light ? C.navy : C.white;
    const side = p.i % 2 ? -1 : 1;
    const u = ease.outCubic(inv(t, p.t, 0.22));
    const x = 540 + side * (1 - u) * 1100;
    const rot = side * 0.03 * (1 - u) + (p.i % 2 ? 0.02 : -0.02);
    const cw = 860, ch = 860, cy = 760;
    // counter
    txt(ctx, `${String(p.i + 1).padStart(2, '0')} / ${S.produits.length}`, 540, 290, { size: 40, weight: 700, color: ink, alpha: 0.85 });
    ctx.save(); ctx.translate(x, cy); ctx.rotate(rot);
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; rr(ctx, -cw / 2 + 12, -ch / 2 + 18, cw, ch, 36); ctx.fill();
    ctx.fillStyle = '#fff'; rr(ctx, -cw / 2 - 12, -ch / 2 - 12, cw + 24, ch + 24, 44); ctx.fill();
    const img = IMG[p.img];
    if (img) G.kenBurns(ctx, img, -cw / 2, -ch / 2, cw, ch, t, p.t, p.end + 0.3, { from: { zoom: 1.05, x: 0.5, y: 0.5 }, to: { zoom: 1.22, x: 0.5 + side * 0.06, y: 0.45 }, radius: 34 });
    ctx.restore();
    // label
    const lp = pop(t, p.t + 0.08, 0.3, 1.8);
    if (lp) {
      ctx.save(); ctx.translate(540, 1300); ctx.scale(lp, lp); ctx.rotate(-0.02);
      ctx.fillStyle = light ? C.navy : C.white; rr(ctx, -430, -82, 860, 120, 22); ctx.fill();
      txt(ctx, p.label, 0, 0, { size: 70, color: light ? C.white : C.navy });
      ctx.restore();
    }
    const sp = inv(t, p.t + 0.2, 0.2);
    if (sp > 0) txt(ctx, p.sub, 540, 1420, { size: 46, weight: 700, color: ink, alpha: sp });
    // "en boutique" sticker
    const st = pop(t, p.t + 0.12, 0.3, 3);
    if (st) {
      ctx.save(); ctx.translate(215, 420); ctx.rotate(-0.22); ctx.scale(st, st);
      ctx.fillStyle = light ? C.red : C.yellow; ctx.beginPath();
      for (let i = 0; i < 24; i++) { const r = i % 2 ? 78 : 92, a = i / 24 * 6.2832; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill();
      txt(ctx, 'EN', 0, -12, { size: 30, color: light ? C.white : C.navy });
      txt(ctx, 'BOUTIQUE', 0, 24, { size: 26, color: light ? C.white : C.navy });
      ctx.restore();
    }
  }

  // 4b. THE BREATH — freeze, darken, a question
  function sceneBreath(ctx, t) {
    sceneProduit(ctx, ev.breath - 1 / 30, S.produits[S.produits.length - 1]);
    ctx.fillStyle = 'rgba(10,29,74,0.82)'; ctx.fillRect(0, 0, 1080, 1920);
    const p = pop(t, ev.breath + 0.05, 0.25);
    if (p) { ctx.save(); ctx.translate(540, 900); ctx.scale(p, p); txt(ctx, 'Et tout ça…', 0, 0, { size: 90 }); txt(ctx, 'où ?', 0, 120, { size: 110, color: C.yellow }); ctx.restore(); }
  }

  // 5. THE SHOP — drop
  function sceneBoutique(ctx, t) {
    grad(ctx, C.blue2, C.navy);
    decor(ctx, t);
    const a = t - ev.drop;
    G.rays(ctx, 540, 640, { n: 24, r0: 200, r1: 1500, color: C.yellow, lw: 22, alpha: 0.18, spin: a * 0.3, seed: 5 });
    const s = lerp(1.25, 1, ease.outCubic(inv(t, ev.drop, 0.35))) * (1 + 0.015 * beatKick(t));
    ctx.save(); ctx.translate(540, 640); ctx.scale(s, s); ctx.rotate(-0.02);
    ctx.fillStyle = '#fff'; rr(ctx, -480, -330, 960, 660, 34); ctx.fill();
    const img = t < T(11) ? IMG.facade : IMG.rayons;
    if (img) G.kenBurns(ctx, img, -462, -312, 924, 624, t, t < T(11) ? ev.drop : T(11), t < T(11) ? T(11) : T(12), { from: { zoom: 1.0, x: 0.5, y: 0.5 }, to: { zoom: 1.15, x: 0.55, y: 0.45 }, radius: 24 });
    ctx.restore();
    const p = pop(t, T(10, 1), 0.3, 2.5);
    if (p) {
      ctx.save(); ctx.translate(540, 1150); ctx.scale(p, p); ctx.rotate(-0.04);
      brush(ctx, 0, -30, 860, 260, C.yellow, ease.outCubic(inv(t, T(10, 1), 0.15)), 21, 0);
      marker(ctx, 'VENEZ', 0, -50, { size: 96, color: C.navy });
      marker(ctx, 'NOUS VOIR !', 0, 60, { size: 96, color: C.navy });
      ctx.restore();
    }
    const words = ['Qualité', 'Choix', 'Proximité'];
    words.forEach((w, i) => {
      const q = pop(t, T(11, i), 0.3);
      if (!q) return;
      const x = 270 + i * 270;
      ctx.save(); ctx.translate(x, 1400); ctx.scale(q, q);
      ctx.fillStyle = C.white; rr(ctx, -125, -56, 250, 80, 40); ctx.fill();
      txt(ctx, w, 0, 0, { size: 40, color: C.blue });
      ctx.restore();
    });
    if (t < T(12)) G.confetti(ctx, t, ev.drop, { n: 120, seed: 9, spawn: 1.8 });
  }

  // 6. CONTACT
  function pin(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, -10, 22, Math.PI, 0); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -10, 22, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -10, 9, 0, 6.29); ctx.fill(); ctx.restore();
  }
  function phoneIcon(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.6); ctx.fillStyle = color;
    rr(ctx, -12, -30, 24, 60, 10); ctx.fill(); ctx.fillRect(-20, -32, 22, 16); ctx.fillRect(-20, 16, 22, 16); ctx.restore();
  }
  function sceneContact(ctx, t) {
    grad(ctx, C.navy, '#071233');
    decor(ctx, t, '#fff', 0.06);
    // logo
    const lp = pop(t, ev.contact, 0.35, 2);
    if (lp) { ctx.save(); ctx.translate(540, 400); ctx.scale(lp * (1 + 0.02 * beatKick(t)), lp * (1 + 0.02 * beatKick(t))); logo(ctx, 0, 0, 150); ctx.restore(); }
    // address
    const ap = inv(t, ev.contact + 0.1, 0.35);
    if (ap > 0) {
      ctx.save(); ctx.globalAlpha = ap; ctx.translate(0, (1 - ease.outCubic(ap)) * 40);
      pin(ctx, 160, 662, 1.3, C.yellow);
      txt(ctx, 'Kipé Centre T2', 220, 660, { size: 58, align: 'left' });
      txt(ctx, 'Carrefour Alpha Condé', 220, 722, { size: 42, weight: 700, align: 'left', color: '#BFD3FF' });
      ctx.restore();
    }
    // phone: digits type themselves
    const bp = pop(t, S.L.phone - 0.1, 0.3, 1.6);
    if (bp) {
      ctx.save(); ctx.translate(540, 900); ctx.scale(bp, bp);
      ctx.fillStyle = C.white; rr(ctx, -440, -95, 880, 170, 85); ctx.fill();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(-355, -10, 62, 0, 6.29); ctx.fill();
      phoneIcon(ctx, -355, -10, 1.3, '#fff');
      let shown = '';
      for (let i = 0; i < S.PHONE.length; i++) {
        const d = S.digits.find((q) => q.i === i);
        if (!d || t >= d.t) shown += S.PHONE[i]; else break;
      }
      txt(ctx, shown, -270, 18, { size: 88, color: C.navy, align: 'left' });
      const last = [...S.digits].reverse().find((q) => t >= q.t);
      if (last && t < S.digits[S.digits.length - 1].t + BEAT && Math.floor(t * 4) % 2 === 0) { ctx.fillStyle = C.blue; ctx.fillRect(-270 + G.measure(ctx, shown, 88, 'Inter', 800) + 8, -50, 8, 80); }
      ctx.restore();
    }
    // WhatsApp + socials
    const wp = pop(t, S.L.whats, 0.3);
    if (wp) {
      ctx.save(); ctx.translate(540, 1075); ctx.scale(wp, wp);
      ctx.fillStyle = C.green; rr(ctx, -360, -55, 720, 96, 48); ctx.fill();
      txt(ctx, 'WhatsApp  +224 623 31 70 16', 0, 8, { size: 40, color: C.navy });
      ctx.restore();
    }
    const sp = inv(t, S.L.socials - 0.2, 0.35);
    if (sp > 0) {
      txt(ctx, 'TikTok · Facebook · Instagram', 540, 1180, { size: 36, weight: 700, color: '#BFD3FF', alpha: sp });
      txt(ctx, '@grandepapeteriedekipe', 540, 1240, { size: 50, color: C.white, alpha: sp });
    }
    if (S.L.contactConfetti) G.confetti(ctx, t, ev.contact, { n: 110, seed: 9, spawn: 1.6 });
    // tagline
    const tp = pop(t, ev.tag + BEAT, 0.35, 2);
    if (tp) {
      ctx.save(); ctx.translate(540, 1400); ctx.scale(tp, tp); ctx.rotate(-0.04);
      brush(ctx, 0, -10, 820, 210, C.yellow, ease.outCubic(inv(t, ev.tag + BEAT, 0.6)), 31, 0);
      marker(ctx, S.L.tagLines[0], 0, -30, { size: 72, color: C.navy });
      marker(ctx, S.L.tagLines[1], 0, 52, { size: 72, color: C.navy });
      ctx.restore();
    }
  }

  // ---------- transitions ----------
  function flash(ctx, t, t0, a = 0.9, d = 10) {
    if (t < t0) return; const f = a * Math.exp(-(t - t0) * d);
    if (f > 0.01) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, 1080, 1920); }
  }
  function iris(ctx, t, t0, color, dur = 0.3) { // a circle that opens at t0 revealing the new scene underneath (drawn over by caller)
    const u = inv(t, t0, dur); if (u >= 1) return null; return u;
  }

  Studio.film({
    async init() {
      const names = ['logo', 'ardoise', 'cahier', 'rayons', 'cartables', 'gourdes', 'alphabet', 'livres', 'tableau', 'facade'];
      await Promise.all(names.map(async (n) => { IMG[n] = await Studio.loadImage(`assets/${n}.jpg`); }));
    },
    draw(ctx, t) {
      ctx.save(); ctx.scale(k, H / 1920);
      // camera shake on the big hits
      const hits = [...ev.stamps, ev.logoPop, ev.drop];
      let sh = 0; for (const h of hits) if (t >= h) sh = Math.max(sh, (h === ev.drop ? 22 : 12) * Math.exp(-(t - h) * 9));
      ctx.translate(U.noise1(t * 30, 1) * sh, U.noise1(t * 30, 2) * sh);
      ctx.translate(-30, -30); ctx.scale(1 + 60 / 1080, 1 + 60 / 1920); // overscan so shake never shows an edge

      if (t < S.L.logoStart) sceneHook(ctx, t);
      else if (t < S.L.cibles) {
        sceneLogo(ctx, t);
        const u = iris(ctx, t, S.L.logoStart, C.white, 0.35);
        if (u !== null) { // the hook scene shrinks away through a growing circle
          ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); { const ir = ease.inOutCubic(u) * 1300; ctx.moveTo(540 + ir, 760); ctx.arc(540, 760, ir, 0, 6.2832, true); } ctx.clip('evenodd'); sceneHook(ctx, S.L.logoStart - 0.001); ctx.restore();
        }
      } else if (t < S.L.prod) sceneCibles(ctx, t);
      else if (t < ev.breath) { const p = [...S.produits].reverse().find((q) => t >= q.t); sceneProduit(ctx, t, p); }
      else if (t < ev.drop) sceneBreath(ctx, t);
      else if (t < ev.contact) sceneBoutique(ctx, t);
      else sceneContact(ctx, t);
      ctx.restore();

      ctx.save(); ctx.scale(k, H / 1920);
      flash(ctx, t, ev.stamps[0], 0.7, 16);
      flash(ctx, t, ev.stamps[2], 0.5, 14);
      flash(ctx, t, ev.logoPop, 0.95, 12);
      flash(ctx, t, ev.drop, 0.95, 9);
      for (const p of S.produits) flash(ctx, t, p.t, 0.25, 22);
      if (S.L.cibles < S.L.prod) flash(ctx, t, S.L.cibles, 0.4, 18); flash(ctx, t, ev.contact, 0.4, 16);
      ctx.restore();
    },
    post: { paper: 0, vignette: 0.2, grain: 0.03 },
    fadeOut: 0.8,
  });
})();
