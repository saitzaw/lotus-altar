"use strict";
/* The temple's statues as signed distance fields (statue-local units, throne top at y = .5, facing +z),
   meshed with surface nets. Runs in a Web Worker; falls back to the main thread.
   Figures: guanyin (1F, white porcelain), medicine (4F, Medicine Buddha), shakyamuni (the temple hall), maitreya (7F, laughing Maitreya). */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * .25; }
function smax(a, b, k) { return -smin(-a, -b, k); }
function ell(x, y, z, rx, ry, rz) {
  const a = x / rx, b = y / ry, c = z / rz, k0 = Math.sqrt(a * a + b * b + c * c);
  const a2 = a / rx, b2 = b / ry, c2 = c / rz, k1 = Math.sqrt(a2 * a2 + b2 * b2 + c2 * c2);
  return k1 < 1e-9 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1;
}
function cone(x, y, z, ax, ay, az, ra, bx, by, bz, rb) {
  const px = x - ax, py = y - ay, pz = z - az, dx = bx - ax, dy = by - ay, dz = bz - az;
  const h = clamp((px * dx + py * dy + pz * dz) / (dx * dx + dy * dy + dz * dz), 0, 1);
  const qx = px - dx * h, qy = py - dy * h, qz = pz - dz * h;
  return Math.sqrt(qx * qx + qy * qy + qz * qz) - (ra + (rb - ra) * h);
}
function sstep(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

// serene face shared by Guanyin and the Medicine Buddha (head centre near y = 2.34)
function faceSDF(x, y, z, ax) {
  let H = smin(ell(x, y - 2.34, z - .02, .245, .3, .27), ell(x, y - 2.245, z - .1, .205, .21, .2), .08);
  H = smin(H, ell(ax - .1, y - 2.25, z - .2, .09, .08, .08), .05);          // cheeks
  H = smin(H, ell(x, y - 2.11, z - .2, .07, .05, .065), .05);                // chin
  H = smax(H, -ell(ax - .085, y - 2.34, z - .29, .068, .03, .04), .025);     // eye sockets
  H = smin(H, ell(ax - .085, y - 2.333 + .9 * (ax - .085) * (ax - .085), z - .262, .054, .014, .024), .01); // lowered eyelids, gently curved
  H = smin(H, ell(ax - .09, y - 2.388 + 2.2 * (ax - .07) * (ax - .07), z - .268, .09, .011, .022), .04); // soft brow arches
  H = smin(H, cone(x, y, z, 0, 2.365, .282, .018, 0, 2.275, .312, .026), .035); // nose
  H = smin(H, ell(ax - .025, y - 2.27, z - .29, .021, .017, .02), .02);      // nostril wings
  H = smin(H, ell(x, y - 2.222, z - .296, .046, .012, .021), .01);           // upper lip
  H = smin(H, ell(x, y - 2.202, z - .291, .038, .014, .021), .01);           // lower lip
  H = smax(H, -ell(x, y - 2.212, z - .318, .044, .0028, .03), .006);         // mouth line
  H = smin(H, Math.hypot(x, y - 2.425, z - .29) - .011, .008);               // urna
  H = smin(H, smin(ell(ax - .25, y - 2.27, z, .035, .12, .07), ell(ax - .255, y - 2.12, z + .005, .03, .055, .04), .04), .02); // long ears
  return H;
}

function guanyinHead(x, y, z, ax) {
  const hb = ell(x, y - 2.45, z - .02, .4, .55, .42);
  if (hb > .12) return hb;
  let H = faceSDF(x, y, z, ax);
  // hair, combed back with fine grooves, and the high topknot
  let hair = ell(x, y - 2.41, z + .01, .262, .27, .285);
  hair = smax(hair, 2.52 - .4 * clamp(.24 - z, 0, .5) - y, .025);
  hair += .003 * Math.sin(Math.atan2(x, z) * 70);
  H = smin(H, hair, .015);
  H = smin(H, ell(x, y - 2.7, z + .02, .14, .17, .14) + .004 * Math.sin(Math.atan2(x, z + .02) * 16 + y * 30), .06);
  // crown band, front plaque and side ornaments
  H = smin(H, Math.hypot(Math.hypot(x * 1.06, z * .97) - .245, y - 2.55) - .013, .01);
  H = smin(H, ell(x, y - 2.66, z - .17, .07, .085, .02), .02);
  H = smin(H, ell(ax - .15, y - 2.61, z - .15, .032, .045, .016), .015);
  return H;
}

function veilSDF(x, y, z) {
  const vb = ell(x, y - 1.9, z + .05, .85, 1.25, .6);
  if (vb > .1) return vb;
  let o = ell(x, y - 2.44, z + .04, .335, .47, .355);                        // hood
  o = smin(o, ell(x, y - 1.74, z + .08, .68, .56, .3), .22);                 // over the shoulders
  o = smin(o, ell(x, y - 1.22, z + .14, .68, .62, .27), .25);                // falling down the back
  o += (.003 + .009 * sstep(2.1, 1.2, y)) * Math.sin(Math.atan2(x, z + .1) * 9 + y * 1.3);
  const th = .017 + .5 * sstep(2.02, 1.8, y);                                 // thin hood, solid drape below
  let s = Math.max(o, -(o + 2 * th) ) ;
  s = smax(s, z - (-.07 + .24 * sstep(1.82, 2.12, y)), .02);                 // open at the face and chest
  return smax(s, .78 - y, .02);
}

function guanyin(x, y, z) {
  const ax = Math.abs(x);
  // crossed legs under the robe, with folds radiating from the lap
  let lap = ell(x, y - .74, z - .12, .98, .27, .62);
  lap = smin(lap, ell(ax - .74, y - .72, z - .38, .3, .21, .3), .15);
  lap = smin(lap, ell(x, y - .6, z - .55, .55, .13, .2), .1);
  lap += .011 * Math.sin(Math.atan2(x, z + .05) * 9 + Math.hypot(x, z) * 5) * sstep(.6, .85, y);
  // torso, robe folds fanning down from the neck
  let tor = smin(ell(x, y - 1.05, z - .02, .47, .32, .32), ell(x, y - 1.48, z, .46, .42, .3), .2);
  tor = smin(tor, ell(ax - .4, y - 1.7, z + .02, .2, .14, .18), .12);
  tor += .006 * Math.sin(Math.atan2(x, z) * 11 + y * 4);
  tor = smin(tor, ell(x, y - 1.15, z - .29, .3, .02, .03), .08);                    // soft sash at the waist
  let d = smin(lap, tor, .12);
  // arms in wide hanging sleeves, hands cupped in the lap
  let arm = cone(ax, y, z, .5, 1.66, -.01, .13, .64, 1.18, .18, .11);
  arm = smin(arm, cone(ax, y, z, .64, 1.18, .18, .1, .22, 1.0, .5, .07), .06);
  arm = smin(arm, ell(ax - .52, y - 1.0, z - .3, .22, .17, .24) + .006 * Math.sin(y * 20 + ax * 9), .12);
  d = smin(d, arm, .08);
  let hand = ell(ax - .11, y - .98, z - .55, .11, .045, .085);
  hand = smin(hand, ell(ax - .06, y - 1.015, z - .5, .03, .022, .05), .02);
  d = smin(d, hand, .03);
  d = smin(d, cone(x, y, z, 0, 1.8, -.01, .11, 0, 2.12, .02, .1), .08);            // neck
  d = smin(d, guanyinHead(x, y, z, ax), .04);
  d = Math.min(d, veilSDF(x, y, z));
  return smax(d, .5 - y, .01);                                                      // sits flat on the throne
}

/* ---------- 4F: the Medicine Buddha (藥師佛), seated, lapis-blue curls, holding the medicine jar ---------- */
const snail = (x, y, z) => .008 * Math.sin(x * 95) * Math.sin(y * 95) * Math.sin(z * 95);
function medHair(x, y, z) {
  let hair = ell(x, y - 2.41, z + .01, .265, .275, .29);
  hair = smax(hair, 2.5 - .38 * clamp(.24 - z, 0, .5) - y, .02);
  return smin(hair, ell(x, y - 2.66, z, .16, .14, .16), .05) + snail(x, y, z);   // curls over the skull and the ushnisha
}
function medJar(x, y, z) {
  let j = smax(ell(x + .06, y - 1.09, z - .52, .12, .09, .12), 1.02 - y, .01);
  j = smin(j, ell(x + .06, y - 1.17, z - .52, .075, .03, .075), .02);
  return smin(j, Math.hypot(x + .06, y - 1.215, z - .52) - .025, .01);
}
// the seated Buddha's body; the Medicine Buddha holds the jar, Shakyamuni rests his left hand in his lap
function seatedBuddha(x, y, z, jar) {
  const ax = Math.abs(x);
  let lap = ell(x, y - .74, z - .12, 1.0, .28, .64);
  lap = smin(lap, ell(ax - .76, y - .72, z - .38, .3, .21, .3), .15);
  lap = smin(lap, ell(x, y - .6, z - .55, .58, .13, .2), .1);
  lap += .01 * Math.sin(Math.atan2(x, z + .05) * 8 + Math.hypot(x, z) * 5) * sstep(.6, .85, y);
  lap = smin(lap, ell(x - .34, y - .93, z - .46, .15, .045, .085), .03);           // upturned sole
  let tor = smin(ell(x, y - 1.05, z - .02, .5, .33, .33), ell(x, y - 1.48, z, .5, .44, .31), .2);
  tor = smin(tor, ell(ax - .43, y - 1.7, z + .02, .21, .15, .19), .12);
  tor = smin(tor, cone(x, y, z, -.46, 1.8, .02, .07, .32, 1.02, .3, .05), .06);     // robe over the left shoulder
  tor += .005 * Math.sin((x * .7 + y) * 26) * (.2 + .8 * sstep(.25, -.05, x));   // diagonal folds of the robe, fading out on the bare side
  let d = smin(lap, tor, .12);
  let arm = cone(x, y, z, -.53, 1.66, -.01, .135, -.66, 1.18, .18, .115);           // left arm to the lap
  arm = smin(arm, cone(x, y, z, -.66, 1.18, .18, .1, -.14, 1.0, .5, .075), .06);
  arm = smin(arm, ell(x + .58, y - 1.4, z - .04, .2, .34, .2), .1);
  arm = smin(arm, cone(x, y, z, .53, 1.66, -.01, .13, .68, 1.15, .22, .1), .06);    // right arm to the knee
  arm = smin(arm, cone(x, y, z, .68, 1.15, .22, .09, .74, .92, .52, .07), .05);
  d = smin(d, arm, .08);
  d = smin(d, ell(x + .06, y - .98, z - .52, .14, .045, .1), .03);                  // left palm under the jar
  d = smin(d, ell(x - .74, y - .88, z - .58, .075, .035, .11), .03);                // right hand on the knee, palm out
  d = smin(d, cone(x, y, z, 0, 1.8, -.01, .115, 0, 2.12, .02, .105), .08);
  const hb = ell(x, y - 2.45, z - .02, .4, .5, .42);
  d = hb < .12 ? smin(d, smin(faceSDF(x, y, z, ax), medHair(x, y, z), .015), .04) : Math.min(d, hb);
  if (jar) d = Math.min(d, medJar(x, y, z));
  return smax(d, .5 - y, .01);
}
const medicine = (x, y, z) => seatedBuddha(x, y, z, true);
// the great hall: Shakyamuni (釋迦牟尼佛) in the earth-touching gesture, right hand over the knee, left hand in the lap
const shakyamuni = (x, y, z) => seatedBuddha(x, y, z, false);

/* ---------- 8F: Maitreya (彌勒佛) as the laughing Budai, right knee raised, beads and cloth sack ---------- */
function beads(x, y, z) {
  const px = x - .56, py = y - 1.08, pz = z - .7, R = .15, n = 18;
  const k = Math.round(Math.atan2(py, px) / (TAU / n)) * (TAU / n);
  return Math.hypot(px - R * Math.cos(k), py - R * Math.sin(k), pz) - .03;
}
function maitreyaHead(x, y, z, ax) {
  let H = smin(ell(x, y - 2.14, z - .04, .3, .3, .3), ell(x, y - 2.03, z - .12, .28, .25, .25), .1);
  H = smin(H, ell(ax - .15, y - 2.02, z - .27, .12, .1, .09), .06);                // round laughing cheeks
  H = smin(H, ell(x, y - 1.84, z - .2, .16, .07, .11), .06);                       // double chin
  H = smax(H, -ell(ax - .11, y - 2.13 + 3.2 * (ax - .11) * (ax - .11), z - .335, .065, .009, .04), .01); // eyes squeezed into crescents
  H = smin(H, ell(ax - .11, y - 2.2 + 2 * (ax - .1) * (ax - .1), z - .32, .08, .012, .03), .03);         // raised brows
  H = smin(H, cone(x, y, z, 0, 2.13, .32, .025, 0, 2.04, .36, .04), .035);         // nose
  H = smin(H, ell(ax - .035, y - 2.04, z - .33, .028, .022, .025), .02);
  H = smax(H, -ell(x, y - 1.93 - 2.6 * x * x, z - .34, .12, .028, .06), .02);       // wide open smile
  H = smin(H, smin(ell(ax - .3, y - 2.1, z, .04, .15, .08), ell(ax - .31, y - 1.94, z, .035, .06, .05), .04), .02); // long ears
  return H;
}
function sack(x, y, z) {
  return smin(ell(x + 1.02, y - .86, z + .1, .38, .36, .33), cone(x, y, z, -1.0, 1.15, -.05, .08, -.95, 1.32, -.02, .04), .06);
}
function maitreya(x, y, z) {
  const ax = Math.abs(x);
  let legs = ell(x + .12, y - .72, z - .15, 1.02, .26, .62);                       // left leg folded flat
  legs += .01 * Math.sin(Math.atan2(x + .1, z) * 7 + Math.hypot(x, z) * 4) * sstep(.6, .85, y);
  legs = smin(legs, ell(x - .5, y - 1.0, z - .4, .26, .32, .27), .12);              // raised right knee
  legs = smin(legs, cone(x, y, z, .52, 1.05, .5, .17, .44, .62, .74, .13), .08);   // shin
  legs = smin(legs, ell(x - .42, y - .58, z - .86, .1, .075, .17), .05);           // foot
  let body = smin(ell(x, y - 1.2, z - .24, .6, .56, .52), ell(x, y - 1.66, z - .02, .54, .4, .36), .2); // belly and chest
  body = smin(body, ell(ax - .47, y - 1.8, z, .24, .17, .22), .12);
  body = smax(body, -(Math.hypot(x, y - 1.2, z - .77) - .03), .02);                // navel
  body = smin(body, cone(ax, y, z, .3, 1.95, .18, .035, .52, 1.05, .5, .045), .04); // edges of the open robe
  let d = smin(legs, body, .14);
  let arm = cone(x, y, z, .57, 1.78, 0, .14, .76, 1.36, .24, .12);                 // right arm on the raised knee
  arm = smin(arm, cone(x, y, z, .76, 1.36, .24, .1, .56, 1.26, .6, .08), .06);
  arm = smin(arm, cone(-x, y, z, .57, 1.78, 0, .14, .8, 1.3, .12, .12), .06);      // left arm down to the sack
  arm = smin(arm, cone(-x, y, z, .8, 1.3, .12, .1, .74, .96, .46, .08), .06);
  arm = smin(arm, ell(ax - .74, y - 1.32, z - .22, .24, .27, .27) + .006 * Math.sin(y * 20), .1); // wide sleeves
  d = smin(d, arm, .08);
  d = smin(d, ell(x - .54, y - 1.23, z - .66, .09, .06, .1), .03);
  d = smin(d, ell(x + .74, y - .93, z - .52, .1, .05, .1), .03);
  d = smin(d, sack(x, y, z), .05);
  d = Math.min(d, beads(x, y, z));
  const hb = ell(x, y - 2.1, z - .06, .45, .45, .45);
  d = hb < .12 ? smin(d, maitreyaHead(x, y, z, ax), .05) : Math.min(d, hb);
  return smax(d, .5 - y, .01);
}

/* ---------- the gate: a pair of stone guardian lions (石獅) on carved plinths ---------- */
function box(x, y, z, bx, by, bz) {
  const qx = Math.abs(x) - bx, qy = Math.abs(y) - by, qz = Math.abs(z) - bz;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0);
}
function lion(x, y, z) {
  const ax = Math.abs(x);
  let d = Math.min(box(x, y - .22, z, .78, .22, 1.02) - .02, box(x, y - .5, z, .7, .06, .94) - .02);   // plinth
  let b = ell(x, y - 1.0, z + .42, .6, .48, .52);                                   // haunches
  b = smin(b, ell(x, y - 1.38, z - .02, .48, .6, .46), .2);                         // chest
  b = smin(b, ell(ax - .48, y - .72, z + .2, .2, .16, .32), .08);                   // hind paws
  // one forepaw rests on the embroidered ball, the other stands on the plinth
  b = smin(b, cone(x, y, z, .32, 1.2, .32, .15, .38, .95, .66, .12), .08);
  b = smin(b, ell(x - .38, y - .92, z - .72, .15, .08, .18), .04);
  b = smin(b, cone(x, y, z, -.3, 1.2, .32, .15, -.3, .62, .55, .12), .08);
  b = smin(b, ell(x + .3, y - .6, z - .66, .15, .08, .2), .04);
  d = Math.min(d, Math.hypot(x - .4, y - .72, z - .74) - .2 + .012 * Math.sin(x * 40) * Math.sin(z * 40));
  // head framed by a mane of tight curls
  let m = ell(x, y - 1.92, z - .1, .56, .56, .5) + .022 * Math.sin(x * 34) * Math.sin(y * 34) * Math.sin(z * 34);
  let h = ell(x, y - 2.02, z - .32, .42, .4, .38);
  h = smin(h, ell(x, y - 1.9, z - .66, .24, .18, .17), .08);                         // muzzle
  h = smin(h, ell(x, y - 1.99, z - .82, .11, .07, .07), .03);                        // nose
  h = smin(h, ell(ax - .17, y - 2.13, z - .64, .085, .075, .065), .02);              // bulging eyes
  h = smin(h, ell(ax - .18, y - 2.24, z - .6, .13, .05, .07), .04);                  // heavy brows
  h = smax(h, -ell(x, y - 1.78, z - .76, .17, .06, .14), .03);                       // open mouth
  h = smin(h, ell(ax - .38, y - 2.3, z - .3, .08, .12, .05), .04);                   // ears
  d = Math.min(d, smin(b, smin(m, h, .06), .12));
  return smin(d, ell(x, y - 1.25, z + .95, .2, .35, .14) + .02 * Math.sin(y * 30 + x * 20), .06); // curled tail
}
const lionL = (x, y, z) => lion(-x, y, z);   // its partner, mirrored

