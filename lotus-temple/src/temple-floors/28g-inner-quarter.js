  /* ---------- အမှတ် (၄) ရပ်ကွက် Ward No. 4, the inner quarter: the block of town behind the daily market and the high school, between
     them and the east road's back fences. Its lane leaves the market lane between the daily market and the school wall and runs
     east to a tea shop that looks straight down it; there it meets the quarter's own lane, which runs north and south through the
     block (both drawn with the other lanes from `LANES`). Houses either side, wooden and concrete, one and two storeys, in yards
     with bananas, shade trees and washing lines; a well; the ward administrator's office at the lane's south end and the
     quarter's dhamma hall (ဓမ္မာရုံ) at its north end, short of the power station's back wall ---------- */
  const WARD4 = {
    entry: { x0: 43.25, x1: 118, z0: 104.5, z1: 108.5 },   // the lane in from the market lane (in `LANES`), between the daily market (z 102.8) and the school wall (z 111)
    spine: { x0: 114, x1: 118, z0: 81, z1: 199.5 },   // the quarter's lane, north–south (in `LANES`)
    west: 106.6, east: 125.4,   // the two rows of houses' centre lines (x): 7.4 m back from the lane's edges, as in Ward No. 5
    westZ: [87, 97, 116, 127, 138, 149, 160, 171, 182], eastZ: [87, 97, 118, 129, 140, 151, 162, 173, 184],   // the houses along each row (z)
    tea: [126.4, 106.5]   // the tea shop at the lanes' corner, facing west down the lane in
  };
  function innerQuarter(g) {
    const Q = WARD4, r = rng(4404), list = picks.pagoda;
    const KINDS = [[true, 1], [false, 2], [true, 2], [false, 1], [true, 2], [true, 1], [false, 2], [true, 1]];
    let seq = 0;
    const house = (cx, cz, ry) => {
      const [wood, floors] = KINDS[seq % KINDS.length], seed = 440 + seq++, W = 7 + (seq % 2) * .5, D = 6.5;
      if (wood) shanWoodHouse(g, cx, cz, ry, { W, D, floors, seed, roof: seed % 3 ? rustRoof : ROOFS[seed % 4](1) });
      else shanHouse(g, cx + (ry > 0 ? .6 : -.6), cz, ry, { W, D, floors, shop: false, seed, wall: WALLS[(seed * 5) % WALLS.length], roof: ROOFS[seed % 4] });
    };
    Q.westZ.forEach(z => house(Q.west, z, Math.PI / 2));    // the west row, facing the lane
    Q.eastZ.forEach(z => house(Q.east, z, -Math.PI / 2));   // the east row

    // ရပ်ကွက် လက်ဖက်ရည်ဆိုင် the tea shop at the corner: the family's shophouse with low tables and little plastic stools out on its apron
    const TEA = { tip: "The tea shop · လက်ဖက်ရည်ဆိုင်", toast: "The quarter's tea shop (လက်ဖက်ရည်ဆိုင်), at the corner where the lane from the market meets the quarter's own lane. From dawn the neighbours sit on the little stools over sweet milk tea, Shan noodles and fried dough sticks, and read the news; it's where the ward hears everything first. It's only to look at." };
    shanHouse(g, Q.tea[0], Q.tea[1], -Math.PI / 2, { W: 8, D: 8, floors: 2, shop: true, seed: 449, wall: WALLS[4], roof: ROOFS[1] });
    const stoolM = [0xc02a2a, 0x2a5aa0, 0xc02a2a, 0x2f8a4a].map(c => std({ color: c, roughness: .5 })), stoolGeo = new THREE.CylinderGeometry(.16, .19, .3, 8), legGeo = new THREE.BoxGeometry(.05, .46, .05);
    const tx = Q.tea[0] - 5;
    [-2.8, 0, 2.8].forEach((dz, i) => {
      const tz = Q.tea[1] + dz;
      clickable(list, mesh(new THREE.BoxGeometry(.7, .05, .7), M.wood, tx, .48, tz, g), TEA);
      [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]].forEach(([a, b]) => part(legGeo, M.wood, tx + a, .24, tz + b, g));
      [[-.65, 0], [.65, 0], [0, -.65], [0, .65]].forEach(([a, b], k) => part(stoolGeo, stoolM[(i + k) % stoolM.length], tx + a, .15, tz + b, g));
      sRect(g, tx - .9, tx + .9, tz - .9, tz + .9);
      [[-.15, .08], [.18, -.1]].forEach(([a, b]) => mesh(new THREE.CylinderGeometry(.04, .035, .09, 8), std({ color: 0xf4f0e8, roughness: .3 }), tx + a, .55, tz + b, g));   // tea cups
    });
    // a kettle on a charcoal stove by the door
    mesh(new THREE.CylinderGeometry(.22, .18, .45, 10), std({ color: 0x5a5a58, roughness: .6, metalness: .3 }), Q.tea[0] - 4.3, .45, Q.tea[1] - 3.9, g);
    mesh(new THREE.SphereGeometry(.18, 10, 8), steel, Q.tea[0] - 4.3, .78, Q.tea[1] - 3.9, g);
    sCircle(g, Q.tea[0] - 4.3, Q.tea[1] - 3.9, .3);

    // the yards between and behind the houses: bananas, shade trees, washing lines
    [[101.5, 92], [102, 121.5], [101.8, 143.5], [102.2, 165.5], [130, 92.5], [130.5, 123.5], [130.2, 145.5], [130.5, 167.5], [104, 190]].forEach(([x, z], i) => banana(g, x, z, 4410 + i));
    [[101, 110.8], [130.5, 134.5], [102, 154.5], [131, 179], [107, 195.5], [124.5, 194.5]].forEach(([x, z], i) => tree(g, x, z, .7 + r() * .25, 4420 + i));
    const cloth = [0xc04040, 0x3a6aa8, 0xe8d060, 0xf0ece0, 0x6a4a8a].map(c => std({ color: c, roughness: .9, side: THREE.DoubleSide })), bamboo = std({ color: 0x9a8a50, roughness: .8 });
    [[110.6, 131], [121.4, 155], [110.6, 174.9]].forEach(([x, z], i) => {
      [z, z + 3].forEach(zz => { mesh(new THREE.CylinderGeometry(.04, .04, 1.9, 6), bamboo, x, .95, zz, g); sCircle(g, x, zz, .08); });
      mesh(new THREE.CylinderGeometry(.008, .008, 3, 4), steel, x, 1.8, z + 1.5, g).rotation.x = Math.PI / 2;
      for (let k = 0; k < 4; k++) { const ch = .6 + r() * .3, c = mesh(new THREE.PlaneGeometry(.55, ch), cloth[(i + k) % cloth.length], x, 1.79 - ch / 2, z + .4 + k * .7, g); c.rotation.y = Math.PI / 2; c.castShadow = false; }
    });
    // the quarter's well beside the lane, a round brick kerb under a post and beam with a pulley and a bucket
    const W0 = [120.6, 196.5];
    mesh(new THREE.CylinderGeometry(.75, .8, .8, 16, 1, true), whiteWall, W0[0], .4, W0[1], g).material.side = THREE.DoubleSide;
    flat(mesh(new THREE.CircleGeometry(.7, 16), std({ color: 0x1a2228, roughness: .2 }), W0[0], .5, W0[1], g)).rotation.x = -Math.PI / 2;
    sCircle(g, W0[0], W0[1], .85);
    [-1, 1].forEach(sd => mesh(new THREE.BoxGeometry(.12, 2, .12), teakPost, W0[0] + sd * .85, 1, W0[1], g));
    mesh(new THREE.BoxGeometry(1.9, .12, .12), teakPost, W0[0], 2, W0[1], g);
    mesh(new THREE.CylinderGeometry(.15, .15, .1, 10), steel, W0[0], 1.85, W0[1], g).rotation.x = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(.16, .12, .28, 10), steel, W0[0] + .4, .95, W0[1] + .55, g);

    // the ward administrator's office at the lane's south end, looking up the lane
    const WO = { tip: "Ward No. 4 office · အမှတ် (၄) ရပ်ကွက်", toast: "အမှတ် (၄) ရပ်ကွက် အုပ်ချုပ်ရေးမှူးရုံး: the ward administrator's office for Ward No. 4, the inner quarter behind the daily market. The ward administrator keeps the household lists, writes the letters of recommendation people need for an ID card, a job or a school, settles quarrels between neighbours, and calls the quarter out to clear the drains before the rains. It's only to look at." };
    const wo = civic(g, 116, 75, 0, { W: 9, D: 5.5, floors: 1, wall: WALLS[2], roof: ROOFS[0](3), corridor: 1.8, door: true, data: WO });
    clickable(list, civicSign(wo.h, "ရပ်ကွက်အုပ်ချုပ်ရေးမှူးရုံး", "Ward Administrator's Office", "#1e4a7a", "#ffffff", 3.4, 0, 2.95, 4.63), WO);
    flagPole(g, 110.4, 79.2, 6);

    // ဓမ္မာရုံ the dhamma hall at the lane's north end, looking down it: one big room, open for sermons and the quarter's gatherings
    const DH = { tip: "The dhamma hall · ဓမ္မာရုံ", toast: "The quarter's dhamma hall (ဓမ္မာရုံ). The neighbours built it together: on sabbath days they gather here to keep the precepts and listen to a monk invited from the monastery, the elders meet here, and at the end of Lent the whole ward cooks here for a merit-making feast. It's only to look at." };
    const dh = civic(g, 116, 206, Math.PI, { W: 13, D: 7.5, floors: 1, wall: civicCream, trim: civicRed, roof: ROOFS[1](2), corridor: 2.2, door: true, data: DH });
    clickable(list, civicSign(dh.h, "ဓမ္မာရုံ", "Dhamma Hall", "#8a2a1e", "#f8e6a8", 2.8, 0, 2.95, 6.03), DH);

    // the quarter's board at the lane's mouth on the market lane, on two steel posts, facing the passers-by on the market lane
    const BX = 44.6, BZ = 109.8;
    [-1, 1].forEach(sd => { mesh(new THREE.BoxGeometry(.1, 2.9, .1), steel, BX, 1.45, BZ + sd * 1, g); sCircle(g, BX, BZ + sd * 1, .1); });
    clickable(list, civicSign(g, "အမှတ် (၄) ရပ်ကွက်", "Ward No. 4", "#1e4a7a", "#ffffff", 2.4, BX - .06, 2.45, BZ, -Math.PI / 2), WO);
  }
