  /* ---------- ကျောင်း the shrine hall of the Shan monastery on the stupa hill: teak plank walls and floor, tall arched and oval windows
     in dark teak frames, matching the monastery's outside walls, red pillars banded in gold, and at the back a Buddha image in the northern Shan and Lanna manner on a square gilded throne
     set with glass mosaic, before a red hanging worked in gold that fills the back wall, a ring of little lights round the dark blue
     halo behind his head, white parasols and sprays of white flowers either side, a red coffered ceiling over him; the altar before
     him is the Shan way, with no table: water, fruit, lotus, candles and lamps on gilt trays, and incense in a little brass bowl of
     sand all stand on the throne's front ledge, and long woven Shan banners hang down the side walls ---------- */
  const KYAUNG = { pillars: [-3.9, -.6, 2.7, 5.9].flatMap(z => [[-3.6, z], [3.6, z]]), hti: [[-2.3, -2.7], [2.3, -2.7]], urns: [[-1.7, 1.55], [1.7, 1.55], [-2.75, .4], [2.75, .4]], ledge: .75 };   // ledge: the height of the throne's offering ledge
  function kyaungHall(g, n) {
    picks[n] = picks[n] || []; updaters[n] = updaters[n] || [];
    const list = picks[n], HH = 6.8;   // HH: the ceiling's height
    const planks = (base, line, sz, across) => canvasTex(128, (c, s2) => {
      c.fillStyle = base; c.fillRect(0, 0, s2, s2);
      for (let k = 0; k < s2; k += sz) { c.fillStyle = line; across ? c.fillRect(0, k, s2, 2) : c.fillRect(k, 0, 2, s2); c.fillStyle = "rgba(140,80,40,.12)"; across ? c.fillRect(0, k + 4, s2, 3) : c.fillRect(k + 4, 0, 3, s2); }
    });
    const wallT = planks("#4a2412", "rgba(15,6,2,.6)", 12, false); wallT.wrapS = wallT.wrapT = THREE.RepeatWrapping; wallT.repeat.set(5, 2);
    const floorT = planks("#7a4422", "rgba(30,12,4,.55)", 16, true); floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(4, 4);
    const teak = std({ map: wallT, roughness: .7 }), teakDark = std({ color: 0x2e140a, roughness: .6 }), floorM = std({ map: floorT, roughness: .45 });
    const red = std({ color: 0x8a1a10, roughness: .45 }), white = std({ color: 0xf4f0e6, roughness: .6 }), gold = M.gold;
    // floor, walls and a coffered teak ceiling on beams
    flat(mesh(new THREE.PlaneGeometry(15, 13), floorM, 0, 0, 1, g)).rotation.x = -Math.PI / 2;
    flat(mesh(new THREE.PlaneGeometry(15, HH), teak, 0, HH / 2, -5.5, g));
    flat(mesh(new THREE.PlaneGeometry(15, HH), teak, 0, HH / 2, 7.5, g)).rotation.y = Math.PI;
    [-1, 1].forEach(sd => { flat(mesh(new THREE.PlaneGeometry(13, HH), teak, sd * 7.5, HH / 2, 1, g)).rotation.y = -sd * Math.PI / 2; });
    flat(mesh(new THREE.PlaneGeometry(15, 13), teakDark, 0, HH, 1, g)).rotation.x = Math.PI / 2;
    const beamX = new THREE.BoxGeometry(15, .3, .26), beamZ = new THREE.BoxGeometry(.26, .3, 13);
    [-3.9, -.6, 2.7, 5.9].forEach(z => part(beamX, teakDark, 0, HH - .15, z, g));
    [-3.6, 3.6].forEach(x => part(beamZ, teakDark, x, HH - .15, 1, g));
    // the windows, laid out as on the outside walls (kyaungWindows) and scaled to this hall: tall arches and ovals in dark teak
    // frames along the front and both sides; daylight in the open ones by day, the dark hill at night; the shuttered ones closed
    const pane = std({ color: 0x120a06, roughness: .4, emissive: 0xdde8f2, emissiveIntensity: 0 });
    onDaylight(d => pane.emissiveIntensity = .9 * d + .02);
    const KW = kyaungWindows(), fx = 7.5 / (KW.IW / 2), fz = 6.5 / (KW.ID / 2), ws = 1.5, wy = HH / KW.WH;   // fx, fz: outside to inside across and along; ws: the windows' size; wy: heights
    const AW = KW.AW * ws, AH = KW.AH * ws, ORX = KW.ORX * ws, ORY = KW.ORY * ws, AB = KW.AB * wy, OY = AB + AH / 2;
    const frameIn = std({ color: 0x0a0402, roughness: .6 }), leafIn = std({ color: 0x0c0503, roughness: .7 });
    const ringG = (outer, inner) => { const s = new THREE.Shape(outer); s.holes.push(new THREE.Path(inner)); return new THREE.ShapeGeometry(s); };
    const archG = new THREE.ShapeGeometry(new THREE.Shape(kwArch(AW, AH))), archRing = ringG(kwArch(AW + .15, AH + .2, 0, -.05), kwArch(AW, AH));
    const ovalG = new THREE.ShapeGeometry(new THREE.Shape(kwOval(ORX, ORY))), ovalRing = ringG(kwOval(ORX + .15, ORY + .15), kwOval(ORX, ORY));
    const seamG = new THREE.BoxGeometry(.04, AH - .1, .02), sillG = new THREE.BoxGeometry(1, .08, .16);
    const winIn = (w, x, z, ry) => {   // one window in the wall at (x, z), facing into the hall
      const o = new THREE.Group(); o.position.set(x, w.oval ? OY : AB, z); o.rotation.y = ry; g.add(o);
      flat(part(w.oval ? ovalG : archG, w.shut ? leafIn : pane, 0, 0, .01, o));
      flat(part(w.oval ? ovalRing : archRing, frameIn, 0, 0, .02, o));
      if (w.shut) flat(part(seamG, frameIn, 0, (AH - .1) / 2, .025, o));   // where the two shutters meet
      flat(part(sillG, frameIn, 0, w.oval ? -ORY - .12 : -.06, .06, o)).scale.x = (w.oval ? ORX : AW) * 2 + .4;
    };
    KW.front.forEach(w => winIn(w, w.x * fx, 7.48, Math.PI));
    [-1, 1].forEach(sd => KW.side.forEach(w => winIn(w, sd * 7.48, 1 - sd * w.x * fz, -sd * Math.PI / 2)));
    // the pillars: red lacquer, gold bands, white footings
    const footG = new THREE.BoxGeometry(.6, .2, .6), shaftG = new THREE.CylinderGeometry(.2, .22, HH - .2, 16), bandG = new THREE.CylinderGeometry(.235, .235, .16, 16);
    KYAUNG.pillars.forEach(([x, z]) => {
      part(footG, white, x, .1, z, g); part(shaftG, red, x, HH / 2 + .05, z, g);
      [.45, 2.2, HH - .5].forEach(y => part(bandG, gold, x, y, z, g));
    });
    // woven mats on the floor before the image, for sitting and bowing
    const matT = canvasTex(64, (c, s2) => { c.fillStyle = "#c8a868"; c.fillRect(0, 0, s2, s2); c.fillStyle = "rgba(90,60,20,.35)"; for (let k = 0; k < s2; k += 4) { c.fillRect(k, 0, 1, s2); c.fillRect(0, k + 2, s2, 1); } c.strokeStyle = "#7a2a18"; c.lineWidth = 4; c.strokeRect(2, 2, s2 - 4, s2 - 4); });
    const matM = std({ map: matT, roughness: .95 });
    const matG = new THREE.BoxGeometry(1.2, .02, .9);
    [3.4, 4.6, 5.8].forEach(z => [-1.5, 0, 1.5].forEach(x => flat(part(matG, matM, x, .01, z, g))));
    // the throne (palin), with no table before it, as in Shan image halls: a broad gilded plinth carved with niches whose front
    // ledge (KYAUNG.ledge high, out to z = 1.05) takes the offerings, and on it the seat, a waist of red and green glass mosaic
    // under a band of niches and a rim of lotus petals, raising the image well above the ledge
    const mosaic = canvasTex(128, (c, s2) => { c.fillStyle = "#b8893c"; c.fillRect(0, 0, s2, s2); for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) { c.fillStyle = (r + k) % 2 ? "#1f7a4a" : "#a01818"; c.beginPath(); const cx = k * 16 + 8 + (r % 2) * 8, cy = r * 32 + 16; c.moveTo(cx, cy - 12); c.lineTo(cx + 6, cy); c.lineTo(cx, cy + 12); c.lineTo(cx - 6, cy); c.fill(); } });
    mosaic.wrapS = THREE.RepeatWrapping; mosaic.repeat.set(4, 1);
    const glass = std({ map: mosaic, roughness: .25, metalness: .3 });
    const niches = canvasTex(256, (c, s2) => { c.fillStyle = "#c99a44"; c.fillRect(0, 0, s2, s2); for (let k = 0; k < 4; k++) { const x = k * 64 + 12; c.fillStyle = "#3a1408"; c.beginPath(); c.moveTo(x, s2 - 30); c.lineTo(x, 90); c.quadraticCurveTo(x + 20, 40, x + 20, 20); c.quadraticCurveTo(x + 20, 40, x + 40, 90); c.lineTo(x + 40, s2 - 30); c.fill(); c.fillStyle = "#e8c070"; c.beginPath(); c.arc(x + 20, 150, 10, 0, TAU); c.fill(); } c.fillStyle = "#8a1a10"; c.fillRect(0, s2 - 20, s2, 20); });
    niches.wrapS = THREE.RepeatWrapping; niches.repeat.set(3, 1);
    const nicheM = std({ map: niches, roughness: .35, metalness: .5 });
    const L = KYAUNG.ledge, PZ = (1.05 - 3.4) / 2, PD = 1.05 + 3.4;   // the plinth runs from the back (z -3.4) to the ledge's edge
    [[4.2, .12, PD + .2, 0, gold], [4.0, L - .25, PD, .12, nicheM], [4.2, .06, PD + .2, L - .13, gold], [4.1, .04, PD + .1, L - .07, red], [4.16, .03, PD + .16, L - .03, gold]]
      .forEach(([w, h, d, y, m]) => mesh(new THREE.BoxGeometry(w, h, d), m, 0, y + h / 2, PZ, g));
    const SZ = -1.8, seatTop = L + .5;
    [[2.8, .2, 2.4, L, glass], [3.0, .06, 2.6, L + .2, gold], [2.6, .18, 2.2, L + .26, nicheM], [2.9, .06, 2.5, L + .44, gold]]
      .forEach(([w, h, d, y, m]) => mesh(new THREE.BoxGeometry(w, h, d), m, 0, y + h / 2, SZ, g));
    const petalRow = new THREE.SphereGeometry(.085, 8, 6, 0, TAU, 0, Math.PI / 2);   // upturned lotus petals round the seat's rim
    for (let i = 0; i < 15; i++) [-1, 1].forEach(sd => { part(petalRow, gold, -1.26 + i * .18, seatTop + .06, SZ + sd * 1.2, g).scale.set(1, 1.8, .45); });
    for (let i = 0; i < 13; i++) [-1, 1].forEach(sd => { part(petalRow, gold, sd * 1.4, seatTop + .06, SZ - 1.08 + i * .18, g).scale.set(.45, 1.8, 1); });
    const st = new THREE.Group(); st.position.set(0, seatTop - .5, -1.7); g.add(st);
    sculptFigure("shan", st, "the Shan Buddha image");
    // behind him the whole back wall is a red hanging worked in gold: flying hamsa and little spired shrines in rows, under a
    // scalloped gilt border, framed in teak
    const wallArt = canvasTex(1024, (c, s2) => {
      const gr = c.createRadialGradient(s2 / 2, s2 * .45, 40, s2 / 2, s2 * .5, s2 * .75); gr.addColorStop(0, "#a8201a"); gr.addColorStop(1, "#5a0c0a");
      c.fillStyle = gr; c.fillRect(0, 0, s2, s2);
      c.fillStyle = c.strokeStyle = "rgba(232,184,96,.9)"; c.lineWidth = 3;
      const shrineMotif = (x, y, k) => {   // a little pyatthat: stepped roofs narrowing to a spire, on a plinth
        c.fillRect(x - 22 * k, y, 44 * k, 8 * k); c.strokeRect(x - 14 * k, y - 30 * k, 28 * k, 30 * k);
        for (let t = 0, w = 26 * k, yy = y - 30 * k; t < 4; t++, w *= .72, yy -= 11 * k) { c.beginPath(); c.moveTo(x - w, yy); c.lineTo(x + w, yy); c.lineTo(x + w * .6, yy - 9 * k); c.lineTo(x - w * .6, yy - 9 * k); c.fill(); }
        c.beginPath(); c.moveTo(x - 3 * k, y - 74 * k); c.lineTo(x + 3 * k, y - 74 * k); c.lineTo(x, y - 96 * k); c.fill();
      };
      const hamsa = (x, y, sd) => {   // a flying sacred goose, wings raised, tail curled behind
        c.beginPath(); c.ellipse(x, y, 20, 9, 0, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(x + sd * 16, y - 4); c.quadraticCurveTo(x + sd * 30, y - 22, x + sd * 34, y - 10); c.lineTo(x + sd * 42, y - 8); c.lineTo(x + sd * 32, y - 4); c.quadraticCurveTo(x + sd * 24, y - 10, x + sd * 16, y + 2); c.fill();
        c.beginPath(); c.moveTo(x - sd * 4, y - 6); c.quadraticCurveTo(x - sd * 14, y - 40, x - sd * 34, y - 42); c.quadraticCurveTo(x - sd * 22, y - 24, x - sd * 16, y - 4); c.fill();
        c.beginPath(); c.moveTo(x - sd * 18, y); c.quadraticCurveTo(x - sd * 40, y + 4, x - sd * 46, y - 14); c.quadraticCurveTo(x - sd * 38, y + 12, x - sd * 16, y + 6); c.fill();
      };
      for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) {
        const x = 85 + k * 171 + (r % 2) * 85, y = 250 + r * 160;
        if (r % 2) hamsa(x, y - 40, k % 2 ? 1 : -1); else shrineMotif(x, y, .9);
      }
      c.fillStyle = "#d8a640"; c.fillRect(0, 0, s2, 40);   // the scalloped border along the top
      for (let k = 0; k < 24; k++) { c.beginPath(); c.arc(21 + k * 42.7, 40, 21, 0, Math.PI); c.fill(); }
      c.fillStyle = "#5a0c0a"; for (let k = 0; k < 24; k++) { c.beginPath(); c.arc(21 + k * 42.7, 42, 9, 0, Math.PI); c.fill(); }
    });
    wallArt.wrapS = THREE.RepeatWrapping; wallArt.repeat.set(2, 1);
    const hanging = std({ map: wallArt, roughness: .75 });
    flat(mesh(new THREE.PlaneGeometry(10.4, 5.6), hanging, 0, 3.4, -5.47, g));
    [[10.8, .2, 0, 6.3], [10.8, .2, 0, .5], [.2, 6, -5.3, 3.4], [.2, 6, 5.3, 3.4]].forEach(([w, h, x, y]) => mesh(new THREE.BoxGeometry(w, h, .1), teakDark, x, y, -5.44, g));
    // a dark blue halo behind his head, with a ring of little lights round it twinkling slowly
    const B = new THREE.Group(); B.position.set(0, 2.42, -.56); st.add(B);
    flat(mesh(new THREE.CircleGeometry(.72, 48), new THREE.MeshBasicMaterial({ color: 0x060c2c }), 0, 0, 0, B));
    flat(mesh(new THREE.TorusGeometry(.74, .025, 6, 64), gold, 0, 0, .01, B));
    const NB = 36, bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), NB), m4 = new THREE.Matrix4(), bc = new THREE.Color();
    const tints = [0xfff4dc, 0x9ec8ff, 0xfff4dc, 0x8dffb0, 0xfff4dc, 0xff9a8a].map(h => new THREE.Color(h));
    for (let i = 0; i < NB; i++) { const a = i / NB * TAU; bulbs.setMatrixAt(i, m4.makeTranslation(Math.sin(a) * .7, Math.cos(a) * .7, .03)); bulbs.setColorAt(i, tints[i % 6]); }
    B.add(bulbs);
    const halo = glowSprite(0xbcd0ff, 1.9, .16); halo.position.z = -.02; B.add(halo);
    updaters[n].push((dt, t, motion) => {
      if (!motion) return;
      for (let i = 0; i < NB; i++) { const k = .5 + .5 * Math.sin(i * 2.4 + t * 1.6); bulbs.setColorAt(i, bc.copy(tints[i % 6]).multiplyScalar(.55 + .45 * k)); }
      bulbs.instanceColor.needsUpdate = true;
    });
    // tall sprays of white flowers in gilt urns on the floor before the throne, green leaves under them
    const urnG = new THREE.CylinderGeometry(.16, .11, .42, 16), urnLip = new THREE.TorusGeometry(.16, .025, 6, 16);
    const bloomG = new THREE.SphereGeometry(.045, 8, 6), leafG = new THREE.SphereGeometry(.1, 6, 4), stemG = new THREE.CylinderGeometry(.008, .008, 1, 4);
    const bloomM = std({ color: 0xfbf8f0, roughness: .8 }), leafM = std({ color: 0x2f6a2a, roughness: .8 }), stemM = std({ color: 0x4a7a32, roughness: .8 });
    const fr = rng(41);
    KYAUNG.urns.forEach(([x, z]) => {
      part(urnG, gold, x, .21, z, g); part(urnLip, gold, x, .42, z, g).rotation.x = Math.PI / 2;
      for (let k = 0; k < 7; k++) { const a = fr() * TAU, r = .1 + fr() * .1; part(leafG, leafM, x + Math.sin(a) * r, .5 + fr() * .2, z + Math.cos(a) * r, g).scale.set(1, .5, 1.6); }
      for (let k = 0; k < 9; k++) {
        const a = fr() * TAU, r = .08 + fr() * .3, h = .5 + fr() * .9, top = V(x + Math.sin(a) * r, .45 + h, z + Math.cos(a) * r);
        const stem = part(stemG, stemM, (x + top.x) / 2, (.45 + top.y) / 2, (z + top.z) / 2, g); stem.scale.y = h; stem.quaternion.setFromUnitVectors(V(0, 1, 0), top.clone().sub(V(x, .45, z)).normalize());
        [0, 1, 2, 3, 4].forEach(j => part(bloomG, bloomM, top.x + (fr() - .5) * .14, top.y - j * .07, top.z + (fr() - .5) * .12, g).scale.setScalar(.7 + fr() * .5));
      }
    });
    // long woven Shan banners (tamkhon) hanging down the side walls between the windows, each striped and patterned in its own
    // colours, with a bamboo rod at the top and a tassel at the foot
    const banner = (base, band, motif) => canvasTex(128, (c, s2) => {
      c.fillStyle = base; c.fillRect(0, 0, s2, s2);
      for (let k = 0; k < 8; k++) { const y = k * 16; c.fillStyle = band; c.fillRect(0, y, s2, 3); c.fillStyle = motif;
        if (k % 2) { c.beginPath(); c.moveTo(64, y + 4); c.lineTo(84, y + 9); c.lineTo(64, y + 14); c.lineTo(44, y + 9); c.fill(); }
        else for (let j = 0; j < 3; j++) c.fillRect(24 + j * 34, y + 6, 12, 6); }
      c.fillStyle = band; c.fillRect(0, 0, 10, s2); c.fillRect(s2 - 10, 0, 10, s2);
    });
    const bannerMs = [["#9a1c18", "#e8c070", "#f4f0e6"], ["#f2ede0", "#9a1c18", "#2a6a3a"], ["#1f5a3a", "#e8c070", "#f2ede0"], ["#2a2a5a", "#d8a640", "#c83a2a"]]
      .map(c => std({ map: banner(...c), roughness: .9, side: THREE.DoubleSide }));
    const rodG = new THREE.CylinderGeometry(.015, .015, .5, 6), tasselG = new THREE.ConeGeometry(.05, .3, 6);
    const sideZ = KW.side.map(w => 1 + w.x * fz).sort((a, b) => a - b), bannerZ = sideZ.slice(1).map((z, i) => (z + sideZ[i]) / 2);   // midway between the windows
    [-1, 1].forEach(sd => bannerZ.forEach((z, i) => [-.22, .22].forEach((dz, j) => {
      const h = 2.2 + ((i + j) % 3) * .35, x = sd * 7.42, zz = z + dz, m = bannerMs[(i * 2 + j + (sd > 0 ? 1 : 0)) % 4];
      const b = flat(mesh(new THREE.PlaneGeometry(.3, h), m, x, 5.9 - h / 2, zz, g)); b.rotation.y = -sd * Math.PI / 2;
      part(rodG, teakDark, x, 5.92, zz, g).rotation.x = Math.PI / 2;
      part(tasselG, gold, x, 5.9 - h - .12, zz, g).rotation.x = Math.PI;
    })));
    bannerMs.forEach(m => { m.map.wrapT = THREE.RepeatWrapping; m.map.repeat.set(1, 2); });
    // over the image, a coffered red ceiling with gilt ribs and round lamps let into it
    const cof = canvasTex(256, (c, s2) => { c.fillStyle = "#6a1410"; c.fillRect(0, 0, s2, s2); c.strokeStyle = "#d8a640"; c.lineWidth = 10; for (let k = 0; k <= 4; k++) { c.beginPath(); c.moveTo(k * 64, 0); c.lineTo(k * 64, s2); c.moveTo(0, k * 64); c.lineTo(s2, k * 64); c.stroke(); } c.lineWidth = 3; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.beginPath(); c.arc(32 + i * 64, 32 + j * 64, 18, 0, TAU); c.stroke(); } });
    cof.wrapS = cof.wrapT = THREE.RepeatWrapping; cof.repeat.set(3, 2);
    flat(mesh(new THREE.PlaneGeometry(7, 4.8), std({ map: cof, roughness: .6 }), 0, HH - .32, -3, g)).rotation.x = Math.PI / 2;
    const lampM = new THREE.MeshBasicMaterial({ color: 0xfff0d0 }), lampG = new THREE.CircleGeometry(.16, 20);
    [[-2.2, -4.3], [2.2, -4.3], [-2.2, -1.7], [2.2, -1.7]].forEach(([x, z]) => { const l = flat(mesh(lampG, lampM, x, HH - .33, z, g)); l.rotation.x = Math.PI / 2; });
    // white parasols (hti) with gold rims either side of the throne
    const canopy = std({ color: 0xf4f0e6, roughness: .7, side: THREE.DoubleSide });
    const htiG = [new THREE.CylinderGeometry(.03, .03, 3.4, 8), new THREE.CylinderGeometry(.2, .26, .14, 12), new THREE.ConeGeometry(.05, .3, 8)];
    const tiers = [[.62, 3.3], [.44, 3.7]].map(([r, y]) => [new THREE.ConeGeometry(r, .26, 20, 1, true), new THREE.TorusGeometry(r, .018, 6, 24), y]);
    KYAUNG.hti.forEach(([x, z]) => {
      part(htiG[0], gold, x, 1.7, z, g); part(htiG[1], gold, x, .07, z, g); part(htiG[2], gold, x, 4.0, z, g);
      tiers.forEach(([cone, rim, y]) => { part(cone, canopy, x, y, z, g); part(rim, gold, x, y - .13, z, g).rotation.x = Math.PI / 2; });
    });
    bakeParts(g);
    // the offering table, and the altar: a vase for lotus, the seven water bowls, candle stands, fruit and incense
    // the altar's offerings stand on the plinth's ledge: shrine() lays them out at the table height ALT.y, so it builds them in a
    // group lowered and drawn back to the ledge
    const ledge = new THREE.Group(); ledge.position.set(0, L - ALT.y, -.25); g.add(ledge);
    list.push(...shrine(ledge, n, { before: "the Buddha image", vaseX: -1.02, shan: true }));
    // the doors out to the verandah, in the front wall behind the visitor
    const D0 = new THREE.Group(); D0.position.set(0, 0, 7.45); D0.rotation.y = Math.PI; g.add(D0);
    [-1, 1].forEach(sd => {
      clickable(list, mesh(new THREE.BoxGeometry(.98, 2.5, .08), teakDark, sd * .5, 1.25, 0, D0), { floor: "pagoda", tip: "Go back out onto the verandah" });
      mesh(new THREE.BoxGeometry(.12, 2.7, .14), gold, sd * 1.06, 1.35, 0, D0);
    });
    mesh(new THREE.BoxGeometry(2.3, .14, .14), gold, 0, 2.7, 0, D0);
    // lights: warm lamplight, the key on the image from the front, a glow behind the throne, cool light from the windows
    g.add(new THREE.HemisphereLight(0xffd9a8, 0x2a1208, .36));
    const key = new THREE.SpotLight(0xffd6a0, 1.5, 24, .6, .6, 1); key.position.set(2.4, 5.6, 5.5); key.target.position.set(0, 1.8, -1.6); g.add(key, key.target);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
    const back = new THREE.PointLight(0xffb060, 1.1, 7, 2); back.position.set(0, 2.8, -2.8); g.add(back);
    const side = new THREE.DirectionalLight(0x6f86d8, .3); side.position.set(-6, 4, -1); g.add(side);
  }

