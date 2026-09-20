// sound-bed.js
// ---------------------------------------------------------------------------
// The two sounds of the place: the wind in the branches, and the water
// murmuring in the kettle.
//
// AND NEITHER OF THEM IS A HISS. Both were, once, and both were wrong in
// the same way: a filtered noise that never stops is a machine, whatever
// it is filtered into. The wind had to be given a deep swell to stop
// being one; the kettle had to lose its continuous voice altogether and
// keep only the two things that start and stop.
//
// THERE WAS A THIRD. Water being poured was built, tuned down from a
// waterfall to a teapot, and then taken out: "le bruit de l'eau est une
// distraction." It was not wrong, it was in the way -- the pouring is the
// thing you are watching, and a sound that arrives exactly when the eye is
// busy competes with it. Nothing of it is left here; this line is, so that
// it does not get built again by someone who thinks it was forgotten.
//
// SYNTHESISED, NOT RECORDED. Nothing is fetched: there is no audio file to
// host, to license, or to fail to load, and a recording of someone else's
// garden would be as borrowed as a photograph of someone else's bowl. All
// three are one loop of white noise put through different filters, which is
// what all three actually are -- moving air, boiling water and falling water
// are broadband noise shaped by the thing they move through.
//
// IT MAKES NO SOUND UNTIL IT IS ASKED TO. Browsers will not start an audio
// context without a gesture, and they are right: a page that begins talking
// on its own is rude. `start()` is called from the first click or key.
//
// Levels are 0..1 and are set every frame by the page, which knows where the
// visitor is standing and how near the fire. Nothing in here knows about
// the room.
// ---------------------------------------------------------------------------
(function (global) {
  "use strict";

  let ctx = null, master = null, noise = null;
  let wind = null, kettle = null;
  let muted = false, gust = 0, gustTo = 0, simmer = 0;
  let clock = 0, flut = 0, windLo = 1, windHi = 0;
  let bubDue = 0, bubbles = 0;
  let started = false;

  // WHITE NOISE, three seconds of it, looped. One buffer for all three
  // voices: three separate noise sources would cost three times as much and
  // sound no different, because the filters are what make them different.
  // Three seconds rather than one, so the loop's own period is longer than
  // anything the ear tracks.
  function noiseBuffer() {
    const n = Math.floor(ctx.sampleRate * 3);
    const b = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  function voice(filters, gain) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    let node = src;
    filters.forEach((f) => { node.connect(f); node = f; });
    const g = ctx.createGain();
    g.gain.value = 0;
    node.connect(g);
    g.connect(master);
    src.start();
    return { src: src, gain: g, at: gain, filters: filters };
  }

  function band(type, freq, q) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    if (q !== undefined) f.Q.value = q;
    return f;
  }

  function start() {
    if (started) return !!ctx;
    started = true;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
    noise = noiseBuffer();

    // THE WIND. A breeze in leaves is a broad hiss with no pitch, gathered
    // low and rolled off at both ends: the high end because leaves are soft,
    // the low because moving air has no body until it is a gale.
    //
    // "Le vent est violent", then "on dirait un white noise machine", and
    // the second is the answer to the first done wrongly: I lowered the
    // LEVEL and flattened the SWELL at the same time, and it is the swell
    // that makes it wind. Loudness is what made it violent; depth is what
    // makes it breathe. They are two knobs and I had turned them together.
    //
    // So: quiet, and moving a great deal. It nearly dies away between
    // gusts, and every gust opens the low-pass as it rises -- moving air
    // gets BRIGHTER as it gets stronger, and that change of colour is the
    // cue the ear actually uses. Under it, a flutter of a few hertz, which
    // is leaves rather than air.
    wind = voice([band("highpass", 130), band("bandpass", 340, 0.5),
                  band("lowpass", 900)], 0);

    // THE KETTLE. "Le son de friture est revenu dans la piece de the",
    // and the last of it was a thin band of surface noise I had kept at a
    // twentieth of the murmur, thinking it too quiet to matter. It was not
    // the level: FRYING IS CONTINUOUS BROADBAND NOISE, and a continuous
    // broadband noise is a fryer at any level. There is no quiet amount of
    // it that becomes water.
    //
    // So it is gone, and the kettle is the two things that are not noise:
    // a low murmur from the body of water and the iron around it, and
    // separate bubbles over it. Both stop and start; neither hisses.
    kettle = voice([band("bandpass", 190, 2.4)], 0);
    return true;
  }

  // ---- what the page asks for, every frame ---------------------------------
  const clamp = (v) => Math.max(0, Math.min(1, v || 0));

  function set(g, want, dt, rise, fall) {
    if (!g) return;
    const now = g.gain.value;
    const k = want > now ? (rise || 3) : (fall || 2);
    g.gain.value = now + (want - now) * Math.min(1, dt * k);
  }

  // Levels are the page's business; the gusting is not, so it lives here.
  function tick(dt, want) {
    if (!ctx) return;
    dt = Math.max(0, Math.min(0.1, dt || 0.016));
    // A BREEZE COMES AND GOES. A steady hiss is a fan; what makes it wind is
    // that it swells and drops on its own, over seconds rather than beats.
    // A random walk toward a new target, re-drawn when it arrives.
    clock += dt;
    // THREE PERIODS THAT DO NOT DIVIDE EACH OTHER, so the pattern never
    // comes round: nine seconds, twenty-one, and a hundred and thirty.
    const s1 = Math.sin(clock * 0.68);
    const s2 = Math.sin(clock * 0.30 + 1.7);
    const s3 = Math.sin(clock * 0.048 + 0.4);
    if (Math.abs(gust - gustTo) < 0.03) gustTo = Math.random();
    gust += (gustTo - gust) * Math.min(1, dt * 0.35);
    // and a flutter at a few hertz, smoothed out of frame-rate noise
    flut += ((Math.random() - 0.5) * 2 - flut) * Math.min(1, dt * 11);
    simmer += dt;
    const breath = 0.82 + 0.18 * Math.sin(simmer * 0.7) *
                          Math.sin(simmer * 0.23);

    // SQUARED, so the quiet is long and the gusts are events: a linear
    // envelope spends half its life at half strength, which is the sound
    // of a machine.
    let env = clamp(0.5 + 0.20 * s1 + 0.26 * s2 + 0.34 * s3 + 0.22 * gust);
    env = env * env;
    const w = clamp(want.wind) * (0.06 + 0.94 * env) * (1 + 0.45 * flut);
    // AND IT LIVES IN THE BOTTOM OF ITS OWN RANGE. "Un vent convaincant
    // mais trop vif: le registre est ce qu'il nous faut, on reste dans le
    // bas de ce range." The shape is kept whole -- the same swell, the same
    // ratio between lull and gust -- and the whole of it is moved down. A
    // gust reaches where a lull used to be.
    //
    // The brightness comes down with it: the high end opening on a gust is
    // what reads as VIF, so its travel is cut from 2600Hz to 1100.
    // FAST ENOUGH TO LET THE FLUTTER THROUGH. Smoothed at the old rate the
    // envelope was averaged away and the result was flat again.
    set(wind && wind.gain, clamp(w) * 0.021, dt, 14, 10);
    if (wind) {
      wind.filters[1].frequency.value = 250 + 200 * env;
      wind.filters[2].frequency.value = 540 + 1100 * env;
    }
    if (wind) {
      const g = wind.gain.gain.value;
      windLo = Math.min(windLo, g); windHi = Math.max(windHi, g);
    }

    const k = clamp(want.kettle) * breath;
    set(kettle && kettle.gain, k * 0.050, dt, 1.5, 1.0);
    // AND THE BUBBLES, five or six a second at full strength and irregular:
    // a steady tick would be a clock. They stop with the kettle, so walking
    // away from the fire takes them with it.
    if (k > 0.02) {
      // FURTHER APART. "Le nouveau son est beau, mais ca n'est pas de
      // l'eau qui fremit: le meme son, plus espace entre les bulles." The
      // voice is kept exactly; only the spacing changes. Six a second is a
      // boil, and the ear reads a boil as frying however each blip is
      // made; two was still a stir; one is a kettle being kept, which is
      // what this one is doing for most of an hour.
      bubDue -= dt * (0.5 + 0.7 * k);
      while (bubDue <= 0) {
        // MOSTLY FAINT, WITH A FEW THAT STAND OUT. "Leger" is not a rate,
        // it is a distribution: an even patter of equal blips is a dripping
        // tap. Squared, so small ones are common and a big one is an event.
        const r = Math.random();
        bubble(k * (0.14 + 0.86 * r * r), r);
        // AND UNEVENLY. At six a second an even spacing passes; at two it
        // is a metronome, so the gap is drawn over a wide range.
        bubDue += 0.30 + Math.random() * 1.8;
      }
    }
  }

  // A SINGLE BUBBLE. "On dirait un film de science fiction, une experience
  // de chimie dans un cartoon", and that is exactly what a clean sine with
  // a wide upward glide is: it is the bloop a cartoonist draws. Three
  // things made it one, and all three were mine.
  //
  //  - A PURE TONE. A bubble is a damped RESONANCE, and a resonance excited
  //    by a burst of noise ticks where a sine sings. Same physics, and the
  //    ear hears a pop instead of a note.
  //  - TOO LONG. Fifty to a hundred milliseconds is a note; a bubble is
  //    fifteen to thirty-five, and at that length nothing has time to
  //    sound musical.
  //  - TOO MUCH GLIDE. A third to nearly double was the cartoon; the real
  //    rise as a bubble shrinks on its way up is a few per cent.
  function bubble(level, size) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const big = size === undefined ? Math.random() : size;
    // a small bubble rings high: the faint ones and the high ones are the
    // same bubble, and pitching them apart is what sounds assembled
    const f0 = 1150 - 620 * big + Math.random() * 260;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    src.playbackRate.value = 0.7 + Math.random() * 0.6;
    const f = band("bandpass", f0, 13);
    f.frequency.setValueAtTime(f0, t);
    f.frequency.linearRampToValueAtTime(f0 * (1.04 + Math.random() * 0.07),
                                        t + 0.016);
    const g = ctx.createGain();
    const dur = 0.015 + Math.random() * 0.020;
    g.gain.setValueAtTime(0.00001, t);
    g.gain.linearRampToValueAtTime(level * 1.9, t + 0.0016);
    g.gain.exponentialRampToValueAtTime(0.00001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.02);
    bubbles++;
  }

  function mute(yes) {
    muted = !!yes;
    if (master) master.gain.value = muted ? 0 : 1;
    return muted;
  }

  // what a test can ask without listening
  function state() {
    return {
      ready: !!ctx, muted: muted,
      rate: ctx ? ctx.sampleRate : 0,
      state: ctx ? ctx.state : "none",
      wind: wind ? +wind.gain.gain.value.toFixed(4) : -1,
      kettle: kettle ? +kettle.gain.gain.value.toFixed(4) : -1,
      gust: +gust.toFixed(3),
      // the range the wind has actually covered since it was last asked:
      // "on dirait un white noise machine" is a question about a range
      windLo: +windLo.toFixed(4), windHi: +windHi.toFixed(4),
      bubbles: bubbles,
    };
  }

  function forget() { windLo = 1; windHi = 0; bubbles = 0; }
  global.SOUND = { start: start, tick: tick, mute: mute, state: state,
                   forget: forget,
                   resume: () => ctx && ctx.resume && ctx.resume() };
})(this);
