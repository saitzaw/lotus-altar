  /* ---------- beyond the paddy fields: a band of forest, then the forested Shan hills rising in two ranges toward the horizon ---------- */
  // the hills have a Shan name, လွႆသၢမ်သိပ်း (Loi Sam Sip, "the thirty hills"): every peak names them on hover and tells of them on a click
  const HILLS = { tip: "လွႆသၢမ်သိပ်း · the Loi Sam Sip hills", toast: "လွႆသၢမ်သိပ်း, Loi Sam Sip: \"the thirty hills\" in Shan (လွႆ, loi, a hill or mountain; သၢမ်သိပ်း, sam sip, thirty). Forested ridges of the Shan uplands, greener in front and bluer behind, closing the valley round the town and its fields." };
  function mountainsAndForest(g) {
    const r = rng(2024);
    const near = std({ color: 0x3e5a34, roughness: 1, flatShading: true }), far = std({ color: 0x4a6a6a, roughness: 1, flatShading: true });
    onDaylight(d => { near.color.copy(lerpC(0x141c12, 0x2a4422, d)); far.color.copy(lerpC(0x161c26, 0x3a5656, d)); });
    const peaks = [];
    // a craggy peak: a cone with its rings pushed in and out
    function peak(x, z, rad, h, mat) {
      const geo = new THREE.ConeGeometry(rad, h, 11, 6), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i), t = (y + h / 2) / h;
        if (t > .98) continue;
        const k = 1 + (r() - .5) * .35 * (1 - t);
        p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); p.setY(i, y + (r() - .5) * h * .05 * (1 - t));
      }
      const ry = r() * TAU;
      // none may stand on the road up to the hospital or on the hospital itself (the random numbers are still drawn, so the others keep their shapes)
      if (Math.hypot(x - clamp(x, -130, -86), z - clamp(z, -19, 60)) < rad) { geo.dispose(); return; }
      geo.computeVertexNormals();
      const m = clickable(picks.pagoda, mesh(geo, mat, x, h / 2 - .5, z, g), HILLS); m.castShadow = false; m.rotation.y = ry;
      peaks.push({ x, z, rad, h });
    }
    // two ranges along an arc behind the fields: lower, greener hills in front; taller, bluer ridges behind
    for (let i = 0; i <= 12; i++) {
      const a = -1.45 + i / 12 * 2.9;
      const d1 = 150 + r() * 12, d2 = 182 + r() * 8;
      peak(Math.sin(a) * d1, -Math.cos(a) * d1, 30 + r() * 16, 24 + r() * 18, near);
      if (i % 2 === 0 || r() < .5) peak(Math.sin(a + .1) * d2, -Math.cos(a + .1) * d2, 26 + r() * 10, 42 + r() * 22, far);
    }
    // the forest: dark conical trees in a band from the field edge to the foothills, and climbing the lower slopes
    const treeGeo = new THREE.ConeGeometry(1, 1, 7); treeGeo.translate(0, .5, 0);
    const greens = [0x2a4a28, 0x34552c, 0x223f22, 0x3c5e30].map(c => new THREE.Color(c));
    const N = 2600, trees = new THREE.InstancedMesh(treeGeo, std({ color: 0xffffff, roughness: .95, flatShading: true }), N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    let n = 0;
    const put = (x, y, z, s) => { if (n >= N) return; m4.compose(V(x, y, z), q.setFromAxisAngle(V(0, 1, 0), r() * TAU), V(s * .45, s, s * .45)); trees.setMatrixAt(n, m4); trees.setColorAt(n++, greens[(r() * 4) | 0]); };
    for (let i = 0; i < 1500; i++) {   // the band: past the fields' far edge (z < -98), out to the foothills
      const a = -1.5 + r() * 3, d = 100 + r() * 55, x = Math.sin(a) * d, z = -Math.cos(a) * d;
      if (z > -98 && Math.abs(x) < 110) continue;   // keep off the fields
      if (z > -36) continue;                          // and off the town side of the stream
      put(x, 0, z, 3 + r() * 3.5); sCircle(g, x, z, .35);
    }
    peaks.forEach(pk => {   // and up the lower half of each hill
      for (let i = 0; i < 70; i++) {
        const t = r() * .5, a = r() * TAU, rr = pk.rad * (1 - t) * .92;
        put(pk.x + Math.cos(a) * rr, pk.h * t - .5, pk.z + Math.sin(a) * rr, 3 + r() * 2.5);
      }
    });
    trees.count = n; trees.castShadow = false; g.add(trees);
    onDaylight(d => { trees.material.color.copy(lerpC(0x404c40, 0xb8c4b0, d)); });
  }
