  /* ---------- Shan carpentry shared by the teak monastery and the Haw Kham: the teak planks, whitewash, lamplit glass and
     rusty corrugated iron they are built of, and the two roofs they share: the carved gable and the tiered pyatthat. Made once,
     the first time a builder asks (shanCarpentry()), and the same materials handed to every caller ---------- */
  let CARPENTRY = null;
  function shanCarpentry() {
    if (CARPENTRY) return CARPENTRY;
    const plank = canvasTex(128, (c, sz) => { c.fillStyle = "#43200f"; c.fillRect(0, 0, sz, sz); for (let x = 0; x < sz; x += 10) { c.fillStyle = "rgba(15,6,2,.6)"; c.fillRect(x, 0, 2, sz); c.fillStyle = "rgba(120,70,40,.16)"; c.fillRect(x + 3, 0, 3, sz); } });
    plank.wrapS = plank.wrapT = THREE.RepeatWrapping; plank.repeat.set(4, 1);
    const teak = std({ map: plank, roughness: .7 }), teakDark = std({ color: 0x2e140a, roughness: .65 });
    const roofTex = corrugated("#6a3a24", "#8e5838", "#40200f"); roofTex.repeat.set(10, 1);
    const roofM = std({ map: roofTex, roughness: .5, metalness: .35, side: THREE.DoubleSide });
    const white = std({ color: 0xf2eee4, roughness: .8 }), frameW = std({ color: 0xf4f0e6, roughness: .6 });
    const pane = std({ color: 0x1a0e08, roughness: .4, emissive: 0xffb060, emissiveIntensity: 0 });
    onDaylight(d => pane.emissiveIntensity = .8 * (1 - d));
    const flame = new THREE.ConeGeometry(.12, .7, 4);
    // carved gable fretwork: rows of little pointed arches and scrolls in old gilt on dark teak, a sunburst roundel in the middle
    const carved = canvasTex(512, (c, sz) => {
      c.fillStyle = "#24100a"; c.fillRect(0, 0, sz, sz);
      c.strokeStyle = "#b8893c"; c.lineWidth = 3;
      for (let row = 0; row < 9; row++) for (let k = 0; k < 14; k++) {
        const x = k * 38 + (row % 2) * 19, y = sz - row * 52 - 10;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 4, y - 30, x + 17, y - 42); c.quadraticCurveTo(x + 30, y - 30, x + 34, y); c.stroke();
        c.beginPath(); c.arc(x + 17, y - 14, 6, 0, TAU); c.stroke();
      }
      c.fillStyle = "#24100a"; c.beginPath(); c.arc(sz / 2, sz * .58, 78, 0, TAU); c.fill();
      c.strokeStyle = "#d8a84a"; c.lineWidth = 5; c.beginPath(); c.arc(sz / 2, sz * .58, 70, 0, TAU); c.stroke();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; c.beginPath(); c.moveTo(sz / 2 + Math.cos(a) * 22, sz * .58 + Math.sin(a) * 22); c.lineTo(sz / 2 + Math.cos(a) * 62, sz * .58 + Math.sin(a) * 62); c.stroke(); }
      c.fillStyle = "#d8a84a"; c.beginPath(); c.arc(sz / 2, sz * .58, 18, 0, TAU); c.fill();
    });
    const gableMat = (w, h) => { const t = carved.clone(); t.needsUpdate = true; t.repeat.set(1 / w, 1 / h); t.offset.set(.5, 0); return std({ map: t, roughness: .7, metalness: .1 }); };
    // a gable roof with its ridge along local z: slopes, carved gable ends front and back, flame finials up the gable edges
    function gable(G, cx, y, cz, w, d, h) {
      const hw = w / 2, L = Math.hypot(hw, h) + .5, a = Math.atan2(h, hw);
      [-1, 1].forEach(sd => { const sl = mesh(new THREE.BoxGeometry(L, .1, d), roofM, cx + sd * (hw / 2), y + h / 2, cz, G); sl.rotation.z = -sd * a; });
      mesh(new THREE.BoxGeometry(.25, .25, d + .2), roofM, cx, y + h + .05, cz, G);
      const tri = new THREE.Shape(); tri.moveTo(-hw + .3, 0); tri.lineTo(hw - .3, 0); tri.lineTo(0, h - .1); tri.closePath();
      [-1, 1].forEach(e => {
        const z = cz + e * (d / 2 - .05), panel = mesh(new THREE.ExtrudeGeometry(tri, { depth: .12, bevelEnabled: false }), [gableMat(w, h), teakDark], cx, y, z - (e > 0 ? .12 : 0), G);
        // gold trim along the gable edges and flame finials rising from them
        [-1, 1].forEach(sd => {
          const tr = mesh(new THREE.BoxGeometry(Math.hypot(hw, h), .1, .16), M.gold, cx + sd * hw / 2, y + h / 2 + .06, z + e * .05, G); tr.rotation.z = -sd * a;
          for (let k = 1; k <= 5; k++) { const t = k / 6, f = mesh(flame, teakDark, cx + sd * hw * (1 - t), y + h * t + .4, z + e * .06, G); f.rotation.z = -sd * .5; }
        });
        mesh(new THREE.ConeGeometry(.16, 1.4, 6), M.gold, cx, y + h + .8, z, G);
      });
    }
    // a pyatthat: stacked shrinking tiers of little hipped roofs over the shrine room, crowned by a gold spire
    function pyatthat(G, cx, y, cz, s0, tiers, shrink = .17) {
      for (let k = 0; k < tiers; k++) {
        const s = s0 * (1 - k * shrink);
        mesh(new THREE.BoxGeometry(s * .62, .55, s * .62), teak, cx, y + .27, cz, G);
        const r = mesh(new THREE.ConeGeometry(s * .74, 1.0, 4, 1, true), roofM, cx, y + .55 + .5, cz, G); r.rotation.y = Math.PI / 4;
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([a, b]) => { const f = mesh(flame, teakDark, cx + a * s * .45, y + 1.05, cz + b * s * .45, G); f.scale.setScalar(1.3); });
        y += 1.35;
      }
      mesh(new THREE.CylinderGeometry(.2, .3, .5, 8), teakDark, cx, y + .25, cz, G);
      mesh(new THREE.ConeGeometry(.28, 2.6, 8), M.gold, cx, y + 1.7, cz, G);
      mesh(new THREE.CylinderGeometry(.015, .015, 1.0, 4), M.gold, cx, y + 3.4, cz, G);
    }
    return CARPENTRY = { teak, teakDark, roofM, white, frameW, pane, flame, gable, pyatthat };
  }