const FIGURES = { guanyin, medicine, shakyamuni, maitreya, lion, lionL };
// base colour per point (multiplied by baked occlusion); guanyin keeps her plain white glaze
const GOLD = [1, .76, .4];
const TINT = {
  medicine: (x, y, z) => medHair(x, y, z) < .014 ? [.16, .27, .72] : medJar(x, y, z) < .01 ? [.15, .36, .82] : GOLD,
  shakyamuni: (x, y, z) => medHair(x, y, z) < .014 ? [.1, .13, .3] : GOLD,
  maitreya: (x, y, z) => beads(x, y, z) < .01 ? [.42, .22, .1] : sack(x, y, z) < .012 ? [.95, .7, .42] : GOLD,
  lion: (x, y) => y < .58 ? [.5, .48, .45] : [.68, .66, .62],
  lionL: (x, y) => y < .58 ? [.5, .48, .45] : [.68, .66, .62]
};
let sdf = guanyin;

function build(job) {
  sdf = FIGURES[job.figure] || guanyin;
  const tint = TINT[job.figure];
  const [x0, y0, z0] = job.min, [x1, y1, z1] = job.max, c = job.cell;
  const nx = Math.ceil((x1 - x0) / c) + 1, ny = Math.ceil((y1 - y0) / c) + 1, nz = Math.ceil((z1 - z0) / c) + 1, sxy = nx * ny;
  // coarse pass first: only evaluate the full field near the surface
  const S = 4, cnx = Math.ceil((nx - 1) / S) + 1, cny = Math.ceil((ny - 1) / S) + 1, cnz = Math.ceil((nz - 1) / S) + 1;
  const co = new Float32Array(cnx * cny * cnz);
  for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++)
    co[i + j * cnx + k * cnx * cny] = sdf(x0 + i * S * c, y0 + j * S * c, z0 + k * S * c);
  const thr = S * c * 2.2, f = new Float32Array(nx * ny * nz);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const cv = co[Math.round(i / S) + Math.round(j / S) * cnx + Math.round(k / S) * cnx * cny];
    f[i + j * nx + k * sxy] = Math.abs(cv) > thr ? cv : sdf(x0 + i * c, y0 + j * c, z0 + k * c);
  }
  // surface nets: one vertex per cell that straddles the surface
  const cx = nx - 1, cy = ny - 1, cz = nz - 1;
  const cellV = new Int32Array(cx * cy * cz).fill(-1);
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const v = new Float32Array(8), pos = [];
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let mask = 0;
    for (let q = 0; q < 8; q++) { v[q] = f[(i + (q & 1)) + (j + ((q >> 1) & 1)) * nx + (k + ((q >> 2) & 1)) * sxy]; if (v[q] < 0) mask |= 1 << q; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of E) {
      if (((mask >> a) & 1) === ((mask >> b) & 1)) continue;
      const t = v[a] / (v[a] - v[b]);
      sx += (a & 1) + t * ((b & 1) - (a & 1));
      sy += ((a >> 1) & 1) + t * (((b >> 1) & 1) - ((a >> 1) & 1));
      sz += ((a >> 2) & 1) + t * (((b >> 2) & 1) - ((a >> 2) & 1));
      n++;
    }
    cellV[i + j * cx + k * cx * cy] = pos.length / 3;
    pos.push(x0 + (i + sx / n) * c, y0 + (j + sy / n) * c, z0 + (k + sz / n) * c);
  }
  const idx = [], cstr = [1, cx, cx * cy], gstr = [1, nx, sxy], co3 = [0, 0, 0];
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    const g = i + j * nx + k * sxy, a = f[g], c0 = i + j * cx + k * cx * cy;
    co3[0] = i; co3[1] = j; co3[2] = k;
    for (let d = 0; d < 3; d++) {
      const u = (d + 1) % 3, w = (d + 2) % 3;
      if (co3[u] === 0 || co3[w] === 0) continue;
      if ((a < 0) === (f[g + gstr[d]] < 0)) continue;
      const v0 = cellV[c0], v1 = cellV[c0 - cstr[u]], v2 = cellV[c0 - cstr[u] - cstr[w]], v3 = cellV[c0 - cstr[w]];
      if (v0 < 0 || v1 < 0 || v2 < 0 || v3 < 0) continue;
      idx.push(v0, v1, v2, v0, v2, v3);
    }
  }
  // Taubin smoothing (shrink, then inflate) irons out the grid's stair-steps without losing volume
  const nv = pos.length / 3, P = new Float32Array(pos), sum = new Float32Array(nv * 3), cnt = new Float32Array(nv);
  for (let it = 0; it < 8; it++) {
    const lam = it % 2 ? -.53 : .5;
    sum.fill(0); cnt.fill(0);
    for (let t = 0; t < idx.length; t += 3) for (let e = 0; e < 3; e++) {
      const a = idx[t + e], b = idx[t + (e + 1) % 3];
      sum[a * 3] += P[b * 3]; sum[a * 3 + 1] += P[b * 3 + 1]; sum[a * 3 + 2] += P[b * 3 + 2]; cnt[a]++;
      sum[b * 3] += P[a * 3]; sum[b * 3 + 1] += P[a * 3 + 1]; sum[b * 3 + 2] += P[a * 3 + 2]; cnt[b]++;
    }
    for (let q = 0; q < nv; q++) if (cnt[q]) for (let k = 0; k < 3; k++) P[q * 3 + k] += lam * (sum[q * 3 + k] / cnt[q] - P[q * 3 + k]);
  }
  // normals from the field gradient, ambient occlusion baked into vertex colours
  const N = new Float32Array(nv * 3), C = new Float32Array(nv * 3), h = c;
  for (let q = 0; q < nv; q++) {
    const x = P[q * 3], y = P[q * 3 + 1], z = P[q * 3 + 2];
    const a = sdf(x + h, y - h, z - h), b = sdf(x - h, y - h, z + h), e = sdf(x - h, y + h, z - h), g = sdf(x + h, y + h, z + h);
    let gx = a - b - e + g, gy = -a - b + e + g, gz = -a + b - e + g;
    const l = Math.hypot(gx, gy, gz) || 1; gx /= l; gy /= l; gz /= l;
    N[q * 3] = gx; N[q * 3 + 1] = gy; N[q * 3 + 2] = gz;
    let occ = 0, sca = 1;
    for (let s = 0; s < 5; s++) { const hh = .008 + .025 * s; occ += (hh - sdf(x + gx * hh, y + gy * hh, z + gz * hh)) * sca; sca *= .8; }
    const ao = clamp(1 - 2.4 * occ, 0, 1), t = .35 + .65 * ao;
    if (tint) { const b = tint(x, y, z), s = .28 + .72 * t; C[q * 3] = b[0] * s; C[q * 3 + 1] = b[1] * s; C[q * 3 + 2] = b[2] * s; }
    else { C[q * 3] = .58 + .42 * t; C[q * 3 + 1] = .52 + .48 * t; C[q * 3 + 2] = .47 + .53 * t; }
  }
  // wind every triangle to face along the field normal
  const I = new Uint32Array(idx);
  for (let t = 0; t < I.length; t += 3) {
    const A = I[t] * 3, B = I[t + 1] * 3, D = I[t + 2] * 3;
    const ux = P[B] - P[A], uy = P[B + 1] - P[A + 1], uz = P[B + 2] - P[A + 2];
    const wx = P[D] - P[A], wy = P[D + 1] - P[A + 1], wz = P[D + 2] - P[A + 2];
    const fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx;
    const sx = N[A] + N[B] + N[D], sy = N[A + 1] + N[B + 1] + N[D + 1], sz = N[A + 2] + N[B + 2] + N[D + 2];
    if (fx * sx + fy * sy + fz * sz < 0) { const s = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = s; }
  }
  return { pos: P, nor: N, col: C, idx: I };
}

if (typeof importScripts === "function") {
  self.onmessage = e => e.data.jobs.forEach((job, i) => {
    const r = build(job);
    postMessage({ i, pos: r.pos, nor: r.nor, col: r.col, idx: r.idx }, [r.pos.buffer, r.nor.buffer, r.col.buffer, r.idx.buffer]);
  });
}
