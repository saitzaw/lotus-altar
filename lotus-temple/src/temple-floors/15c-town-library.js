  /* ---------- ပြည်သူ့စာကြည့်တိုက် the town's public library, across the market lane from the Haw Kham's east wall and just south of the
     bamboo grove, its front facing the palace; after the owner's photograph of an old mansion of the saophas' time: two storeys of
     cream plaster under wide hipped roofs of red tile with dark fascias, a half-octagon bay of brown-framed windows and a round
     bay beside it, a porch on two columns carrying a curved balcony, a one-storey verandah with a terrace on top at its left end
     and a two-storey wing on posts at its right, a chimney on the roof, and a lawn with crotons and clipped shrubs, the flag on its
     pole out front ---------- */
  const LIB = { x: 60, z: 197, ry: -Math.PI / 2 };   // where it stands; ry turns its front (local +z) west, to the Haw Kham across the lane; its left end (local −x) toward the bamboo grove
  function townLibrary(g) {
    const L = new THREE.Group(); L.position.set(LIB.x, 0, LIB.z); L.rotation.y = LIB.ry; g.add(L);
    const list = picks.pagoda, data = { tip: "The library · ပြည်သူ့စာကြည့်တိုက်", toast: "ပြည်သူ့စာကြည့်တိုက်, the town's public library, in a mansion of the saophas' time across the lane from the Haw Kham: two storeys of plaster under red tile, a half-octagon bay and a round bay of teak-framed windows, and a porch carrying a curved balcony. Inside are books in Shan, Burmese and English, the newspapers on long tables, and the town's old records; children come after school to read on the verandahs." };
    const P = .4, FH = 3.6, F2 = P + FH, EV = P + 2 * FH;   // the plinth (a walker can step up it), a storey, the upper floor, the eaves
    const cream = std({ color: 0xf0e6cc, roughness: .9 }), trim = std({ color: 0xfaf6ec, roughness: .8 }), frame = std({ color: 0x5a3420, roughness: .7 });
    const fascia = std({ color: 0x5e5048, roughness: .8 }), doorM = std({ color: 0x4a2a16, roughness: .6 });
    const tileT = canvasTex(128, (c, s) => {   // red clay tiles in courses
      c.fillStyle = "#9a3a26"; c.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 16) { c.fillStyle = "rgba(40,10,4,.45)"; c.fillRect(0, y, s, 3); for (let x = (y / 16 % 2) * 8; x < s; x += 16) { c.fillStyle = "rgba(255,150,110,.12)"; c.fillRect(x, y + 4, 8, 11); } }
    });
    tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set(.6, 1.2);
    const tileM = std({ map: tileT, roughness: .75, side: THREE.DoubleSide });
    const geos = {}, box = (w, h, d) => geos[[w, h, d]] || (geos[[w, h, d]] = new THREE.BoxGeometry(w, h, d));
    // a window of the house: panes behind a brown frame of narrow mullions and a transom bar, a white sill; faces local +z of its frame
    const win = (x, y, z, ry, w, h) => {
      const o = new THREE.Group(); o.position.set(x, y, z); o.rotation.y = ry; L.add(o);
      part(box(w, h, .06), townGlass, 0, 0, .01, o);
      [-1, 1].forEach(sd => { part(box(w + .16, .1, .12), frame, 0, sd * (h / 2 + .03), .03, o); part(box(.1, h, .12), frame, sd * (w / 2 + .03), 0, .03, o); });
      const n = Math.max(1, Math.round(w / .45)); for (let i = 1; i < n; i++) part(box(.05, h, .09), frame, -w / 2 + w * i / n, 0, .03, o);
      part(box(w, .06, .09), frame, 0, h * .22, .03, o);
      part(box(w + .3, .08, .2), trim, 0, -h / 2 - .1, .06, o);
    };
    // a row of balusters under a rail, from (x0, z0) to (x1, z1) at height y
    const balGeo = new THREE.CylinderGeometry(.045, .07, .75, 6);
    const rail = (x0, z0, x1, z1, y) => {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(len / .3));
      for (let i = 0; i <= n; i++) part(balGeo, trim, x0 + (x1 - x0) * i / n, y + .375, z0 + (z1 - z0) * i / n, L);
      mesh(box(Math.max(len, .12), .1, .16), trim, (x0 + x1) / 2, y + .8, (z0 + z1) / 2, L).rotation.y = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2;
    };
    const colGeo = new THREE.CylinderGeometry(.2, .24, 1, 12), capGeo = box(.6, .18, .6);
    const column = (x, z, y0, y1) => { part(colGeo, trim, x, (y0 + y1) / 2, z, L).scale.y = y1 - y0; part(capGeo, trim, x, y1 - .09, z, L); part(capGeo, trim, x, y0 + .09, z, L); sCircle(L, x, z, .28); };

    // the main block, two storeys, with a string course at the upper floor
    clickable(list, mesh(box(22, EV - P, 12), cream, 0, P + (EV - P) / 2, 0, L), data);
    mesh(box(23, P, 13), trim, 0, P / 2, 0, L);
    mesh(box(22.2, .25, 12.2), trim, 0, F2, 0, L);
    sRect(L, -11, 11, -6, 6);
    // the half-octagon bay at the left of the front, windows all round both floors, under its own tiled hip
    const BX = -6.5, BR = 2.6, AP = BR * Math.cos(Math.PI / 8);
    clickable(list, mesh(new THREE.CylinderGeometry(BR, BR, EV - P, 8), cream, BX, P + (EV - P) / 2, 6, L), data).rotation.y = Math.PI / 8;
    mesh(new THREE.CylinderGeometry(BR + .15, BR + .15, .25, 8), trim, BX, F2, 6, L).rotation.y = Math.PI / 8;
    mesh(new THREE.CylinderGeometry(BR + .25, BR + .25, P, 8), trim, BX, P / 2, 6, L).rotation.y = Math.PI / 8;
    [-Math.PI / 4, 0, Math.PI / 4].forEach(a => [P + 1.9, F2 + 1.8].forEach(y => win(BX + Math.sin(a) * AP, y, 6 + Math.cos(a) * AP, a, 1.6, 1.7)));
    mesh(new THREE.ConeGeometry(BR + .9, 2.2, 8), tileM, BX, EV + 1.1, 6, L).rotation.y = Math.PI / 8;
    sCircle(L, BX, 6, BR);
    // the round bay beside it: a band of three windows upstairs, one below
    const RX = -1.2, RZ = 6.3, RR = 1.9;
    clickable(list, mesh(new THREE.CylinderGeometry(RR, RR, EV - P, 24), cream, RX, P + (EV - P) / 2, RZ, L), data);
    mesh(new THREE.CylinderGeometry(RR + .12, RR + .12, .25, 24), trim, RX, F2, RZ, L);
    mesh(new THREE.CylinderGeometry(RR + .25, RR + .25, P, 24), trim, RX, P / 2, RZ, L);
    [-.75, 0, .75].forEach(a => win(RX + Math.sin(a) * (RR + .06), F2 + 1.8, RZ + Math.cos(a) * (RR + .06), a, 1.1, 1.8));
    win(RX, P + 1.8, RZ + RR + .06, 0, 1.1, 1.2);
    mesh(new THREE.ConeGeometry(RR + .8, 1.8, 24), tileM, RX, EV + .9, RZ, L);
    sCircle(L, RX, RZ, RR);
    // the porch: two columns carrying a balcony with a curved front, the front door under it and French doors onto it above
    const PX = 3.75, PZ = 9.6;
    mesh(box(4.7, P, 4.6), trim, PX, P / 2, 8.3, L);
    [[.27, 10.8], [.13, 11.2]].forEach(([h, z]) => mesh(box(3.2, h, .4), trim, PX, h / 2, z, L));   // the steps down to the path
    [-1.65, 1.65].forEach(dx => column(PX + dx, PZ, P, F2 - .3));
    mesh(box(4.7, .35, 3.6), trim, PX, F2 - .15, 7.8, L);
    const curve = mesh(new THREE.CylinderGeometry(2.35, 2.35, .35, 24, 1, false, -Math.PI / 2, Math.PI), trim, PX, F2 - .15, PZ, L); curve.scale.z = .45;
    for (let i = 0; i <= 12; i++) { const t = i / 12 * Math.PI; part(balGeo, trim, PX + Math.cos(t) * 2.25, F2 + .4, PZ + Math.sin(t) * 2.25 * .45, L); }
    const arc = mesh(new THREE.TorusGeometry(2.25, .07, 4, 20, Math.PI), trim, PX, F2 + .82, PZ, L); arc.rotation.x = Math.PI / 2; arc.scale.y = .45;
    [-1, 1].forEach(sd => rail(PX + sd * 2.25, 6.1, PX + sd * 2.25, PZ, F2 + .03));
    win(PX, F2 + 1.45, 6.02, 0, 1.6, 2.5);
    clickable(list, mesh(box(1.8, 2.6, .1), doorM, PX, P + 1.3, 6.04, L), data);
    mesh(box(.04, 2.6, .12), frame, PX, P + 1.3, 6.06, L);
    win(PX, P + 2.95, 6.02, 0, 1.8, .5);   // the fanlight over the door
    // the right-hand wing: its upper storey carried forward over a verandah on square posts
    const WX = 8.55;
    clickable(list, mesh(box(4.9, FH, 2.6), cream, WX, F2 + FH / 2, 7.3, L), data);
    mesh(box(5.1, .25, 2.8), trim, WX, F2, 7.4, L);
    mesh(box(5.1, P, 3), trim, WX, P / 2, 7.4, L);
    [6.4, 10.7].forEach(x => { mesh(box(.42, FH - .1, .42), trim, x, P + (FH - .1) / 2, 8.4, L); sCircle(L, x, 8.4, .3); });
    [7.3, 9.8].forEach(x => { win(x, F2 + 1.8, 8.62, 0, 1.5, 1.8); win(x, P + 1.8, 6.02, 0, 1.5, 1.8); });
    const wr = tinHipRoof(3.15, 1.95, 1.2, tileM); wr.position.set(WX, EV, 7.3); wr.castShadow = true; L.add(wr);
    // the left-hand verandah, one storey on round columns, its flat roof a terrace with a balustrade, a door onto it from upstairs
    const VX0 = -15.6, VX1 = -11, VZ0 = -5, VZ1 = 5.3;
    mesh(box(VX1 - VX0 + .2, P, VZ1 - VZ0 + .2), trim, (VX0 + VX1) / 2, P / 2, (VZ0 + VZ1) / 2, L);
    clickable(list, mesh(box(VX1 - VX0 - .4, FH - .1, 6.2), cream, (VX0 + VX1) / 2 + .2, P + (FH - .1) / 2, VZ0 + 3.1, L), data);   // the closed room at its back
    sRect(L, VX0 + .4, VX1, VZ0, VZ0 + 6.2);
    win(-13.3, P + 1.8, VZ0 + 6.22, 0, 1.5, 1.6);
    mesh(box(1.1, 2.4, .08), doorM, -11.9, P + 1.2, VZ0 + 6.24, L);
    mesh(box(VX1 - VX0 + .4, .3, VZ1 - VZ0 + .4), trim, (VX0 + VX1) / 2, F2 - .15, (VZ0 + VZ1) / 2, L);
    [[VX0 + .3, VZ1 - .3], [-13.3, VZ1 - .3], [VX1 - .5, VZ1 - .3], [VX0 + .3, VZ0 + 6.2 + .4]].forEach(([x, z]) => column(x, z, P, F2 - .3));
    rail(VX0 + .05, VZ1 + .05, VX1, VZ1 + .05, F2); rail(VX0 + .05, VZ0, VX0 + .05, VZ1 + .05, F2);
    win(-11.02, F2 + 1.4, 2.5, -Math.PI / 2, 1.4, 2.5);
    // windows round the sides and back
    for (let x = -9; x <= 9; x += 3) [P + 1.9, F2 + 1.8].forEach(y => win(x, y, -6.02, Math.PI, 1.5, 1.8));
    [-4, -1, 2].forEach(z => [P + 1.9, F2 + 1.8].forEach(y => win(11.02, y, z, Math.PI / 2, 1.5, 1.8)));
    [-4.5, -1.5].forEach(z => win(-11.02, F2 + 1.8, z, -Math.PI / 2, 1.5, 1.8));
    win(-11.02, P + 1.9, 3.5, -Math.PI / 2, 1.5, 1.8);
    // the walkable verandah floors (after the columns and walls, which block)
    sRect(L, PX - 2.35, PX + 2.35, 6, 11.4, P);
    sRect(L, 6.1, 11.1, 6, 8.9, P);
    sRect(L, VX0 - .1, VX1, VZ0, VZ1 + .1, P);
    // the main roof: a wide red-tiled hip over a pale soffit with a dark fascia, and the chimney
    const rf = tinHipRoof(11.8, 6.8, 3.2, tileM); rf.position.set(0, EV, 0); rf.castShadow = rf.receiveShadow = true; L.add(rf);
    mesh(box(23.6, .12, 13.6), trim, 0, EV - .02, 0, L);
    [[0, 6.85, 23.7, .1], [0, -6.85, 23.7, .1], [11.85, 0, .1, 13.7], [-11.85, 0, .1, 13.7]].forEach(([x, z, w, d]) => mesh(box(w, .35, d), fascia, x, EV - .05, z, L));
    mesh(box(.8, 2.6, .8), cream, -4, EV + 2.4, -2, L); mesh(box(1, .15, 1), fascia, -4, EV + 3.75, -2, L);
    // the lawn, kerbed, the path from the porch out to the lane, shrubs and crotons along the front, the flag and the name board
    flat(mesh(box(34.5, .05, 25.2), std({ color: 0x5a8a3a, roughness: 1 }), -1.25, .03, 3.6, L)).receiveShadow = true;
    flat(mesh(box(3, .06, 5.2), M.stone, PX, .04, 13.6, L));
    [[-18.5, PX - 1.5, 16.15], [PX + 1.5, 16, 16.15]].forEach(([a, b, z]) => flat(mesh(box(b - a, .15, .2), concrete, (a + b) / 2, .08, z, L)));
    const r = rng(8181), bush = new THREE.IcosahedronGeometry(1, 1), BUSH = [0x3e6a2a, 0x4e7a30, 0xa8b830, 0xd8b830, 0xb84a20].map(c => std({ color: c, roughness: .9, flatShading: true }));
    const shrub = (x, z, s) => { const o = part(bush, BUSH[(r() * BUSH.length) | 0], x, s * .6, z, L); o.scale.set(s, s * .8, s); o.rotation.y = r() * TAU; };
    for (let x = -17.5; x < 15.5; x += 1.6 + r() * 1.4) if (Math.abs(x - PX) > 2.6) { shrub(x, 12 + r() * .8, .5 + r() * .4); if (r() < .5) shrub(x + .6, 15.2, .4 + r() * .3); }
    for (let z = -7; z < 11; z += 2.2 + r()) { shrub(-17.8, z, .45 + r() * .35); shrub(15, z, .45 + r() * .35); }
    const [fx, fz] = [LIB.x - 13.5, LIB.z + 13]; mesh(box(.6, .5, .6), concrete, fx, .25, fz, g); flagPole(g, fx, fz, 9);
    [-5.5, -2.5].forEach(x => { mesh(box(.14, 2.6, .14), townFrame, x, 1.3, 15.4, L); sCircle(L, x, 15.4, .12); });
    civicSign(L, "ပြည်သူ့စာကြည့်တိုက်", "Public Library", "#2a4a8a", "#ffffff", 3, -4, 2.15, 15.48);
    // keep the outside camera above it
    TALL.push({ x0: LIB.x - 12, x1: LIB.x + 7, z0: LIB.z - 16, z1: LIB.z + 12, h: EV + 3.4 });
  }
