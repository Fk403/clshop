// THE SONG — an afrobeats groove with a balafon-like marimba, every sound tied to score.js.
//   node song.js   (STEMS=1 writes stems, LUFS=-14 masters to a loudness target)
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), bala = bus(), fx = bus();
const verb = bus(), dly = bus();

// ---------- backing: afrobeats pack ----------
const kicks = [];
Genre.play('afrobeats', { clock, from: 0, to: 1, chordAt: sc.chordAt, buses: { drums, bass, pad, keys }, kicks, bassline: false, chords: false, gain: 0.8 });
Genre.play('afrobeats', { clock, from: 1, to: 5, chordAt: sc.chordAt, buses: { drums, bass, pad, keys }, kicks, fill: [4] });
Genre.play('afrobeats', { clock, from: 5, to: 6, chordAt: sc.chordAt, buses: { drums, bass, pad, keys }, kicks, gain: 1.1 });

// soft pad under everything (warm bed), cut by the breath
for (const c of sc.chords) {
  if (c.t0 >= ev.end + 4) continue;
  const t1 = c.t0 < ev.breath && c.t1 > ev.breath ? ev.breath : c.t1;
  for (const n of c.notes) { const { L, R } = I.padNote(n, t1 - c.t0, { cutoff: 1400, attack: 0.2, release: 0.8 }); pad.addStereo(L, R, c.t0, 0.06); }
}

// ---------- the hook stamps: C'EST / LA / RENTRÉE ! ----------
const K = I.kick({ tail: 0.3, punch: 1.3 });
ev.stamps.forEach((t, i) => {
  fx.addMono(I.thud(70 + i * 10, 0.09), t, 0.7);
  drums.addMono(I.clap({ spread: 1.2 }), t, 0.5);
  drums.addMono(K, t, 0.6);
});
drums.addMono(I.crash(9), ev.stamps[2], 0.25, 0.2);

// ---------- logo: the ring draws itself on a balafon arpeggio, then lands ----------
for (const n of sc.logoArp) { const x = I.marimba(n.midi); bala.addMono(x, n.t, 0.5, Math.sin(n.t * 3) * 0.5); verb.addMono(x, n.t, 0.2); }
drums.addMono(I.crash(12), ev.logoPop, 0.4, -0.2);
fx.addMono(I.subBoom(1.6), ev.logoPop, 0.55);
fx.addMono(I.pop(1400, 3), ev.logoPop, 0.4);
fx.addMono(I.noiseSweep(BEAT * 1.6, 600, 7000, { q: 1, shape: (x) => x * x, pink: true }), ev.logoPop - BEAT * 2, 0.22);

// ---------- audiences: one chip, one note ----------
if (isFinite(ev.cibleTitle)) fx.addMono(I.paperFwip(0.8, 4), ev.cibleTitle - 0.02, 0.3);
for (const c of sc.cibles) { const x = I.marimba(m(c.note)); bala.addMono(x, c.t, 0.55); verb.addMono(x, c.t, 0.18); fx.addMono(I.pop(1800 + m(c.note) * 10, 5), c.t, 0.2); }

// ---------- product montage: a swoosh into each cut, a note on each cut ----------
sc.produits.forEach((p, i) => {
  if (i > 0) fx.addMono(I.noiseSweep(0.18, 1500, 6000, { q: 1.2, pink: true }), p.t - 0.2, 0.18, i % 2 ? 0.4 : -0.4);
  const x = I.marimba(sc.prodNotes[i].midi); bala.addMono(x, p.t, 0.45); dly.addMono(x, p.t, 0.12);
});
fx.addMono(I.noiseSweep(T(5) - T(4, 2), 300, 9000, { q: 0.9, shape: (x) => x * x, pink: true }), T(4, 2), 0.3); // riser into the call to action

// ---------- drop: the shop ----------
drums.addMono(I.crash(18), ev.drop, 0.45, 0.1);
fx.addMono(I.subBoom(2.2), ev.drop, 0.75);
drums.addMono(K, ev.drop, 0.8);
for (const n of sc.melody) { const x = I.marimba(n.midi); bala.addMono(x, n.t, 0.5, 0.2); verb.addMono(x, n.t, 0.15); dly.addMono(x, n.t, 0.08); }

// ---------- contact: the number types itself ----------
for (const d of sc.digits) { const x = I.marimba(d.midi); bala.addMono(x, d.t, 0.42, -0.2); fx.addMono(I.woodTick(1.2, d.i), d.t, 0.12); }
drums.addMono(I.crash(22), ev.tag, 0.25);
fx.addMono(I.scribble(1.2, 5), ev.tag + BEAT, 0.18);
// ending chord, held
for (const n of ['C4', 'E4', 'G4', 'D5', 'G5']) { const x = I.marimba(m(n)); bala.addMono(x, ev.end + 0.02 * ['C4', 'E4', 'G4', 'D5', 'G5'].indexOf(n), 0.35); verb.addMono(x, ev.end, 0.3); }
bass.addMono(I.logDrum(m('C3'), { decay: 1.2 }), ev.end, 0.5);

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks.filter((t) => t >= ev.drop && t < ev.end));
const stems = {
  drums, bass, pad, keys, bala, fx,
  verb: reverb(verb, { room: 0.8, damp: 0.35 }),
  dly: pingpong(dly, BEAT * 0.75, 0.35, 3800),
};
const GAIN = { drums: 0.85, bass: 0.9, pad: 1.6, keys: 2.0, bala: 1.0, fx: 0.8, verb: 0.9, dly: 0.9 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 25);
if (ev.drop - ev.breath > 0.1) MIX.gate(mix, ev.breath + 0.05, ev.drop);
Genre.fx('afrobeats', mix, { kicks, buses: [pad, keys] });
MIX.fadeOut(mix, DURATION - 0.7, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: parseFloat(process.env.LUFS || '-13') });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS` : ''})`);
