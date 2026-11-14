/* FourFaceTopGame: the four-animal spinning top (လေးကောင်ဂျင်) of Northern Shan State market nights, as a self-contained
   Three.js (r128, global THREE) component. A cube-bodied top on a short wooden spindle spins in a wooden bowl at the centre of a
   betting mat laid on a table; a cover is lowered over the bowl while it spins, the top slows with a decaying wobble, tips over onto
   one side inside the bowl, and the cover lifts to show the face lying upward. Purely a cultural mini-game: no money, only festival
   tokens kept by the caller.

   Faces (around the spindle, starting at +z): Rooster ကြက် and Pig ဝက် (red, land animals ကုန်းသတ္တဝါ),
   Frog ဖား and Eel ငါးရှဉ့် (black, water animals ရေနေသတ္တဝါ).
   The mat: the four animal squares round the bowl (rooster and pig on the red row, eel and frog on the black row), a Red strip and a
   Black strip along the rows, and a half-red, half-black strip down each column for the pairs Rooster · Eel and Pig · Frog.
   A single animal pays 3 to 1; a colour or a pair pays 1 to 1.

   const game = new FourFaceTopGame(scene, new THREE.Vector3(x, y, z), {       // y: the table top
     onRoundStart: bets => {}, onResult: (face, outcome) => {}, onSound: name => {}   // "cover" | "spin" | "tip" | "lift"
   });                                    // outcome: [{ key, stake, won, pays }] for every spot with chips on it
   game.update(dt);                       // every frame, dt in seconds
   game.setChips({ red: 5, rooster: 2 })  // the chip stacks shown on the mat
   game.spin({ red: 5, rooster: 2 })      // returns false if a round is already running
*/
(function () {
  "use strict";
  const TAU = Math.PI * 2;
  const FACES = [
    { key: "rooster", my: "ကြက်", en: "Rooster", color: "red" },
    { key: "pig", my: "ဝက်", en: "Pig", color: "red" },
    { key: "frog", my: "ဖား", en: "Frog", color: "black" },
    { key: "eel", my: "ငါးရှဉ့်", en: "Eel", color: "black" }
  ];
  const MY_FONT = '"Noto Sans Myanmar", "Myanmar Text", "Padauk", sans-serif';
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const clamp01 = t => Math.max(0, Math.min(1, t));

  // a simple drawn animal on a coloured ground, for a face of the top and a tile of the mat
  function drawAnimal(c, key, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100); c.lineJoin = "round"; c.lineCap = "round";
    if (key === "rooster") {
      c.fillStyle = "#f4ecd8"; c.beginPath(); c.ellipse(0, 10, 30, 24, 0, 0, TAU); c.fill();
      c.beginPath(); c.arc(22, -18, 13, 0, TAU); c.fill();
      c.fillStyle = "#d42a1a"; c.beginPath(); c.moveTo(14, -30); c.lineTo(18, -42); c.lineTo(24, -32); c.lineTo(30, -42); c.lineTo(32, -28); c.fill();
      c.fillStyle = "#e8a020"; c.beginPath(); c.moveTo(34, -18); c.lineTo(44, -14); c.lineTo(34, -12); c.fill();
      c.strokeStyle = "#2a5a3a"; c.lineWidth = 7; [-36, -26, -16].forEach((a, i) => { c.beginPath(); c.moveTo(-24, 0); c.quadraticCurveTo(-46, a, -34 + i * 4, a - 14); c.stroke(); });
      c.strokeStyle = "#e8a020"; c.lineWidth = 4; [-6, 8].forEach(lx => { c.beginPath(); c.moveTo(lx, 32); c.lineTo(lx, 44); c.stroke(); });
    } else if (key === "pig") {
      c.fillStyle = "#f2a8b0"; c.beginPath(); c.ellipse(-4, 6, 38, 26, 0, 0, TAU); c.fill();
      c.beginPath(); c.arc(30, -2, 18, 0, TAU); c.fill();
      c.fillStyle = "#e07888"; c.beginPath(); c.ellipse(44, 2, 8, 9, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(22, -16); c.lineTo(28, -30); c.lineTo(34, -16); c.fill();
      c.fillRect(-30, 26, 8, 14); c.fillRect(10, 26, 8, 14);
      c.strokeStyle = "#e07888"; c.lineWidth = 4; c.beginPath(); c.moveTo(-42, 2); c.bezierCurveTo(-54, -6, -44, -16, -52, -20); c.stroke();
    } else if (key === "frog") {
      c.fillStyle = "#5aa040"; c.beginPath(); c.ellipse(0, 8, 34, 26, 0, 0, TAU); c.fill();
      [-16, 16].forEach(ex => { c.beginPath(); c.arc(ex, -16, 11, 0, TAU); c.fill(); });
      c.fillStyle = "#f8f4e0"; [-16, 16].forEach(ex => { c.beginPath(); c.arc(ex, -17, 6, 0, TAU); c.fill(); });
      c.fillStyle = "#1a1a1a"; [-16, 16].forEach(ex => { c.beginPath(); c.arc(ex, -17, 3, 0, TAU); c.fill(); });
      c.strokeStyle = "#5aa040"; c.lineWidth = 9; [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(sd * 26, 22); c.lineTo(sd * 44, 34); c.lineTo(sd * 36, 44); c.stroke(); });
    } else {
      c.strokeStyle = "#8a7a4a"; c.lineWidth = 16; c.beginPath(); c.moveTo(-46, 10);
      for (let i = 0; i <= 8; i++) c.lineTo(-46 + i * 11, 10 + Math.sin(i * 1.1) * 18);
      c.stroke();
      c.fillStyle = "#8a7a4a"; c.beginPath(); c.ellipse(44, 10 + Math.sin(8.8) * 18, 13, 10, 0, 0, TAU); c.fill();
      c.fillStyle = "#f8f4e0"; c.beginPath(); c.arc(48, 6 + Math.sin(8.8) * 18, 3, 0, TAU); c.fill();
    }
    c.restore();
  }
  function canvasTexture(w, h, paint) {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    const draw = () => { paint(cv.getContext("2d"), w, h); t.needsUpdate = true; };
    draw();
    if (document.fonts && document.fonts.load) document.fonts.load(`600 40px ${MY_FONT}`, "ကြက်").then(draw, () => {});
    return t;
  }
  function faceTexture(f) {
    return canvasTexture(256, 256, (c, w, h) => {
      c.fillStyle = f.color === "red" ? "#b81c1c" : "#1c1c1e"; c.fillRect(0, 0, w, h);
      c.strokeStyle = "#d6a94a"; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16);
      c.fillStyle = "#f8f0dc"; c.beginPath(); c.arc(w / 2, h / 2 - 18, 74, 0, TAU); c.fill();
      drawAnimal(c, f.key, w / 2, h / 2 - 18, 120);
      c.fillStyle = "#f8e8b0"; c.font = `600 34px ${MY_FONT}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(f.my, w / 2, h - 34);
    });
  }

  // the betting spots on the mat, with where their chips sit (in pixels on the 1024 px mat drawing) and what they pay
  const BETS = [
    { key: "rooster", my: "ကြက်", en: "Rooster", wins: ["rooster"], pays: 3, at: [182, 412] },
    { key: "pig", my: "ဝက်", en: "Pig", wins: ["pig"], pays: 3, at: [842, 412] },
    { key: "eel", my: "ငါးရှဉ့်", en: "Eel", wins: ["eel"], pays: 3, at: [182, 612] },
    { key: "frog", my: "ဖား", en: "Frog", wins: ["frog"], pays: 3, at: [842, 612] },
    { key: "red", my: "အနီ", en: "Red", wins: ["rooster", "pig"], pays: 1, at: [512, 76] },
    { key: "black", my: "အမည်း", en: "Black", wins: ["eel", "frog"], pays: 1, at: [512, 948] },
    { key: "rooster-eel", my: "ကြက် · ငါးရှဉ့်", en: "Rooster · Eel", wins: ["rooster", "eel"], pays: 1, at: [76, 512] },
    { key: "pig-frog", my: "ဝက် · ဖား", en: "Pig · Frog", wins: ["pig", "frog"], pays: 1, at: [948, 512] }
  ];
  const RED = "#b81c1c", BLACK = "#1c1c1e", GOLD = "#d6a94a", CREAM = "#f8e8b0";
  // the chips: white 1, red 5, blue 10, green 25
  const CHIPS = [[25, 0x2a8a4a], [10, 0x2a5ab0], [5, 0xc0302a], [1, 0xf0ece0]];

  class FourFaceTopGame {
    constructor(scene, position, options = {}) {
      this.options = options;
      this.faces = FACES; this.bets = BETS;
      this.group = new THREE.Group(); this.group.position.copy(position || new THREE.Vector3()); scene.add(this.group);
      this.state = "idle"; this.t = 0; this.wagers = {}; this.result = null;
      this._build();
    }
    _mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
    _build() {
      const S = this.S = 2.4, g = this.group, N = 1024, E = 136, H = N / 2, T = H - E;   // mat size in metres; drawing size, edge strips, tile size in pixels
      // the mat (အခင်း), turned so its writing reads from the west side of the table, where the players sit
      const matTex = canvasTexture(N, N, c => {
        c.fillStyle = "#e8dcc0"; c.fillRect(0, 0, N, N);
        const txt = (s, x, y, px, rot = 0) => { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = CREAM; c.font = `600 ${px}px ${MY_FONT}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(s, 0, 0); c.restore(); };
        const box = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x + 6, y + 6, w - 12, h - 12); c.strokeStyle = GOLD; c.lineWidth = 6; c.strokeRect(x + 14, y + 14, w - 28, h - 28); };
        // the four animals: rooster and pig on the red row, eel and frog on the black row; each picture sits at the tile's outer corner
        [["rooster", -1, -1], ["pig", 1, -1], ["eel", -1, 1], ["frog", 1, 1]].forEach(([key, sx, sy]) => {
          const f = FACES.find(x => x.key === key);
          box(sx < 0 ? E : H, sy < 0 ? E : H, T, T, f.color === "red" ? RED : BLACK);
          const ax = H + sx * 215, ay = H + sy * 205;
          c.fillStyle = "#f8f0dc"; c.beginPath(); c.arc(ax, ay, 98, 0, TAU); c.fill();
          drawAnimal(c, key, ax, ay, 150);
          txt(`${f.my} ${f.en}`, ax, ay + sy * 128, 40);
        });
        // the colour strips along the rows
        box(E, 0, N - 2 * E, E, RED); txt("အနီ  Red · 1 to 1", H, E / 2, 48);
        box(E, N - E, N - 2 * E, E, BLACK); txt("အမည်း  Black · 1 to 1", H, N - E / 2, 48);
        // the pair strips down the columns, half red and half black: rooster and eel on the left, pig and frog on the right
        [[0, "ကြက် · ငါးရှဉ့်  1 to 1", -Math.PI / 2], [N - E, "ဝက် · ဖား  1 to 1", Math.PI / 2]].forEach(([x, s, rot]) => {
          c.fillStyle = RED; c.fillRect(x + 6, E + 6, E - 12, T - 6); c.fillStyle = BLACK; c.fillRect(x + 6, H, E - 12, T - 6);
          c.strokeStyle = GOLD; c.lineWidth = 6; c.strokeRect(x + 14, E + 14, E - 28, N - 2 * E - 28);
          txt(s, x + E / 2, H, 40, rot);
        });
        // the corners, and the bowl's ring in the middle
        [[0, 0], [N - E, 0], [0, N - E], [N - E, N - E]].forEach(([x, y]) => { c.fillStyle = "#c8a870"; c.fillRect(x + 6, y + 6, E - 12, E - 12); c.fillStyle = GOLD; c.beginPath(); c.arc(x + E / 2, y + E / 2, 22, 0, TAU); c.fill(); });
        c.fillStyle = "#6a4a2a"; c.beginPath(); c.arc(H, H, 196, 0, TAU); c.fill();
      });
      this.matG = new THREE.Group(); this.matG.rotation.y = -Math.PI / 2; g.add(this.matG);
      const mat = this._mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshStandardMaterial({ map: matTex, roughness: .9 }), this.matG, 0, .004, 0);
      mat.rotation.x = -Math.PI / 2; mat.castShadow = false;
      this.mat = mat;
      // the wooden bowl the top spins in: wide and shallow, so the top stays inside it from the first spin until it lies still
      const bowlPts = [[0, 0], [.4, 0], [.44, .03], [.46, .075], [.43, .075], [.39, .028], [0, .028]].map(([x, y]) => new THREE.Vector2(x, y));
      this._mesh(new THREE.LatheGeometry(bowlPts, 40), new THREE.MeshStandardMaterial({ color: 0x7a5432, roughness: .55, side: THREE.DoubleSide }), g, 0, .004, 0);
      this.floorY = .032;   // the bowl's inside floor
      // the top (ဂျင်တုံး): a cube body showing the four animals on its sides, a short spindle through the centre
      this.tilt = new THREE.Group(); g.add(this.tilt);
      this.spinG = new THREE.Group(); this.tilt.add(this.spinG);
      const B = .2, wood = new THREE.MeshStandardMaterial({ color: 0xc8a070, roughness: .6 }), stem = new THREE.MeshStandardMaterial({ color: 0x6a3a1a, roughness: .5 });
      const faceMats = FACES.map(f => new THREE.MeshStandardMaterial({ map: faceTexture(f), roughness: .55 }));
      // BoxGeometry material order: +x, -x, +y, -y, +z, -z; faces go +z, +x, -z, -x round the spindle
      const body = this._mesh(new THREE.BoxGeometry(B, B, B), [faceMats[1], faceMats[3], wood, wood, faceMats[0], faceMats[2]], this.spinG);
      body.userData.fourTop = true;
      this._mesh(new THREE.CylinderGeometry(.018, .018, .34, 10), stem, this.spinG, 0, .03, 0);           // the spindle, −.14 … .2
      this._mesh(new THREE.SphereGeometry(.026, 10, 8), stem, this.spinG, 0, .2, 0);                       // the knob you twist it by
      this._mesh(new THREE.ConeGeometry(.026, .06, 10), stem, this.spinG, 0, -B / 2 - .03, 0).rotation.x = Math.PI;   // the point, tip at −.16
      this.B = B; this.restY = this.floorY + .16;   // standing on its point on the bowl's floor
      this.tilt.position.y = this.restY;
      // the cover (အုပ်ခွက်): a coconut-shell bowl that comes down over the spinning bowl; when not in use it sits mouth down on the
      // table beyond the mat, on the banker's side
      const coverPts = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI / 2; coverPts.push(new THREE.Vector2(Math.sin(a) * .49, Math.cos(a) * .49)); }
      const coverMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: .8, side: THREE.DoubleSide });
      this.cover = this._mesh(new THREE.LatheGeometry(coverPts, 32), coverMat, g, 0, 0, 0);
      this._mesh(new THREE.SphereGeometry(.05, 10, 8), coverMat, this.cover, 0, .51, 0);
      this.coverUp = .95; this.coverDown = .004;
      this.cover.position.set(S / 2 + .55, .004, 0);
      this.coverRest = this.cover.position.clone();
      // the chips, one shared geometry and a material per colour; a stack per betting spot
      this.chipGeo = new THREE.CylinderGeometry(.065, .065, .016, 18);
      this.chipMats = CHIPS.map(([, col]) => new THREE.MeshStandardMaterial({ color: col, roughness: .4 }));
      this.stacks = new THREE.Group(); this.matG.add(this.stacks);
      this.picks = [mat, body];
      mat.userData.fourTop = true;
    }
    // where a betting spot's chips sit, in the mat group's frame
    _spot(b) { const k = this.S / 1024; return [b.at[0] * k - this.S / 2, b.at[1] * k - this.S / 2]; }
    // show a stack of chips on each spot: the fewest chips that make the amount, the big ones at the bottom (at most 14 high)
    setChips(wagers) {
      while (this.stacks.children.length) this.stacks.remove(this.stacks.children[0]);
      BETS.forEach((b, bi) => {
        let left = (wagers && wagers[b.key]) || 0, n = 0;
        if (left <= 0) return;
        const [x, z] = this._spot(b);
        CHIPS.forEach(([v], ci) => { while (left >= v && n < 14) { const m = new THREE.Mesh(this.chipGeo, this.chipMats[ci]); m.position.set(x + Math.sin(n * 2.3 + bi) * .006, .012 + n * .017, z + Math.cos(n * 1.7 + bi) * .006); m.castShadow = true; this.stacks.add(m); left -= v; n++; } });
      });
    }
    _emit(name, ...a) { const fn = this.options[name]; if (fn) fn(...a); }
    _sound(n) { this._emit("onSound", n); }
    // a full round: cover down, spin, slow down, tip over, cover up, result
    spin(wagers) {
      if (this.state !== "idle") return false;
      this.wagers = Object.assign({}, wagers || {});
      this.setChips(this.wagers);
      const pick = this.options.rng ? this.options.rng() : Math.random();
      this.result = FACES[Math.min(3, Math.floor(pick * 4))];
      // spin back up from wherever the last round left the top
      this.spinG.rotation.set(0, 0, 0); this.tilt.rotation.set(0, 0, 0); this.tilt.position.set(0, this.restY, 0);
      this.turns = 9 + Math.floor((this.options.rng ? this.options.rng() : Math.random()) * 4);
      this.state = "cover"; this.t = 0; this.wob = Math.random() * TAU;
      this._emit("onRoundStart", this.wagers); this._sound("cover");
      return true;
    }
    get busy() { return this.state !== "idle"; }
    update(dt) {
      if (this.state === "idle") return;
      this.t += dt;
      const C = this.cover, I = FACES.indexOf(this.result), R = this.coverRest;
      if (this.state === "cover") {   // lift the cover off the table and lower it over the bowl
        const k = easeInOut(clamp01(this.t / .7));
        C.position.set(R.x * (1 - k), R.y + Math.sin(Math.PI * k) * .7 + k * (this.coverDown - R.y), R.z * (1 - k));
        if (this.t >= .7) { this.state = "spin"; this.t = 0; this._sound("spin"); }
      } else if (this.state === "spin") {   // spin with a cubic ease-out to the chosen face; the wobble grows as it slows, but stays small
        const D = 2.8, k = clamp01(this.t / D), e = easeOutCubic(k);
        const finalYaw = this.turns * TAU - I * Math.PI / 2;   // face i turned to the front (+z)
        this.spinG.rotation.y = finalYaw * e;
        const wob = .04 + .14 * Math.pow(k, 2.2);
        this.tilt.rotation.x = Math.sin(this.wob + this.t * 9) * wob * (1 - k * .3);
        this.tilt.rotation.z = Math.cos(this.wob + this.t * 9) * wob * (1 - k * .3);
        if (k >= 1) { this.state = "tip"; this.t = 0; this.tx0 = this.tilt.rotation.x; this.tz0 = this.tilt.rotation.z; }
      } else if (this.state === "tip") {   // topple forward so the front face comes to lie upward, on the bowl's floor
        const k = clamp01(this.t / .45), e = k * k;
        this.tilt.rotation.x = this.tx0 + (-Math.PI / 2 - this.tx0) * e;
        this.tilt.rotation.z = this.tz0 * (1 - e);
        this.tilt.position.y = this.restY + (this.floorY + this.B / 2 - this.restY) * e;
        this.tilt.position.z = -.03 * e;
        if (k >= 1) {   // a small settling bounce, then the cover lifts
          this.tilt.rotation.x = -Math.PI / 2; this._sound("tip");
          this.state = "settle"; this.t = 0;
        }
      } else if (this.state === "settle") {
        this.tilt.position.y = this.floorY + this.B / 2 + Math.abs(Math.sin(this.t * 18)) * .015 * Math.max(0, 1 - this.t / .4);
        if (this.t >= .45) { this.state = "lift"; this.t = 0; this._sound("lift"); }
      } else if (this.state === "lift") {   // lift the cover straight up and set it back on the table
        const k = easeInOut(clamp01(this.t / .9));
        if (k < .5) C.position.set(0, this.coverDown + k * 2 * this.coverUp, 0);
        else { const k2 = (k - .5) * 2; C.position.set(R.x * k2, this.coverDown + this.coverUp * (1 - k2) + (R.y - this.coverDown) * k2, R.z * k2); }
        if (this.t >= .9) {
          C.position.copy(R);
          this.state = "idle";
          const face = this.result, outcome = BETS.filter(b => this.wagers[b.key] > 0).map(b => ({ key: b.key, stake: this.wagers[b.key], won: b.wins.includes(face.key), pays: b.pays }));
          // the banker takes the losing stacks and pays the winners beside their stake
          const after = {}; outcome.forEach(o => { if (o.won) after[o.key] = o.stake * (o.pays + 1); });
          this.setChips(after);
          this._emit("onResult", face, outcome);
        }
      }
    }
  }
  FourFaceTopGame.FACES = FACES;
  FourFaceTopGame.BETS = BETS;
  window.FourFaceTopGame = FourFaceTopGame;
})();
