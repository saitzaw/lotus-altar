  /* ---------- ကချင်နှစ်ခြင်းအသင်းတော် inside the Kachin Baptist church: whitewashed walls over a teak wainscot banded with manau
     pattern, tall pointed windows, two banks of wooden pews either side of the aisle, ceiling fans turning under the beams, and
     at the front a raised dais with the pulpit, the choir's chairs and the keyboard, a plain wooden cross on a red hanging behind,
     and the communion table with the Bible and flowers below it ---------- */
  const CHURCH = { rows: [-.6, .45, 1.5, 2.55, 3.6, 4.65], banks: [[-5.8, -1], [1, 5.8]], dais: -2.6 };
  function churchHall(g, n) {
    picks[n] = picks[n] || []; updaters[n] = updaters[n] || [];
    const list = picks[n], HH = 6.4, DY = .45;   // HH: the ceiling's height, DY: the dais's
    const floorT = canvasTex(128, (c, s2) => { c.fillStyle = "#8a5a32"; c.fillRect(0, 0, s2, s2); for (let k = 0; k < s2; k += 16) { c.fillStyle = "rgba(30,14,4,.5)"; c.fillRect(0, k, s2, 2); c.fillStyle = "rgba(160,100,50,.15)"; c.fillRect(0, k + 5, s2, 3); } });
    floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(4, 4);
    const floorM = std({ map: floorT, roughness: .5 }), lime = std({ color: 0xf4f2ec, roughness: .9 }), wood = std({ color: 0x6a3e1e, roughness: .6 }), dark = std({ color: 0x3a2010, roughness: .6 });
    const red = std({ color: 0x9a2a22, roughness: .7 }), cloth = std({ color: 0xf6f2e8, roughness: .9 }), green = std({ color: 0x3a6a2a, roughness: .8 });
    const band = (rx, ry) => { const t = manauTex().clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return std({ map: t, roughness: .7 }); };
    const across = canvasTex(128, (c, s2) => { c.translate(s2 / 2, s2 / 2); c.rotate(Math.PI / 2); c.drawImage(manauTex().image, -s2 / 2, -s2 / 2, s2, s2); });   // the pattern turned to run along the wall
    across.wrapS = across.wrapT = THREE.RepeatWrapping; across.repeat.set(36, 1);
    // floor, walls with a teak wainscot and a manau band along its top, and the ceiling on dark beams
    flat(mesh(new THREE.PlaneGeometry(15, 13), floorM, 0, 0, 1, g)).rotation.x = -Math.PI / 2;
    flat(mesh(new THREE.PlaneGeometry(15, HH), lime, 0, HH / 2, -5.5, g));
    flat(mesh(new THREE.PlaneGeometry(15, HH), lime, 0, HH / 2, 7.5, g)).rotation.y = Math.PI;
    [-1, 1].forEach(sd => {
      flat(mesh(new THREE.PlaneGeometry(13, HH), lime, sd * 7.5, HH / 2, 1, g)).rotation.y = -sd * Math.PI / 2;
      flat(mesh(new THREE.BoxGeometry(.04, 1, 13), wood, sd * 7.48, .5, 1, g));
      flat(mesh(new THREE.BoxGeometry(.04, .3, 13), std({ map: across, roughness: .7 }), sd * 7.47, 1.15, 1, g));
    });
    flat(mesh(new THREE.PlaneGeometry(15, 13), lime, 0, HH, 1, g)).rotation.x = Math.PI / 2;
    const beamG = new THREE.BoxGeometry(15, .3, .24);
    [-3.4, -.6, 2.2, 5].forEach(z => part(beamG, dark, 0, HH - .15, z, g));
    // tall pointed windows down both side walls: daylight by day, dark at night
    const pane = std({ color: 0x14202e, roughness: .3, emissive: 0xe6eef6, emissiveIntensity: 0 });
    onDaylight(d => pane.emissiveIntensity = .85 * d + .02);
    [-1, 1].forEach(sd => [-3.4, -.6, 2.2, 5].forEach(z => {
      const o = new THREE.Group(); o.position.set(sd * 7.47, 0, z); o.rotation.y = -sd * Math.PI / 2; g.add(o);
      mesh(new THREE.PlaneGeometry(1, 2.4), pane, 0, 3, .01, o);
      mesh(new THREE.PlaneGeometry(.71, .71), pane, 0, 4.2, .01, o).rotation.z = Math.PI / 4;
      mesh(new THREE.BoxGeometry(1.3, .12, .12), red, 0, 1.76, .04, o);   // the sill
      [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(.08, 2.4, .06), lime, e * .52, 3, .03, o));
    }));
    // the pews, two banks either side of the aisle, facing the dais
    CHURCH.banks.forEach(([x0, x1]) => {
      const w = x1 - x0, cx = (x0 + x1) / 2, seat = new THREE.BoxGeometry(w, .07, .42), back = new THREE.BoxGeometry(w, .5, .05), end = new THREE.BoxGeometry(.07, .9, .55);
      CHURCH.rows.forEach(z => {
        part(seat, wood, cx, .45, z, g); part(back, wood, cx, .78, z + .22, g);
        [x0, x1].forEach(x => part(end, dark, x, .45, z + .02, g));
      });
    });
    // the dais at the front, a step before it, and the red hanging with the plain wooden cross, banded in manau pattern
    mesh(new THREE.BoxGeometry(12, DY, 2.9), wood, 0, DY / 2, -4.05, g);
    mesh(new THREE.BoxGeometry(6, DY / 2, .3), wood, 0, DY / 4, CHURCH.dais + .15, g);
    mesh(new THREE.BoxGeometry(12.02, .08, .04), dark, 0, DY - .04, CHURCH.dais, g);
    mesh(new THREE.PlaneGeometry(3, 4.4), red, 0, DY + 2.9, -5.48, g);
    [-1, 1].forEach(sd => mesh(new THREE.PlaneGeometry(.32, 4.4), band(1, 6), sd * 1.66, DY + 2.9, -5.47, g));
    mesh(new THREE.BoxGeometry(.24, 3, .12), wood, 0, DY + 2.8, -5.4, g);
    mesh(new THREE.BoxGeometry(1.6, .24, .12), wood, 0, DY + 3.5, -5.4, g);
    // the pulpit, its front painted with manau pattern
    mesh(new THREE.BoxGeometry(1.1, 1.1, .6), wood, 0, DY + .55, -3.5, g);
    mesh(new THREE.BoxGeometry(.8, .7, .02), band(2, 1), 0, DY + .55, -3.19, g);
    mesh(new THREE.BoxGeometry(1.2, .06, .7), dark, 0, DY + 1.12, -3.5, g).rotation.x = .25;
    // the choir's chairs either side of the pulpit, and the keyboard on its stand
    const cSeat = new THREE.BoxGeometry(.45, .05, .45), cBack = new THREE.BoxGeometry(.45, .5, .04), cLeg = new THREE.BoxGeometry(.04, .45, .04);
    [-1, 1].forEach(sd => [-4.7, -3.9].forEach(z => [2.2, 2.9, 3.6, 4.3].forEach(ax => {
      const x = sd * ax, y = DY;
      part(cSeat, dark, x, y + .45, z, g); part(cBack, dark, x, y + .72, z - .21, g);
      [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]].forEach(([lx, lz]) => part(cLeg, dark, x + lx, y + .225, z + lz, g));
    })));
    mesh(new THREE.BoxGeometry(1.2, .1, .35), std({ color: 0x1a1a1c, roughness: .4 }), -5.4, DY + .85, -3.2, g);
    mesh(new THREE.BoxGeometry(1.05, .02, .14), std({ color: 0xf2f2f0, roughness: .4 }), -5.4, DY + .91, -3.11, g);
    [-1, 1].forEach(sd => { const leg = mesh(new THREE.BoxGeometry(.04, .95, .04), dark, -5.4 + sd * .3, DY + .42, -3.2, g); leg.rotation.z = sd * .5; });
    // the communion table below the dais: a white cloth, the open Bible, and flowers either side
    mesh(new THREE.BoxGeometry(1.8, .8, .6), wood, 0, .4, -2.15, g);
    mesh(new THREE.BoxGeometry(1.84, .02, .64), cloth, 0, .81, -2.15, g);
    mesh(new THREE.BoxGeometry(1.84, .4, .01), cloth, 0, .62, -1.83, g);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.2, .03, .28), cloth, sd * .1, .84, -2.15, g).rotation.z = -sd * .12);
    const bloom = std({ color: 0xf8f4ea, roughness: .8 }), bud = new THREE.SphereGeometry(.06, 8, 6);
    [-1, 1].forEach(sd => {
      mesh(new THREE.CylinderGeometry(.08, .06, .25, 12), M.brass, sd * .7, .95, -2.2, g);
      for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; part(bud, k % 3 ? bloom : green, sd * .7 + Math.sin(a) * .1, 1.15 + (k % 2) * .08, -2.2 + Math.cos(a) * .1, g); }
    });
    bakeParts(g);
    // ceiling fans turning under the beams, and lamps hanging between them
    const fans = [];
    [[-3.4, .9], [3.4, .9], [-3.4, 3.6], [3.4, 3.6]].forEach(([x, z]) => {
      mesh(new THREE.CylinderGeometry(.02, .02, .6, 6), dark, x, HH - .3, z, g);
      const f = new THREE.Group(); f.position.set(x, HH - .65, z); g.add(f); fans.push(f);
      mesh(new THREE.CylinderGeometry(.12, .1, .14, 12), std({ color: 0xe8e4dc, roughness: .5 }), 0, 0, 0, f);
      for (let k = 0; k < 3; k++) { const b = mesh(new THREE.BoxGeometry(.7, .015, .14), wood, Math.cos(k / 3 * TAU) * .42, -.02, Math.sin(k / 3 * TAU) * .42, f); b.rotation.y = -k / 3 * TAU; b.castShadow = false; }
    });
    updaters[n].push((dt, t, motion) => fans.forEach((f, i) => f.rotation.y += dt * (5 + i * .3) * motion));
    const bulb = std({ color: 0xfff4dc, emissive: 0xffe8b0, emissiveIntensity: .9 });
    [-1.6, 2.2].forEach(z => [-1, 1].forEach(sd => {
      mesh(new THREE.CylinderGeometry(.01, .01, 1.4, 4), dark, sd * 1.4, HH - .7, z, g);
      mesh(new THREE.SphereGeometry(.12, 12, 8), bulb, sd * 1.4, HH - 1.45, z, g).castShadow = false;
    }));
    // the doors out to the forecourt, in the front wall behind the visitor
    const D0 = new THREE.Group(); D0.position.set(0, 0, 7.45); D0.rotation.y = Math.PI; g.add(D0);
    [-1, 1].forEach(sd => clickable(list, mesh(new THREE.BoxGeometry(.98, 2.6, .08), wood, sd * .5, 1.3, 0, D0), { floor: "pagoda", tip: "Go back out to the forecourt" }));
    mesh(new THREE.BoxGeometry(2.3, .2, .14), red, 0, 2.7, 0, D0);
    // lights: bright and plain, the key from the back of the hall onto the cross and the dais
    g.add(new THREE.HemisphereLight(0xfff0dc, 0x3a2a1a, .5));
    const key = new THREE.SpotLight(0xfff0d8, 1.2, 26, .7, .6, 1); key.position.set(1.5, 5.6, 6); key.target.position.set(0, 1.6, -4); g.add(key, key.target);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
    [-1.6, 2.2].forEach(z => { const l = new THREE.PointLight(0xffe2b0, .7, 9, 2); l.position.set(0, HH - 1.6, z); g.add(l); });
    const side = new THREE.DirectionalLight(0x9ab0e0, .3); side.position.set(-6, 4, -1); g.add(side);
  }

