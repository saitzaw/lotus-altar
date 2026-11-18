
    /* the lake side: on the open ground between the east side's last flats and the stupa hill's north walk, an office tower and a
       supermarket with its car park, both fronted to the east, where the palace lake and the stupa hill lie across the walk; and a
       slim office on the lake's west shore itself, its back to the water. The firms and their names are made up */
    // walkX(z): the north walk's centre line (x) at z, between the hill's foot and its bend near the Hluttaw road, as `shanStupaHill`
    // lays it; edge(z): the furthest east anything here may reach at z (half the walk's width and a margin off it)
    const LV = (() => {
      const { cx, cz, rBase, to } = HILL, a = Math.atan2(-(to[0] - cx), -(to[1] - cz)) - MORE_STAIRS.north, d = [-Math.sin(a), -Math.cos(a)];
      const p = [cx + d[0] * (rBase + 4), cz + d[1] * (rBase + 4)], q = [MORE_STAIRS.road[0] - 6, MORE_STAIRS.road[1]];
      const walkX = z => p[0] + (q[0] - p[0]) * (z - p[1]) / (q[1] - p[1]);
      return { walkX, edge: z => walkX(z) - SW_ / 2 - .5 };
    })();

    // the office tower: six storeys of glass, its front and its roof café looking east over the lake and the hill
    const LVO = { tip: "Lake View Offices · ကန်မြင် ရုံးခန်းအဆောက်အအုံ", toast: "Lake View Offices (ကန်မြင် ရုံးခန်းအဆောက်အအုံ, a made-up building): six storeys of offices behind a glass skin, as high as the quarter allows, turned to face the palace lake and the stupa hill across the north walk. A mobile operator's regional office, an insurance agent, a tea exporter and a travel agency rent the floors; on the roof a café's tables look east over the water to the island pavilion and up to the white-and-gold stupa." };
    const tower = block(-162, 213, W90, { W: 16, D: 14, floors: 6, kind: "glass", wall: WALL[0], trim: WALL[4], sign: ["ကန်မြင် ရုံးခန်းအဆောက်အအုံ", "Lake View Offices", "#1f4a5a", "#ffffff"], data: LVO });
    const roof = new THREE.Group(); roof.position.y = tower.top; tower.h.add(roof);
    tables(roof, [-5.2, -1.8, 1.8, 5.2], 3.6, 2);   // the roof café, on the front half clear of the stair housing and the tanks
    // its forecourt, and benches on the grass beyond it facing the lake
    flat(bx(paving, -152.1, .05, 213, 5, .06, 17.5, g));
    [[-151, 205.8], [-151, 220.2], [-146, 207]].forEach(([x, z]) => streetTree(x, z, .9 + r() * .3));
    [[-147.6, 214.5], [-145.4, 219]].forEach(([x, z]) => bench(x, z, W90));

    // the supermarket: a big two-storey store, glass shop fronts under one long red awning, its name across the upper floor
    const SUPER = { tip: "Lakeside Supermarket · ကန်စပ် စူပါမားကတ်", toast: "Lakeside Supermarket (ကန်စပ် စူပါမားကတ်, a made-up shop): the town's big self-service store, cool inside, with trolleys at the door. Rice by the 25 kg sack, cooking oil, instant noodles, Thai and Chinese snacks, washing powder, and a counter of fresh greens and fruit from the hill villages. Upstairs are household goods and school uniforms, and a little café whose window looks out over the palace lake to the stupa hill." };
    const SD = 19, sm = block(-161.5, 237.5, W90, { W: 25, D: SD, floors: 2, kind: "office", wall: WALL[0], trim: AWN[0], shops: true, fascia: AWN[0], awn: AWN[0], data: SUPER });
    clickable(picks.pagoda, civicSign(sm.h, "ကန်စပ် စူပါမားကတ်", "Lakeside Supermarket", "#c0392b", "#ffffff", 11, 0, 5.75, SD / 2 + .2), SUPER);
    const SF = -161.5 + SD / 2;   // its front (x)
    // the pavement along its front, and at its south end three rows of nested trolleys between steel rails
    pave(SF + .4, SF + 2.4, 224.6, 250.4);
    [225.5, 228.1].forEach(z => bx(steel, SF + 1.4, .8, z, 1.8, .05, .05, g));
    [226, 226.8, 227.6].forEach(z => { for (let k = 0; k < 4; k++) { const t = bx(alu, SF + .9 + k * .28, .65, z, .5, .5, .55, g); t.rotation.y = W90; } });
    sRect(g, SF + .4, SF + 2.4, 225, 228.6);

    // the car park in front: one row of bays along the store's pavement, an aisle, a driveway out to the Hluttaw road
    const PK0 = SF + 2.4, PK1 = LV.edge(224);   // the car park's east edge, where the walk comes closest
    flat(bx(asphalt, (PK0 + PK1) / 2, .03, 237, PK1 - PK0, .04, 26, g));
    flat(bx(asphalt, -142, .03, 252.75, 6, .04, 5.5, g));   // the driveway, its north end at the road's south edge (z 255.5)
    const BAY = 2.6, BZ0 = 225.5;
    for (let i = 0; i <= 8; i++) flat(bx(paint, PK0 + 2.5, .06, BZ0 + i * BAY, 5, .02, .12, g));
    const CARS = [0xe8e8e4, 0xa8acb0, 0xa02a24, 0x1c1c20, 0x2a4a8a, 0xe8e8e4].map(c => std({ color: c, roughness: .35, metalness: .4 }));
    [0, 1, 3, 4, 6].forEach((b, k) => car(PK0 + 2.6, BZ0 + (b + .5) * BAY, -W90, CARS[k]));
    // motorbikes in the end bays, by the driveway
    const bikeM = [0xc02a2a, 0x1a1a1c, 0x2a5aa0, 0xe8e4dc].map(c => std({ color: c, roughness: .4, metalness: .3 })), tyreM = std({ color: 0x141414, roughness: .8 });
    for (let k = 0; k < 6; k++) {
      const z = BZ0 + 8 * BAY + .5 + k * .9; if (z > 249.6) break;
      [-.55, .55].forEach(dx => { const w = part(UC, tyreM, PK0 + 2.5 + dx, .3, z, g); w.scale.set(.3, .08, .3); w.rotation.x = W90; });
      bx(bikeM[k % 4], PK0 + 2.5, .6, z, 1.1, .32, .26, g); bx(tyreM, PK0 + 2.4, .82, z, .55, .1, .28, g);
    }
    sRect(g, PK0 + 1.7, PK0 + 3.3, BZ0 + 8 * BAY + .1, 250);
    [[PK1 - .3, 229], [PK1 + 2, 243]].forEach(([x, z]) => streetLight(g, x, z, 0));   // the arms out west over the bays
    // a parked car, nose toward local +z: body, glasshouse with its windows, four wheels
    function car(x, z, ry, mat) {
      const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
      bx(mat, 0, .62, 0, 1.74, .62, 4.3, c); bx(mat, 0, 1.16, -.25, 1.6, .5, 2.2, c); bx(windscreen, 0, 1.15, -.25, 1.64, .4, 2.0, c);
      [-1, 1].forEach(sx => [-1, 1].forEach(sz => { const w = part(UC, tyre, sx * .8, .33, sz * 1.35, c); w.scale.set(.33, .22, .33); w.rotation.z = W90; }));
      sRect(c, -.9, .9, -2.2, 2.2);
    }

    // the slim office on the lake shore, its glass back to the water and its door on the walk: a microfinance firm
    const MF = { tip: "Valley Microfinance · အသေးစား ငွေရေးကြေးရေး", toast: "Valley Microfinance (a made-up firm): small loans to farmers before planting and to traders in the market, repaid week by week. The loan officers' desks are along the back windows, over the palace lake, looking across the water to the island pavilion and the stupa hill beyond." };
    const mfB = block(-124.6, 234, -W90, { W: 11, D: 7.5, floors: 4, kind: "glass", wall: WALL[5], trim: WALL[0], bare: true, sign: ["အသေးစား ငွေရေးကြေးရေး", "Valley Microfinance", "#2e6b3a", "#ffffff", 7], data: MF });
    bx(alu, 0, 3.1, 7.5 / 2 + .8, 3.2, .14, 1.6, mfB.h);   // a steel canopy over its door, held off the wall
  }
