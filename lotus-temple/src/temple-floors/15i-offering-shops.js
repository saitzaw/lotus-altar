  /* ---------- ႁၢၼ်ႉၶူဝ်းလူႇ the offering shops on the stupa hill's lower terrace: a row of little Shan shops along the uphill side of
     the lit footpath, west of the main stair, where people coming to the stupa and the monasteries buy what they offer: flowers in
     tin buckets and strings of jasmine, sprigs of eugenia leaf, hands of bananas with a green coconut, sticky rice in banana leaf
     and popped rice, candles, incense, gold leaf, little paper umbrellas and flags, woven banners. Built like the festival market's
     shops (`shanStall`), facing out over the path, with a board on bamboo posts by the stair ---------- */
  // the row's radius round the hill's centre (the path runs at 66.2…67.8, the lamps at 68.3), the first shop's distance along the
  // row from the main stair (m, westward), the gap between shops; a shop's width, depth, floor and eave heights; the board's distance
  const OFFER_SHOPS = { r: 62.8, from: 8, gap: 1.4, n: 7, W: 4, D: 3.6, FY: .45, EH: 2.75, board: 4 };
  function offeringShops() {
    const O = OFFER_SHOPS, H = HILL.group, list = picks.pagoda, r = rng(7070), y0 = HILL.terraces[1].y;
    const K = stallKit(), { box, cyl, ball, bamboo } = K, W = O.W, D = O.D, FY = O.FY, EH = O.EH, CT = FY + .9, CZ = D / 2 - .25, BZ = -D / 2 + .25;
    const at = (a, rr) => [rr * Math.sin(a), -rr * Math.cos(a)];   // hill frame (x, z) at angle a, radius rr
    const pk = l => l[(r() * l.length) | 0];
    const P = new THREE.Group(); H.add(P);   // the static parts, baked
    const data = { tip: "The offering shops · ႁၢၼ်ႉၶူဝ်းလူႇ", toast: "Little Shan shops on the way to the stupa and the monasteries, where people buy what they offer: flowers by the bunch from tin buckets, strings of jasmine, sprigs of eugenia leaf for the vases, hands of bananas with a green coconut set on top, sticky rice in banana leaf and popped rice, candles, incense sticks, books of gold leaf to press onto the images, little paper umbrellas and flags, and long woven banners to hang in the shrine hall. Flowers, light and food are offered to the Buddha; food for the monks is offered in the morning." };
    // the goods, in a shop's frame: one flat-shaded mesh for the row
    const goods = [];
    const bunch = (p, x, y, z, c, n = 7, rad = .16) => { for (let i = 0; i < n; i++) { const t = i * 2.4, k = i ? 1 : 0; p.push([ball(.055 + r() * .02), c, x + Math.cos(t) * rad * k * (.5 + (i % 3) * .25), y + (i % 2) * .05, z + Math.sin(t) * rad * k * (.5 + (i % 3) * .25)]); } };
    const banana = (p, x, y, z, ripe) => { for (let i = 0; i < 6; i++) { const q = box(.05, .05, .2); q.rotateX(-.5); q.rotateY((i - 2.5) * .18); p.push([q, ripe ? 0xe8c83a : 0x8ab83a, x + (i - 2.5) * .055, y + .06, z]); } };
    const FLOWERS = [0xf0c020, 0xf4f2e8, 0xd8304a, 0xf08a1c, 0xe86aa0, 0x9a3ad0];
    const KINDS = {
      flowers: () => {   // tin buckets of cut flowers on the counter and on the ground before it, jasmine strings hung from the awning, eugenia sprigs on the shelf
        const p = [];
        [-1.35, -.45, .45, 1.35].forEach(x => { p.push([cyl(.16, .12, .3, 9), 0x9aa0a4, x, CT + .15, CZ]); const c = pk(FLOWERS); bunch(p, x, CT + .42, CZ, c, 9, .2); for (let i = 0; i < 4; i++) p.push([box(.02, .3, .02), 0x3a6a2a, x + (i - 1.5) * .06, CT + .32, CZ - .04]); });
        [-1.2, 0, 1.2].forEach(x => { p.push([cyl(.2, .15, .38, 9), 0x8a9094, x, .19, D / 2 + .35]); bunch(p, x, .5, D / 2 + .35, pk(FLOWERS), 10, .24); });
        for (let i = 0; i < 9; i++) { const x = -1.6 + i * .4; p.push([box(.016, .55, .016), i % 3 ? 0xf8f6ee : 0xf0c020, x, EH - .9, D / 2 + 1.2], [ball(.025), 0xd8304a, x, EH - 1.19, D / 2 + 1.2]); }
        [-1.2, -.4, .4, 1.2].forEach(x => { p.push([cyl(.08, .1, .22, 8), 0xc8b88a, x, FY + 1.13, BZ]); for (let i = 0; i < 5; i++) p.push([ball(.09, 1.6), 0x2f5a26, x + (i - 2) * .05, FY + 1.36 + (i % 2) * .06, BZ]); });
        return p;
      },
      bananas: () => {   // the banana-and-coconut offering, ready on trays; more hands hung from the awning; green coconuts heaped in a basket below
        const p = [];
        [-1.2, 0, 1.2].forEach(x => { p.push([cyl(.3, .26, .05, 10), 0xc8a868, x, CT + .025, CZ]); banana(p, x, CT + .02, CZ - .08, true); banana(p, x, CT + .02, CZ + .08, true); p.push([ball(.15, 1.1), 0x6a9a2a, x, CT + .3, CZ]); });
        for (let i = 0; i < 5; i++) { const x = -1.6 + i * .8; p.push([box(.02, .3, .02), 0x6a5a3a, x, EH - .75, D / 2 + 1.15]); for (let k = 0; k < 3; k++) banana(p, x, EH - 1.05 - k * .14, D / 2 + 1.15, k > 0); }
        p.push([cyl(.32, .26, .3, 10), 0xa88a52, 1.2, FY + .15, BZ + .4]);
        for (let i = 0; i < 6; i++) p.push([ball(.13, 1.1), 0x6a9a2a, 1.2 + Math.cos(i * 1.05) * .14 * (i ? 1 : 0), FY + .4 + (i ? 0 : .12), BZ + .4 + Math.sin(i * 1.05) * .14 * (i ? 1 : 0)]);
        [-1.2, -.4].forEach(x => { p.push([cyl(.08, .1, .22, 8), 0xc8b88a, x, FY + 1.13, BZ]); bunch(p, x, FY + 1.34, BZ, pk(FLOWERS), 6, .1); });
        return p;
      },
      rice: () => {   // sticky rice parcels in banana leaf, bags of popped rice, trays of rice cakes, a pot of steamed rice
        const p = [];
        [-1.3, -.45].forEach(x => { p.push([cyl(.32, .28, .05, 10), 0xc8a868, x, CT + .025, CZ]); for (let i = 0; i < 6; i++) p.push([box(.16, .08, .09), 0x4a7a2a, x + ((i % 3) - 1) * .18, CT + .09 + (i > 2 ? .08 : 0), CZ + (i > 2 ? 0 : .1) - .05]); });
        [.4, 1.2].forEach(x => { p.push([cyl(.32, .28, .05, 10), 0xc8a868, x, CT + .025, CZ]); const c = pk([0xf0e4c0, 0x5ab04a, 0xd84a7a, 0xe8b830]); for (let i = 0; i < 7; i++) p.push([box(.12, .06, .12), c, x + Math.cos(i) * .16 * (i ? 1 : 0), CT + .08, CZ + Math.sin(i) * .16 * (i ? 1 : 0)]); });
        for (let i = 0; i < 7; i++) p.push([ball(.13, 1.2), 0xf8f4ea, -1.5 + i * .5, FY + 1.18, BZ]);   // popped rice in clear bags
        p.push([cyl(.26, .22, .36, 10), 0x9a5a3a, -1.2, FY + .18, BZ + .45], [cyl(.27, .27, .08, 10), 0xb8bcc0, -1.2, FY + .4, BZ + .45]);
        return p;
      },
      candles: () => {   // bundles of white candles, incense sticks in red paper, books of gold leaf, a stand of little paper umbrellas and flags, woven banners on the wall
        const p = [];
        [-1.4, -.9].forEach(x => { for (let i = 0; i < 9; i++) p.push([cyl(.018, .018, .26, 5), 0xf8f6ee, x + (i % 3 - 1) * .045, CT + .13, CZ + ((i / 3 | 0) - 1) * .045]); p.push([box(.16, .04, .16), 0xd8302a, x, CT + .12, CZ]); });
        [-.3, .1].forEach(x => { for (let i = 0; i < 12; i++) p.push([box(.012, .34, .012), 0x6a3a1a, x + (i % 4 - 1.5) * .025, CT + .17, CZ + ((i / 4 | 0) - 1) * .025]); p.push([box(.12, .08, .1), 0xc8302a, x, CT + .08, CZ]); });
        for (let i = 0; i < 4; i++) p.push([box(.14, .02, .1), 0xe8c040, .65 + (i % 2) * .18, CT + .01 + (i / 2 | 0) * .02, CZ]);
        p.push([cyl(.07, .07, .4), 0xc8a868, 1.35, CT + .2, CZ]);
        for (let i = 0; i < 6; i++) { const t = i * 1.05, x = 1.35 + Math.cos(t) * .07, z = CZ + Math.sin(t) * .07, h = .45 + (i % 2) * .15; p.push([box(.012, h, .012), 0xc8a868, x, CT + .4 + h / 2 - .2, z]); p.push(i % 2 ? [new THREE.ConeGeometry(.12, .07, 8), pk([0xf8f6ee, 0xe8c040]), x, CT + .42 + h - .2, z] : [box(.12, .08, .01), pk([0xd8282a, 0xf4c430, 0x2a8ac0, 0xf8f6ee]), x + .06, CT + .36 + h - .2, z]); }
        for (let i = 0; i < 5; i++) { const x = -1.4 + i * .7, c = pk([0xc8302a, 0xe8c040, 0x2a7a5a, 0xf8f6ee, 0x2a4a9a]); p.push([box(.2, 1.1, .02), c, x, FY + 1.35, -D / 2 + .1]); for (let k = 0; k < 4; k++) p.push([box(.21, .03, .025), 0xf0ece0, x, FY + .95 + k * .25, -D / 2 + .1]); }
        return p;
      }
    };
    const ORDER = ["flowers", "bananas", "flowers", "candles", "rice", "flowers", "bananas"];
    for (let i = 0; i < O.n; i++) {
      const a = -(O.from + i * (W + O.gap)) / O.r, [x, z] = at(a, O.r), kind = ORDER[i % ORDER.length];
      const S = new THREE.Group(); S.position.set(x, y0, z); S.rotation.y = Math.PI - a; P.add(S);   // facing out down the hill, over the path
      shanStall(S, { W, D, FY, EH, n: i + 1, r, data, front: kind === "flowers" ? .6 : .1, lamp: (i % 2 ? -1 : 1) * .9 });
      stallGoods(goods, S, KINDS[kind]());
    }
    const gm = mesh(lowPoly(goods), std({ vertexColors: true, flatShading: true, roughness: .8 }), 0, 0, 0, H); gm.castShadow = false; gm.receiveShadow = true;
    clickable(list, gm, data);
    // the board by the stair: the row's name in Shan and English on red lacquer, on two bamboo posts beside the path, facing it
    {
      const a = -O.board / (O.r + 1.6), [x, z] = at(a, O.r + 1.6), B = new THREE.Group(); B.position.set(x, y0, z); B.rotation.y = Math.PI - a; H.add(B);
      const BW = 2.6, BH = BW * 300 / 1024, face = shanBoardFace("ႁၢၼ်ႉၶူဝ်းလူႇ", "Offering Shops");
      [-1, 1].forEach(sd => { mesh(cyl(.07, .08, 2.9), bamboo, sd * (BW / 2 + .05), 1.45, 0, B); sCircle(B, sd * (BW / 2 + .05), 0, .12); mesh(K.G.fin, M.gold, sd * (BW / 2 + .05), 3.1, 0, B); });
      clickable(list, mesh(new THREE.BoxGeometry(BW, BH, .07), [M.lacquer, M.lacquer, M.lacquer, M.lacquer, face, face], 0, 2.45, 0, B), data);
    }
    bakeParts(P);
  }
