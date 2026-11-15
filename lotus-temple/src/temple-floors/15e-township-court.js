  /* ---------- မြို့နယ်တရားရုံး the township court, in its own small walled compound sharing its west wall with the Hluttaw's, across the road
     from the bank; after the owner's photograph of an old court of the colonial years in the Shan hills: two storeys under dark
     hipped roofs of corrugated iron with deep eaves, the main block's ground floor plastered a faded brick red with white arched
     windows and its upper floor whitewashed, behind an upstairs balcony of dark teak rails; a gabled bay brought forward at its
     left end; a wing set back at the right on a ground floor of rubble stone; and behind the wing a red tiered spire with a gilt
     finial. In front, a lawn with clipped shrubs, a stone path from the gate and the flag on its pole ---------- */
  // the gate board's lines: Burmese, Chinese and English (Shan and Tai Nüa to come from the site's owner)
  const COURT_NAMES = { my: "မြို့နယ်တရားရုံး", zh: "镇区法院", en: "Township Court" };
  const COURT = { x: 50, z: 274.5, ry: Math.PI };   // where it stands, its west side on the Hluttaw compound's east wall (x 36) and its front and back walls in line with that compound's; ry turns its front (local +z) south, across the road to the bank. Local (x, z) is world (COURT.x − x, COURT.z − z)
  // the name board over the gate: three lines in white on maroon in a white frame, faintly lit at night
  function courtBoard(parent, x, y, z) {
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256;
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    const N = COURT_NAMES, LINES = [[N.my, '600 72px "Noto Sans Myanmar", "Myanmar Text", sans-serif', 84, 512], [N.zh, '600 64px "Noto Serif SC", "Noto Serif TC", "Songti SC", serif', 202, 300], [N.en, '600 52px "Figtree", sans-serif', 202, 712]];
    const paint = () => {
      const c = cv.getContext("2d");
      c.fillStyle = "#6a1e1a"; c.fillRect(0, 0, 1024, 256); c.strokeStyle = "#fff"; c.lineWidth = 10; c.strokeRect(7, 7, 1010, 242);
      c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
      LINES.forEach(([s, font, ly, lx]) => { c.font = font; c.fillText(s, lx, ly, 960); });
      t.needsUpdate = true;
    };
    paint();
    if (document.fonts && document.fonts.load) Promise.all(LINES.map(([s, font]) => document.fonts.load(font, s).catch(() => {}))).then(paint);
    const m = std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .3, roughness: .6 });
    onDaylight(d => { m.emissiveIntensity = .3 + .5 * (1 - d); });
    flat(mesh(new THREE.PlaneGeometry(4.4, 1.1), m, x, y, z, parent));
  }
  function townshipCourt(g) {
    const C = new THREE.Group(); C.position.set(COURT.x, 0, COURT.z); C.rotation.y = COURT.ry; g.add(C);
    const list = picks.pagoda, N = COURT_NAMES, data = { tip: `The township court · ${N.my}`, toast: `${N.my} in Burmese, ${N.zh} in Chinese: the township court, in an old building of the colonial years next door to the Hluttaw and across the road from the bank: brick red below and whitewashed above under deep dark eaves, a teak balcony upstairs, a wing on rubble stone and a red tiered spire behind. The judge sits in the courtroom upstairs; below are the clerks' rooms and the records, and on the benches on the verandah families wait for their cases to be called. It's only to look at.` };
    const P = .5, FH = 3.5, F2 = P + FH, EV = P + 2 * FH;   // the plinth, a storey, the upper floor, the eaves
    const white = std({ color: 0xf2efe6, roughness: .9 }), trim = std({ color: 0xfbfaf4, roughness: .8 }), brick = std({ color: 0x9a3e2c, roughness: .9 });
    const teakD = std({ color: 0x1a0c06, roughness: .7 }), roofM = std({ color: 0x0c0604, roughness: .7, side: THREE.DoubleSide }), roofW = std({ color: 0x1c0804, roughness: .7, side: THREE.DoubleSide });
    const red = std({ color: 0x5a0a06, roughness: .5, side: THREE.DoubleSide }), doorM = std({ color: 0x3a2214, roughness: .6 });
    const rs = rng(7373), stoneM = std({ map: canvasTex(128, (c, s) => {   // rubble stone laid in rough courses, grey and buff
      c.fillStyle = "#5a5046"; c.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 16) for (let x = -(y / 16 % 2) * 10; x < s; x += 14 + rs() * 10) { const v = 120 + rs() * 50 | 0; c.fillStyle = `rgb(${v + 14},${v + 4},${v - 12})`; c.fillRect(x + 1, y + 1, 12 + rs() * 8, 13); }
    }), roughness: .95 });
    const geos = {}, box = (w, h, d) => geos[[w, h, d]] || (geos[[w, h, d]] = new THREE.BoxGeometry(w, h, d));
    const halfDisc = r => geos["d" + r] || (geos["d" + r] = new THREE.CircleGeometry(r, 12, 0, Math.PI));
    // a window on a wall facing local +z of its frame, its sill at y: dark panes, a mullion, a white surround and sill; `arched`: a
    // round head; `door`: a dark door in place of glass
    const win = (x, y, z, ry, w, h, arched, door) => {
      const o = new THREE.Group(); o.position.set(x, y, z); o.rotation.y = ry; C.add(o);
      const hs = arched ? h - w / 2 : h, pane = door ? doorM : townGlass;
      part(box(w, hs, .06), pane, 0, hs / 2, .01, o);
      if (arched) { part(halfDisc(w / 2 + .14), trim, 0, hs, .02, o); part(halfDisc(w / 2), pane, 0, hs, .05, o); }
      else part(box(w + .28, .14, .1), trim, 0, h + .07, .04, o);
      [-1, 1].forEach(sd => part(box(.14, hs, .1), trim, sd * (w / 2 + .07), hs / 2, .04, o));
      part(box(.05, hs, .08), teakD, 0, hs / 2, .03, o);
      if (!door) part(box(w + .3, .1, .2), trim, 0, -.05, .08, o);
    };
    // a two-storey block from x0 to x1 and z0 (back) to z1 (front): its ground floor in `low`, the upper floor whitewashed, a white
    // band between them, on a white plinth
    const block = (x0, x1, z0, z1, low) => {
      const w = x1 - x0, d = z1 - z0, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      clickable(list, mesh(box(w, FH, d), low, mx, P + FH / 2, mz, C), data);
      clickable(list, mesh(box(w, FH, d), white, mx, F2 + FH / 2, mz, C), data);
      mesh(box(w + .3, P, d + .3), trim, mx, P / 2, mz, C);
      mesh(box(w + .12, .2, d + .12), trim, mx, F2, mz, C);
      mesh(box(w + .1, .3, d + .1), teakD, mx, EV - .15, mz, C);   // the dark fascia under the eaves
      sRect(C, x0 - .15, x1 + .15, z0 - .15, z1 + .15);
    };
    // a balcony along the upper floor's front from x0 to x1, out from the wall at z0 to z1: a plank floor on brackets, dark teak
    // balusters under a rail, and slender posts up to the eaves
    const balGeo = new THREE.BoxGeometry(.05, .8, .05), vpost = new THREE.BoxGeometry(.14, EV - F2, .14);
    const balcony = (x0, x1, z0, z1) => {
      const w = x1 - x0, mx = (x0 + x1) / 2;
      mesh(box(w, .16, z1 - z0), teakD, mx, F2 + .02, (z0 + z1) / 2, C);
      for (let x = x0 + .4; x < x1 - .2; x += 1.4) { const b = part(box(.12, .4, z1 - z0), teakD, x, F2 - .2, (z0 + z1) / 2, C); b.castShadow = false; }
      for (let x = x0 + .12; x <= x1 - .1; x += .22) part(balGeo, teakD, x, F2 + .5, z1 - .08, C);
      [[mx, z1 - .08, w, .1], [x0 + .05, (z0 + z1) / 2, .1, z1 - z0], [x1 - .05, (z0 + z1) / 2, .1, z1 - z0]].forEach(([bx, bz, bw, bd]) => mesh(box(bw, .1, bd), teakD, bx, F2 + .93, bz, C));
      [x0 + .07, x1 - .07].forEach(x => { for (let z = z0 + .25; z < z1 - .2; z += .22) part(balGeo, teakD, x, F2 + .5, z, C); });
      for (let k = 0; k <= 4; k++) part(vpost, teakD, x0 + .07 + k * (w - .14) / 4, (F2 + EV) / 2, z1 - .08, C);
    };

    // the main block, and the gabled bay at its left end brought forward 1.6 m
    const MX0 = -6.5, MX1 = 2, MZ0 = -7, MZ1 = 1, BX0 = -11, BZ1 = 2.6;
    block(MX0, MX1, MZ0, MZ1, brick); block(BX0, MX0, MZ0, BZ1, brick);
    const mr = tinHipRoof((MX1 - BX0) / 2 + 1, (MZ1 - MZ0) / 2 + 1, 2.3, roofM); mr.position.set((BX0 + MX1) / 2, EV, (MZ0 + MZ1) / 2); mr.castShadow = true; C.add(mr);
    // the bay's gable, its ridge running out to the front over a white pediment
    const bx = (BX0 + MX0) / 2, GW = (MX0 - BX0) / 2 + .7, GH = 2.3, GL = Math.hypot(GW, GH), GA = Math.atan2(GH, GW), GZ0 = -2.5, GZ1 = BZ1 + .8;
    [-1, 1].forEach(sd => { const s = mesh(box(GL, .12, GZ1 - GZ0), roofM, bx + sd * GW / 2, EV + GH / 2, (GZ0 + GZ1) / 2, C); s.rotation.z = -sd * GA; s.castShadow = true; });
    const tri = new THREE.Shape(); tri.moveTo(-GW + .7, 0); tri.lineTo(GW - .7, 0); tri.lineTo(0, GH * (GW - .7) / GW); tri.closePath();
    mesh(new THREE.ShapeGeometry(tri), white, bx, EV, BZ1 + .03, C);
    [-1, 1].forEach(sd => { const e = mesh(box(GL, .2, .12), teakD, bx + sd * GW / 2, EV + GH / 2 - .08, GZ1 - .02, C); e.rotation.z = -sd * GA; });
    mesh(box(1.1, .5, .06), teakD, bx, EV + .75, BZ1 + .05, C);   // a little louvred vent in the pediment
    // the bay's windows: arched below, square above, front and outer side
    [-9.9, -7.6].forEach(x => { win(x, P + .7, BZ1 + .02, 0, 1.1, 2.3, true); win(x, F2 + .8, BZ1 + .02, 0, 1.1, 1.8); });
    [-5.5, -2.5, .8].forEach(z => { win(BX0 - .02, P + .7, z, -Math.PI / 2, 1, 2.2, true); win(BX0 - .02, F2 + .8, z, -Math.PI / 2, 1, 1.8); });
    // the main block's front: arched windows either side of the arched door under the balcony, and the steps up to it
    [-5.2, -3.4, .9].forEach(x => win(x, P + .7, MZ1 + .02, 0, 1, 2.3, true));
    win(-1.2, P, MZ1 + .02, 0, 1.5, 3, true, true);
    clickable(list, mesh(box(1.5, 2.2, .08), doorM, -1.2, P + 1.1, MZ1 + .06, C), data);
    [[.33, MZ1 + .45], [.17, MZ1 + .9]].forEach(([h, z]) => mesh(box(2.6, h, .45), trim, -1.2, h / 2, z, C));
    balcony(-6, 1.6, MZ1, MZ1 + 1.15);
    [-5, -3.2, -1.2, .8].forEach(x => win(x, F2 + .3, MZ1 + .02, 0, x === -1.2 ? 1.2 : 1, x === -1.2 ? 2.6 : 2, false, x === -1.2));
    // the back: square windows on both floors
    for (let x = -10; x <= 1.5; x += 2.3) [P + .9, F2 + .8].forEach(y => win(x, y, MZ0 - .02, Math.PI, 1, 1.8));

    // the wing set back at the right: rubble stone below, whitewashed above under its own hipped roof, a balcony along its front
    const WX0 = MX1, WX1 = 11.5, WZ0 = -8, WZ1 = -1;
    block(WX0, WX1, WZ0, WZ1, stoneM);
    const wr = tinHipRoof((WX1 - WX0) / 2 + 1, (WZ1 - WZ0) / 2 + 1, 2, roofW); wr.position.set((WX0 + WX1) / 2, EV, (WZ0 + WZ1) / 2); wr.castShadow = true; C.add(wr);
    [4, 7, 10].forEach(x => win(x, P + 1, WZ1 + .02, 0, 1, 1.7));
    balcony(WX0 + .6, WX1 - .4, WZ1, WZ1 + 1.05);
    [3.6, 5.6, 7.6, 9.6].forEach(x => win(x, F2 + .3, WZ1 + .02, 0, 1, 2.1, false, x === 5.6));
    [-6.2, -3.2].forEach(z => [P + 1, F2 + .8].forEach(y => win(WX1 + .02, y, z, Math.PI / 2, 1, 1.7)));

    // the spire behind the wing: a whitewashed tower up past the eaves, then six red tiers of hipped roofs, each on a white drum
    // with a gilt rim, under a gilt finial
    const SX = 7, SZ = -10, SB = 3;
    clickable(list, mesh(box(SB, EV + 1, SB), white, SX, (EV + 1) / 2, SZ, C), data);
    mesh(box(SB + .3, .3, SB + .3), trim, SX, EV + 1, SZ, C);
    sRect(C, SX - SB / 2, SX + SB / 2, SZ - SB / 2, SZ + SB / 2);
    let sy = EV + 1.15;
    for (let k = 0; k < 6; k++) {
      const s = 3.4 * (1 - k * .14);
      mesh(box(s * .55, .55, s * .55), white, SX, sy + .27, SZ, C);
      mesh(box(s * .6, .08, s * .6), M.gold, SX, sy + .55, SZ, C);
      const r = mesh(new THREE.ConeGeometry(s * .74, .95, 4, 1, true), red, SX, sy + 1.02, SZ, C); r.rotation.y = Math.PI / 4;
      sy += 1.25;
    }
    mesh(new THREE.CylinderGeometry(.2, .3, .5, 8), white, SX, sy + .25, SZ, C);
    mesh(new THREE.ConeGeometry(.28, 2.4, 8), M.gold, SX, sy + 1.6, SZ, C);
    mesh(new THREE.CylinderGeometry(.015, .015, .9, 4), M.gold, SX, sy + 3.2, SZ, C);

    // the compound: a whitewashed wall round it as high as the Hluttaw's, with a gate in the front, two pillars carrying the name board
    // over the way in. No wall of its own on the west (local +x): it shares the Hluttaw compound's east wall
    const CX = 14, CZ0 = -12, CZ1 = 12, GX = 2.4;
    [[-CX, -GX, CZ1, CZ1], [GX, CX, CZ1, CZ1], [-CX, CX, CZ0, CZ0], [-CX, -CX, CZ0, CZ1]].forEach(([a, b, c, d]) => {
      const w = Math.max(b - a, .35), dd = Math.max(d - c, .35), mx = (a + b) / 2, mz = (c + d) / 2;
      mesh(box(w, 1.8, dd), white, mx, .9, mz, C);
      mesh(box(w + .12, .1, dd + .12), trim, mx, 1.85, mz, C);
      sRect(C, mx - w / 2, mx + w / 2, mz - dd / 2, mz + dd / 2);
    });
    [-1, 1].forEach(sd => { mesh(box(.7, 3.6, .7), white, sd * (GX + .2), 1.8, CZ1, C); mesh(box(.85, .15, .85), trim, sd * (GX + .2), 3.65, CZ1, C); sCircle(C, sd * (GX + .2), CZ1, .45); });
    mesh(box(2 * GX + 1.1, .3, .4), white, 0, 3.2, CZ1, C);
    mesh(box(4.6, 1.3, .14), white, 0, 3.95, CZ1, C);
    courtBoard(C, 0, 3.95, CZ1 + .08);
    // the iron gate's two leaves, folded back open against the wall inside
    [-1, 1].forEach(sd => {
      const o = new THREE.Group(); o.position.set(sd * (GX + .6), 0, CZ1 - .3); C.add(o);
      mesh(box(GX - .3, .06, .06), steel, sd * (GX - .3) / 2, 1.5, 0, o); mesh(box(GX - .3, .06, .06), steel, sd * (GX - .3) / 2, .2, 0, o);
      for (let x = .1; x < GX - .3; x += .18) part(box(.035, 1.36, .035), steel, sd * x, .85, 0, o);
    });

    // the lawn, the stone path from the gate to the steps and along the front, clipped shrubs, a shade tree and the flag
    flat(mesh(box(2 * CX - .4, .05, CZ1 - CZ0 - .4), std({ color: 0x4e8a34, roughness: 1 }), 0, .03, 0, C)).receiveShadow = true;
    flat(mesh(box(2.4, .06, CZ1 - MZ1 - 1.1), M.stone, -1.2, .045, (CZ1 + MZ1 + 1.1) / 2, C));
    flat(mesh(box(23, .055, 1.4), M.stone, .25, .042, BZ1 + 1.2, C));
    const r = rng(7171), bush = new THREE.IcosahedronGeometry(1, 1), BUSH = [0x2e5a22, 0x3e6a2a, 0x4e7a30].map(c => std({ color: c, roughness: .9, flatShading: true }));
    const shrub = (x, z, s) => { const o = part(bush, BUSH[(r() * BUSH.length) | 0], x, s * .55, z, C); o.scale.set(s, s * .8, s); o.rotation.y = r() * TAU; };
    for (let x = -12.5; x < 12.5; x += 1.3 + r() * .6) if (Math.abs(x + 1.2) > 2) shrub(x, BZ1 + 2.6 + r() * .3, .45 + r() * .2);   // a clipped row along the path
    [[-8, 7], [-5.5, 8.5], [5, 9], [9, 6.5], [11.5, 9.5]].forEach(([x, z]) => shrub(x, z, .8 + r() * .4));
    [[-CX + 2, CZ1 - 2.5], [CX - 2, CZ0 + 2]].forEach(([lx, lz], i) => tree(g, COURT.x - lx, COURT.z - lz, .9, 840 + i));
    const [fx, fz] = [3.2, 7.5]; mesh(box(.6, .5, .6), concrete, fx, .25, fz, C); flagPole(g, COURT.x - fx, COURT.z - fz, 9);
    // keep the outside camera above it, and higher over the spire
    TALL.push({ x0: COURT.x - CX, x1: COURT.x + CX, z0: COURT.z - 3.5, z1: COURT.z - CZ0, h: EV + 4 });
    TALL.push({ x0: COURT.x - SX - 3, x1: COURT.x - SX + 3, z0: COURT.z - SZ - 3, z1: COURT.z - SZ + 3, h: sy + 4 });
  }
