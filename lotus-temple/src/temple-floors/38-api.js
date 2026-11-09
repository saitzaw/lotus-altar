  /* ---------- what the main script calls ---------- */
  return {
    show(mode) {
      if (backdrop) { backdrop = 0; Object.values(groups).forEach(gr => { if (gr.userData.vista) gr.userData.vista.visible = true; }); if (pagoda) pagoda.position.y = 0; }
      if (mode === "pagoda") pagoda = pagoda || buildPagoda();
      else if (mode !== 1) floor(mode);
      doors.forEach(h => h.rotation.y = 0);
      Object.entries(groups).forEach(([k, g]) => g.visible = k === String(mode));
      if (pagoda) pagoda.visible = mode === "pagoda";
    },
    clickables(mode) { return mode === "pagoda" && CULL.on ? (picks.pagoda || []).filter(shown) : picks[mode] || []; },
    cull,
    set culling(on) { CULL.on = on; if (!on) CULL.cells.forEach(c => { c.vis = true; c.items.forEach(it => it.o.visible = true); }); },
    get fourTop() { return fourTop; },
    get market() { return MARKET; },
    groundAt, terrainAt, walkAt, get monasteries() { return MONASTERIES; },
    // where the world makes its sounds, in the grounds' frame (the main script's ambience fades each in by distance):
    // the hti bells on the stupa hill's spires, the Bell Tower, the gong in the Lotus Temple hall, the compound's walls
    // [x0, x1, z0, z1], the festival stage, the old banyan, the paddies [x0, x1, z0, z1], the forest's edge, the waterfall's foot
    sounds: { stupa: [HILL.cx, HILL.top + 8, HILL.cz], bell: [-17, -1.5], gong: [24.5, 26], compound: [-33, 33, -16, 43],
              stage: STAGE, banyan: [36.4, 65.4], fields: [-104, 64, -94, -42], forestZ: -98, falls: [FALLS.x - FALLS.R + 2.6, FALLS.z] },
    takeBand() { return BAND.splice(0); },   // the stage ensemble's strokes (long drum, gongs, cymbals) since the last call, for the ambience
    get pavilionSeat() { return PAV_SEAT; },
    get corridorRing() { return CORRIDOR_RING; },
    // inside a hall: is (x, z) taken by furniture, columns or the stair room?
    indoorBlocked(mode, x, z) {
      const c = (cx, cz, r) => Math.hypot(x - cx, z - cz) < r + PAD, rc = (x0, x1, z0, z1) => x > x0 - PAD && x < x1 + PAD && z > z0 - PAD && z < z1 + PAD;
      if (mode !== "church" && [...INNER_COLUMNS, ...CORNER_COLUMNS].some(([cx, cz]) => c(cx, cz, .3))) return true;   // the church has no columns
      if (typeof mode === "number" && rc(STAIR_ROOM.x0, STAIR_ROOM.x1, STAIR_ROOM.z0, STAIR_ROOM.z1)) return true;
      if ([1, 4, 5, 6, 7, "library", "kyaung"].includes(mode)) {   // the statue on its pedestal, the offering table, the censer and the candle stands
        if (mode === "kyaung") { if (rc(-2.2, 2.2, -3.5, 1.2)) return true; }   // the Shan throne's broad plinth; no table or stands
        else if (c(0, -1.7, 1.75) || rc(-1.6, 1.6, .25, 1.25) || rc(-1.4, 1.4, 1.6, 2.3)) return true;
        if (mode === 1 && rc(-.8, .8, 2.5, 3.1)) return true;   // the kneeling bench
      }
      if (mode === "library" && c(WISH_TREE.x, WISH_TREE.z, 2.2 * WISH_TREE.s)) return true;   // the wishing tree's fence
      if (mode === 5 && rc(2.9, 5.9, 4.5, 5.3)) return true;   // the shop counter
      if (mode === 2) return [[-2.4, -1.1], [0, -1.8], [2.4, -1.1]].some(([cx, cz]) => c(cx, cz, .8)) || rc(-3.4, 4.6, -4.75, -3.95);   // and the lamp rack
      if (mode === "shop") return rc(-2.55, 2.55, -1.45, -.55) || z < -4.4;
      if (mode === "quarters") return rc(-2.6, 2.6, -2.1, -1.1) || rc(-2.6, 2.6, 1.1, 2.1) || x < -5.1 || x > 6.6 || rc(1.2, 3.8, -5.5, -4.7);
      if (mode === "bell") return rc(-1.2, 1.2, -1.8, -1.4);
      if (mode === "church") return CHURCH.banks.some(([x0, x1]) => rc(x0, x1, CHURCH.rows[0] - .25, CHURCH.rows[CHURCH.rows.length - 1] + .3)) || rc(-.9, .9, -2.45, -1.85) || z < CHURCH.dais;   // the pews, the communion table, the dais
      if (mode === "kyaung") return KYAUNG.pillars.some(([cx, cz]) => c(cx, cz, .25)) || KYAUNG.hti.some(([cx, cz]) => c(cx, cz, .3)) || KYAUNG.urns.some(([cx, cz]) => c(cx, cz, .3)) || z < -2.9;   // pillars, parasols, flower urns
      return false;
    },
    setDaylight(d) { daylight = d; dayParts.forEach(fn => fn(d)); },
    // Halloween night: `on` lets the ghost out, `out` (0–1) puts out the houses' and huts' lights; `ghost` is where it is, while out
    setHalloween({ on, out }) { FEST.on = on; if (out !== FEST.out) { FEST.out = out; dayParts.forEach(fn => fn(daylight)); } },
    get ghost() { return FEST.ghost || null; },
    // townsfolk: out in the market and on the roads in the evening and night, under umbrellas when it rains
    setTownsfolk(out, umbrellas) { FOLK.out = out; FOLK.umbrellas = umbrellas; },
    // who dances on the festival stage: "solo" (the kinnara alone, a bigger crowd), "pair" (kinnara and kinnari), "to",
    // "twoTo" (the white and the yellow to), "toKinnara" (the two to with the kinnara alone, a bigger crowd), or null for none
    setDancers(show) { FOLK.dance = show; },
    // dragon and lion dance training on the kung fu ground before Chinese New Year: "dragon", "lion", or null for none
    setLionDragon(show) { FOLK.drill = show; },
    // the beat officer: settings and whether a visitor is on foot outside; `policeNews()` hands over what just happened, once
    setPolice(o) { Object.assign(COP, o); },
    policeNews() { const n = COP.news; COP.news = null; return n; },
    get police() { return COP.on && (!COP.night || daylight < .5) ? COP.at : null; },
    setCelestial(c) { Object.assign(celestial, c); celestialParts.forEach(fn => fn()); },
    openDoor(mode) { return openers[mode] ? openers[mode]() : 0; },
    dress(hall) { const list = []; daylit(hall); sumeru(hall, 0, -1.7); hallColumns(hall); hallWalls(hall, M.wall, false); moreLanterns(hall, 1); spiralStairs(hall, 1, list); stairRoom(hall, 1, list); frontWall(hall, 1, list); return list; },
    hover(obj) { hovered = obj; },
    activate(obj, mode, point) {
      if (obj.userData.coinPond && pondCoinThrow) {
        const n = pondCoinThrow(point || obj.getWorldPosition(V(0, 0, 0)));
        return { toast: `Your coin falls among the lotus. Make a wish. ${n === 1 ? "The first coin" : n + " coins"} you have given to the pond.` };
      }
      if (obj.userData.bathe && pondBathe) {
        return pondBathe() ? { toast: "You pour pond water over the infant Buddha, washing away the dust of the year: may your mind be as clear as the water." } : {};
      }
      if (obj.userData.pavilion) return { pavilion: true };
      if (obj.userData.ringBell) { bellRingers.forEach(f => f()); return {}; }
      if (obj.userData.fourTop) return { fourTop: true };
      if (obj.userData.market) return { market: true };
      if (obj.userData.view) return { view: obj.userData.view };
      if (obj.userData.toast) return { toast: obj.userData.toast };
      if (obj.userData.floor) return { floor: obj.userData.floor, delay: obj.userData.open ? obj.userData.open() : 0 };
      const act = actions[mode];
      return act ? act(obj.userData.act) || {} : {};
    },
    update(dt, t, mode, motion, eye) {
      FEST.eye = mode === "pagoda" ? eye : null;
      (updaters[mode] || []).forEach(fn => fn(dt, t, motion));
      if (backdrop && mode !== "pagoda") (updaters.pagoda || []).forEach(fn => fn(dt, t, motion));   // koi, smoke, flags seen from the corridor
    },
    // from a corridor, show the real grounds below at this storey's height instead of the painted vista
    setBackdrop(n) {
      backdrop = n || 0;
      const g = groups[n] || groups[String(n)];
      if (backdrop) pagoda = pagoda || buildPagoda();
      if (pagoda) { pagoda.visible = !!backdrop || false; pagoda.position.y = backdrop ? -(STOREY_Y[n] || 0) : 0; }
      Object.values(groups).forEach(gr => { if (gr.userData.vista) gr.userData.vista.visible = !backdrop; });
    },
    name: floorName
  };
};
