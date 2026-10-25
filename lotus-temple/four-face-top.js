/* FourFaceTopGame: the four-animal spinning top (လေးကောင်ဂျင်) of Northern Shan State market nights, as a self-contained
   Three.js (r128, global THREE) component. A cube-bodied top on a wooden spindle spins in a dish at the centre of a mat of four
   tiles; a cover is lowered over it while it spins, the top slows with a decaying wobble, tips over onto one side, and the cover
   lifts to show the face lying upward. Purely a cultural mini-game: no money, only festival tokens kept by the caller.

   Faces (around the spindle, starting at +z): Rooster ကြက် and Pig ဝက် (red, land animals ကုန်းသတ္တဝါ),
   Frog ဖား and Eel ငါးရှဉ့် (black, water animals ရေနေသတ္တဝါ).

   const game = new FourFaceTopGame(scene, new THREE.Vector3(x, 0, z), {
     onRoundStart: prediction => {}, onResult: (face, won, prediction) => {}, onSound: name => {}   // "cover" | "spin" | "tip" | "lift"
   });
   game.update(dt);                       // every frame, dt in seconds
   game.spin("rooster")  or  game.spin("red")   // returns false if a round is already running
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

  class FourFaceTopGame {
    constructor(scene, position, options = {}) {
      this.options = options;
      this.faces = FACES;
      this.group = new THREE.Group(); this.group.position.copy(position || new THREE.Vector3()); scene.add(this.group);
      this.state = "idle"; this.t = 0; this.prediction = null; this.result = null;
      this._build();
    }
    _mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
    _build() {
      const S = 2.0, g = this.group;
      // the mat (အခင်း): four tiles round a central dish; rooster and pig in red, frog and eel in black
      const matTex = canvasTexture(1024, 1024, (c, w, h) => {
        c.fillStyle = "#e8dcc0"; c.fillRect(0, 0, w, h);
        const order = [["rooster", 0, 0], ["pig", 1, 0], ["eel", 0, 1], ["frog", 1, 1]];
        order.forEach(([key, i, j]) => {
          const f = FACES.find(x => x.key === key), x0 = 24 + i * (w / 2 - 12), y0 = 24 + j * (h / 2 - 12), tw = w / 2 - 36, th = h / 2 - 36;
          c.fillStyle = f.color === "red" ? "#b81c1c" : "#1c1c1e"; c.fillRect(x0, y0, tw, th);
          c.strokeStyle = "#d6a94a"; c.lineWidth = 8; c.strokeRect(x0 + 10, y0 + 10, tw - 20, th - 20);
          c.fillStyle = "#f8f0dc"; c.beginPath(); c.arc(x0 + tw / 2, y0 + th / 2 - 30, 120, 0, TAU); c.fill();
          drawAnimal(c, key, x0 + tw / 2, y0 + th / 2 - 30, 190);
          c.fillStyle = "#f8e8b0"; c.font = `600 56px ${MY_FONT}`; c.textAlign = "center"; c.textBaseline = "middle";
          c.fillText(`${f.my}  ${f.en}`, x0 + tw / 2, y0 + th - 64);
        });
        c.fillStyle = "#6a4a2a"; c.beginPath(); c.arc(w / 2, h / 2, 150, 0, TAU); c.fill();   // the dish
      });
      const mat = this._mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshStandardMaterial({ map: matTex, roughness: .9 }), g, 0, .02, 0);
      mat.rotation.x = -Math.PI / 2; mat.castShadow = false;
      this.mat = mat;
      // the shallow wooden dish the top spins in
      const dishPts = [[0, 0], [.26, 0], [.3, .03], [.32, .06], [.29, .06], [.25, .02], [0, .02]].map(([x, y]) => new THREE.Vector2(x, y));
      this._mesh(new THREE.LatheGeometry(dishPts, 40), new THREE.MeshStandardMaterial({ color: 0x7a5432, roughness: .55 }), g, 0, .02, 0);
      // the top (ဂျင်တုံး): a cube body showing the four animals on its sides, a spindle through the centre
      this.tilt = new THREE.Group(); g.add(this.tilt);
      this.spinG = new THREE.Group(); this.tilt.add(this.spinG);
      const B = .26, wood = new THREE.MeshStandardMaterial({ color: 0xc8a070, roughness: .6 });
      const faceMats = FACES.map(f => new THREE.MeshStandardMaterial({ map: faceTexture(f), roughness: .55 }));
      // BoxGeometry material order: +x, -x, +y, -y, +z, -z; faces go +z, +x, -z, -x round the spindle
      const body = this._mesh(new THREE.BoxGeometry(B, B, B), [faceMats[1], faceMats[3], wood, wood, faceMats[0], faceMats[2]], this.spinG);
      body.userData.fourTop = true;
      this._mesh(new THREE.CylinderGeometry(.022, .022, B + .26, 10), new THREE.MeshStandardMaterial({ color: 0x6a3a1a, roughness: .5 }), this.spinG, 0, .07, 0);
      this._mesh(new THREE.ConeGeometry(.03, .08, 10), new THREE.MeshStandardMaterial({ color: 0x6a3a1a, roughness: .5 }), this.spinG, 0, -B / 2 - .07, 0).rotation.x = Math.PI;
      this.B = B; this.restY = B / 2 + .1;   // standing on its point in the dish
      this.tilt.position.y = this.restY;
      // the cover (အုပ်ခွက်): a coconut-shell bowl that lowers over the top
      const coverPts = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI / 2; coverPts.push(new THREE.Vector2(Math.sin(a) * .34, Math.cos(a) * .34)); }
      const coverMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: .8, side: THREE.DoubleSide });
      this.cover = this._mesh(new THREE.LatheGeometry(coverPts, 32), coverMat, g, 0, 0, 0);
      this._mesh(new THREE.SphereGeometry(.05, 10, 8), coverMat, this.cover, 0, .36, 0);
      this.coverUp = .95; this.coverDown = .06;
      this.cover.position.set(.75, .02, -.75); this.cover.rotation.z = Math.PI;   // resting upside down at the mat's corner
      this.coverRest = this.cover.position.clone();
      this.picks = [mat, body];
      mat.userData.fourTop = true;
    }
    _emit(name, ...a) { const fn = this.options[name]; if (fn) fn(...a); }
    _sound(n) { this._emit("onSound", n); }
    // a full round: cover down, spin, slow down, tip over, cover up, result
    spin(prediction) {
      if (this.state !== "idle") return false;
      this.prediction = prediction || null;
      const pick = this.options.rng ? this.options.rng() : Math.random();
      this.result = FACES[Math.min(3, Math.floor(pick * 4))];
      // spin back up from wherever the last round left the top
      this.spinG.rotation.set(0, 0, 0); this.tilt.rotation.set(0, 0, 0); this.tilt.position.set(0, this.restY, 0);
      this.turns = 9 + Math.floor((this.options.rng ? this.options.rng() : Math.random()) * 4);
      this.state = "cover"; this.t = 0; this.wob = Math.random() * TAU;
      this._emit("onRoundStart", this.prediction); this._sound("cover");
      return true;
    }
    get busy() { return this.state !== "idle"; }
    update(dt) {
      if (this.state === "idle") return;
      this.t += dt;
      const C = this.cover, I = FACES.indexOf(this.result);
      if (this.state === "cover") {   // lift the cover off the corner, turn it over and lower it onto the dish
        const k = easeInOut(clamp01(this.t / .7));
        C.position.set(this.coverRest.x * (1 - k), this.coverRest.y + Math.sin(Math.PI * k) * .7 + k * this.coverDown, this.coverRest.z * (1 - k));
        C.rotation.z = Math.PI * (1 - k);
        if (this.t >= .7) { this.state = "spin"; this.t = 0; this._sound("spin"); }
      } else if (this.state === "spin") {   // spin with a cubic ease-out to the chosen face; the wobble grows as it slows
        const D = 2.8, k = clamp01(this.t / D), e = easeOutCubic(k);
        const finalYaw = this.turns * TAU - I * Math.PI / 2;   // face i turned to the front (+z)
        this.spinG.rotation.y = finalYaw * e;
        const wob = .05 + .18 * Math.pow(k, 2.2);
        this.tilt.rotation.x = Math.sin(this.wob + this.t * 9) * wob * (1 - k * .3);
        this.tilt.rotation.z = Math.cos(this.wob + this.t * 9) * wob * (1 - k * .3);
        if (k >= 1) { this.state = "tip"; this.t = 0; this.tx0 = this.tilt.rotation.x; this.tz0 = this.tilt.rotation.z; }
      } else if (this.state === "tip") {   // topple forward so the front face comes to lie upward
        const k = clamp01(this.t / .45), e = k * k;
        this.tilt.rotation.x = this.tx0 + (-Math.PI / 2 - this.tx0) * e;
        this.tilt.rotation.z = this.tz0 * (1 - e);
        this.tilt.position.y = this.restY + (this.B / 2 + .04 - this.restY) * e;
        this.tilt.position.z = -.06 * e;
        if (k >= 1) {   // a small settling bounce, then the cover lifts
          this.tilt.rotation.x = -Math.PI / 2; this._sound("tip");
          this.state = "settle"; this.t = 0;
        }
      } else if (this.state === "settle") {
        this.tilt.position.y = this.B / 2 + .04 + Math.abs(Math.sin(this.t * 18)) * .02 * Math.max(0, 1 - this.t / .4);
        if (this.t >= .45) { this.state = "lift"; this.t = 0; this._sound("lift"); }
      } else if (this.state === "lift") {   // lift the cover straight up and set it back on the corner
        const k = easeInOut(clamp01(this.t / .9));
        if (k < .5) C.position.set(0, this.coverDown + k * 2 * this.coverUp, 0);
        else { const k2 = (k - .5) * 2; C.position.set(this.coverRest.x * k2, this.coverDown + this.coverUp * (1 - k2) + this.coverRest.y * k2, this.coverRest.z * k2); C.rotation.z = Math.PI * k2; }
        if (this.t >= .9) {
          C.position.copy(this.coverRest); C.rotation.z = Math.PI;
          this.state = "idle";
          const p = this.prediction, won = !!p && (p === this.result.key || p === this.result.color);
          this._emit("onResult", this.result, won, p);
        }
      }
    }
  }
  FourFaceTopGame.FACES = FACES;
  window.FourFaceTopGame = FourFaceTopGame;
})();
