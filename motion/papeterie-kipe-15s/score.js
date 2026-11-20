// GRANDE PAPETERIE DE KIPÉ — motion design 9:16 (Reels / TikTok / Status WhatsApp)
// THE SCORE — single source of truth for the music AND the picture.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, placeBar, makeChords } = MU;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const STYLE = U.pickStyle ? U.pickStyle('flat') : 'flat';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;
  const clock = makeClock({ bpm: 112, offset: 0.3 }); // 1 bar ≈ 2.14 s
  const { T, BEAT } = clock;
  const DURATION = 15.0;

  const S = { hook: [0, T(1)], logo: [T(1), T(3)], produits: [T(3), T(5)], contact: [T(5), DURATION] };

  const prog = ['C', 'F', 'Am', 'G'];
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' },
    F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' },
    Am: { notes: ['E4', 'A4', 'C5'], bass: 'A1' },
    G: { notes: ['D4', 'G4', 'B4'], bass: 'G1' },
    Cadd9: { notes: ['E4', 'G4', 'D5'], bass: 'C2' },
  }, [...Array.from({ length: 6 }, (_, b) => [b, 0, 4, prog[b % 4]]), [6, 0, 4, 'Cadd9']]);

  const ev = {
    stamps: [T(0, 0), T(0, 1), T(0, 2)],
    logoSweep: T(1, 0),
    logoPop: T(2, 0),
    title: T(2, 1),
    cibleTitle: Infinity,
    breath: T(5, 0), // no breath in the 15 s cut: the products cut straight to the call to action
    drop: T(5, 0),
    contact: T(5, 0),
    tag: T(6, 0),
    end: T(6, 2),
  };
  // layout times the film reads
  const L = {
    tagline: Infinity, logoStart: T(1), logoHint: T(1, 1), title2: T(2, 2), title3: T(2, 3),
    cibles: T(3), prod: T(3), phone: T(5, 1), whats: T(5, 3), socials: T(6, 0),
    tagLines: ['Venez', 'nous voir !'], contactConfetti: true,
  };

  const logoArp = placeBar(clock, [['C5', 0, 1], ['E5', 1, 1], ['G5', 2, 1], ['C6', 3, 1], ['G5', 4, 1], ['E5', 5, 1], ['G5', 6, 1], ['B5', 7, 1]], 1);
  const cibles = [];

  const produits = [
    { img: 'ardoise', label: 'Ardoises & craies', sub: 'pour les tout-petits' },
    { img: 'cahier', label: 'Cahiers 2B4', sub: '188 pages · 7 mm' },
    { img: 'cartables', label: 'Cartables & sacs', sub: 'solides et stylés' },
    { img: 'rayons', label: 'Fournitures & bureau', sub: 'tout au même endroit' },
  ].map((p, i) => ({ ...p, i, t: T(3 + Math.floor(i / 2), (i % 2) * 2), end: T(3 + Math.floor((i + 1) / 2), ((i + 1) % 2) * 2) }));
  const prodNotes = produits.map((p, i) => ({ t: p.t, midi: m(['C5', 'E5', 'G5', 'C6'][i]) }));

  const PHONE = '623 31 70 16';
  const digitNotes = ['C5', 'D5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C6'];
  const digits = [];
  { let k = 0; for (let i = 0; i < PHONE.length; i++) if (PHONE[i] !== ' ') { digits.push({ i, t: L.phone + k * BEAT / 2, midi: m(digitNotes[k % 8]) }); k++; } }
  const melody = [];

  const markers = {
    stamp: { t: ev.stamps[0], sync: 'av' },
    rentree: { t: ev.stamps[2], sync: 'av' },
    logo: { t: ev.logoPop, sync: 'av' },
    produits: produits[0].t,
    contact: { t: ev.contact, sync: 'av' },
    tag: ev.tag,
    end: ev.end,
  };

  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, logoArp, cibles, produits, prodNotes, PHONE, digits, melody, markers, L };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
