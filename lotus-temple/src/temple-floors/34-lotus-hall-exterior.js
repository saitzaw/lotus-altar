    // 蓮華寺, the temple hall on the right, in the Lingnan style: grey-blue brick under a tiled gable roof with a decorated ridge,
    // a porch of stone columns, the name plaque over red doors, and a granite forecourt with notice kiosks and bonsai.
    // It faces the pond (local +z points to world -x) and runs from beside the pagoda almost to the front wall.
    function templeHall(o) {
      const b = new THREE.Group(); b.position.set(o.x, 0, o.z); b.rotation.y = -Math.PI / 2; g.add(b);
      const pl = PLACES[o.place], data = { floor: o.place, tip: `Go into the ${pl.name}` };
      const W = o.w, D = o.d, base = .5, EY = base + 5.7, H = 2.8, run = D / 2 + .8, FZ = D / 2 - 1.8;
      sRect(b, -W / 2, W / 2, -D / 2, FZ);                                                        // the hall itself (tap its door to go in)
      [-7.9, -3.9, 3.9, 7.9].forEach(x => sCircle(b, x, D / 2 - .4, .3));                         // the porch columns
      sCircle(b, 0, D / 2 + 4.6, 2.0);                                                           // the great censer
      [-1, 1].forEach(sx => { sRect(b, sx * (W / 2 - 1.8) - .7, sx * (W / 2 - 1.8) + .7, D / 2 + 3.0, D / 2 + 3.4); sCircle(b, sx * 3.4, D / 2 + 1.9, .5); });   // kiosks, bonsai
      sRect(b, -2.6, 2.6, D / 2 + .5, D / 2 + 1.85, (lx, lz) => base * (1 - (lz - D / 2 - .5) / 1.35));   // the front steps
      sRect(b, -W / 2 - .5, W / 2 + .5, -D / 2 - .5, D / 2 + .5, base);                             // the platform and porch
      const brickTex = canvasTex(256, (c, sz) => {
        c.fillStyle = "#4d5560"; c.fillRect(0, 0, sz, sz);
        for (let r = 0; r < 16; r++) for (let k = -1; k < 8; k++) {
          const x = k * 32 + (r % 2) * 16, y = r * 16, sh = 70 + ((r * 7 + k * 13) % 5) * 6;
          c.fillStyle = `rgb(${sh},${sh + 8},${sh + 18})`; c.fillRect(x + 1, y + 1, 30, 14);
        }
      });
      brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
      const brick = repX => { const t = brickTex.clone(); t.needsUpdate = true; t.repeat.set(repX, 1.5); return std({ map: t, roughness: .85 }); };
      const granite = std({ color: 0x8c877d, roughness: .8 }), darkWood = std({ color: 0x3a1a10, roughness: .6 }), plaster = std({ color: 0xe8e2d4, roughness: .8 });
      // platform, steps and the forecourt of granite slabs
      mesh(new THREE.BoxGeometry(W + 1, base, D + 1), granite, 0, base / 2, 0, b);
      for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(5.2 + (2 - i) * .4, base - i * base / 3, .45), granite, 0, (base - i * base / 3) / 2, D / 2 + .7 + i * .45, b);
      const slab = canvasTex(256, (c, sz) => {
        c.fillStyle = "#7d786f"; c.fillRect(0, 0, sz, sz);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const sh = 118 + ((r + k * 3) % 4) * 6; c.fillStyle = `rgb(${sh},${sh - 4},${sh - 12})`; c.fillRect(k * 128 + (r % 2) * 64 + 2, r * 64 + 2, 124, 60); }
      });
      slab.wrapS = slab.wrapT = THREE.RepeatWrapping; slab.repeat.set((W + 4) / 4, 7 / 4);
      flat(mesh(new THREE.PlaneGeometry(W + 4, 7.4), std({ map: slab, roughness: .85 }), 0, .025, D / 2 + 4.2, b)).rotation.x = -Math.PI / 2;
      // walls: brick back and gable ends, the recessed front wall behind the porch
      const back = mesh(new THREE.BoxGeometry(W, EY - base, .5), brick(W / 4), 0, base + (EY - base) / 2, -D / 2 + .25, b);
      clickable(list, back, data);
      [-1, 1].forEach(sx => {
        const side = mesh(new THREE.BoxGeometry(.6, EY - base, D), brick(D / 4), sx * (W / 2 - .3), base + (EY - base) / 2, 0, b);
        clickable(list, side, data);
        // the gable rises above the roof as a parapet, edged in dark tile
        const sh = new THREE.Shape(); sh.moveTo(-run, 0); sh.lineTo(run, 0); sh.lineTo(0, H + .35); sh.closePath();
        const gab = mesh(new THREE.ExtrudeGeometry(sh, { depth: .6, bevelEnabled: false }), brick(1), sx * (W / 2 - .3) - .3, EY - .02, 0, b);
        gab.rotation.y = Math.PI / 2;
        [-1, 1].forEach(sz => {
          const len = Math.hypot(run, H + .35), e = mesh(new THREE.BoxGeometry(.75, .16, len + .2), ridgeMat, sx * (W / 2 - .3), EY + (H + .35) / 2 + .06, sz * run / 2, b);
          e.rotation.x = sz * Math.atan2(H + .35, run);
        });
        // white plaster panels with a painted roundel on the front of each corner pier
        const pier = writing(256, 512, (c, cw, ch) => {
          c.fillStyle = "#4d5560"; c.fillRect(0, 0, cw, ch);
          c.fillStyle = "#ece6d8"; c.fillRect(30, 40, cw - 60, ch - 80);
          c.strokeStyle = "#8a6a3a"; c.lineWidth = 6; c.strokeRect(44, 54, cw - 88, ch - 108);
          c.fillStyle = "#2f6a5a"; c.beginPath(); c.arc(cw / 2, ch * .32, 46, 0, TAU); c.fill();
          c.fillStyle = "#b8862e"; c.beginPath(); c.arc(cw / 2, ch * .32, 22, 0, TAU); c.fill();
          c.fillStyle = "#3a5a8a"; c.fillRect(70, ch * .55, cw - 140, 90);
        });
        flat(mesh(new THREE.PlaneGeometry(1.0, 4.6), std({ map: pier, roughness: .8 }), sx * (W / 2 - .3), base + 2.8, D / 2 + .01, b));
      });
      const front = mesh(new THREE.BoxGeometry(W - 1.2, EY - base, .3), brick((W - 1.2) / 4), 0, base + (EY - base) / 2, FZ - .15, b);
      clickable(list, front, data);
      mesh(new THREE.BoxGeometry(7.2, 4.6, .1), darkWood, 0, base + 2.3, FZ + .05, b);   // the dark timber centre bay
      doorway(b, 0, base, FZ + .12, 0, 2.8, 3.6, null, data, list);
      latticeWindows(b, [-6.2, -3.4, 3.4, 6.2].map(x => ({ p: V(x, base + 2.0, FZ + .12), ry: 0, w: 1.5, h: 2.2 })), lampPane(0xffa040, .75));
      // the name plaque: dark lacquer, gold characters, gilt frame
      const plaqueTex = writing(768, 256, (c, cw, ch) => {
        c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 14; c.strokeRect(10, 10, cw - 20, ch - 20);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(150); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(pl.han, cw / 2, ch / 2 + 8);
      });
      mesh(new THREE.BoxGeometry(3.7, 1.3, .1), M.trim, 0, base + 4.55, FZ + .2, b);
      flat(mesh(new THREE.PlaneGeometry(3.5, 1.15), new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: .6, emissive: 0x2a2a2a, emissiveMap: plaqueTex }), 0, base + 4.55, FZ + .26, b));
      // porch: granite columns with gilt couplet boards, a carved beam and a painted frieze, red lanterns
      const couplet = text => writing(96, 512, (c, cw, ch) => {
        c.fillStyle = "#2a1610"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#d6a94a"; c.lineWidth = 6; c.strokeRect(4, 4, cw - 8, ch - 8);
        c.fillStyle = "#e8c25a"; c.font = HAN_FONT(64); c.textAlign = "center"; c.textBaseline = "middle"; [...text].forEach((ch2, i) => c.fillText(ch2, cw / 2, 60 + i * 98));
      });
      [[-3.9, "蓮開見佛"], [3.9, "心淨國土"], [-7.9, ""], [7.9, ""]].forEach(([x, text]) => {
        mesh(new THREE.BoxGeometry(.5, EY - base - .5, .5), granite, x, base + (EY - base - .5) / 2, D / 2 - .4, b);
        mesh(new THREE.BoxGeometry(.7, .25, .7), granite, x, base + .12, D / 2 - .4, b);
        if (text) flat(mesh(new THREE.PlaneGeometry(.4, 3.6), new THREE.MeshStandardMaterial({ map: couplet(text), roughness: .6, emissive: 0x222222 }), x, base + 2.5, D / 2 - .14, b));
      });
      const beamTexG = writing(1024, 64, (c, cw, ch) => {
        c.fillStyle = "#2a140c"; c.fillRect(0, 0, cw, ch);
        c.strokeStyle = "#c9993c"; c.lineWidth = 4;
        for (let x = 10; x < cw; x += 52) { c.beginPath(); c.arc(x + 20, ch / 2, 16, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(x, 10); c.lineTo(x, ch - 10); c.stroke(); }
      });
      mesh(new THREE.BoxGeometry(W - 1.2, .55, .45), std({ map: beamTexG, roughness: .5, metalness: .2 }), 0, EY - .95, D / 2 - .4, b);
      const frieze = writing(1024, 96, (c, cw, ch) => {
        c.fillStyle = "#e8e2d4"; c.fillRect(0, 0, cw, ch);
        const cols = ["#2f6a5a", "#3a5a8a", "#a8402a", "#c9993c"];
        for (let i = 0; i < 12; i++) { const x = 8 + i * 84; c.fillStyle = cols[i % 4]; c.fillRect(x, 14, 70, ch - 28); c.fillStyle = "#e8e2d4"; c.beginPath(); c.arc(x + 35, ch / 2, 18, 0, TAU); c.fill(); }
      });
      mesh(new THREE.BoxGeometry(W - 1.2, .6, .3), std({ map: frieze, roughness: .8 }), 0, EY - .4, D / 2 - .35, b);
      flat(mesh(new THREE.PlaneGeometry(W - 1.2, 2.3), darkWood, 0, EY - .7, (FZ + D / 2) / 2, b)).rotation.x = Math.PI / 2;   // porch ceiling
      [-5.6, 5.6].forEach(x => lantern(b, x, base + 3.9, D / 2 - 1.0, EY - .7, 1.3));
      // the roof: two concave slopes of tiles, red eave boards and undersides, between the gables
      const slope = (sz, ts = 16) => {
        const pos = [], uv = [], idx = [];
        for (let i = 0; i <= ts; i++) { const t = i / ts, zz = sz * run * (1 - t), yy = H * Math.pow(t, 1.45); [-1, 1].forEach(sx => { pos.push(sx * (W / 2 - .6), yy, zz); uv.push(sx * (W / 2 - .6) * 1.2, t * run * 1.2); }); }
        for (let i = 0; i < ts; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx); geo.computeVertexNormals(); return geo;
      };
      [-1, 1].forEach(sz => {
        clickable(list, mesh(slope(sz), roofMat, 0, EY, 0, b), data);
        flat(mesh(slope(sz), eaveRed, 0, EY - .07, 0, b));
        mesh(new THREE.BoxGeometry(W - 1.1, .22, .14), eaveRed, 0, EY - .02, sz * run, b);
      });
      // the decorated ridge (陶塑瓦脊): a base course, a band of painted figures, a row of finials,
      // the flaming pearl at the centre and a curling dragon-fish at each end
      const RY = EY + H;
      mesh(new THREE.BoxGeometry(W - 1.0, .4, .55), ridgeMat, 0, RY + .1, 0, b);
      const band = writing(1024, 128, (c, cw, ch) => {
        c.fillStyle = "#2a3a3a"; c.fillRect(0, 0, cw, ch);
        const cols = ["#3a8a6a", "#d8a83a", "#3a6aa8", "#c0503a", "#e8e2d4"];
        for (let i = 0; i < 26; i++) { const x = 14 + i * 39; c.fillStyle = cols[i % 5]; c.beginPath(); c.ellipse(x + 14, 70, 12, 34, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x + 14, 28, 10, 0, TAU); c.fill(); }
        c.fillStyle = "#c9993c"; c.fillRect(0, ch - 12, cw, 12); c.fillRect(0, 0, cw, 8);
      });
      mesh(new THREE.BoxGeometry(W - 3.0, .9, .3), std({ map: band, roughness: .5, metalness: .1 }), 0, RY + .75, 0, b);
      for (let x = -(W - 3.4) / 2; x <= (W - 3.4) / 2 + .01; x += 1.6) mesh(new THREE.ConeGeometry(.1, .35, 8), paintGreen, x, RY + 1.37, 0, b);
      mesh(new THREE.CylinderGeometry(.12, .2, .5, 12), M.gold, 0, RY + 1.45, 0, b);
      mesh(new THREE.SphereGeometry(.32, 20, 14), std({ color: 0xffd890, emissive: 0xffa040, emissiveIntensity: .7 }), 0, RY + 1.95, 0, b);
      [-1, 1].forEach(sx => {
        const curl = mesh(new THREE.TorusGeometry(.42, .12, 8, 20, Math.PI * 1.4), paintGreen, sx * (W / 2 - 1.2), RY + 1.0, 0, b);
        curl.rotation.set(0, sx < 0 ? Math.PI : 0, -Math.PI * .1);
        mesh(new THREE.ConeGeometry(.14, .6, 8), M.gold, sx * (W / 2 - .9), RY + 1.65, 0, b).rotation.z = -sx * .5;
      });
      // forecourt: two notice kiosks with little tiled roofs, and bonsai on stands either side of the steps
      [-1, 1].forEach(sx => {
        const kx = sx * (W / 2 - 1.8), kz = D / 2 + 3.2;
        [-.65, .65].forEach(dx => mesh(new THREE.BoxGeometry(.12, 2.2, .12), M.lacquer, kx + dx, 1.1, kz, b));
        const note = writing(256, 320, (c, cw, ch) => {
          c.fillStyle = "#f2ead6"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#7a1c12"; c.lineWidth = 10; c.strokeRect(5, 5, cw - 10, ch - 10);
          c.fillStyle = "#7a1c12"; c.font = HAN_FONT(48); c.textAlign = "center"; c.fillText(sx < 0 ? "法會" : "公告", cw / 2, 64);
          c.fillStyle = "#6a5a4a"; for (let i = 0; i < 6; i++) c.fillRect(36, 104 + i * 32, cw - 72, 6);
        });
        flat(mesh(new THREE.PlaneGeometry(1.15, 1.4), std({ map: note, roughness: .8, emissive: 0x333028, emissiveMap: note }), kx, 1.35, kz + .07, b));
        mesh(new THREE.BoxGeometry(1.3, 1.6, .08), M.lacquer, kx, 1.35, kz, b);
        tiledHipRoof(b, kx, kz, 2.2, 1.0, .55, .45, .15, [0, .2, .4, .6, .8, .93], .45);
        const pot = mesh(new THREE.CylinderGeometry(.42, .32, .45, 16), std({ color: 0x5a4a3a, roughness: .7 }), sx * 3.4, .72, D / 2 + 1.9, b);
        mesh(new THREE.BoxGeometry(.9, .5, .9), granite, sx * 3.4, .25, D / 2 + 1.9, b);
        const tr = mesh(new THREE.CylinderGeometry(.05, .09, .7, 8), bark, sx * 3.4, 1.2, D / 2 + 1.9, b); tr.rotation.z = sx * .3;
        [[0, 1.55, 0, .45], [sx * .35, 1.4, .1, .35], [-sx * .25, 1.7, -.1, .32]].forEach(([dx, y, dz, r]) => mesh(new THREE.IcosahedronGeometry(r, 0), leafMats[1], sx * 3.4 + dx, y, D / 2 + 1.9 + dz, b));
      });
      // the great incense censer (大香爐) in the middle of the forecourt: a bronze cauldron on three legs with upright handles,
      // giant red incense sticks glowing at the tips, and smoke drifting up
      const CZ = D / 2 + 4.6, cen = new THREE.Group(); cen.position.set(0, 0, CZ); b.add(cen);
      const cdata = { tip: "The great incense censer · offer incense inside the halls" };
      mesh(new THREE.CylinderGeometry(1.9, 2.0, .3, 8), granite, 0, .15, 0, cen).rotation.y = R8;
      mesh(new THREE.CylinderGeometry(1.6, 1.7, .25, 8), granite, 0, .42, 0, cen).rotation.y = R8;
      for (let k = 0; k < 3; k++) {   // legs ending in lion paws
        const a = k / 3 * TAU + Math.PI / 6;
        const leg = mesh(new THREE.CylinderGeometry(.16, .1, 1.0, 10), M.bronze, Math.sin(a) * .85, 1.05, Math.cos(a) * .85, cen); leg.rotation.set(Math.cos(a) * -.15, 0, Math.sin(a) * .15);
        mesh(new THREE.SphereGeometry(.2, 12, 8), M.bronze, Math.sin(a) * .92, .62, Math.cos(a) * .92, cen);
      }
      // the bowl is open: its inner wall drops from the rim to a bed of ash well below it
      const bowl = lathe([[0, 0], [.7, .02], [1.05, .2], [1.22, .55], [1.25, .95], [1.32, 1.05], [1.38, 1.12], [1.2, 1.12], [1.12, 1.0], [1.08, .7], [0, .66]], M.bronze, 40);
      bowl.position.y = 1.45; cen.add(bowl); clickable(list, bowl, cdata);
      [.55, .95].forEach(y => { const r = mesh(new THREE.TorusGeometry(y < .7 ? 1.2 : 1.27, .04, 8, 48), M.trim, 0, 1.45 + y, 0, cen); r.rotation.x = Math.PI / 2; });
      const ashTop = mesh(ashBed(1.08), ashMat, 0, 1.45 + .68, 0, cen); ashTop.rotation.x = -Math.PI / 2;   // the ash, sunk inside the rim
      [-1, 1].forEach(sx => {   // upright ear handles
        const h = mesh(new THREE.TorusGeometry(.32, .07, 8, 20, Math.PI), M.bronze, sx * .95, 1.45 + 1.12, 0, cen);
        [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(.14, .3, .14), M.bronze, sx * .95 + e * .32, 1.45 + 1.0, 0, cen));
        h.rotation.y = Math.PI / 2;
      });
      const ashY = 1.45 + .72, tips = [];
      const giant = std({ color: 0xa8201a, roughness: .5 }), stickMat = std({ color: 0xb2683a, roughness: .9 });
      [[-.3, 0, 1.6], [0, -.12, 1.85], [.3, 0, 1.6]].forEach(([x, z, h]) => {   // three tall incense sticks, one for each jewel
        mesh(new THREE.CylinderGeometry(.06, .07, h, 12), giant, x, ashY + h / 2, z, cen);
        mesh(new THREE.CylinderGeometry(.085, .085, .2, 12), M.trim, x, ashY + .3, z, cen);
        const tip = mesh(new THREE.CylinderGeometry(.06, .075, .18, 12), std({ color: 0x3a1a0a, emissive: 0xff5a1a, emissiveIntensity: 1.4 }), x, ashY + h + .09, z, cen);
        const gl = glowSprite(0xff6a2a, .9, .8); gl.position.set(x, ashY + h + .15, z); cen.add(gl); tips.push(V(x, ashY + h + .2, z));
      });
      const rs = rng(41);
      for (let i = 0; i < 36; i++) {   // ordinary sticks left by visitors
        const a = rs() * TAU, r = .25 + rs() * .75, st = mesh(new THREE.CylinderGeometry(.008, .008, .5, 4), stickMat, Math.cos(a) * r, ashY + .25, Math.sin(a) * r, cen);
        st.rotation.set((rs() - .5) * .2, 0, (rs() - .5) * .2);
        if (i % 4 === 0) { const e = glowSprite(0xff5a20, .12, 1); e.position.set(Math.cos(a) * r, ashY + .5, Math.sin(a) * r); cen.add(e); }
      }
      const smokeTex = canvasTex(64, (c, sz) => { const gr = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2); gr.addColorStop(0, "rgba(220,215,210,.55)"); gr.addColorStop(1, "rgba(220,215,210,0)"); c.fillStyle = gr; c.fillRect(0, 0, sz, sz); });
      const puffs = [];
      for (let i = 0; i < 24; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
        cen.add(sp); puffs.push({ sp, t: i / 24, src: tips[i % 3], dx: rs() - .5, dz: rs() - .5 });
      }
      updaters.pagoda.push((dt, t, motion) => puffs.forEach(p => {
        p.t = (p.t + dt * .12 * (motion || .3)) % 1;
        const k = p.t, sway = Math.sin(t * .6 + p.dx * 6) * .4 * k;
        p.sp.position.set(p.src.x + p.dx * k * 1.2 + sway, p.src.y + k * 3.5, p.src.z + p.dz * k * 1.2);
        p.sp.scale.setScalar(.3 + k * 2.2);
        p.sp.material.opacity = Math.sin(Math.PI * k) * .45;
      }));
      const fire = new THREE.PointLight(0xff8a3a, 1.2, 7, 2); fire.position.set(0, ashY + 1, 0); cen.add(fire);
      const warm = new THREE.PointLight(0xffb070, 1.6, 16, 2); warm.position.set(0, base + 3.4, D / 2 + 3); b.add(warm);
    }
    bellPavilion({ x: -17, z: -1.5, place: "bell" });
    templeHall({ x: 24.5, z: 26, w: 24, d: 12, place: "library" });
