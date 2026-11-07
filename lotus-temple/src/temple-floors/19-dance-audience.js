  /* ---------- the dancers' audience: children sitting cross-legged on the grass in a front row before the stage and young people
     standing behind them, all turned to the dancers; out while the dancers are (setDancers). Blocky low-poly figures like the
     townsfolk, one mesh each; the children bob and rock as they watch. Returns the step to run each frame ---------- */
  function festivalAudience(G, list, cx, cz, keepOff) {
    const C = AUDIENCE, r = rng(4242), data = { tip: "The audience · ပွဲကြည့်ပရိသတ်", toast: "Children from the town sit right up at the front of the stage, and the young people stand behind them, to watch the kinnara and kinnari dance." };
    const M_ = std({ vertexColors: true, flatShading: true, roughness: .85 });
    onDaylight(d => M_.emissive.copy(lerpC(0x1c1814, 0x000000, d)));   // a little lift so they read under the lanterns
    const SKIN = [0xe8b890, 0xd8a47a, 0xc89068, 0xf0c4a0], HAIR = 0x221a16, INK = 0x2a1c18, pk = l => l[(r() * l.length) | 0];
    const TOP = [0xe8e4da, 0x2a6ac8, 0xd83a3a, 0xf2c230, 0x3a8a5a, 0xe88aa0, 0x2a2e48, 0x8a5ac8, 0xf08a3a], LOWER = [0x23232b, 0x2e3446, 0x4a3a2c, 0x3a5a8a];
    const LONGYI = [0x8a2a3a, 0xd8483a, 0x2a2e48, 0x6a2a5a, 0x2f5a3a, 0x3a4a5a];
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 7) => new THREE.CylinderGeometry(a, b, h, n);
    // a head with a face, the same for both: [parts], at height y
    const head = (y, skin, girl, fill) => {
      const p = [[box(.25, .27, .24), skin, 0, y, 0], [box(.035, .045, .012), INK, -.055, y + .015, .122], [box(.035, .045, .012), INK, .055, y + .015, .122],
                 [box(.07, .014, .01), 0x8a3a30, 0, y - .055, .122], [box(.27, .07, .26), HAIR, 0, y + .15, -.005], [box(.27, girl ? .24 : .17, .07), HAIR, 0, y + (girl ? .035 : .065), -.1]];
      if (girl) p.push([box(.025, .18, .2), HAIR, -.13, y + .045, -.02], [box(.025, .18, .2), HAIR, .13, y + .045, -.02], [box(.08, .08, .08), fill, 0, y + .1, -.15]);   // hair down, a ribbon at the back
      else [-.08, 0, .08].forEach(x => p.push([box(.08, .05 + r() * .04, .05), HAIR, x, y + .135, .11]));   // a spiky fringe
      return p;
    };
    // a child sitting cross-legged, hands in the lap
    const sitter = (skin, top, lower, girl) => [
      [box(.22, .1, .34), lower, -.1, .06, .08], [box(.22, .1, .34), lower, .1, .06, .08], [box(.5, .09, .12), lower, 0, .07, .24],   // folded legs, shins crossed in front
      [cyl(.14, .16, .38), top, 0, .3, 0], [box(.08, .3, .09), top, -.19, .32, .05], [box(.08, .3, .09), top, .19, .32, .05], [box(.24, .07, .08), skin, 0, .2, .17],   // body, arms, hands in the lap
      [cyl(.045, .045, .06, 6), skin, 0, .52, 0], ...head(.66, skin, girl, top)
    ];
    // a young person standing: jeans or a longyi, a shirt, arms down
    const stander = (skin, top, lower, girl) => [
      ...(girl ? [[cyl(.16, .18, .78), lower, 0, .39, 0]] : [[box(.12, .78, .12), lower, -.08, .39, 0], [box(.12, .78, .12), lower, .08, .39, 0]]),
      [box(.13, .04, .22), 0x3a2e28, -.08, .02, .04], [box(.13, .04, .22), 0x3a2e28, .08, .02, .04],   // sandals
      [cyl(.155, .165, .5), top, 0, 1.02, 0], [box(.09, .46, .095), top, -.2, 1.01, 0], [box(.09, .46, .095), top, .2, 1.01, 0],
      [box(.07, .08, .08), skin, -.2, .74, 0], [box(.07, .08, .08), skin, .2, .74, 0], [cyl(.05, .05, .07, 6), skin, 0, 1.3, 0], ...head(1.45, skin, girl, top)
    ];
    const clear = (x, z) => keepOff.every(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) > kr);
    const folk = [];
    C.rows.forEach(({ rad, n, sit, spread, epic = false }) => {
      for (let i = 0; i < n; i++) {
        const a = (i / (n - 1) - .5) * spread + (r() - .5) * .05, rr = rad + (r() - .5) * .4, x = cx + Math.sin(a) * rr, z = cz + Math.cos(a) * rr;
        if (!clear(x, z)) continue;
        const girl = r() < .5, skin = pk(SKIN), top = pk(TOP), lower = girl && !sit ? pk(LONGYI) : pk(LOWER);
        const body = new THREE.Mesh(lowPoly(sit ? sitter(skin, top, lower, girl) : stander(skin, top, lower, girl)), M_);
        const sc = sit ? .8 + r() * .15 : 1.0 + r() * .12;
        body.scale.setScalar(sc); body.position.set(x, 0, z); body.rotation.y = Math.atan2(cx - x, cz - z) + (r() - .5) * .3; body.castShadow = false;
        clickable(list, body, data); body.raycast = function (ray, out) { if (body.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); };
        G.add(body); folk.push({ body, sit, epic, ry: body.rotation.y, ph: r() * TAU, lively: sit && r() < .6 });
      }
    });
    let t = 0;
    return (dt, motion) => {
      const show = FOLK.dance, big = show === "solo";
      folk.forEach(f => f.body.visible = !!show && (big || !f.epic));   // the extra rows come only for the solo, the epic's opening
      if (!show) return;
      t += dt * motion;
      folk.forEach(f => {
        // children bob and rock to the drum; everyone turns a little now and then to follow the dancers; at the solo the young
        // people standing bounce on their toes too
        f.body.position.y = f.lively ? Math.abs(Math.sin(t * 3 + f.ph)) * .04 : big && !f.sit ? Math.abs(Math.sin(t * 2.3 + f.ph)) * .03 : 0;
        f.body.rotation.z = f.lively ? Math.sin(t * 1.5 + f.ph) * .06 : 0;
        f.body.rotation.y = f.ry + Math.sin(t * .3 + f.ph) * .15;
      });
    };
  }
