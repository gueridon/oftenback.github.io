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
  // Sadler: "the Four-and-a-half mat, the Daime, the Muko-giri or Opposite
  // Hearth, and the Sumi-giri or Corner Hearth, each in two styles, Normal
  // and Reverse." Normal is the hearth on the left with the host in front of
  // it and the guests to his right; Reverse is that mirrored.
  //
  // Each entry is only: which mat the host works from, where on it the
  // hearth is cut, and whether the mat is shortened. Everything drawn
  // follows from those, so a correction is a number.
  const TYPES = [
    { key: "yojohan", jp: "四畳半", rom: "four and a half", pillar: false,
      temae: "left", ro: [0.56, 1.06], host: [0.42, 1.62], guests: [[2.5, 0.5], [2.5, 1.5]],
      note: "The ordinary room, and the original. Said to be so proportioned " +
            "because an eighteen mat hall at Kamakura was divided in four and " +
            "one quarter screened off for tea. The hearth is cut in the inner " +
            "corner of the host's mat, against the half mat at the centre." },
    { key: "daime", jp: "台目", rom: "daime", pillar: true,
      temae: "left", shorten: 0.75, ro: [0.56, 1.06], host: [0.42, 1.55],
      guests: [[2.5, 0.5], [2.5, 1.5]],
      note: "A mat cut about a quarter short, used as the utensil mat, with " +
            "the hearth beside it. Being LARGER than half a mat it has a " +
            "desirable asymmetry. The middle pillar, the naka-bashira, stands " +
            "at the hearth: Rikyu's son Do-an suggested it, and Oribe made the " +
            "three mat daime popular." },
    { key: "mukogiri", jp: "向切", rom: "opposite hearth", pillar: false,
      temae: "left", ro: [0.56, 2.50], host: [0.42, 2.00], guests: [[2.5, 0.5], [2.5, 1.5]],
      note: "The hearth cut at the far END of the mat instead of in the " +
            "middle. The host works turned away from the centre of the room, " +
            "which changes the whole choreography of the procedure." },
    { key: "sumigiri", jp: "隅切", rom: "corner hearth", pillar: false,
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
