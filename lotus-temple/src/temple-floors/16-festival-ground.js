  /* ---------- the festival ground (ပွဲခင်း) in front of the monastery, across the stair: a level grass plain held up by a stone retaining
     wall, ringed with Shan flags; a tall prayer-flag pole crowned by a hamsa at its centre, an open teak pavilion stage for Shan dance
     and music, kahtein money trees for the robe-offering, a row of tall bamboo poles for the hot-air balloons, and strings of lanterns ---------- */
  function festivalGround(H) {
    const list = picks.pagoda, f = festivalSpot(), { R, T } = f;   // R: radial depth (local z), T: width along the terrace (local x)
    const G = new THREE.Group(); G.position.set(f.x, f.y, f.z); G.rotation.y = f.ry; H.add(G);
    const data = { tip: "The festival ground · ပွဲခင်း", toast: "On full-moon festivals the monasteries fill this ground: Shan dancers and the long drum on the pavilion stage, kahtein trees hung with offerings for the monks, and fire balloons rising from the poles at night." };
    // the plain: grass on a stone platform whose wall shows on the downhill side
    const grassT = canvasTex(128, (c, sz) => { c.fillStyle = "#6a8a3e"; c.fillRect(0, 0, sz, sz); const r = rng(31); for (let i = 0; i < 600; i++) { c.fillStyle = r() < .5 ? "rgba(50,80,30,.45)" : "rgba(140,170,80,.35)"; c.fillRect(r() * sz, r() * sz, 2, 3); } });
    grassT.wrapS = grassT.wrapT = THREE.RepeatWrapping; grassT.repeat.set(T / 6, R / 6);
    const grass = std({ map: grassT, roughness: 1 }); onDaylight(d => grass.color.copy(lerpC(0x3a4a34, 0xffffff, d)));
    const wallM = std({ color: 0x8c877d, roughness: .85 });
    mesh(new THREE.BoxGeometry(T, 6, R), [wallM, wallM, grass, wallM, wallM, wallM], 0, -3 + .05, 0, G);   // deep enough to reach the slope below its far corner
    clickable(list, G.children[G.children.length - 1], data);
    mesh(new THREE.BoxGeometry(T + .4, .25, .4), M.trim, 0, .1, R / 2, G);   // a gilt coping on the downhill edge
    // Shan flags round the edge: yellow, green and red bands with a white disc
    const flagT = canvasTex(64, (c, sz) => { ["#f2c230", "#2f8a4a", "#c02a2a"].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * sz / 3, sz, sz / 3 + 1); }); c.fillStyle = "#fff"; c.beginPath(); c.arc(sz / 2, sz / 2, sz / 5, 0, TAU); c.fill(); });
    const flagM = std({ map: flagT, roughness: .7, side: THREE.DoubleSide }), poleM = std({ color: 0xc8b088, roughness: .7 });
    const flags = [];
    for (let i = 0; i < 18; i++) {
      const t = i / 18, onLong = i < 12, x = onLong ? -T / 2 + 1 + (i % 6) * (T - 2) / 5 : (i < 15 ? -T / 2 + .6 : T / 2 - .6), z = onLong ? (i < 6 ? -R / 2 + .6 : R / 2 - .6) : -R / 2 + 3 + ((i - 12) % 3) * (R - 6) / 2;
      mesh(new THREE.CylinderGeometry(.04, .05, 4, 6), poleM, x, 2, z, G);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .65, 6, 1), flagM); fl.geometry.translate(.5, 0, 0); fl.position.set(x, 3.6, z); G.add(fl); flags.push(fl);
    }
    // the prayer-flag pole (တံခွန်တိုင်) near the centre, crowned by a golden hamsa, with a long streamer; set a little downhill so
    // there is room to walk between its plinth and the pavilion's steps
    const FZ = 3.0;
    mesh(new THREE.CylinderGeometry(.9, 1.1, .6, 8), std({ color: 0xf2eee4, roughness: .8 }), 0, .3, FZ, G);
    mesh(new THREE.CylinderGeometry(.08, .14, 14, 10), std({ color: 0xc02a2a, roughness: .5 }), 0, 7, FZ, G);
    const hamsa = new THREE.Group(); hamsa.position.set(0, 14.4, FZ); G.add(hamsa);
    mesh(new THREE.SphereGeometry(.35, 12, 8), M.gold, 0, 0, 0, hamsa).scale.set(1, .7, 1.6);
    mesh(new THREE.CylinderGeometry(.06, .1, .7, 8), M.gold, 0, .35, .45, hamsa).rotation.x = -.5;
    mesh(new THREE.ConeGeometry(.12, .3, 8), M.gold, 0, .7, .7, hamsa).rotation.x = Math.PI / 2;
    mesh(new THREE.ConeGeometry(.3, .8, 8), M.gold, 0, .15, -.6, hamsa).rotation.x = -Math.PI / 2 - .4;
    const streamer = new THREE.Mesh(new THREE.PlaneGeometry(.5, 9, 1, 12), std({ color: 0xf2e8c8, roughness: .8, side: THREE.DoubleSide }));
    streamer.geometry.translate(0, -4.5, 0); streamer.position.set(.1, 13.6, FZ); G.add(streamer);
    // the pavilion stage (မဏ္ဍပ်): teak posts, a raised floor, a two-tier gable roof like the monasteries', at the uphill side
    const teak = std({ color: 0x43200f, roughness: .7 }), roofT = corrugated("#6a3a24", "#8e5838", "#40200f"); roofT.repeat.set(6, 1);
    const roofM = std({ map: roofT, roughness: .5, metalness: .35, side: THREE.DoubleSide });
    const PZ = -R / 2 + 4.1, PW = 14, PD = 6.5;   // its centre, width and depth: wide enough for the two to to dance round each other
    sRect(G, -PW / 2, PW / 2, PZ - PD / 2, PZ + PD / 2 + 1.3); sCircle(G, 0, FZ, 1.1); [-8, -4, 4, 8].forEach(x => sCircle(G, x, R / 2 - 3, 1.1));
    mesh(new THREE.BoxGeometry(PW, 1.0, PD), teak, 0, .5, PZ, G);
    for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(2.4, 1 - i * .25, .3), teak, 0, (1 - i * .25) / 2, PZ + PD / 2 + .15 + i * .3, G);
    [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1]].forEach(([a, b]) => mesh(new THREE.CylinderGeometry(.13, .15, 3.6, 8), teak, a * (PW / 2 - .3), 2.8, PZ + b * (PD / 2 - .3), G));
    [[PW + 1.2, 1.6, 4.6], [PW * .6, 1.1, 6.2]].forEach(([w, h, y]) => [-1, 1].forEach(sd => {
      const L = Math.hypot(PD / 2 + .8, h), sl = mesh(new THREE.BoxGeometry(w, .08, L), roofM, 0, y + h / 2, PZ + sd * (PD / 2 + .8) / 2, G); sl.rotation.x = sd * Math.atan2(h, PD / 2 + .8);
    }));
    mesh(new THREE.BoxGeometry(PW * .62, 1.0, PD * .7), teak, 0, 5.9, PZ, G);
    mesh(new THREE.ConeGeometry(.2, 1.4, 6), M.gold, 0, 8.1, PZ, G);
    // kahtein trees (ကထိန်ပဒေသာပင်): bamboo frames hung with folded money, robes and offerings, along the downhill side
    const kah = [0xf2c230, 0xe0702a, 0xd8a840, 0xf4f0e4, 0xc02a2a].map(c => std({ color: c, roughness: .6, side: THREE.DoubleSide }));
    [-8, -4, 4, 8].forEach((x, i) => {
      const z = R / 2 - 3, t = new THREE.Group(); t.position.set(x, 0, z); G.add(t);
      mesh(new THREE.CylinderGeometry(.06, .08, 3.6, 6), poleM, 0, 1.8, 0, t);
      for (let k = 0; k < 5; k++) { const y = 1.4 + k * .45, r = 1.0 - k * .17; for (let j = 0; j < 8; j++) { const a = j / 8 * TAU + k; const leaf = mesh(new THREE.PlaneGeometry(.3, .4), kah[(i + j + k) % kah.length], Math.cos(a) * r, y, Math.sin(a) * r, t); leaf.rotation.y = -a; } }
      mesh(new THREE.BoxGeometry(.7, .35, .5), std({ color: 0xd88a1e, roughness: .6 }), 0, .18, 0, t);   // a folded monk's robe at the foot
    });
    // tall bamboo poles at the far end for launching the fire balloons, and a paper balloon resting by them
    [T / 2 - 4.5, T / 2 - 2].forEach(x => mesh(new THREE.CylinderGeometry(.07, .1, 9, 6), poleM, x, 4.5, -R / 2 + 3, G));
    mesh(new THREE.BoxGeometry(2.6, .08, .08), poleM, T / 2 - 3.25, 8.8, -R / 2 + 3, G);
    const balloon = mesh(new THREE.SphereGeometry(1.4, 16, 12), std({ color: 0xe8a040, roughness: .8, emissive: 0xff8a30, emissiveIntensity: 0 }), T / 2 - 3.25, 6.6, -R / 2 + 3, G);
    balloon.scale.y = 1.4;
    // strings of lanterns from the central pole to the corners, lit at night
    const lamps = [];
    [[-T / 2 + 1, -R / 2 + 1], [T / 2 - 1, -R / 2 + 1], [-T / 2 + 1, R / 2 - 1], [T / 2 - 1, R / 2 - 1]].forEach(([x, z]) => {
      for (let i = 1; i < 12; i++) { const t = i / 12, b = glowSprite([0xffd060, 0xff7040, 0x80d0ff][i % 3], .9, .8); b.material.fog = false; b.position.set(x * t, 11 - 7.5 * t - Math.sin(Math.PI * t) * 1.2, FZ + (z - FZ) * t); G.add(b); lamps.push(b); }
    });
    onDaylight(d => { lamps.forEach(b => b.material.opacity = .85 * (1 - d) + .08); balloon.material.emissiveIntensity = .7 * (1 - d); });
    const dancers = kinnaraDancers(G, list, 0, PZ), to = toDancers(G, list, 0, PZ), to2 = toDancers(G, list, 0, PZ, true);   // on the stage's centre
    G.updateMatrixWorld(true); { const w = G.localToWorld(new THREE.Vector3(0, 0, PZ)); STAGE[0] = w.x; STAGE[1] = w.z; }
    const audience = festivalAudience(G, list, 0, PZ, [[0, FZ, 1.9], ...[-8, -4, 4, 8].map(x => [x, R / 2 - 3, 1.5])]);   // kept off the flag pole and the kahtein trees
    updaters.pagoda.push((dt, t, motion) => {
      const bar = dancers(dt, motion); to(dt, motion, bar); to2(dt, motion, bar); audience(dt, motion);
      flags.forEach((fl, i) => { const p = fl.geometry.attributes.position; for (let j = 0; j < p.count; j++) { const x = p.getX(j); p.setZ(j, Math.sin(x * 4 - t * 3 + i) * .08 * x * motion); } p.needsUpdate = true; });
      streamer.rotation.y = Math.sin(t * .6) * .4 * motion; streamer.rotation.z = Math.sin(t * .9) * .06 * motion;
    });
    G.traverse(o => { if (o.isMesh && !o.userData.tip) clickable(list, o, data); });
    // keep the outside camera above the ground and its pavilion
    G.updateMatrixWorld(true);
    const xs = [], zs = [];
    [[-T / 2, -R / 2], [T / 2, -R / 2], [-T / 2, R / 2], [T / 2, R / 2]].forEach(([lx, lz]) => { const w = G.localToWorld(V(lx, 0, lz)); xs.push(w.x); zs.push(w.z); });
    TALL.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), h: f.y + 9 });
    sRect(G, -T / 2, T / 2, -R / 2, R / 2, .05);   // a walker stays on the grass where it runs out over the slope (after the pavilion and plinths, which block)
  }
