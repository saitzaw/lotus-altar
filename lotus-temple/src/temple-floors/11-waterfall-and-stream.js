  /* ---------- ရေတံခွန်, the waterfall where the stream rises: a ribbon of white water falls off the lip of a mossy rock cliff
     west of the fields into a round plunge pool ringed with boulders, spray hanging over it; the stream runs east out of the pool ---------- */
  const FALLS = { x: -115.5, z: riverZ(-110), R: 5.4, H: 11, W: 2.6, D: 22, T: 9 };   // pool centre and radius; the drop, the falls' width; the cliff's length and thickness
  function waterfall(g) {
    const { x: px, z: pz, R, H, W, D, T } = FALLS, lipX = px - R + 1, r = rng(77);
    const data = { tip: "The waterfall · ရေတံခွန်", toast: "The stream that winds behind the temple rises here, falling off the hillside into a deep pool. In the hot season people from town come to sit on the rocks in the spray; in the rains it roars brown and full." };
    // the cliff: a block of rock whose top falls away toward both ends, pushed in and out by a fixed noise (shared corners stay
    // shut), with a shallow notch worn where the water goes over
    const rock = std({ color: 0x6e6658, roughness: .95, flatShading: true }), moss = std({ color: 0x4a6232, roughness: 1, flatShading: true });
    onDaylight(d => { rock.color.copy(lerpC(0x2a2824, 0x7a7262, d)); moss.color.copy(lerpC(0x1a2414, 0x52703a, d)); });
    const nz = (a, b, c) => Math.sin(a * 1.7 + c * .9) * Math.sin(c * 1.3 - b * 1.1) + .5 * Math.sin(a * 3.1 + b * 2.3 + c * 2.9);
    const cliffGeo = new THREE.BoxGeometry(T, 1, D, 6, 8, 16); cliffGeo.translate(-T / 2, .5, 0);
    const cp = cliffGeo.attributes.position;
    for (let i = 0; i < cp.count; i++) {
      const x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i), e = Math.abs(z) / (D / 2), ch = Math.exp(-z * z / 6);
      const top = (H + 1.2) * (1 - Math.pow(e, 2.2)) * (1 - .25 * (-x / T)) + .3 - 1.3 * ch, notch = x > -.01 ? 1.4 * ch : 0, n = nz(x, y * top, z);
      cp.setXYZ(i, x + n * .7 * (1 - e * .5) - notch, y * top + (y > .99 ? n * .5 : 0), z + n * .6);
    }
    cliffGeo.computeVertexNormals();
    const cliff = flat(mesh(cliffGeo, rock, lipX - .2, -.4, pz, g)); cliff.receiveShadow = true;
    sRect(g, lipX - T - .5, lipX, pz - D / 2, pz + D / 2);
    TALL.push({ x0: lipX - T - 1, x1: lipX + 1, z0: pz - D / 2, z1: pz + D / 2, h: H + 3 });
    // boulders: a ring round the pool (open to the east, where the stream runs out), heaped at the cliff's foot, and moss on top
    const bGeo = new THREE.DodecahedronGeometry(1, 0), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    const stones = new THREE.InstancedMesh(bGeo, rock, 60), mossy = new THREE.InstancedMesh(bGeo, moss, 24);
    let k = 0, j = 0;
    const put = (im, n, x, y, z, s, sy = .65) => { im.setMatrixAt(n, m4.compose(V(x, y, z), q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), V(s, s * sy, s))); };
    for (let a = .5; a < TAU - .5; a += .26 + r() * .12) {
      const rr = R + .2 + r() * .5, s = .5 + r() * .7, x = px + Math.cos(a) * rr, z = pz + Math.sin(a) * rr;
      put(stones, k++, x, .15, z, s); sCircle(g, x, z, s * .8);
    }
    for (let i = 0; i < 12; i++) {
      const sd = i % 2 ? 1 : -1, z = pz + sd * (W / 2 + .9 + r() * 5), s = 1 + r() * 1.4;
      put(stones, k++, lipX + .3 + r() * 1.4, s * .3, z, s);
    }
    for (let i = 0; i < 24; i++) {   // moss and ferny clumps along the cliff's top and ledges
      const z = pz + (r() - .5) * D * .8, e = Math.abs(z - pz) / (D / 2), x = lipX - .6 - r() * T * .7, s = .6 + r() * .9;
      if (Math.abs(z - pz) < 2.2) continue;   // not in the water's channel
      put(mossy, j++, x, (H + 1.2) * (1 - Math.pow(e, 2.2)) * (1 - .25 * (lipX - x) / T) - .2, z, s, .35);
    }
    // a few pines on the cliff's back, so it reads as a shoulder of the hill behind
    const tGeo = new THREE.ConeGeometry(1, 1, 7); tGeo.translate(0, .5, 0);
    const pines = new THREE.InstancedMesh(tGeo, moss, 10); let t = 0;
    for (let i = 0; i < 10; i++) {
      const z = pz + (r() < .5 ? -1 : 1) * (2.5 + r() * D * .3), e = Math.abs(z - pz) / (D / 2), x = lipX - 3 - r() * (T - 4), s = 2.5 + r() * 2;
      pines.setMatrixAt(t++, m4.compose(V(x, (H + 1.2) * (1 - Math.pow(e, 2.2)) * (1 - .25 * (lipX - x) / T) - .6, z), q.identity(), V(s * .45, s, s * .45)));
    }
    stones.count = k; mossy.count = j; [stones, mossy, pines].forEach(im => { im.castShadow = false; g.add(im); });
    // the pool: grassy bank, dark bed, the water, and churned white foam where the falls come down
    const grass = std({ color: 0x3e5a2c, roughness: 1 });
    onDaylight(d => grass.color.copy(lerpC(0x1e2a16, 0x4a6a32, d)));
    const disc = (rad, y, mat) => { const m = flat(mesh(new THREE.CircleGeometry(rad, 36), mat, px, y, pz, g)); m.rotation.x = -Math.PI / 2; return m; };
    disc(R + 2.6, .021, grass); disc(R + .3, .031, std({ color: 0x5a5046, roughness: .95 })); disc(R, .036, std({ color: 0x10282a, roughness: 1 }));
    sCircle(g, px, pz, R);
    disc(R, .09, std({ color: 0x3f7d88, metalness: .2, roughness: .1, transparent: true, opacity: .85, depthWrite: false }));
    const foamTex = canvasTex(128, (c, sz) => {
      for (let i = 0; i < 70; i++) { const a = r() * TAU, d = Math.sqrt(r()) * sz * .42; c.fillStyle = `rgba(255,255,255,${.15 + r() * .35})`; c.beginPath(); c.arc(sz / 2 + Math.cos(a) * d, sz / 2 + Math.sin(a) * d, 3 + r() * 9, 0, TAU); c.fill(); }
    });
    const foamMat = std({ map: foamTex, color: 0xffffff, roughness: .6, transparent: true, opacity: .8, depthWrite: false });
    const foam = flat(mesh(new THREE.CircleGeometry(2.4, 24), foamMat, lipX + 1.6, .11, pz, g)); foam.rotation.x = -Math.PI / 2;
    // the falling water: two sheets, each bowed out from the lip as water leaves an edge, widening a little as it falls, with
    // long streaks drawn down them; the front sheet is thinner and falls faster
    const fallTex = canvasTex(128, (c, sz) => {
      c.fillStyle = "rgba(214,236,240,.55)"; c.fillRect(0, 0, sz, sz);
      for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,255,255,${.2 + r() * .6})`; c.fillRect(r() * sz, r() * sz, 1 + r() * 3, 12 + r() * 40); }
    });
    fallTex.wrapS = fallTex.wrapT = THREE.RepeatWrapping;
    const sheet = (out, half, speed, opacity) => {
      const N = 12, pos = [], uv = [], idx = [];
      for (let i = 0; i <= N; i++) {
        const s = i / N, x = lipX + .15 + out * Math.sqrt(s), y = H - .2 - s * (H - .1), w = half * (1 + .35 * s);
        pos.push(x, y, pz - w, x, y, pz + w); uv.push(0, s * H / 4, 1, s * H / 4);
        if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx); geo.computeVertexNormals();
      const tex = fallTex.clone(); tex.needsUpdate = true; tex.repeat.set(1 + half * .4, 1);
      const mat = std({ map: tex, color: 0xeef8fa, emissive: 0x6a8a90, emissiveIntensity: .25, roughness: .3, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
      onDaylight(d => { mat.color.copy(lerpC(0x5a6a74, 0xeef8fa, d)); mat.emissiveIntensity = .05 + .2 * d; });
      clickable(picks.pagoda, flat(mesh(geo, mat, 0, 0, 0, g)), data);
      return { tex, speed };
    };
    const sheets = [sheet(1.3, W / 2, .9, .85), sheet(1.6, W / 2 * .8, 1.4, .55)];
    // spray: soft white puffs rising off the foam and fading, each on its own loop
    const mistTex = canvasTex(64, (c, sz) => {
      const gr = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
      gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz);
    });
    const puffs = [];
    for (let i = 0; i < 10; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTex, color: 0xf4fafc, transparent: true, opacity: 0, depthWrite: false }));
      g.add(s); puffs.push({ s, ph: i / 10, dx: (r() - .3) * 2.4, dz: (r() - .5) * W * 1.6 });
    }
    onDaylight(d => puffs.forEach(p => p.s.material.color.copy(lerpC(0x4a5560, 0xf4fafc, d))));
    let mt = 0; foamTex.center.set(.5, .5);
    updaters.pagoda.push((dt, t, motion) => {
      sheets.forEach(sh => { sh.tex.offset.y -= dt * sh.speed * (motion || .25); });
      foamTex.rotation += dt * .3 * motion;
      mt += dt * .18 * (motion || .15);
      puffs.forEach(p => {
        const u = (mt + p.ph) % 1, sc = 1.6 + u * 3.2;
        p.s.position.set(lipX + 1.6 + p.dx * (.5 + u), .4 + u * 3.5, pz + p.dz); p.s.scale.set(sc, sc, 1);
        p.s.material.opacity = .32 * Math.sin(Math.PI * u);
      });
    });
  }
  // rice paddies beyond the stream: plots edged with earth bunds, most golden at harvest, some still green,
  // a few flooded and newly planted; a farm track from the temple's arched bridge, and a bamboo field hut
  function paddyFields(g) {
    const r = rng(123), rice = (base, line) => {
      const t = canvasTex(64, (c, sz) => { c.fillStyle = base; c.fillRect(0, 0, sz, sz); c.fillStyle = line; for (let x = 0; x < sz; x += 8) c.fillRect(x, 0, 3, sz); });
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return std({ map: t, roughness: 1 });
    };
    const KINDS = [rice("#c8a23a", "#a8842a"), rice("#d4b048", "#b4902e"), rice("#6a9a3a", "#4e7e2a"), std({ color: 0x4a6a6e, roughness: .15, metalness: .3 })];
    const bund = std({ color: 0x7a6448, roughness: 1 });
    const PW = 11, PD = 8, X0 = -104, X1 = 64, Z0 = -42, Z1 = -94;
    const plotGeo = new THREE.PlaneGeometry(PW, PD), riceGeo = new THREE.BoxGeometry(PW - .3, .35, PD - .3);
    const bundGeoX = new THREE.BoxGeometry(PW + .6, .3, .5), bundGeoZ = new THREE.BoxGeometry(.5, .3, PD);
    for (let x = X0; x + PW <= X1; x += PW + .6) for (let z = Z0; z - PD >= Z1; z -= PD + .6) {
      const cx = x + PW / 2, cz = z - PD / 2;
      if (Math.abs(cx - TOWN.roadX) < PW / 2 + 4.5) continue;            // the road
      if (Math.abs(cx) < PW / 2 + 1.6) continue;                         // the farm track
      if (cz + PD / 2 > riverZ(cx) - 5) continue;                       // stay off the stream bank
      if (cx + PW / 2 > -40 && cx - PW / 2 < -12 && cz + PD / 2 > -67 && cz - PD / 2 < -42) continue;   // the fuel station
      const k = r() < .55 ? (r() < .5 ? 0 : 1) : r() < .7 ? 2 : 3;
      flat(part(plotGeo, KINDS[k], cx, .05, cz, g)).rotation.x = -Math.PI / 2;
      if (k < 3) {   // standing rice: a low layer of stalks above the mud
        flat(part(riceGeo, KINDS[k], cx, .22, cz, g));
      }
      [[0, PD / 2, bundGeoX], [0, -PD / 2, bundGeoX], [PW / 2, 0, bundGeoZ], [-PW / 2, 0, bundGeoZ]].forEach(([dx, dz, geo]) => flat(part(geo, bund, cx + dx, .15, cz + dz, g)));
    }
    // the farm track south from the arched bridge
    flat(mesh(new THREE.BoxGeometry(2.4, .04, -36 - Z1), std({ color: 0x8a7a5e, roughness: 1 }), 0, .03, (-36 + Z1) / 2, g));
    // a raised bamboo field hut with a thatched roof, where farmers rest at midday, beside the farm track
    const hut = new THREE.Group(); hut.position.set(6, 0, -62); g.add(hut);
    sRect(hut, -1.3, 1.3, -1.1, 1.1);
    const bamboo = std({ color: 0xb8a060, roughness: .8 }), thatch = std({ color: 0x9a8050, roughness: 1, flatShading: true });
    [[-1.2, -1], [1.2, -1], [-1.2, 1], [1.2, 1]].forEach(([x, z]) => mesh(new THREE.CylinderGeometry(.08, .1, 2.6, 6), bamboo, x, 1.3, z, hut));
    mesh(new THREE.BoxGeometry(2.8, .12, 2.4), bamboo, 0, .9, 0, hut);
    const roof = mesh(new THREE.ConeGeometry(2.6, 1.3, 4), thatch, 0, 3.1, 0, hut); roof.rotation.y = Math.PI / 4; roof.scale.set(1.15, 1, 1);
    for (let i = 0; i < 6; i++) mesh(new THREE.BoxGeometry(.5, .12, .14), bamboo, 0, .25 + i * .13, 1.3 + i * .05, hut);   // a ladder
    // a few palms and a bamboo clump at the field edges
    const palm = (x, z) => {
      const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
      sCircle(t, 0, 0, .2);
      const trunk = mesh(new THREE.CylinderGeometry(.1, .16, 5, 7), std({ color: 0x7a6650, roughness: .9 }), 0, 2.5, 0, t); trunk.rotation.z = .08;
      for (let i = 0; i < 7; i++) { const f = mesh(new THREE.ConeGeometry(.35, 2.4, 3), leafMats[i % 4], 0, 4.9, 0, t); f.rotation.set(1.1, i / 7 * TAU, 0); f.translateY(1.1); f.scale.set(1, 1, .2); }
    };
    [[-60, -40], [-28, -42], [20, -41], [46, -44], [-80, -70], [30, -88]].forEach(([x, z]) => palm(x, z));
  }
