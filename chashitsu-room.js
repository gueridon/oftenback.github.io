// chashitsu-room.js
// ---------------------------------------------------------------------------
// The room, as data. One table, and two things read it: the flat plan in
// chashitsu.html and the room built in three dimensions.
//
// It comes out of the page for the same reason the utensils did, and with a
// sharper edge to it: a plan and a room that disagree are worse than either
// alone. Read from one table they cannot disagree, and a correction is a
// number in one place.
//
// EVERYTHING HERE IS IN MAT WIDTHS, and that turns out to be already true to
// scale. A Kyoto mat is 1910 by 955mm, so one unit is 0.955m and the three unit
// room is 2865mm square, which is a four and a half mat room. RO = 0.44 units
// is 420mm against a real hearth of 1.4 shaku, 424. The plan was measured in
// the right currency from the start; it only ever lacked the exchange rate.
// ---------------------------------------------------------------------------
(function (global) {
  "use strict";

  // A Kyoto mat, in metres. Six point three shaku by three point one five.
  const MAT_LONG = 1.910, MAT_WIDE = 0.955;

  // ---- the room -----------------------------------------------------------
  // Three units square. A tatami is twice as long as it is wide, so four of
  // them turning about a half mat in the middle is exactly 3x3 -- which is
  // why four AND A HALF is the number, and why the half mat is at the centre
  // rather than tucked in a corner.
  const U = 3;
  const RO = 0.44;                 // the hearth: a bit under half a mat wide
  // WHERE THE RO IS, and this is OPEN, deliberately, with the evidence written
  // down so nobody has to gather it twice.
  //
  // Urasenke, page 129 and the footwork plans on page 105, is unambiguous on
  // two of the four: in `yojohangiri` and `daimegiri` the ro is cut in the RO
  // MAT, the rodatami, at its corner against the temaedatami -- NOT in the
  // host's own mat, which is where all four of ours put it. In `mukogiri` and
  // `sumiro` it IS in the temaedatami, inner side and outer side. Four
  // independent readings agree: the glossary, the four diagrams, the named-mat
  // diagram on page 55, and the oriented footwork plans on page 105.
  //
  // What blocks the correction is that the book stages its temae in an
  // EIGHT-MAT hiroma, and every one of those plans is that room. The rodatami
  // there is a narrow mat particular to it. Ours is a four-and-a-half. The ro
  // position carries the same name in both, but the mats around it do not, so
  // "the corner of the rodatami" and the "24 cm in front of the knees" do not
  // transpose by analogy: placed at the corner of our centre mat, the host's
  // knees land on the very edge of his own mat and the mizusashi falls off it.
  //
  // SETTLED 2026-09-11 for yojohangiri and daimegiri, by the schema on page 84
  // that Nicolas put in front of me, plus his own reading of it: the host sits
  // DIAGONALLY on the mat, more across its width than along its length. The
  // schema shows him on the temaedatami, to the LEFT of the ro and at its
  // level, with the chawan and natsume in front of him, the mizusashi beyond
  // them, and the kensui at his left.
  //
  // And the glossary gives the rule I had read without seeing its weight, at
  // `uchizumi`, page 128: the corners of the ro frame joint nearest the
  // dogudatami "are used in ro temae as AIMING POINTS for the host's
  // prescribed sitting position at the temaeza." So his facing is not a taste
  // and not one of our four rules: he aims at that corner.
  //
  // So these two now read ro [1.00, 1.00] -- the corner of the ro mat against
  // the temaedatami -- and the host at the mat's width centre, at the ro's
  // mid height, facing that corner. `mukogiri` and `sumiro` are LEFT ALONE:
  // the schema does not cover them, and the ro is in the temaedatami there
  // anyway.

  // Mats, in the pinwheel. Named by where they lie so the eight can point at
  // them without repeating coordinates.
  const MATS = {
    toko:  { x: 0, y: 0, w: 2, h: 1 },   // along the alcove
    right: { x: 2, y: 0, w: 1, h: 2 },
    lower: { x: 1, y: 2, w: 2, h: 1 },
    left:  { x: 0, y: 1, w: 1, h: 2 },
    half:  { x: 1, y: 1, w: 1, h: 1 },
  };

  // ---- the eight ----------------------------------------------------------
  // NAMED AS URASENKE NAMES THEM, 2026-09-11, from Urasenke Tea Procedure
  // Guidebook 2, "The Four Hongatte Positions of the Ro", page 129, and the
  // glossary on page 128. The distinction is not pedantry: `yojohan` is the
  // four-and-a-half-mat ROOM and `yojohangiri` is the position of the ro in
  // it; likewise `daime` is the shortened MAT and `daimegiri` the ro position
  // cut beside it. We had been labelling the arrangements with the names of
  // the objects. And what Sadler calls `sumi-giri`, the corner hearth, that
  // book calls `sumiro`; where two sources differ we now follow Urasenke, as
  // the authoritative modern school. Nicolas: "on suit Urasenke en bons
  // disciples."
  //
  // The GEOMETRY of these four does not yet follow. See the note on `ro` below.
  // Sadler: "the Four-and-a-half mat, the Daime, the Muko-giri or Opposite
  // Hearth, and the Sumi-giri or Corner Hearth, each in two styles, Normal
  // and Reverse." Normal is the hearth on the left with the host in front of
  // it and the guests to his right; Reverse is that mirrored.
  //
  // Each entry is only: which mat the host works from, where on it the
  // hearth is cut, and whether the mat is shortened. Everything drawn
  // follows from those, so a correction is a number.
  const TYPES = [
    // WHERE THE HOST KNEELS, and this one is not a rule: Nicolas placed him,
    // 2026-09-11, on the plan in temaeza.html. 0.764 of the mat's
    // width, which is 730mm across a 955 mat -- and the schema on page 84,
    // measured independently off his screenshot, puts the host's mark at 0.71
    // of the same width. Two readings that never met agree to five centimetres.
    // `facing` is degrees above the mat's across-axis, and it is stored rather
    // than derived because the aiming-corner rule only gave 23.7 from the
    // mat's centre: from where he now sits that corner would turn him to 39.
    { key: "yojohangiri", jp: "四畳半切", rom: "yojohangiri", pillar: false,
      temae: "left", ro: [1.00, 1.00], host: [0.7644, 1.1832], facing: 18.7,
      guests: [[2.5, 0.5], [2.5, 1.5]],
      note: "The ordinary room, and the original. Said to be so proportioned " +
            "because an eighteen mat hall at Kamakura was divided in four and " +
            "one quarter screened off for tea. The hearth is cut at the corner " +
            "of the half mat at the centre, against the host's own." },
    { key: "daimegiri", jp: "台目切", rom: "daimegiri", pillar: true,
      temae: "left", shorten: 0.75, ro: [1.00, 1.00], host: [0.50, 1.22],
      guests: [[2.5, 0.5], [2.5, 1.5]],
      note: "A mat cut about a quarter short, used as the utensil mat, with " +
            "the hearth beside it. Being LARGER than half a mat it has a " +
            "desirable asymmetry. The middle pillar, the naka-bashira, stands " +
            "at the hearth: Rikyu's son Do-an suggested it, and Oribe made the " +
            "three mat daime popular." },
    { key: "mukogiri", jp: "向切", rom: "mukogiri", pillar: false,
      temae: "left", ro: [0.56, 2.50], host: [0.42, 2.00], guests: [[2.5, 0.5], [2.5, 1.5]],
      note: "The hearth cut at the far END of the mat instead of in the " +
            "middle. The host works turned away from the centre of the room, " +
            "which changes the whole choreography of the procedure." },
    { key: "sumiro", jp: "隅炉", rom: "sumiro", pillar: false,
      temae: "left", ro: [0.00, 1.06], host: [0.52, 1.62], guests: [[2.5, 0.5], [2.5, 1.5]],
      note: "Cut in the OUTER corner of the mat rather than on the inner " +
            "side, so the hearth sits against the wall. Sadler: these came " +
            "from lack of space, or from having to enter by a different " +
            "quarter, and only later became variations for their own sake." },
  ];


  global.ROOM = {
    U: U, RO: RO, MATS: MATS, TYPES: TYPES,
    MAT_LONG: MAT_LONG, MAT_WIDE: MAT_WIDE,
    m: (units) => units * MAT_WIDE,       // one unit of the plan, in metres
  };
})(this);
