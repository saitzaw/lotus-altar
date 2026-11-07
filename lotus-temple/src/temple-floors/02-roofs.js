  /* ---------- roofs: curved octagonal eaves of dark slate barrel tiles over a red eave board, the corners swept up to sharp tips ---------- */
  const R8 = Math.PI / 8, oct = m => { m.rotation.y = R8; return m; };
  const tileTexture = (dark, stops, line, glint) => {
    const t = canvasTex(256, (c, s) => {
      const n = 4, w = s / n;
      c.fillStyle = dark; c.fillRect(0, 0, s, s);
      for (let i = 0; i < n; i++) {   // round tiles: lit along the crown, dark in the channels between them
        const gr = c.createLinearGradient(i * w, 0, (i + 1) * w, 0);
        [0, .22, .46, .76, 1].forEach((o, j) => gr.addColorStop(o, stops[j]));
        c.fillStyle = gr; c.fillRect(i * w + 3, 0, w - 6, s);
      }
      for (let y = 0; y < s; y += s / 4) { c.fillStyle = line; c.fillRect(0, y, s, 6); c.fillStyle = glint; c.fillRect(0, y + 6, s, 4); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
  };
  const tileTex = tileTexture("#161b20", ["#1c2228", "#3a4550", "#66727f", "#36404a", "#161b20"], "rgba(6,9,12,.6)", "rgba(200,220,240,.12)");
  const roofMat = std({ map: tileTex, roughness: .5, metalness: .1, side: THREE.DoubleSide });
  const ridgeMat = std({ color: 0x2a3038, roughness: .45, metalness: .1 }), eaveRed = std({ color: 0xa42418, roughness: .5, side: THREE.DoubleSide });
  const EAVE_T = [0, .1, .2, .3, .4, .5, .6, .7, .8, .88, .93], RIM_T = [.93, .965, 1];
  const eaveY = (h, lift, t, d = R8) => h * Math.pow(1 - t, 1.6) + lift * Math.pow(d / R8, 5) * t * t;
  // geometry from y = 0 (the foot) to h over the slice `ts` of the slope; corners sweep up by `lift`; rIn near 0 makes a pointed roof
  function curvedEave(rIn, rOut, h, lift, ts = EAVE_T) {
    const geo = new THREE.LatheGeometry(ts.map(t => new THREE.Vector2(rIn + (rOut - rIn) * t, h * Math.pow(1 - t, 1.6))), 64, R8);
    const pos = geo.attributes.position, uv = geo.attributes.uv, rep = Math.max(2, Math.round(rOut * 7.5));
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), rho = Math.hypot(x, z), phi = Math.atan2(x, z);
      const u = ((phi % (2 * R8)) + 2 * R8) % (2 * R8), d = Math.min(u, 2 * R8 - u);   // angle from the nearest face centre
      const t = clamp((rho - rIn) / (rOut - rIn), 0, 1), r2 = rho * Math.cos(R8) / Math.cos(d);   // clamp: rounding can nudge t past 1          // straighten the round lathe into an octagon
      pos.setXYZ(i, Math.sin(phi) * r2, eaveY(h, lift, t, d), Math.cos(phi) * r2);
      uv.setXY(i, uv.getX(i) * rep, t * 2);
    }
    geo.computeVertexNormals();
    return geo;
  }
  const windBellGeo = new THREE.LatheGeometry([[0, .14], [.06, .12], [.08, .03], [.1, -.08], [.08, -.08], [0, -.05]].map(([x, z]) => new THREE.Vector2(x, z)), 16);
  const tipGeo = new THREE.ConeGeometry(.06, .5, 8);
  // an eave on `parent` with its foot at height y: tiles, the red eave board and underside, a ridge down each corner
  // ending in an upturned tip, and a wind bell under each corner
  function tiledEave(parent, y, rIn, rOut, h, lift, data, list, bells = true) {
    const e = mesh(curvedEave(rIn, rOut, h, lift), roofMat, 0, y, 0, parent);
    mesh(curvedEave(rIn, rOut, h, lift, RIM_T), eaveRed, 0, y, 0, parent);
    flat(mesh(curvedEave(rIn, rOut, h, lift, [...EAVE_T, ...RIM_T.slice(1)]), eaveRed, 0, y - .05, 0, parent));   // red underside
    if (list) clickable(list, e, data);
    if (rIn > .2) oct(mesh(new THREE.CylinderGeometry(rIn + .04, rIn + .1, .16, 8, 1, true), ridgeMat, 0, y + h - .04, 0, parent));
    for (let k = 0; k < 8; k++) {
      const c = k / 8 * TAU + R8, at = t => { const r = rIn + (rOut - rIn) * t; return V(Math.sin(c) * r, y + eaveY(h, lift, t) + .05, Math.cos(c) * r); };
      const pts = []; for (let i = 0; i <= 12; i++) pts.push(at(i / 12));
      flat(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .07, 6), ridgeMat, 0, 0, 0, parent));
      const tip = flat(mesh(tipGeo, ridgeMat, pts[12].x, pts[12].y + .22, pts[12].z, parent));
      tip.rotation.set(Math.cos(c) * .75, 0, -Math.sin(c) * .75); tip.scale.setScalar(clamp(rOut / 4.5, .55, 1.2));
      if (!bells) continue;
      const wb = at(.9).add(V(0, -.12, 0));
      flat(mesh(new THREE.CylinderGeometry(.006, .006, .3, 4), M.feature, wb.x, wb.y - .15, wb.z, parent));
      flat(mesh(windBellGeo, M.trim, wb.x, wb.y - .42, wb.z, parent));
    }
    return e;
  }
  // a stone or timber balustrade round an octagon of corner radius rb; `open` lists faces left open (0 faces +z),
  // and `gap` (a width) leaves an opening in the middle of each open face instead of the whole face
  const railMat = std({ color: 0xf3eee4, roughness: .6, emissive: 0x2a2620 }), redRail = std({ color: 0xa42418, roughness: .5 });
  function balustrade(parent, rb, open = [], mat = railMat, gap = Infinity) {
    const L = 2 * rb * Math.sin(R8), ap = rb * Math.cos(R8), per = 7;
    const parts = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, 8 * (per + 3) + 8);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    let k = 0;
    for (let f = 0; f < 8; f++) {
      const a = f / 8 * TAU, right = V(Math.cos(a), 0, -Math.sin(a)), mid = V(Math.sin(a), 0, Math.cos(a)).multiplyScalar(ap);
      q.setFromEuler(e.set(0, a, 0));
      if (open.includes(f)) {   // still close the corner post on the far side of an opening
        parts.setMatrixAt(k++, m4.compose(mid.clone().addScaledVector(right, L / 2).setY(.45), q, V(.14, .9, .14)));
        if (gap < L) [-1, 1].forEach(sd => {   // rail stubs either side of the gap
          const len = (L - gap) / 2, c = mid.clone().addScaledVector(right, sd * (gap / 2 + len / 2));
          parts.setMatrixAt(k++, m4.compose(c.clone().setY(.78), q, V(len, .07, .1)));
          parts.setMatrixAt(k++, m4.compose(c.clone().setY(.22), q, V(len, .06, .08)));
          parts.setMatrixAt(k++, m4.compose(mid.clone().addScaledVector(right, sd * gap / 2).setY(.45), q, V(.14, .9, .14)));
          parts.setMatrixAt(k++, m4.compose(mid.clone().addScaledVector(right, sd * (L / 2 - len / 2)).setY(.5), q, V(.06, .56, .06)));
        });
        continue;
      }
      parts.setMatrixAt(k++, m4.compose(mid.clone().setY(.78), q, V(L, .07, .1)));                 // hand rail
      parts.setMatrixAt(k++, m4.compose(mid.clone().setY(.22), q, V(L, .06, .08)));                // bottom rail
      for (let j = 0; j < per; j++) {
        const big = j === 0, p = mid.clone().addScaledVector(right, -L / 2 + j * L / per);
        parts.setMatrixAt(k++, m4.compose(p.setY(big ? .45 : .5), q, big ? V(.14, .9, .14) : V(.06, .56, .06)));
      }
    }
    parts.count = k; parts.castShadow = false; parent.add(parts);
  }
  // painted beams (blue and green bands, a gold-framed cartouche on each face) and two rows of brackets (dougong) under an eave
  const paintGreen = std({ color: 0x2f7a55, roughness: .55 }), paintBlue = std({ color: 0x2a4f94, roughness: .55 }), pillarRed = std({ color: 0xa42418, roughness: .5 });
  const beamTex = writing(512, 128, (c, w, h) => {
    c.fillStyle = "#1f4f8a"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#2f7a5a"; c.fillRect(0, 0, w, 22); c.fillRect(0, h - 22, w, 22);
    c.fillStyle = "#d6a94a"; c.fillRect(0, 22, w, 5); c.fillRect(0, h - 27, w, 5);
    c.fillStyle = "#2c6e4f"; c.fillRect(150, 38, 212, 52); c.strokeStyle = "#e8c25a"; c.lineWidth = 6; c.strokeRect(150, 38, 212, 52);
    c.fillStyle = "#e8c25a"; [60, 100, 412, 452].forEach(x => { c.beginPath(); c.arc(x, h / 2, 12, 0, TAU); c.fill(); });
  });
  beamTex.wrapS = THREE.RepeatWrapping; beamTex.repeat.x = 8;
  const beamMat = std({ map: beamTex, roughness: .6 });
  function paintedBeam(parent, y, r, h = .5) { return oct(mesh(new THREE.CylinderGeometry(r, r, h, 8, 1, true), beamMat, 0, y, 0, parent)); }
  function brackets(parent, y, r, perFace, mats = [paintGreen, paintBlue, M.trim]) {
    const geo = new THREE.BoxGeometry(1, 1, 1), n = 8 * perFace;
    const lo = new THREE.InstancedMesh(geo, mats[0], n), hi = new THREE.InstancedMesh(geo, mats[1], n), tips = new THREE.InstancedMesh(geo, mats[2], n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), ap = r * Math.cos(R8), hw = r * Math.sin(R8);
    let i = 0;
    for (let k = 0; k < 8; k++) for (let j = 0; j < perFace; j++) {
      const a = k / 8 * TAU, t = -hw + (j + .5) * 2 * hw / perFace;
      const p = V(Math.sin(a) * ap + Math.cos(a) * t, y, Math.cos(a) * ap - Math.sin(a) * t), out = V(Math.sin(a), 0, Math.cos(a));
      q.setFromEuler(e.set(0, a, 0));
      lo.setMatrixAt(i, m4.compose(p, q, V(.16, .14, .3)));
      hi.setMatrixAt(i, m4.compose(p.clone().add(V(0, .14, 0)).addScaledVector(out, .1), q, V(.34, .12, .46)));
      tips.setMatrixAt(i, m4.compose(p.clone().add(V(0, .14, 0)).addScaledVector(out, .35), q, V(.36, .05, .04)));
      i++;
    }
    [lo, hi, tips].forEach(m => { m.castShadow = false; parent.add(m); });
  }
  const BELL_PROFILE = [[0, -.02], [.3, -.05], [.46, -.2], [.52, -.6], [.56, -1.2], [.66, -1.62], [.7, -1.7], [.62, -1.7], [.5, -1.3], [.46, -.6], [.4, -.22], [0, -.1]];

  // eight columns in the traditional plan: four inner columns (金柱) framing the shrine and joined by beams,
  // and four corner columns (角柱) set into the corners of the hall, where they hardly show
  const INNER_COLUMNS = [[-2.8, -2.6], [2.8, -2.6], [-2.8, 2.4], [2.8, 2.4]], CORNER_COLUMNS = [[-7.25, -5.25], [7.25, -5.25], [-7.25, 7.25], [7.25, 7.25]];
  function hallColumns(g) {
    // the back-left corner column would stand inside the stair room, behind the stairs, so it is left out
    [...INNER_COLUMNS, ...CORNER_COLUMNS.filter(([x, z]) => !inStairCorner({ x, z }))].forEach(([x, z]) => {
      mesh(new THREE.CylinderGeometry(.42, .46, .3, 24), M.stone, x, .15, z, g);
      mesh(new THREE.CylinderGeometry(.26, .3, 6.0, 24), M.lacquer, x, 3.3, z, g);
      mesh(new THREE.BoxGeometry(.8, .3, .8), M.trim, x, 6.3, z, g);
    });
    const [[x0, z0], , , [x1, z1]] = INNER_COLUMNS;
    [z0, z1].forEach(z => { mesh(new THREE.BoxGeometry(x1 - x0 + .8, .4, .5), M.lacquer, 0, 6.6, z, g); mesh(new THREE.BoxGeometry(x1 - x0 + .82, .08, .52), M.trim, 0, 6.38, z, g); });
    [x0, x1].forEach(x => { mesh(new THREE.BoxGeometry(.5, .4, z1 - z0 + .8), M.lacquer, x, 6.6, (z0 + z1) / 2, g); mesh(new THREE.BoxGeometry(.52, .08, z1 - z0 + .82), M.trim, x, 6.38, (z0 + z1) / 2, g); });
  }
  // 須彌座, the Sumeru pedestal a statue's lotus throne sits on: plinth, mouldings, a red waist with gilt panels, top slab
  function sumeru(parent, x, z) {
    const p = new THREE.Group(); p.position.set(x, 0, z); parent.add(p);
    oct(mesh(new THREE.CylinderGeometry(1.62, 1.68, .08, 8), M.stone, 0, .04, 0, p));
    oct(mesh(new THREE.CylinderGeometry(1.5, 1.6, .06, 8), M.trim, 0, .11, 0, p));
    const waist = oct(mesh(new THREE.CylinderGeometry(1.3, 1.3, .14, 8), M.lacquer, 0, .21, 0, p));
    for (let k = 0; k < 8; k++) {   // a gilt panel on each face of the waist
      const a = k / 8 * TAU, ap = 1.3 * Math.cos(R8) + .006;
      const pn = mesh(new THREE.BoxGeometry(.7, .08, .01), M.trim, Math.sin(a) * ap, .21, Math.cos(a) * ap, p); pn.rotation.y = a;
    }
    oct(mesh(new THREE.CylinderGeometry(1.6, 1.5, .06, 8), M.trim, 0, .31, 0, p));
    oct(mesh(new THREE.CylinderGeometry(1.64, 1.64, .06, 8), M.lacquer, 0, .37, 0, p));
    return waist;
  }
  function shell(g, n, o = {}) {
    const sway = [];
    const top = typeof n === "number" && n === FLOORS.length, holeBelow = typeof n === "number" && n > 1;
    // the floor covers just the hall (so it does not show past the balcony), with a hole for the stairs on the top floor
    const floorShape = sh => { sh.moveTo(-7.6, -7.6); sh.lineTo(7.6, -7.6); sh.lineTo(7.6, 5.6); sh.lineTo(-7.6, 5.6); sh.closePath(); };
    const fg = holeBelow ? holed(floorShape, STAIRS.x, -STAIRS.z, 1.0) : new THREE.ShapeGeometry((() => { const sh = new THREE.Shape(); floorShape(sh); return sh; })());
    const fp = fg.attributes.position, fuv = fg.attributes.uv;
    for (let i = 0; i < fp.count; i++) fuv.setXY(i, fp.getX(i) / 32 + .5, fp.getY(i) / 32 + .5);   // same tile size as the old 32-wide floor
    const f = flat(mesh(fg, M.floor, 0, 0, 0, g)); f.rotation.x = -Math.PI / 2;
    hallWalls(g, o.wall || M.wall);
    hallColumns(g);
    const ceil = flat(mesh(top ? new THREE.ShapeGeometry((() => { const sh = new THREE.Shape(); sh.moveTo(-8, -7.7); sh.lineTo(8, -7.7); sh.lineTo(8, 7.7); sh.lineTo(-8, 7.7); sh.closePath(); return sh; })()) : holed(sh => { sh.moveTo(-8, -7.7); sh.lineTo(8, -7.7); sh.lineTo(8, 7.7); sh.lineTo(-8, 7.7); sh.closePath(); }, STAIRS.x, STAIRS.z, 1.0), M.wall, 0, 6.9, 0, g));
    ceil.rotation.x = Math.PI / 2;
    [-2.6, -.4, 1.8, 4].forEach(z => flat(mesh(new THREE.BoxGeometry(12, .22, .26), M.lacquer, 0, 6.75, z, g)));
    if (o.lanterns !== false) [[-2.6, [-3.4, 3.4]], [-.4, [-3.6, -1.8, 1.8, 3.6]], [1.8, [-3.6, -1.2, 1.2, 3.6]], [4, [-3.6, -1.2, 1.2, 3.6]]]
      .forEach(([z, xs], row) => xs.forEach((x, i) => sway.push(lantern(g, x, 4.4 + ((i + row) % 2) * .3, z))));
    g.add(new THREE.HemisphereLight(o.sky || 0xffd9a8, 0x2a1208, o.hemi ?? .32));
    const key = new THREE.SpotLight(0xffd6a0, o.key ?? 1.4, 24, .62, .6, 1);
    key.position.set(2.8, 6.4, 6.5); key.target.position.set(0, 1.6, -1.4); g.add(key, key.target);
    if (o.shadow) { key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02; }
    const back = new THREE.PointLight(o.glow || 0xffa850, 1, 7, 2); back.position.set(0, 2.6, -3); g.add(back);
    const side = new THREE.DirectionalLight(0x6f86d8, .35); side.position.set(-6, 4, -1); g.add(side);
    moreLanterns(g, n);
    picks[n] = picks[n] || [];
    // the stairs climb through the pagoda's floors and end at the top floor, where only the stairwell shows
    if (typeof n === "number") { spiralStairs(g, n, picks[n]); stairRoom(g, n, picks[n]); }
    frontWall(g, n, picks[n]);
    updaters[n] = updaters[n] || [];
    updaters[n].push((dt, t, motion) => sway.forEach((l, i) => l.rotation.z = Math.sin(t * .7 + i * 2) * .03 * motion));
    return { key, back };
  }
  function auraTexture(inner, mid, ray) {
    return canvasTex(512, (c, s) => {
      const h = s / 2;
      c.save(); c.translate(h, h);
      for (let i = 0; i < 48; i++) {
        c.rotate(TAU / 48);
        const gr = c.createLinearGradient(0, 0, 0, -h);
        gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.35, ray); gr.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = gr; c.beginPath(); c.moveTo(-3, 0); c.lineTo(-(i % 2 ? 7 : 14), -h); c.lineTo(i % 2 ? 7 : 14, -h); c.lineTo(3, 0); c.fill();
      }
      c.restore();
      const r = c.createRadialGradient(h, h, 0, h, h, h);
      r.addColorStop(0, inner); r.addColorStop(.4, mid); r.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = r; c.fillRect(0, 0, s, s);
    });
  }
  function throne(parent, petalMat) {
    mesh(new THREE.CylinderGeometry(1.05, 1.25, .3, 48), M.gold, 0, .15, 0, parent);
    mesh(new THREE.TorusGeometry(1.15, .04, 8, 64), M.trim, 0, .3, 0, parent).rotation.x = Math.PI / 2;
    [[18, 1.08, .42, .55, 0], [18, .9, .5, .25, TAU / 36]].forEach(([n, r, y, tilt, off]) => {
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + off;
        const p = mesh(petalGeo, petalMat, Math.sin(a) * r, y, Math.cos(a) * r, parent);
        p.scale.set(.2, .2, .07); p.rotation.order = "YXZ"; p.rotation.y = a; p.rotation.x = -tilt;
      }
    });
  }
  function offeringTable(g, n) {
    mesh(new THREE.BoxGeometry(3.1, ALT.y - .04, .95), M.lacquer, 0, (ALT.y - .04) / 2, ALT.z, g);
    mesh(new THREE.BoxGeometry(3.2, .04, 1.05), M.cloth, 0, ALT.y - .02, ALT.z, g);
    mesh(new THREE.BoxGeometry(1.6, .5, .02), M.cloth, 0, .82, ALT.z + .53, g);
    mesh(new THREE.BoxGeometry(1.6, .04, .025), M.trim, 0, .58, ALT.z + .54, g);
    [-1.45, 1.45].forEach(x => {
      const z = ALT.z - .34;
      mesh(new THREE.CylinderGeometry(.07, .09, .03, 20), M.brass, x, ALT.y + .015, z, g);
      mesh(new THREE.CylinderGeometry(.045, .045, .3, 20), M.waxRed, x, ALT.y + .19, z, g);
      const light = new THREE.PointLight(0xff9a3c, 1, 6, 2); light.position.set(x, ALT.y + .42, z); g.add(light);
      makeFlame(V(x, ALT.y + .37, z), 1.4, light, g);
    });
  }
  function vaseOfLotus(g, x, z) {
    const vase = lathe([[0, 0], [.1, 0], [.11, .04], [.15, .14], [.13, .24], [.06, .3], [.07, .36], [0, .36]], M.brass);
    vase.position.set(x, ALT.y, z); vase.castShadow = true; g.add(vase);
    [-.5, 0, .5].forEach((a, i) => {
      const head = makeLotus(); head.userData.bloom(1);
      const tip = V(x + Math.sin(a) * .2, ALT.y + .6 + (i === 1 ? .08 : 0), z);
      const from = V(x, ALT.y + .35, z), d = tip.clone().sub(from);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(.006, .008, 1, 6), M.stem);
      stem.geometry.translate(0, .5, 0); stem.position.copy(from); stem.scale.y = d.length();
      stem.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
      head.position.copy(tip); head.quaternion.copy(stem.quaternion); g.add(stem, head);
    });
  }
  function fruitPlate(g, x, z, mats, shape) {
    mesh(new THREE.CylinderGeometry(.06, .09, .1, 24), M.brass, x, ALT.y + .05, z, g);
    const plate = lathe([[0, 0], [.26, 0], [.32, .03], [.31, .035], [.25, .012], [0, .012]], M.brass, 40);
    plate.position.set(x, ALT.y + .1, z); g.add(plate);
    const pts = [[0, 0, 0]];
    for (let i = 0; i < 6; i++) pts.push([Math.sin(i / 6 * TAU) * .16, 0, Math.cos(i / 6 * TAU) * .16]);
    for (let i = 0; i < 3; i++) pts.push([Math.sin(i / 3 * TAU + .5) * .09, .11, Math.cos(i / 3 * TAU + .5) * .09]);
    pts.push([0, .2, 0]);
    pts.forEach(([dx, dy, dz], i) => {
      const f = shape(mats[i % mats.length]); f.position.set(x + dx, ALT.y + .182 + dy, z + dz); f.rotation.y = i; g.add(f);
    });
  }
  const sphereFruit = m => { const f = new THREE.Mesh(new THREE.SphereGeometry(.07, 20, 14), m); f.castShadow = true; return f; };
  function statueHall(g, n, o) {
    const lights = shell(g, n, { shadow: true, glow: o.glow });
    sumeru(g, 0, -1.7);
    const st = new THREE.Group(); st.position.set(0, .4, -1.7); g.add(st);
    throne(st, o.petal);
    const aura = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshBasicMaterial({ map: o.aura, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
    aura.position.set(0, 2.2, -.75); st.add(aura);
    mesh(new THREE.TorusGeometry(.72, .025, 8, 72), o.ring, 0, 2.4, -.45, st);
    mesh(new THREE.TorusGeometry(1.8, .035, 8, 96), o.ring, 0, 1.8, -.6, st);
    const halo = glowSprite(o.haloColor, 2.4, .25); halo.position.set(0, 2.4, -.52); st.add(halo);
    sculptFigure(o.figure, st, o.label);
    offeringTable(g, n);
    picks[n].push(...shrine(g, n, { before: o.label, fruitX: o.fruitX }));   // water, light, incense and fruit, as before Guanyin
    updaters[n].push((dt, t, motion) => { aura.rotation.z += dt * .03 * motion; aura.material.opacity = .5 + Math.sin(t * .8) * .05; lights.back.intensity = 1.1 + Math.sin(t * .8) * .1; });
    return st;
  }

