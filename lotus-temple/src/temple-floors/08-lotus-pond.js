  /* ---------- 蓮池 the lotus pond, outside in front of the pagoda ---------- */
  // a square pool centred on (cx, cz), S from the centre to each side, with stone coping; the arched bridge runs along z
  /* ---------- at the lotus pond: tossing a coin for a wish, and bathing the Buddha with pond water (symbolic only, no money) ---------- */
  const COIN_KEY = "lotus-altar-coins";
  let pondCoinThrow = null, pondBathe = null;
  function pondRituals(g, water, cx, cz, S, WY) {
    const list = picks.pagoda, upd = updaters.pagoda;
    // the water takes coins: a tap on it throws one to that spot
    clickable(list, water, { coinPond: true, tip: "Toss a coin into the lotus pond and make a wish" });
    const coinGeo = new THREE.CylinderGeometry(.15, .15, .025, 18), coinMat = std({ color: 0xf0c050, metalness: .7, roughness: .25, emissive: 0x6a4a10 });   // a little larger than life so they show through the water
    const MAXC = 300, bedCoins = new THREE.InstancedMesh(coinGeo, coinMat, MAXC), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    bedCoins.count = 0; g.add(bedCoins);
    let saved = 0; try { saved = Math.min(MAXC, parseInt(localStorage.getItem(COIN_KEY), 10) || 0); } catch (err) {}
    const rr = rng(808);
    const lay = (x, z) => {   // a coin settled on the pond bed
      if (bedCoins.count >= MAXC) return;
      bedCoins.setMatrixAt(bedCoins.count++, m4.compose(V(x, .045, z), q.setFromEuler(e.set((rr() - .5) * .3, rr() * TAU, (rr() - .5) * .3)), V(1, 1, 1)));
      bedCoins.instanceMatrix.needsUpdate = true;
    };
    for (let i = 0; i < saved; i++) lay(cx + (rr() * 2 - 1) * (S - 1), cz + (rr() * 2 - 1) * (S - 1));   // coins left on earlier visits
    const flying = [], rings = [];
    const ringGeo = new THREE.RingGeometry(.85, 1, 40);
    pondCoinThrow = p => {
      const to = V(clamp(p.x, cx - S + .5, cx + S - .5), WY, clamp(p.z, cz - S + .5, cz + S - .5));
      const from = to.clone().add(V(0, 3.2, 4.5));   // as if thrown from the bank nearest the viewer
      const coin = mesh(coinGeo, coinMat, from.x, from.y, from.z, g);
      flying.push({ coin, from, to, t: 0 });
      let n = 0; try { n = (parseInt(localStorage.getItem(COIN_KEY), 10) || 0) + 1; localStorage.setItem(COIN_KEY, String(n)); } catch (err) { n = bedCoins.count + 1; }
      return n;
    };
    upd.push(dt => {
      for (let i = flying.length - 1; i >= 0; i--) {
        const f = flying[i]; f.t += dt / .75;
        const k = Math.min(1, f.t);
        f.coin.position.lerpVectors(f.from, f.to, k); f.coin.position.y += Math.sin(Math.PI * k) * 2.2;
        f.coin.rotation.x += dt * 22; f.coin.rotation.z += dt * 9;
        if (k >= 1) {   // splash: rings spread on the water, the coin sinks to the bed
          g.remove(f.coin); flying.splice(i, 1);
          tone(1400, 700, .12, .18, "sine"); tone(380, 160, .2, .25, "triangle", .02);
          for (let j = 0; j < 3; j++) {
            const ring = flat(mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xe8f4f8, transparent: true, opacity: .8, depthWrite: false, side: THREE.DoubleSide }), f.to.x, WY + .03, f.to.z, g));
            ring.rotation.x = -Math.PI / 2; rings.push({ ring, t: -j * .25 });
          }
          const sp = glowSprite(0xe8f8ff, 1.0, .9); sp.position.copy(f.to).add(V(0, .2, 0)); g.add(sp); rings.push({ ring: sp, t: 0, sprite: true });
          lay(f.to.x, f.to.z);
        }
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.t += dt;
        if (r.t < 0) continue;
        const k = r.t / (r.sprite ? .5 : 1.6);
        if (r.sprite) { r.ring.material.opacity = .9 * (1 - k); r.ring.scale.setScalar(1 + k); }
        else { r.ring.scale.setScalar(.15 + k * 1.6); r.ring.material.opacity = .8 * (1 - k); }
        if (k >= 1) { g.remove(r.ring); rings.splice(i, 1); }
      }
    });
    // the bathing basin on the pond's east edge: a small golden Buddha on a lotus pedestal in a stone basin, a ladle hanging ready
    const B = new THREE.Group(); B.position.set(cx + S + 2.2, 0, cz - 7); B.rotation.y = -Math.PI / 2; g.add(B);
    sRect(B, -1.3, 1.3, -1.3, 1.3);
    const stone = std({ color: 0x8c877d, roughness: .85 }), waterM = std({ color: 0x3a8a9a, metalness: .2, roughness: .1, transparent: true, opacity: .75 });
    const bdata = { bathe: true, tip: "Bathe the Buddha · pour pond water over the image" };
    mesh(new THREE.BoxGeometry(2.6, .3, 2.6), stone, 0, .15, 0, B);
    const basin = lathe([[0, 0], [1.0, 0], [1.1, .15], [1.15, .7], [1.05, .7], [.95, .25], [0, .25]], stone, 32); basin.position.y = .3; B.add(basin);
    mesh(new THREE.CylinderGeometry(.98, .98, .05, 32), waterM, 0, .85, 0, B);
    const ped = lathe([[0, 0], [.35, 0], [.3, .3], [.45, .45], [.5, .55], [0, .55]], M.gold, 24); ped.position.y = .55; B.add(ped);
    const buddha = new THREE.Group(); buddha.position.y = 1.1; B.add(buddha);   // the infant Buddha, one hand raised to the sky
    mesh(new THREE.CylinderGeometry(.13, .2, .55, 14), M.gold, 0, .27, 0, buddha);
    mesh(new THREE.SphereGeometry(.13, 16, 12), M.gold, 0, .66, 0, buddha);
    mesh(new THREE.SphereGeometry(.06, 10, 8), M.gold, 0, .8, 0, buddha);
    const arm = mesh(new THREE.CylinderGeometry(.03, .035, .42, 8), M.gold, .12, .72, 0, buddha); arm.rotation.z = -.15;
    const arm2 = mesh(new THREE.CylinderGeometry(.03, .035, .32, 8), M.gold, -.13, .32, .05, buddha); arm2.rotation.z = .5;
    const halo = glowSprite(0xffe0a0, 1.2, .35); halo.position.y = .7; buddha.add(halo);
    // a little roof of the pagoda's tiles keeps the rain off
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(new THREE.CylinderGeometry(.06, .07, 2.6, 8), pillarRed, a * 1.15, 1.6, b * 1.15, B));
    tiledHipRoof(B, 0, 0, 2.9, 1.75, 1.75, .9, .25, [0, .2, .4, .6, .8, .93], .5, false);
    // the ladle on its hook, which lifts, tips over the Buddha and comes back
    const ladle = new THREE.Group(); ladle.position.set(.9, 1.4, .6); B.add(ladle);
    mesh(new THREE.CylinderGeometry(.02, .02, .9, 6), M.wood, 0, .3, 0, ladle).rotation.z = .3;
    const cup = mesh(new THREE.CylinderGeometry(.13, .09, .14, 14, 1, true), std({ color: 0xc8a070, roughness: .6, side: THREE.DoubleSide }), -.14, -.12, 0, ladle);
    clickable(list, basin, bdata); clickable(list, ladle.children[0], bdata); buddha.children.forEach(o => o.isMesh && clickable(list, o, bdata));
    const drops = [];
    const dropTex = glowTex;
    let busy = false;
    pondBathe = () => {
      if (busy) return false;
      busy = true;
      const home = ladle.position.clone(), over = V(.2, 2.15, .15);
      tween(.6, t => { const e2 = t * t * (3 - 2 * t); ladle.position.lerpVectors(home, over, e2); ladle.rotation.z = -1.4 * e2; }, () => {
        let n = 0;
        const pour = setInterval(() => {   // a stream of drops from the ladle over the Buddha's head
          for (let k = 0; k < 4; k++) {
            const d = new THREE.Sprite(new THREE.SpriteMaterial({ map: dropTex, color: 0xbfe8f4, transparent: true, depthWrite: false }));
            d.scale.setScalar(.08); d.position.set(.05 + (Math.random() - .5) * .08, 2.05, .15 + (Math.random() - .5) * .08); B.add(d);
            drops.push({ d, v: V((Math.random() - .5) * .4, 0, (Math.random() - .5) * .4) });
          }
          tone(900 + Math.random() * 500, null, .015, .06, "sine");
          if (++n > 22) {
            clearInterval(pour);
            tween(.6, t => { const e2 = t * t * (3 - 2 * t); ladle.position.lerpVectors(over, home, e2); ladle.rotation.z = -1.4 * (1 - e2); }, () => { busy = false; });
          }
        }, 60);
      });
      return true;
    };
    upd.push(dt => {
      for (let i = drops.length - 1; i >= 0; i--) {
        const p = drops[i]; p.v.y -= 9.8 * dt; p.d.position.addScaledVector(p.v, dt);
        if (p.d.position.y < 1.85 && Math.abs(p.d.position.x) < .3) p.v.x += (p.d.position.x > 0 ? 1 : -1) * dt * 4;   // running off the shoulders
        if (p.d.position.y < .86) { B.remove(p.d); drops.splice(i, 1); }
      }
    });
  }
  function outdoorPond(g, cx, cz, S) {
    const WY = .38, upd = updaters.pagoda, inside = S - .9;   // lotus and fish stay inside `inside`
    [[0, S + .3, 2 * S + 1.2, .6], [0, -S - .3, 2 * S + 1.2, .6], [S + .3, 0, .6, 2 * S], [-S - .3, 0, .6, 2 * S]].forEach(([x, z, w, d]) => {
      mesh(new THREE.BoxGeometry(w, .55, d), M.stone, cx + x, .275, cz + z, g);
      mesh(new THREE.BoxGeometry(w + .08, .08, d + .08), std({ color: 0x5a463a, roughness: .8 }), cx + x, .59, cz + z, g);
    });
    const bed = flat(mesh(new THREE.PlaneGeometry(2 * S, 2 * S), std({ color: 0x14302a, roughness: 1 }), cx, .02, cz, g)); bed.rotation.x = -Math.PI / 2;
    const waterGeo = new THREE.PlaneGeometry(2 * S, 2 * S, 72, 72);
    const water = flat(mesh(waterGeo, std({ color: 0x1d5560, metalness: .2, roughness: .08, transparent: true, opacity: .55, depthWrite: false }), cx, WY, cz, g)); water.rotation.x = -Math.PI / 2;
    const wp = waterGeo.attributes.position, base = Float32Array.from(wp.array);
    const rnd = rng(11);
    const spot = () => { let x, z; do { x = (rnd() * 2 - 1) * inside; z = (rnd() * 2 - 1) * inside; } while (Math.abs(x) < 1.9); return [x, z]; };
    const pad = new THREE.InstancedMesh(new THREE.CircleGeometry(.32, 24, .25, TAU - .5), std({ color: 0x3f7a2a, roughness: .6, side: THREE.DoubleSide }), 160);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V(1, 1, 1), spots = [];
    for (let i = 0; i < 160; i++) {
      const [x, z] = spot();
      q.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, rnd() * TAU)); sc.setScalar((.7 + rnd() * .9) * 1.5);
      m4.compose(V(cx + x, WY + .015, cz + z), q, sc); pad.setMatrixAt(i, m4); spots.push([x, z]);
    }
    g.add(pad);
    spots.slice(0, 48).forEach(([x, z], i) => {
      const f = makeLotus(); f.userData.bloom(i % 4 === 3 ? .25 : 1); f.scale.setScalar((2.6 + rnd()) * 1.5); f.position.set(cx + x, WY + .06, cz + z); g.add(f);
    });
    // floating lotus lamps on slow loops that stay inside the pool and off the bridge
    const drift = [];
    for (let i = 0; i < 12; i++) {
      const lot = makeLotus(); lot.userData.bloom(1); lot.scale.setScalar(2.8); g.add(lot);
      const fl = makeFlame(V(0, 0, 0), 1.2, null, g);
      lot.userData.noCull = fl.flame.userData.noCull = fl.g.userData.noCull = true;   // drifting: never culled
      drift.push({ lot, fl, a: i / 12 * TAU, r: 3 + (i % 4) * 1.8, s: .04 + rnd() * .03 });
    }
    // koi just under the surface, each wandering on its own and turning back before the coping
    const koiMats = [0xff6a10, 0xfaf6ee, 0xe0281a, 0xffb020].map(c => std({ color: c, roughness: .35, emissive: c, emissiveIntensity: .35 }));
    const koi = [];
    for (let i = 0; i < 34; i++) {
      const f = new THREE.Group(); f.scale.setScalar(2.4); f.userData.noCull = true; g.add(f);   // swimming about: never culled
      const body = new THREE.Mesh(petalGeo, koiMats[i % 4]); body.scale.set(.05, .04, .16); f.add(body);
      const head = new THREE.Mesh(petalGeo, koiMats[i % 4 === 1 ? 2 : (i + 2) % 4]); head.scale.set(.04, .035, .07); head.position.z = .08; f.add(head);
      const tail = new THREE.Group(); tail.position.z = -.15; f.add(tail);
      const fin = new THREE.Mesh(petalGeo, koiMats[(i + 1) % 4]); fin.scale.set(.07, .012, .07); fin.position.z = -.05; tail.add(fin);
      koi.push({ k: f, tail, x: (rnd() * 2 - 1) * inside, z: (rnd() * 2 - 1) * inside, h: rnd() * TAU, turn: 0, s: .35 + rnd() * .3, ph: rnd() * 10, y: WY - .05 - rnd() * .06 });
    }
    // red arched bridge carrying the path across the pond
    const L = 2 * S + 1.6, H = 1.3, W = 2.6, z0 = cz - L / 2;
    WALKABLE.pond = { cx, cz, S, bridge: { z0, L, H, W } };
    // stone steps up onto each end of the bridge, so the deck does not start in mid-air
    const BS = 4, bsRise = .65 / BS, bsRun = .42;
    [[z0, -1], [z0 + L, 1]].forEach(([ze, dir]) => {
      for (let i = 0; i < BS; i++) { const h = .65 - i * bsRise; mesh(new THREE.BoxGeometry(W, h, bsRun), M.stone, cx, h / 2, ze + dir * (i * bsRun + bsRun / 2), g); }
    });
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, z = z0 + t * L, y = .6 + Math.sin(Math.PI * t) * H;
      const plank = mesh(new THREE.BoxGeometry(W, .1, L / 24 + .06), M.wood, cx, y, z, g);
      plank.rotation.x = -Math.atan(H * Math.PI * Math.cos(Math.PI * t) / L);
      if (i % 2 === 0) [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(.05, .05, .8, 8), M.lacquer, cx + s * (W / 2 - .05), y + .4, z, g));
    }
    [-1, 1].forEach(s => {
      const pts = []; for (let i = 0; i <= 32; i++) { const t = i / 32; pts.push(V(cx + s * (W / 2 - .05), .6 + .8 + Math.sin(Math.PI * t) * H, z0 + t * L)); }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, .06, 8), M.lacquer, 0, 0, 0, g);
    });
    pondRituals(g, water, cx, cz, S, WY);
    upd.push((dt, t, motion) => {
      for (let i = 0; i < wp.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1];
        wp.array[i * 3 + 2] = (Math.sin(Math.hypot(x, y) * 3.5 - t * 1.6) * .02 + Math.sin(x * 2 + t) * .01) * motion;
      }
      wp.needsUpdate = true; waterGeo.computeVertexNormals();
      koi.forEach(f => {
        const m = dt * motion;
        f.turn += (Math.sin(t * .7 + f.ph) * .9 - f.turn) * m;                         // a lazy meander
        if (Math.abs(f.x) > inside || Math.abs(f.z) > inside) {                         // near the edge: turn toward the middle
          const back = Math.atan2(-f.x, -f.z), diff = Math.atan2(Math.sin(back - f.h), Math.cos(back - f.h));
          f.turn = clamp(diff * 2, -2, 2);
        }
        f.h += f.turn * m;
        f.x += Math.sin(f.h) * f.s * m; f.z += Math.cos(f.h) * f.s * m;
        f.k.position.set(cx + f.x, f.y + Math.sin(t * 2 + f.ph) * .01, cz + f.z); f.k.rotation.y = f.h;
        f.tail.rotation.y = Math.sin(t * (6 + f.s * 6) + f.ph) * .5 * motion;
      });
      drift.forEach(d => {
        d.a += d.s * dt * motion;
        const x = Math.cos(d.a) * d.r, z = Math.sin(d.a) * d.r;
        const p = V(cx + (Math.abs(x) < 1.9 ? Math.sign(x || 1) * 1.9 : x), WY + .04 + Math.sin(t * 1.3 + d.r) * .01, cz + z);
        d.lot.position.copy(p); d.fl.flame.position.set(p.x, p.y + .14, p.z); d.fl.g.position.copy(d.fl.flame.position);
      });
    });
  }

