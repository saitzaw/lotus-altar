  /* ---------- 山門 the temple gate: a gate hall under a tiled hipped roof matching the pagoda, red walls running off either side,
     and a pair of stone guardian lions (石獅) in front ---------- */
  // a hipped roof over a rectangle: ax, bz are the eave half-sizes, the ridge runs along x; the corners sweep up by `lift`
  function hipRoof(ax, bz, H, lift, ts) {
    const n = 16, rl = ax - bz, ring = [], pos = [], uv = [], idx = [];
    const per = 4 * (2 * ax + 2 * bz);
    ts.forEach(t => {
      const X = rl + bz * t, Z = bz * t, pts = [];
      for (let j = 0; j < n; j++) { const s = -1 + 2 * j / n; pts.push([s * X, Z, s]); }          // front
      for (let j = 0; j < n; j++) { const s = 1 - 2 * j / n; pts.push([X, s * Z, s]); }          // right
      for (let j = 0; j < n; j++) { const s = 1 - 2 * j / n; pts.push([s * X, -Z, s]); }         // back
      for (let j = 0; j < n; j++) { const s = -1 + 2 * j / n; pts.push([-X, s * Z, s]); }        // left
      pts.forEach(([x, z, s], j) => {
        pos.push(x, H * Math.pow(1 - t, 1.6) + lift * Math.pow(Math.abs(s), 6) * t * t, z);
        uv.push(j / (4 * n) * per * 1.3, t * 2);
      });
      ring.push(pts.length);
    });
    const M4 = 4 * n;
    for (let i = 0; i < ts.length - 1; i++) for (let j = 0; j < M4; j++) {
      const a = i * M4 + j, b = i * M4 + (j + 1) % M4, c = a + M4, d = b + M4;
      idx.push(a, c, b, b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    return geo;
  }
  // a tiled hipped roof like the pagoda's: slate tiles, the red eave board and underside, a main ridge with curled ends,
  // and a hip ridge down each corner ending in an upturned tip; `ts` can start above 0 to make just the skirt of an eave
  // incense ash: a soft grey bed flecked with darker ash and the stubs of burnt sticks
  const ashTex = canvasTex(128, (c, sz) => {
    c.fillStyle = "#a39d94"; c.fillRect(0, 0, sz, sz);
    const r = rng(5);
    for (let i = 0; i < 900; i++) { const v = 120 + r() * 70 | 0; c.fillStyle = `rgba(${v},${v - 4},${v - 10},.6)`; c.fillRect(r() * sz, r() * sz, 2, 2); }
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${150 + r() * 60 | 0},${70 + r() * 30 | 0},40,.7)`; c.beginPath(); c.arc(r() * sz, r() * sz, 1.5, 0, TAU); c.fill(); }
  });
  const ashMat = std({ map: ashTex, roughness: 1 });
  // a gently mounded bed of ash of radius r
  const ashBed = r => {
    const geo = new THREE.CircleGeometry(r, 40, 0, TAU), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i), p.getY(i)) / r; p.setZ(i, (1 - d * d) * r * .12); }
    geo.computeVertexNormals(); return geo;
  };
  function tiledHipRoof(g, x, z, foot, AX, BZ, RH, LIFT, ts, tipScale = 1, ridgeTop = true) {
    mesh(hipRoof(AX, BZ, RH, LIFT, ts), roofMat, x, foot, z, g);
    mesh(hipRoof(AX, BZ, RH, LIFT, [.93, .965, 1]), eaveRed, x, foot, z, g);
    flat(mesh(hipRoof(AX, BZ, RH, LIFT, [...ts, .965, 1]), eaveRed, x, foot - .06, z, g));
    if (ridgeTop) {
      mesh(new THREE.BoxGeometry(2 * (AX - BZ) + .3, .3, .3), ridgeMat, x, foot + RH + .1, z, g);
      [-1, 1].forEach(sx => {
        const end = mesh(new THREE.TorusGeometry(.32, .09, 8, 18, Math.PI * 1.3), ridgeMat, x + sx * (AX - BZ + .15), foot + RH + .5, z, g);
        end.rotation.set(0, sx < 0 ? Math.PI : 0, -Math.PI * .15);   // mirrored on the left end
      });
    }
    const t0 = ts[0];
    [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
      const pts = []; for (let i = 0; i <= 12; i++) { const t = t0 + (1 - t0) * i / 12; pts.push(V(x + sx * (AX - BZ + BZ * t), foot + RH * Math.pow(1 - t, 1.6) + LIFT * t * t + .08, z + sz * BZ * t)); }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .09, 6), ridgeMat, 0, 0, 0, g);
      const tip = mesh(tipGeo, ridgeMat, pts[12].x, pts[12].y + .22, pts[12].z, g);
      tip.rotation.set(sz * .75, 0, -sx * .75); tip.scale.setScalar(tipScale);
    }));
  }
  function gate(g, z) {
    const COLS = [-4.2, -1.8, 1.8, 4.2], ROWS = [-1.2, 1.2], CH = 4.6, base = .3;
    COLS.forEach(x => ROWS.forEach(dz => BLOCK.posts.push([x, z + dz, .55])));
    BLOCK.segs.push([-5.2, z, -1.95, z], [1.95, z, 5.2, z]);       // the side bays' walls; the middle bay is the way through
    [-3.2, 3.2].forEach(x => BLOCK.posts.push([x, z + 3.4, 1.2]));   // the guardian lions
    mesh(new THREE.BoxGeometry(10.4, base, 4.2), M.stone, 0, base / 2, z, g);
    mesh(new THREE.BoxGeometry(4.2, base / 2, 1.2), M.stone, 0, base / 4, z + 2.6, g);
    COLS.forEach(x => ROWS.forEach(dz => {
      mesh(new THREE.CylinderGeometry(.26, .29, CH, 16), pillarRed, x, base + CH / 2, z + dz, g);
      mesh(new THREE.CylinderGeometry(.38, .4, .16, 16), M.stone, x, base + .08, z + dz, g);
    }));
    // side bays: red walls with carved panels, the middle bay left open for the path
    [-1, 1].forEach(sd => {
      const x = sd * 3;
      mesh(new THREE.BoxGeometry(2.1, CH, .3), pillarRed, x, base + CH / 2, z, g);
      latticeWindows(g, [{ p: V(x, base + 2.4, z + .16), ry: 0, w: 1.4, h: 2.6 }], std({ color: 0x1a0c08, emissive: 0x3a1a0a, emissiveIntensity: .6 }));
    });
    // painted beams front and back, gold brackets above, then the roof
    const T = base + CH;
    ROWS.forEach(dz => {
      mesh(new THREE.BoxGeometry(9.2, .55, .34), beamMat, 0, T - .3, z + dz, g);
      mesh(new THREE.BoxGeometry(9.2, .22, .36), pillarRed, 0, T + .08, z + dz, g);
      for (let x = -4.2; x <= 4.21; x += .6) {
        mesh(new THREE.BoxGeometry(.18, .16, .3), M.trim, x, T + .27, z + dz + Math.sign(dz) * .1, g);
        mesh(new THREE.BoxGeometry(.32, .12, .46), paintGreen, x, T + .41, z + dz + Math.sign(dz) * .2, g);
      }
    });
    const foot = T + .45, AX = 5.8, BZ = 3.0, RH = 2.4, LIFT = .7;
    const ts = [0, .1, .2, .3, .4, .5, .6, .7, .8, .88, .93];
    tiledHipRoof(g, 0, z, foot, AX, BZ, RH, LIFT, ts, 1.3);
    const plaque = writing(512, 192, (c, w, h) => {
      c.fillStyle = "#16233d"; c.fillRect(0, 0, w, h);
      c.strokeStyle = "#d6a94a"; c.lineWidth = 14; c.strokeRect(10, 10, w - 20, h - 20);
      c.fillStyle = "#e8c25a"; c.font = HAN_FONT(118); c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("蓮華寺", w / 2, h / 2 + 6);
    });
    mesh(new THREE.BoxGeometry(2.2, .9, .08), M.trim, 0, T - .95, z + 1.42, g);
    flat(mesh(new THREE.PlaneGeometry(2.0, .75), new THREE.MeshStandardMaterial({ map: plaque, roughness: .6, emissive: 0x222222, emissiveMap: plaque }), 0, T - .95, z + 1.47, g));
    // red walls with orange tiled coping running off to either side
    [-1, 1].forEach(sd => {
      const x0 = 5.2, x1 = 33, cx = sd * (x0 + x1) / 2, w = x1 - x0, WH = 3.2;
      mesh(new THREE.BoxGeometry(w, .5, .7), M.stone, cx, .25, z, g);
      mesh(new THREE.BoxGeometry(w, WH, .5), pillarRed, cx, WH / 2, z, g);
      mesh(new THREE.BoxGeometry(w, .2, .62), beamMat, cx, WH - .2, z, g);
      [-1, 1].forEach(f => { const c = mesh(new THREE.BoxGeometry(w + .2, .08, .62), roofMat, cx, WH + .18, z + f * .26, g); c.rotation.x = f * .5; });
      [-1, 1].forEach(f => mesh(new THREE.BoxGeometry(w + .2, .1, .04), eaveRed, cx, WH + .05, z + f * .55, g));   // red eave edge
      mesh(new THREE.BoxGeometry(w + .2, .14, .16), ridgeMat, cx, WH + .34, z, g);
    });
    // hedges inside the gate, lining the path
    const hedge = std({ color: 0x2f5a26, roughness: .9 });
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.9, .7, 3.6), hedge, sd * 3.8, .35, z - 3.2, g));
    // the lions face out from the temple, each with its paw on the embroidered ball on the inner side
    [["lion", -3.2], ["lionL", 3.2]].forEach(([fig, x]) => {
      const lg = new THREE.Group(); lg.position.set(x, 0, z + 3.4); lg.scale.setScalar(1.35); g.add(lg);
      sculptFigure(fig, lg, "the guardian lions");
    });
    lantern(g, -1.2, 3.6, z + 1.2, T - .6, .9); lantern(g, 1.2, 3.6, z + 1.2, T - .6, .9);
  }

