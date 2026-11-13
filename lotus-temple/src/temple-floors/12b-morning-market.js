  /* ---------- the morning market at the seven-day market, 5 to 9 am on the temple's clock (FOLK.morning): before the stalls open,
     village women walk in from the hills and sit on the ground in two rows along a lane of red earth, their goods spread in front of
     them on plastic sheets, banana leaves and sacks: bundles of greens and mustard leaves, spring onions and bean sprouts in plastic
     bags, avocados and limes, baskets of red chillies, sacks of beans, rice and peanuts, knobs of ginger and long stalks of lemongrass.
     They wear long-sleeved cardigans and checked shirts over the longyi, towels wrapped round the head or wide straw hats, thanaka on
     the cheeks; a few sit on low plastic stools. Shoppers with woven bags walk between the rows. Hurricane lamps burn till it's light.
     Everyone is one flat-shaded mesh per row, shown only in the morning; nothing blocks the way, since the sellers aren't there all day ---------- */
  function morningMarket(g) {
    const list = picks.pagoda, r = rng(5090), pk = l => l[(r() * l.length) | 0], folkM = std({ vertexColors: true, flatShading: true, roughness: .85 });
    onDaylight(d => folkM.emissive.copy(lerpC(0x1c1814, 0x000000, d)));   // a little lift in the half-dark before sunrise
    const LX = 78, Z0 = -10.5, Z1 = 12.5, GAP = 2.3;   // the lane runs north–south across the open ground behind the stalls; sellers sit GAP either side
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n);
    const ball = (rad, sy = 1) => { const q = new THREE.IcosahedronGeometry(rad, 0); q.scale(1, sy, 1); return q; };
    // turn and move a list of parts [geo, colour, x, y, z, ry, rx, rz] into finished parts for lowPoly, placed by m4
    // lowPoly takes the colours as linear, which renders them pale; these are written as on a photo, so turn them linear first
    const solid = geo => { const c = geo.attributes.color; for (let i = 0; i < c.array.length; i++) c.array[i] = Math.pow(c.array[i], 2.2); return geo; };
    const fix = (p, m4) => p.map(([geo, col, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0]) => { const q = geo.index ? geo.toNonIndexed() : geo.clone(); if (rz) q.rotateZ(rz); if (rx) q.rotateX(rx); if (ry) q.rotateY(ry); q.translate(x, y, z); if (m4) q.applyMatrix4(m4); return [q, col, 0, 0, 0]; });
    const at = (x, z, ry, s = 1) => new THREE.Matrix4().compose(V(x, .07, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ry), V(s, s, s));
    const SKIN = [0xd8a47a, 0xc89068, 0xe0b088, 0xb88058], HAIR = 0x1c1614, GREY = 0xcfccc6, INK = 0x2a1c18, THANAKA = 0xf0e2b4;
    // what they wear on a cold hill morning: knitted cardigans, checked flannel shirts, a maroon or purple top; the longyi in purple,
    // maroon, dark checks; a towel round the head (blue check, orange, pink, cream) or a wide straw hat
    const TOP = [0x2f5a3a, 0x3a6a4a, 0x7a2a3a, 0x8a3a6a, 0x5a3a6a, 0x2a3a5a, 0xa83a3a, 0x4a4a50], CHECK = [0x3a4a8a, 0xe8e0d0, 0x1a1a22, 0xc8382a];
    const LONGYI = [0x5a2a5a, 0x7a2032, 0x3a2a4a, 0x2a2a3a, 0x8a2a4a, 0x4a3a5a], TOWEL = [0x4a9ac0, 0xe8822a, 0xe88aa0, 0xf0ece0, 0xd84a2a];
    const STRAW = 0xd8b878, STOOL = [0x2a7ac8, 0x3a9a5a, 0xd83a3a];
    // a head facing +z, centred at height y: thanaka on the cheeks, the hair under a towel turban, a straw hat, or in a bun
    const head = (y, o) => {
      const p = [[box(.24, .26, .24), o.skin, 0, y, 0], [box(.03, .06, .05), o.skin, -.13, y, 0], [box(.03, .06, .05), o.skin, .13, y, 0],
        [box(.035, .04, .012), INK, -.055, y + .015, .122], [box(.035, .04, .012), INK, .055, y + .015, .122], [box(.06, .012, .01), 0x8a3a30, 0, y - .07, .121],
        [box(.26, .22, .07), o.hair, 0, y, -.1]];
      if (o.thanaka) [-1, 1].forEach(e => p.push([box(.065, .075, .012), THANAKA, e * .072, y - .035, .121]));
      if (o.hat === "towel") p.push([box(.29, .13, .28), o.towel, 0, y + .16, 0], [box(.12, .07, .08), o.towel, .06, y + .24, .06], [box(.08, .12, .05), o.towel, -.12, y + .08, -.13]);
      else if (o.hat === "straw") p.push([new THREE.ConeGeometry(.44, .13, 12), STRAW, 0, y + .19, 0], [box(.27, .12, .26), STRAW, 0, y + .17, 0], [box(.28, .025, .27), 0x8a2a2a, 0, y + .11, 0]);
      else p.push([box(.26, .08, .26), o.hair, 0, y + .14, -.005], [ball(.075), o.hair, 0, y + .06, -.17]);
      return p;
    };
    // the upper body from the waist at height w: the top (a checked shirt gets its stripes), arms resting forward on the knees,
    // or hanging at the sides with a woven bag in one hand
    const chest = (w, o, pose) => {
      const p = [[box(.36, .46, .22), o.top, 0, w + .25, 0], [box(.07, .06, .07), o.skin, 0, w + .51, 0], [box(.2, .04, .2), o.top, 0, w + .49, 0]];
      if (o.check) { [.08, .2, .32, .42].forEach(dy => p.push([box(.365, .03, .225), o.check, 0, w + dy, 0])); [-.1, .1].forEach(dx => p.push([box(.03, .44, .225), o.check, dx, w + .25, 0])); }
      if (pose === "sit") [-1, 1].forEach(e => p.push([box(.09, .26, .1), o.top, e * .21, w + .34, 0], [box(.08, .08, .28), o.top, e * .16, w + .2, .14], [box(.07, .06, .08), o.skin, e * .14, w + .19, .3]));
      else {
        [-1, 1].forEach(e => p.push([box(.09, .44, .1), o.top, e * .21, w + .22, 0], [box(.07, .08, .08), o.skin, e * .21, w - .04, 0]));
        if (o.bag) p.push([box(.3, .3, .16), o.bag[0], .3, w - .2, .02], ...[-.08, .08].map(dy => [box(.305, .04, .165), o.bag[1], .3, w - .2 + dy, .02]), [box(.03, .2, .03), o.bag[1], .3, w + .02, .02]);   // the woven bag, its handle
      }
      return p;
    };
    // a seller on the ground, facing +z: legs folded under the longyi, feet showing, or on a low plastic stool
    const seller = o => {
      const p = [];
      if (o.stool) {
        p.push([box(.32, .22, .32), o.stool, 0, .11, -.05], [box(.36, .12, .44), o.longyi, 0, .28, .07], [box(.34, .26, .14), o.longyi, 0, .13, .28]);
        [-1, 1].forEach(e => p.push([box(.1, .04, .18), 0x3a2a22, e * .09, .02, .34]));
        return p.concat(chest(.32, o, "sit"), head(1.0, o));
      }
      p.push([box(.54, .16, .46), o.longyi, 0, .08, .08], [box(.38, .14, .26), o.longyi, 0, .21, -.03]);
      [-1, 1].forEach(e => p.push([box(.1, .05, .17), o.skin, e * .2, .025, .3]));
      return p.concat(chest(.24, o, "sit"), head(.92, o));
    };
    // a shopper standing, facing +z, the longyi to the ankle
    const shopper = o => [[box(.36, .82, .24), o.longyi, 0, .41, 0], ...[-1, 1].map(e => [box(.11, .04, .2), 0x3a2a22, e * .08, .02, .04])].concat(chest(.82, o, "stand"), head(1.5, o));
    const person = () => {
      const hat = r(), towel = pk(TOWEL), old = r() < .3;
      return { skin: pk(SKIN), hair: old ? GREY : HAIR, top: pk(TOP), check: r() < .3 ? pk(CHECK) : 0, longyi: pk(LONGYI), thanaka: r() < .7,
               hat: hat < .45 ? "towel" : hat < .7 ? "straw" : "", towel, stool: r() < .25 ? pk(STOOL) : 0 };
    };
    // goods on the spread in front of a seller (local z .45 … 1.45, x −.75 … .75), by kind
    const GREEN = [0x3f8a2a, 0x5aa03a, 0x2f6a24, 0x6ab84a], SACK = [0xf0ece0, 0xe88aa0, 0x6a9ad8, 0xd8e8c0];
    const GRAIN = [0xa0281e, 0xe8dcb0, 0xc89a5a, 0x6a4a2a, 0xd8b830, 0x8a3a2a];
    const BASKET = 0xb89a5a, LEAF = 0x4f8a3a;
    const GOODS = {
      greens: (x, z) => { const p = []; for (let i = 0; i < 4; i++) { const c = pk(GREEN), ry = (r() - .5) * .3; p.push([box(.18, .08 + r() * .04, .4), c, x + i * .2 - .3, .07, z, ry], [box(.15, .06, .12), 0xd8e8b0, x + i * .2 - .3, .05, z - .24, ry]); } return p; },
      onions: (x, z) => { const p = []; for (let i = 0; i < 3; i++) p.push([cyl(.06, .07, .3, 6), 0xf2f0e2, x + i * .17 - .17, .07, z - .12, 0, Math.PI / 2], [cyl(.07, .03, .32, 6), 0x5aa03a, x + i * .17 - .17, .07, z + .18, 0, Math.PI / 2]); return p; },
      sprouts: (x, z) => { const p = []; for (let i = 0; i < 4; i++) p.push([ball(.1, .85), 0xefece0, x + (i % 2) * .22 - .11, .09, z + (i >> 1) * .22 - .11], [box(.04, .06, .04), 0xe8e4d8, x + (i % 2) * .22 - .11, .19, z + (i >> 1) * .22 - .11]); return p; },
      avocados: (x, z) => { const p = [], c = r() < .5 ? 0x3a2a3a : 0x4a6a2a; for (let i = 0; i < 7; i++) p.push([ball(.07, 1.3), c, x + ((i % 4) - 1.5) * .14, i < 4 ? .08 : .2, z + (i < 4 ? 0 : .02) + (r() - .5) * .1]); return p; },
      limes: (x, z) => { const p = [[cyl(.25, .2, .1, 10), BASKET, x, .05, z]]; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, d = i ? .13 : 0; p.push([ball(.05), 0xd8d040, x + Math.cos(a) * d, .13 + (i ? 0 : .04), z + Math.sin(a) * d]); } return p; },
      chillies: (x, z) => [[cyl(.25, .21, .16, 10), BASKET, x, .08, z], [cyl(.23, .23, .04, 10), pk([0xb8241c, 0xc8301a, 0x8a1a14]), x, .17, z], [cyl(.25, .21, .16, 10), BASKET, x + .5, .08, z + .1], [cyl(.23, .23, .04, 10), pk(GRAIN), x + .5, .17, z + .1]],
      sacks: (x, z) => [-.25, .25].flatMap(dx => [[cyl(.2, .21, .3, 9), pk(SACK), x + dx, .15, z], [cyl(.18, .18, .03, 9), pk(GRAIN), x + dx, .31, z], [box(.42, .05, .1), pk(SACK), x + dx, .29, z + .2]]),
      ginger: (x, z) => { const p = []; for (let i = 0; i < 8; i++) p.push([ball(.07, .6), 0xc8a070, x + (r() - .5) * .45, .05 + (i > 5 ? .06 : 0), z + (r() - .5) * .3]); return p; },
      lemongrass: (x, z) => { const p = []; for (let i = 0; i < 3; i++) p.push([box(.1, .07, .9), 0xa8c070, x - .1 + i * .11, .05 + (i === 1 ? .05 : 0), z, .1 * (i - 1)], [box(.11, .075, .08), 0xd84a6a, x - .1 + i * .11, .05 + (i === 1 ? .05 : 0), z - .1]); return p; }
    };
    const KINDS = Object.keys(GOODS);
    const spread = () => pk([0xc8c4b8, LEAF, 0xd8cfb0, 0x9ab0c8]);
    // the hurricane lamps: one beside every third seller, a glow that fades once it is light
    const lamps = [], lampM = std({ color: 0x2a2a2e, roughness: .5, metalness: .4 });
    const groups = [-1, 1].map(side => {
      const parts = [];
      let n = 0;
      for (let z = Z0 + (side > 0 ? .9 : 0); z <= Z1; z += 2.1 + r() * .4, n++) {
        const x = LX + side * GAP, ry = -side * Math.PI / 2 + (r() - .5) * .3, m4 = at(x, z, ry), o = person();
        parts.push(...fix(seller(o), m4));
        parts.push(...fix([[box(1.6, .02, 1.1), spread(), 0, .01, .95]], m4));
        const k1 = pk(KINDS); let k2 = pk(KINDS); if (k2 === k1) k2 = KINDS[(KINDS.indexOf(k1) + 1) % KINDS.length];
        parts.push(...fix(GOODS[k1](-.35, .95), m4), ...fix(GOODS[k2](.38, .95), m4));
        if (r() < .5) parts.push(...fix([[box(.3, .3, .2), pk(TOP), -.45, .15, -.1], ...[-.08, .08].map(dy => [box(.305, .04, .205), pk(CHECK), -.45, .15 + dy, -.1])], m4));   // her woven basket bag
        if (n % 3 === 1) {
          parts.push(...fix([[cyl(.06, .07, .05, 8), 0x2a2a2e, .55, .03, -.15], [cyl(.05, .05, .14, 8), 0xf0e8d0, .55, .12, -.15], [cyl(.06, .06, .03, 8), 0x2a2a2e, .55, .2, -.15]], m4));
          const p = V(.55, .13, -.15).applyMatrix4(m4), b = glowSprite(0xffd890, .7, .9); b.material.fog = false; b.position.copy(p); g.add(b); lamps.push(b);
        }
        if (r() < .12) parts.push(...fix([[cyl(.025, .025, 2.2, 6), 0x5a5e62, -.6, 1.1, -.3], [new THREE.ConeGeometry(1.3, .45, 10), pk([0xe0702a, 0x2a6ac0, 0xe8c030]), -.6, 2.3, -.3]], m4));   // a big sun umbrella
      }
      const mesh_ = new THREE.Mesh(solid(lowPoly(parts)), folkM);
      mesh_.castShadow = true; mesh_.receiveShadow = true; g.add(mesh_);
      return mesh_;
    });
    // shoppers walking down the lane with their woven bags, stopping at a seller's goods
    const shop = [];
    for (let i = 0; i < 7; i++) {
      const o = person(), side = i % 2 ? 1 : -1, z = Z0 + 1.5 + i * (Z1 - Z0 - 3) / 6 + (r() - .5);
      o.bag = [pk([0xd8483a, 0x2a6ac0, 0x3a9a5a, 0xe8c030]), pk(CHECK)]; o.thanaka = r() < .5;
      shop.push(...fix(shopper(o), at(LX + side * .45, z, side * Math.PI / 2 + (r() < .3 ? Math.PI : 0) + (r() - .5) * .4, .95 + r() * .1)));
    }
    groups.push(new THREE.Mesh(solid(lowPoly(shop)), folkM));
    g.add(groups[2]);
    const mdata = { tip: "The morning market", toast: "The morning market, five to nine. Before the stalls open, women from the villages in the hills sit on the ground along the red earth lane with what they grew and picked: mustard greens, spring onions, bean sprouts in plastic bags, avocados, limes, chillies and beans by the basket, ginger and lemongrass. Most wear a towel wrapped round the head against the morning cold, or a wide straw hat, and thanaka on their cheeks. By nine they have sold out and walk home." };
    groups.forEach(m => { clickable(list, m, mdata); m.raycast = function (ray, out) { if (m.visible) THREE.Mesh.prototype.raycast.call(this, ray, out); }; m.visible = false; });
    // the lane of red earth, packed hard by the sellers' feet
    const lane = std({ color: 0x6a2e18, roughness: 1 });
    onDaylight(d => lane.color.copy(lerpC(0x2a1610, 0x6a2e18, d)));
    flat(mesh(new THREE.PlaneGeometry(3.4, Z1 - Z0 + 3), lane, LX, .065, (Z0 + Z1) / 2, g)).rotation.x = -Math.PI / 2;
    let dark = 1;
    onDaylight(d => { dark = 1 - d; });
    let was = null;
    updaters.pagoda.push(() => {
      const on = FOLK.morning;
      if (on !== was) { was = on; groups.forEach(m => m.visible = on); }
      lamps.forEach(b => { b.visible = on && dark > .05; b.material.opacity = .9 * dark; });
    });
  }
