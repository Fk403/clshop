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
  const clock = makeClock({ bpm: 108, offset: 0.3 }); // afrobeats, 1 bar ≈ 2.22 s
  const { T, BEAT } = clock;
  const DURATION = T(14) + 2.2; // ≈ 33.6 s

  // ---------- sections ----------
  const S = {
    hook: [0, T(2)],
    logo: [T(2), T(4)],
    cibles: [T(4), T(6)],
    produits: [T(6), T(9, 3)],
    breath: [T(9, 3), T(10)],
    boutique: [T(10), T(12)],
    contact: [T(12), DURATION],
  };

  // ---------- harmony: C – F – Am – G, bright and danceable ----------
  const prog = ['C', 'F', 'Am', 'G'];
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' },
    F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' },
    Am: { notes: ['E4', 'A4', 'C5'], bass: 'A1' },
    G: { notes: ['D4', 'G4', 'B4'], bass: 'G1' },
    Cadd9: { notes: ['E4', 'G4', 'D5'], bass: 'C2' },
  }, [...Array.from({ length: 14 }, (_, b) => [b, 0, 4, prog[b % 4]]), [14, 0, 4, 'Cadd9']]);

  // ---------- events ----------
  const ev = {
    stamps: [T(0, 0), T(0, 1), T(0, 2)], // "CAHIERS" "FINIS ?" "ON EST LÀ !"
    tagline: T(1, 0),
    logoSweep: T(2, 0), // the ring draws itself over one bar (balafon arpeggio)
    logoPop: T(3, 0), // logo lands
    title: T(3, 1),
    cibleTitle: T(4, 0),
    breath: T(9, 3),
    drop: T(10, 0),
    contact: T(12, 0),
    tag: T(13, 0),
    end: T(14, 0),
  };

  // the arpeggio that draws the logo ring: one balafon note per 8th, ring segment per note
  const logoArp = placeBar(clock, [['C5', 0, 1], ['E5', 1, 1], ['G5', 2, 1], ['C6', 3, 1], ['G5', 4, 1], ['E5', 5, 1], ['G5', 6, 1], ['B5', 7, 1]], 2);

  // the audiences: one chip per beat, one note per chip
  const cibles = [
    { label: 'Parents', note: 'C5', t: T(4, 1) },
    { label: 'Élèves', note: 'E5', t: T(4, 2) },
    { label: 'Étudiants', note: 'G5', t: T(4, 3) },
    { label: 'Enseignants', note: 'A5', t: T(5, 0) },
    { label: 'Professionnels', note: 'G5', t: T(5, 1) },
    { label: 'Entreprises', note: 'C6', t: T(5, 2) },
  ];

  // the product montage: a cut every half bar (energy rises)
  const produits = [
    { img: 'ardoise', label: 'Ardoises & craies', sub: 'pour les tout-petits' },
    { img: 'cahier', label: 'Cahiers 2B4', sub: '188 pages · 7 mm' },
    { img: 'rayons', label: 'Cahiers & blocs', sub: 'tous les formats' },
    { img: 'cartables', label: 'Cartables & sacs', sub: 'solides et stylés' },
    { img: 'gourdes', label: 'Gourdes', sub: '& accessoires' },
    { img: 'alphabet', label: 'Jeux éducatifs', sub: 'apprendre en jouant' },
    { img: 'livres', label: 'Livres & manuels', sub: 'primaire au lycée' },
    { img: 'tableau', label: 'Matériel de bureau', sub: 'pour les pros' },
  ].map((p, i) => ({ ...p, i, t: T(6 + Math.floor(i / 2), (i % 2) * 2), end: i < 7 ? T(6 + Math.floor((i + 1) / 2), ((i + 1) % 2) * 2) : T(9, 3) }));
  // last shot is cut short by the breath
  const prodNotes = produits.map((p, i) => ({ t: p.t, midi: m(['C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'G5', 'C6'][i]) }));

  // the phone number types itself, one digit per 8th, each digit a balafon note
  const PHONE = '623 31 70 16';
  const digitNotes = ['C5', 'D5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C6'];
  const digits = [];
  { let k = 0; for (let i = 0; i < PHONE.length; i++) if (PHONE[i] !== ' ') { digits.push({ i, t: T(12, 1) + k * BEAT / 2, midi: m(digitNotes[k % 8]) }); k++; } }

  // hook melody on the drop (marimba lead), 8th grid
  const HOOK = {
    a: [['G5', 0, 1], ['E5', 1, 1], ['G5', 2, 1], ['C6', 3, 2], ['A5', 5, 1], ['G5', 6, 2]],
    b: [['A5', 0, 1], ['G5', 1, 1], ['E5', 2, 1], ['D5', 3, 2], ['E5', 5, 1], ['C5', 6, 2]],
  };
  const melody = [...placeBar(clock, HOOK.a, 10), ...placeBar(clock, HOOK.b, 11), ...placeBar(clock, HOOK.a, 13)];

  const markers = {
    stamp: { t: ev.stamps[0], sync: 'av' },
    rentree: { t: ev.stamps[2], sync: 'av' },
    logo: { t: ev.logoPop, sync: 'av' },
    cibles: ev.cibleTitle,
    produits: produits[0].t,
    breath: ev.breath,
    drop: { t: ev.drop, sync: 'av' },
    contact: ev.contact,
    tag: ev.tag,
    end: ev.end,
  };

  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, logoArp, cibles, produits, prodNotes, PHONE, digits, melody, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
