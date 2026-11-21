  /* ---------- ဆီမီးပူဇော် lotus lanterns on the main stupa's terrace walk: small pink paper lotus cups, each holding a little flame,
     set out in rows along the parapet's coping, round the foot of the stupa and at both ends of every step, offered to the Buddha
     through the months of the festivals of light (Thadingyut in October, Tazaungdaing in November) ---------- */
  // T: the terrace walk's frame (origin on the hilltop under the stupa), TW: its sizes, STEPS: the turns of its four flights
  function stupaLotusLanterns(T, list, TW, STEPS) {
    const { D, Y, PT, PH, SH } = TW, rs = Y / (TW.n + 1), r = rng(1011), at = [];
    const put = (x, y, z, a) => at.push({ x: x * Math.cos(a) + z * Math.sin(a), y, z: -x * Math.sin(a) + z * Math.cos(a), ry: r() * TAU });   // (x, z) turned by a round the stupa
    STEPS.forEach(a => {
      for (let u = -D + .45; u <= D - .45; u += .45) if (Math.abs(u) > SH + .4) put(u, Y + PH + .12, -D + PT / 2, a);   // on the coping, clear of the steps and the corner lamps
      for (let u = -2.85; u <= 2.86; u += .38) put(u, Y, -3.12, a);                                                      // in a row round the stupa's foot
      for (let i = 0; i < TW.n; i++) [-1, 1].forEach(sd => put(sd * (SH - .2), Y - (i + 1) * rs, -(D + (i + .5) * TW.tread), a));   // both ends of every step
    });
    // one petal cup: a lathe drawn up into eight pointed petals, white at the heart blushing to pink at the tips
    const cup = new THREE.LatheGeometry([[0, 0], [.03, 0], [.055, .02], [.074, .048], [.082, .07]].map(([x, y]) => new THREE.Vector2(x, y)), 16), cp = cup.attributes.position;
    const cols = [], c0 = new THREE.Color(0xfbeef0), c1 = new THREE.Color(0xe0507e), cc = new THREE.Color();
    for (let i = 0; i < cp.count; i++) {
      const x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i), t = y / .07, p = Math.pow(Math.abs(Math.cos(4 * Math.atan2(z, x))), 3), k = 1 + .18 * p * t;
      cp.setXYZ(i, x * k, y + .045 * p * t * t, z * k);
      cc.copy(c0).lerp(c1, Math.pow(t, 1.4) * (.55 + .45 * p)); cols.push(cc.r, cc.g, cc.b);
    }
    cup.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3)); cup.computeVertexNormals();
    const petals = std({ vertexColors: true, roughness: .7, side: THREE.DoubleSide, emissive: 0x4a1020, emissiveIntensity: 0 });
    const flameGeo = new THREE.ConeGeometry(.016, .06, 5); flameGeo.translate(0, .075, 0);
    const N = at.length, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y_ = V(0, 1, 0);
    const outer = new THREE.InstancedMesh(cup, petals, N), inner = new THREE.InstancedMesh(cup, petals, N), flames = new THREE.InstancedMesh(flameGeo, new THREE.MeshBasicMaterial({ color: 0xffb040 }), N);
    at.forEach((p, i) => {
      outer.setMatrixAt(i, m4.compose(V(p.x, p.y, p.z), q.setFromAxisAngle(Y_, p.ry), V(1, 1, 1)));
      inner.setMatrixAt(i, m4.compose(V(p.x, p.y + .008, p.z), q.setFromAxisAngle(Y_, p.ry + Math.PI / 8), V(.68, .8, .68)));   // the inner ring, between the outer petals
      flames.setMatrixAt(i, m4.compose(V(p.x, p.y, p.z), q.identity(), V(1, 1, 1)));
    });
    // the glow of every flame: one cloud of points, faint by day, bright after dark
    const gp = new Float32Array(N * 3); at.forEach((p, i) => gp.set([p.x, p.y + .08, p.z], i * 3));
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(gp, 3));
    const glow = new THREE.Points(gg, new THREE.PointsMaterial({ size: .34, color: 0xffb860, map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    const all = [outer, inner, flames, glow];
    all.forEach(o => { o.castShadow = false; o.frustumCulled = false; o.visible = false; T.add(o); });
    const data = { tip: "Lotus lanterns · ဆီမီးပူဇော်", toast: "Little lotus lanterns of pink paper, each holding a flame, set all round the stupa as an offering of light to the Buddha. In October, at the full moon of Thadingyut (သီတင်းကျွတ်), the end of the rains retreat, people light lamps to welcome the Buddha back from teaching his mother in the heaven of the thirty-three; in November, through the full moon of Tazaungdaing (တန်ဆောင်တိုင်), they offer light again. You light one more and set it down: may its light chase away the darkness in your mind." };
    clickable(list, outer, data); clickable(list, inner, data);
    let dl = 1, shown = null; onDaylight(d => dl = d);
    updaters.pagoda.push((dt, t, motion) => {
      const on = FOLK.lotusLanterns;
      if (on !== shown) { shown = on; all.forEach(o => o.visible = on); [outer, inner, flames].forEach(o => o.count = on ? N : 0); }   // count 0: no taps on a hidden lantern
      if (!on) return;
      const fl = motion < 1 ? 1 : .9 + .1 * Math.sin(t * 11) * Math.sin(t * 6.3);
      glow.material.opacity = (.15 + .8 * (1 - dl)) * fl;
      petals.emissiveIntensity = .9 * (1 - dl);   // the flames light the paper from inside after dark
    });
  }
