  /* ---------- the Sunday morning service in the Kachin Baptist church: the congregation in the pews, elders, young people and
     families, heads bowed while the pastor prays at the pulpit; the choir standing on the dais in red and black with their hymn books,
     the pianist at the grand piano. The women wear the Kachin dress, a black jacket studded with silver bosses over a red woven
     skirt banded in black, yellow and green; the men dark suits and coats or dark patterned shirts, a red woven shoulder bag beside
     them on the pew. Everyone is one flat-shaded mesh, shown only while the service is on (FOLK.service) ---------- */
  function churchService(g, list, DY) {
    const r = rng(5150), pk = l => l[(r() * l.length) | 0], box = (w, h, d) => new THREE.BoxGeometry(w, h, d), all = [];
    const SKIN = [0xe8b890, 0xd8a47a, 0xc89068, 0xe0b088], HAIR = 0x1c1614, GREY = 0xcfccc6, INK = 0x2a1c18;
    const VELVET = 0x0a090b, SILVER = 0xdfe3e8, SKIRT = [0xa81c26, 0x9a1a22, 0xb42430], BANDS = [VELVET, 0xe8b830, 0x2a6a3a];
    const COAT = [0x0c0d11, 0x121115, 0x0a0b0e, 0x18181c, 0x10121a], TROUSERS = [0x0c0c10, 0x121216, 0x10121a], BAG = [0xa81c24, 0x8a1820, 0xb83030];
    const KID = [0xe8e4da, 0x2a6ac8, 0xd83a3a, 0x3a8a5a, 0xe88aa0];
    // turn and move a list of parts [geo, colour, x, y, z, ry, rx] into finished parts; bend() tips them forward about (py, pz)
    const fix = (p, m4) => p.map(([geo, col, x = 0, y = 0, z = 0, ry = 0, rx = 0]) => { const q = geo.clone(); if (rx) q.rotateX(rx); if (ry) q.rotateY(ry); q.translate(x, y, z); if (m4) q.applyMatrix4(m4); return [q, col, 0, 0, 0]; });
    const bend = (p, py, pz, a) => fix(p).map(([q, col]) => { q.translate(0, -py, -pz); q.rotateX(a); q.translate(0, py, pz); return [q, col, 0, 0, 0]; });
    const at = (x, y, z, ry, s = 1) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(s, s, s));
    // a head facing +z at height y, eyes closed in prayer (or open), hair short, long or in a bun, grey for the elders
    const head = (y, o) => {
      const hair = o.old ? GREY : HAIR, p = [[box(.24, .26, .24), o.skin, 0, y, 0], [box(.26, .08, .26), hair, 0, y + .14, -.005], [box(.26, .24, .07), hair, 0, y + .02, -.1], [box(.06, .012, .01), 0x8a3a30, 0, y - .07, .121]];
      [-1, 1].forEach(e => p.push(o.pray ? [box(.055, .012, .01), INK, e * .055, y + .01, .121] : [box(.035, .045, .012), INK, e * .055, y + .015, .122]));
      if (o.woman) p.push(o.old ? [box(.13, .11, .11), hair, 0, y + .06, -.17] : [box(.24, .3, .05), hair, 0, y - .04, -.125]);
      if (o.band) p.push([box(.27, .06, .27), SKIRT[0], 0, y + .09, 0]);   // a red woven headband
      if (o.glasses) p.push([box(.2, .03, .01), INK, 0, y + .015, .124]);
      return p;
    };
    // the upper body, standing or seated, from the waist at height w: the Kachin woman's black jacket with rows of silver bosses
    // and a silver neck ring; the man's coat over a white shirt and tie, or his dark shirt banded in red and yellow
    const chest = (w, o, arms) => {
      const top = o.woman ? VELVET : o.coat, p = [[box(.36, .5, .22), top, 0, w + .25, 0], [box(.07, .06, .07), o.skin, 0, w + .53, 0]];
      if (o.woman) {
        [[.44, 6], [.37, 5], [.3, 4]].forEach(([dy, k]) => { for (let i = 0; i < k; i++) p.push([box(.045, .045, .02), SILVER, (i - (k - 1) / 2) * .055, w + dy, .115]); });
        [-1, 1].forEach(e => { p.push([box(.1, .03, .18), SILVER, e * .14, w + .505, -.01]); for (let i = 0; i < 3; i++) p.push([box(.02, .05, .02), SILVER, e * (.07 + i * .035), w + .23, .115]); });   // the shoulders, the hanging tassels
        p.push([box(.17, .03, .17), SILVER, 0, w + .51, 0]);
      } else if (o.suit) p.push([box(.1, .22, .01), 0xf2f0ea, 0, w + .38, .111], [box(.035, .2, .012), o.tie, 0, w + .37, .115]);
      else [.18, .28, .38].forEach((dy, i) => p.push([box(.365, .025, .225), i % 2 ? 0xe8b830 : 0xa81c24, 0, w + dy, 0]));
      const sleeve = o.woman ? VELVET : o.coat;
      return p.concat(arms(sleeve));
    };
    // arms: hands together in prayer, on the keys, holding a hymn book, or resting on the pulpit
    const ARMS = {
      pray: (w, o) => c => [[box(.09, .28, .1), c, -.21, w + .3, -.03], [box(.09, .28, .1), c, .21, w + .3, -.03], [box(.08, .08, .22), c, -.13, w + .18, .07, .6], [box(.08, .08, .22), c, .13, w + .18, .07, -.6], [box(.08, .14, .07), o.skin, 0, w + .25, .17]],
      keys: (w, o) => c => [[box(.09, .26, .1), c, -.21, w + .31, -.02], [box(.09, .26, .1), c, .21, w + .31, -.02], [box(.08, .08, .3), c, -.18, w + .18, .14], [box(.08, .08, .3), c, .18, w + .18, .14], [box(.07, .04, .1), o.skin, -.17, w + .17, .33], [box(.07, .04, .1), o.skin, .17, w + .17, .33]],
      book: (w, o) => c => [[box(.09, .28, .1), c, -.21, w + .3, -.02], [box(.09, .28, .1), c, .21, w + .3, -.02], [box(.08, .08, .24), c, -.14, w + .19, .1, .3], [box(.08, .08, .24), c, .14, w + .19, .1, -.3],
        [box(.26, .03, .19), 0x1a1a1e, 0, w + .25, .25, 0, -.6], [box(.24, .02, .17), 0xf4f0e4, 0, w + .27, .24, 0, -.6]],
      pulpit: (w, o) => c => [[box(.09, .3, .1), c, -.22, w + .3, .02], [box(.09, .3, .1), c, .22, w + .3, .02], [box(.08, .08, .3), c, -.22, w + .16, .17], [box(.08, .08, .3), c, .22, w + .16, .17], [box(.08, .05, .1), o.skin, -.22, w + .16, .34], [box(.08, .05, .1), o.skin, .22, w + .16, .34]]
    };
    // the skirt's woven bands round a box at height y
    const bands = (w, d, x, ys, z) => ys.map((y, i) => [box(w, .035, d), BANDS[i % 3], x, y, z]);
    // someone seated, facing +z, on a seat whose top is at .49: legs, a skirt or trousers, the body bowed a little and the head more;
    // a man's red woven bag on the seat beside him
    const seated = (o, arms, bowBody, bowHead) => {
      const lower = o.woman ? o.skirt : o.trousers, p = [];
      if (o.woman) p.push([box(.36, .14, .46), lower, 0, .56, .03], [box(.34, .46, .15), lower, 0, .28, .24], ...bands(.35, .155, 0, [.08, .14, .2, .4], .24), ...bands(.365, .1, 0, [.6], .2));
      else [-1, 1].forEach(e => p.push([box(.15, .14, .46), lower, e * .09, .56, .03], [box(.12, .46, .13), lower, e * .09, .28, .24]));
      [-1, 1].forEach(e => p.push([box(.11, .06, .2), 0x1e1814, e * .09, .03, .3]));
      if (o.bag) p.push([box(.2, .22, .06), o.bag, .35, .62, -.05], [box(.205, .04, .065), VELVET, .35, .6, -.05], [box(.2, .07, .065), 0xf0ece0, .35, .48, -.05], [box(.03, .3, .03), o.bag, .35, .86, -.07]);   // the bag and its fringe, the strap leaning on the pew back
      const upper = bend(chest(.55, o, ARMS[arms](.55, o)).concat(bend(head(1.24, o), 1.07, 0, bowHead)), .55, -.08, bowBody);
      return fix(p).concat(upper);
    };
    // someone standing, facing +z: the Kachin woman's skirt to the ankle, or a man's trousers
    const standing = (o, arms, bowHead) => {
      const p = [];
      if (o.woman) p.push([box(.36, .82, .24), o.skirt, 0, .41, 0], ...bands(.365, .245, 0, [.08, .16, .24, .5, .7], 0));
      else [-1, 1].forEach(e => p.push([box(.13, .82, .14), o.trousers, e * .09, .41, 0]));
      [-1, 1].forEach(e => p.push([box(.12, .05, .22), 0x1e1814, e * .09, .025, .04]));
      if (o.sash) p.push([box(.2, .22, .06), o.sash, .23, .9, .06], [box(.2, .06, .065), 0xf0ece0, .23, .76, .06]);   // the red woven bag slung across the body, its fringe
      const strap = o.sash ? fix([[box(.05, .62, .025), o.sash, 0, 0, 0]]).map(([q, c]) => { q.rotateZ(.55); q.translate(0, 1.1, .118); return [q, c, 0, 0, 0]; }) : [];
      return fix(p).concat(strap, fix(chest(.82, o, ARMS[arms](.82, o))), bend(head(1.52, o), 1.35, 0, bowHead));
    };
    const person = (kind, old) => {
      const woman = kind === "woman" || kind === "girl", child = kind === "girl" || kind === "boy";
      return { woman, child, old, pray: true, skin: pk(SKIN), skirt: pk(SKIRT), trousers: pk(TROUSERS), coat: child && !woman ? pk(KID) : pk(COAT), suit: !woman && !child && r() < .55, tie: pk([0x8a1a22, 0x2a2e48, 0x3a3a3a]),
               band: woman && !old && r() < .3, glasses: old && r() < .5, bag: !woman && !child && r() < .7 ? pk(BAG) : 0 };
    };
    // the congregation: seats along each pew, most taken, children among the families
    CHURCH.banks.forEach(([x0, x1], b) => CHURCH.rows.forEach((z, ri) => {
      for (let i = 0; i < 7; i++) {
        if (r() > (ri === CHURCH.rows.length - 1 ? .45 : .78)) continue;
        const roll = r(), kind = roll < .42 ? "woman" : roll < .8 ? "man" : roll < .9 ? "girl" : "boy", child = kind === "girl" || kind === "boy", o = person(kind, !child && r() < .25);
        const s = child ? .72 + r() * .1 : .97 + r() * .08, x = x0 + .4 + i * .68 + (r() - .5) * .06;
        all.push(...fix(seated(o, "pray", o.old ? .22 : .1 + r() * .06, .4 + r() * .15), at(x, .49 * (1 - s), z + .02, Math.PI + (r() - .5) * .08, s)));
      }
    }));
    // the pastor behind the pulpit, in a dark suit, praying with his hands on it
    all.push(...fix(standing({ woman: false, skin: SKIN[1], trousers: 0x0c0c10, coat: 0x0a0b0e, suit: true, tie: 0x8a1a22, pray: true, glasses: true }, "pulpit", .35), at(0, DY, -4.05, 0)));
    // the choir on the dais's right, two rows standing in front of their chairs, the women in the Kachin dress and the men in black
    // with the red bag across the body, hymn books in their hands
    [[-3.05, [2.0, 2.6, 3.2, 3.8, 4.4]], [-3.45, [2.3, 2.9, 3.5, 4.1]]].forEach(([z, xs], row) => xs.forEach((x, i) => {
      const woman = row === 0 ? i % 2 === 0 : i % 2 === 1, o = { woman, pray: true, skin: pk(SKIN), skirt: SKIRT[0], trousers: 0x141418, coat: VELVET, suit: false, sash: woman ? 0 : BAG[0], band: woman };
      all.push(...fix(standing(o, "book", .3), at(x, DY, z, -.35 + (r() - .5) * .06)));
    }));
    // the pianist on the bench at the grand piano, facing the wall, in the Kachin dress
    const pianist = { woman: true, pray: false, skin: SKIN[0], skirt: SKIRT[1], band: false };
    all.push(...fix(seated(pianist, "keys", .05, .15), at(PIANO.x + PIANO.bench, DY + .04, PIANO.z, -Math.PI / 2)));
    const M_ = std({ vertexColors: true, flatShading: true, roughness: .85 }), folk = new THREE.Mesh(lowPoly(all), M_);
    folk.castShadow = true; folk.receiveShadow = true; g.add(folk);
    clickable(list, folk, { tip: "The Sunday service", toast: "The Sunday morning service. The pastor leads the prayer in Jinghpaw and the congregation bows their heads; then the choir stands to sing, the hymns in four parts as the American missionaries taught them more than a century ago, and the piano keeps the time. Many of the women wear the Kachin dress for church, the black jacket studded with silver over the red woven skirt; the men come in suits and coats, the red woven shoulder bag beside them." });
    folk.raycast = function (ray, out) { if (folk.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); };
    return () => { folk.visible = FOLK.service; };
  }
