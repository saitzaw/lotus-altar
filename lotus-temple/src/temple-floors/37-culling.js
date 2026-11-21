  /* ---------- selective rendering of the grounds: everything is sorted once into a grid of cells; whenever the camera moves,
     cells behind it or past the fog are hidden whole, and in the cells left each object is drawn only if it is in view, nearer
     than the fog's far edge and big enough to cover a couple of pixels at that distance. Lights are never hidden (that would
     recompile every material), nor the sky, the land, the far hills and anything that moves about. ---------- */
  const CULL = { cells: [], cell: 24, big: 60, far: 140, minPx: (ctx.cull && ctx.cull.minPixels) || 2, on: !ctx.cull || ctx.cull.enabled !== false, n: 0, lastM: new THREE.Matrix4(), lastFar: 0 };
  const _cb = new THREE.Box3(), _cbx = new THREE.Box3(), _cm = new THREE.Matrix4(), _cs = new THREE.Sphere(), _cv = new THREE.Vector3(), _cinv = new THREE.Matrix4(), _frustum = new THREE.Frustum();
  // an object's bounds in the grounds' frame; instanced meshes by their instances (three.js r128 only looks at the base geometry)
  function boundsOf(o) {
    _cb.makeEmpty();
    o.traverse(n => {
      if (n.isInstancedMesh) {
        if (!n.geometry.boundingSphere) n.geometry.computeBoundingSphere();
        for (let i = 0; i < n.count; i++) { n.getMatrixAt(i, _cm); _cm.premultiply(n.matrixWorld); _cb.union(_cs.copy(n.geometry.boundingSphere).applyMatrix4(_cm).getBoundingBox(_cbx)); }
      } else if (n.isMesh) {
        if (!n.geometry.boundingBox) n.geometry.computeBoundingBox();
        _cb.union(_cbx.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld));
      } else if (n.isSprite) {
        _cb.union(_cbx.setFromCenterAndSize(n.getWorldPosition(_cv), _cv.clone().setScalar(Math.max(n.scale.x, n.scale.y))));
      }
    });
    return _cb.isEmpty() ? null : _cb.getBoundingSphere(new THREE.Sphere());
  }
  const hasLight = o => { let f = false; o.traverse(n => { if (n.isLight) f = true; }); return f; };
  function indexCull(g) {
    g.updateMatrixWorld(true);
    const cells = new Map();
    const walk = o => o.children.forEach(ch => {
      if (ch.isLight || ch.isPoints || ch.userData.noCull || !ch.visible) return;
      const s = boundsOf(ch); if (!s) return;
      if (s.radius > CULL.big || hasLight(ch)) {   // too big to cull, or holds a light: look inside it instead
        if (ch.isInstancedMesh) ch.frustumCulled = false;
        walk(ch); return;
      }
      // the far hills, fields and outer streets stay, however far off or small: their cell only holds their batches (below),
      // kept while it is in view, and three.js culls the rest of them one by one as before
      const far = Math.hypot(s.center.x, s.center.z) > CULL.far;
      if (!far) ch.traverse(n => { if (n.isInstancedMesh) n.frustumCulled = false; });   // the cell test does it, by the instances' real bounds
      const k = (far ? "f" : "") + Math.floor(s.center.x / CULL.cell) + "," + Math.floor(s.center.z / CULL.cell);
      let c = cells.get(k); if (!c) cells.set(k, c = { items: [], batches: [], box: new THREE.Box3(), sphere: new THREE.Sphere(), vis: true, far });
      c.items.push({ o: ch, s }); c.box.union(s.getBoundingBox(_cbx));
    });
    walk(g);
    CULL.cells = [...cells.values()];
    CULL.cells.forEach(c => c.box.getBoundingSphere(c.sphere));
    CULL.cells.forEach(c => { if (!c.far) c.items.forEach(it => lazyMatrices(it.o)); });
    if (BATCH.on) batchCells(g);
  }
  /* ---------- lazy matrices: three.js works out every object's place in the world again every frame, shown or not, which grows
     with every building added to the town. A cell item the culling has hidden skips that, and so does everything it holds; it
     catches up the frame it is shown again, or at once if what it stands on has moved (the grounds lowered under an upper
     floor's balcony). Something moved while hidden keeps its old matrix until then; that's harmless, as nothing hidden is
     drawn or tapped, but code that reads a world position at run time (`localToWorld`) must read it off something that stands still,
     or call `updateWorldMatrix(true, false)` first. CONFIG.cull.lazy turns it off ---------- */
  CULL.lazy = !ctx.cull || ctx.cull.lazy !== false;
  const _umw = THREE.Object3D.prototype.updateMatrixWorld;
  function lazyMatrices(o) {
    if (o.updateMatrixWorld !== _umw) return;
    const seen = new THREE.Matrix4(); let stale = false;   // seen: the parent's matrix when this was last brought up to date
    o.updateMatrixWorld = function (force) {
      if (CULL.lazy && !this.visible && this.parent && this.parent.matrixWorld.equals(seen)) { stale = true; return; }
      if (stale) { stale = false; force = true; }
      _umw.call(this, force);
      if (this.parent) seen.copy(this.parent.matrixWorld);
    };
  }
  /* ---------- static batching: most of the grounds is built one mesh per post, step and beam, each its own draw call. Once the
     cells are known, the plain, still meshes in each cell are welded into one mesh per material (and shadow flags), drawn while
     the cell is shown. The originals stay where they are, on a layer the camera doesn't draw but the picking ray does
     (`batchLayer`), so the code that built them can still reach them and a tap still finds them. Each frame a share of them is
     checked: if one moves, hides, is re-dressed or has its shape changed (a door, a flag, a lamp put out), its whole batch is
     undone and the originals draw again as before. ---------- */
  const BATCH = { on: !ctx.cull || ctx.cull.batch !== false, src: [], i: 0, off: 31, per: 1500, inv: new THREE.Matrix4(), nm: new THREE.Matrix3() };   // per: originals checked each frame
  const ATTRS = { position: 3, normal: 3, uv: 2, color: 3 };
  const batchable = n => {
    if (!n.isMesh || n.isInstancedMesh || n.isSkinnedMesh || Array.isArray(n.material) || !n.visible) return false;
    const m = n.material, geo = n.geometry;
    if (m.transparent || !m.depthWrite || n.renderOrder || !n.frustumCulled || n.layers.mask !== 1 || n.customDepthMaterial) return false;
    if (n.onBeforeRender !== THREE.Object3D.prototype.onBeforeRender || n.raycast !== THREE.Mesh.prototype.raycast) return false;
    if (!geo || !geo.isBufferGeometry || Object.keys(geo.morphAttributes).length || geo.drawRange.start || geo.drawRange.count !== Infinity) return false;
    if (!geo.attributes.position || (geo.index && !(geo.index.array instanceof Uint16Array || geo.index.array instanceof Uint32Array))) return false;
    return Object.entries(geo.attributes).every(([k, a]) => ATTRS[k] === a.itemSize && !a.isInterleavedBufferAttribute && a.array instanceof Float32Array);
  };
  function batchCells(g) {
    g.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), items = new Set();
    CULL.cells.forEach(c => { if (!c.far) c.items.forEach(it => items.add(it.o)); });   // what culling shows and hides (not the far cells' things)
    CULL.cells.forEach(c => {
      const sets = new Map();
      c.items.forEach(({ o }) => o.traverse(n => {
        if (!batchable(n)) return;
        const up = []; let shown = true;   // the way up to the grounds; all of it but the cell's items (culling owns those) must be shown
        for (let x = n; x !== g; x = x.parent) { up.push(x); if (!items.has(x) && !x.visible) shown = false; }
        if (!shown) return;   // hidden for now: it is shown on cue, leave it be
        const names = Object.keys(n.geometry.attributes).sort().join(), k = n.material.uuid + n.castShadow + n.receiveShadow + names;
        let s = sets.get(k); if (!s) sets.set(k, s = { mat: n.material, cast: n.castShadow, recv: n.receiveShadow, names: names.split(","), list: [] });
        s.list.push({ m: n, up, items, geo: n.geometry, mat: n.material, ver: n.geometry.attributes.position.version, rel: new THREE.Matrix4().multiplyMatrices(inv, n.matrixWorld) });
      }));
      sets.forEach(s => {
        if (s.list.length < 2) return;
        const mesh = new THREE.Mesh(weld(s.list, s.names), s.mat); mesh.castShadow = s.cast; mesh.receiveShadow = s.recv; mesh.userData.noCull = true; mesh.matrixAutoUpdate = false;
        g.add(mesh); mesh.updateMatrixWorld(true);
        const b = { mesh, list: s.list, cell: c, dead: false }; c.batches.push(b);
        s.list.forEach(e => { e.b = b; e.mask = e.m.layers.mask; e.m.layers.set(BATCH.off); BATCH.src.push(e); });
      });
    });
  }
  // one geometry from many, in the grounds' frame (normals turned with them; mirrored copies get their triangles flipped)
  function weld(list, names) {
    let nv = 0, ni = 0;
    list.forEach(({ geo }) => { const c = geo.attributes.position.count; nv += c; ni += geo.index ? geo.index.count : c; });
    const out = {}; names.forEach(k => out[k] = new Float32Array(nv * ATTRS[k]));
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni), v = new THREE.Vector3();
    let vo = 0, io = 0;
    list.forEach(({ geo, rel }) => {
      const A = geo.attributes, c = A.position.count, nm = BATCH.nm.getNormalMatrix(rel), flip = rel.determinant() < 0;
      names.forEach(k => {
        const a = A[k].array, d = out[k], w = ATTRS[k];
        if (k === "position" || k === "normal") for (let i = 0; i < c; i++) {
          v.fromArray(a, i * 3); if (k === "position") v.applyMatrix4(rel); else v.applyMatrix3(nm).normalize(); v.toArray(d, (vo + i) * 3);
        } else d.set(a.subarray(0, c * w), vo * w);
      });
      const n = geo.index ? geo.index.count : c, src = geo.index && geo.index.array;
      for (let i = 0; i < n; i += 3) for (let j = 0; j < 3; j++) idx[io + i + j] = vo + (src ? src[i + (flip ? 2 - j : j)] : i + (flip ? 2 - j : j));
      vo += c; io += n;
    });
    const geo = new THREE.BufferGeometry();
    names.forEach(k => geo.setAttribute(k, new THREE.BufferAttribute(out[k], ATTRS[k])));
    geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingSphere(); geo.computeBoundingBox();
    return geo;
  }
  function unbatch(b) {
    if (b.dead) return; b.dead = true;
    b.mesh.parent.remove(b.mesh); b.mesh.geometry.dispose();
    b.list.forEach(e => e.m.layers.mask = e.mask);
    b.cell.batches.splice(b.cell.batches.indexOf(b), 1);
  }
  const _bm = new THREE.Matrix4();
  // has this original been moved, hidden, re-dressed or reshaped since it was welded in?
  function stirred(e) {
    const m = e.m;
    if (m.material !== e.mat || m.geometry !== e.geo || e.geo.attributes.position.version !== e.ver) return true;
    for (let i = 0; i < e.up.length; i++) { const x = e.up[i]; if (x.parent !== (e.up[i + 1] || pagoda) || (!x.visible && !e.items.has(x))) return true; }
    const a = _bm.multiplyMatrices(BATCH.inv, m.matrixWorld).elements, r = e.rel.elements;
    for (let i = 0; i < 16; i++) if (Math.abs(a[i] - r[i]) > 1e-4) return true;
    return false;
  }
  function batchCheck() {
    const L = BATCH.src; if (!L.length) return;
    BATCH.inv.copy(pagoda.matrixWorld).invert();
    for (let k = Math.min(BATCH.per, L.length); k-- > 0;) {
      BATCH.i = (BATCH.i + 1) % L.length; const e = L[BATCH.i];
      if (!e.b.dead && stirred(e)) unbatch(e.b);
    }
    if (BATCH.i < BATCH.per) for (let i = L.length - 1; i >= 0; i--) if (L[i].b.dead) L.splice(i, 1);   // once a round, drop what was undone
  }
  // called every frame from the main script with the canvas height in pixels; works only when the view has changed
  function cull(cam, heightPx) {
    if (!pagoda || !pagoda.visible) return;
    batchCheck();
    if (!CULL.on) return;
    cam.updateMatrixWorld();
    const far = world.fog ? world.fog.far : Infinity;
    if (CULL.n++ % 30 && cam.matrixWorld.equals(CULL.lastM) && far === CULL.lastFar) return;   // nothing moved (a full pass now and then anyway)
    CULL.lastM.copy(cam.matrixWorld); CULL.lastFar = far;
    pagoda.updateMatrixWorld();
    const eye = _cv.setFromMatrixPosition(cam.matrixWorld).applyMatrix4(_cinv.copy(pagoda.matrixWorld).invert());   // the camera in the grounds' frame
    _frustum.setFromProjectionMatrix(_cm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).multiply(pagoda.matrixWorld));
    const focal = heightPx / 2 / Math.tan(cam.fov * Math.PI / 360);   // pixels per unit at unit distance
    CULL.cells.forEach(c => {
      if (c.far) { const v = _frustum.intersectsSphere(c.sphere); if (v !== c.vis) { c.vis = v; c.batches.forEach(b => b.mesh.visible = v); } return; }
      if (eye.distanceTo(c.sphere.center) - c.sphere.radius > far || !_frustum.intersectsSphere(c.sphere)) {
        if (c.vis) { c.items.forEach(it => it.o.visible = false); c.batches.forEach(b => b.mesh.visible = false); c.vis = false; }
        return;
      }
      if (!c.vis) c.batches.forEach(b => b.mesh.visible = true);
      c.vis = true;
      c.items.forEach(({ o, s }) => {
        const d = eye.distanceTo(s.center);
        o.visible = d - s.radius < far && s.radius * focal / Math.max(d, .1) >= CULL.minPx && _frustum.intersectsSphere(s);
      });
    });
  }
  // show again whatever the culling hid within r of world (x, z), e.g. the roof over your head while the rain's cover is drawn from
  // above (see rainCover); returns what it showed, for the caller to hide again straight after
  function uncull(x, z, r) {
    const out = []; if (!CULL.on || !pagoda || !pagoda.visible) return out;
    pagoda.updateMatrixWorld();
    const p = _cv.set(x, 0, z).applyMatrix4(_cinv.copy(pagoda.matrixWorld).invert()), near = s => Math.hypot(s.center.x - p.x, s.center.z - p.z) - s.radius < r;
    CULL.cells.forEach(c => { if (near(c.sphere)) { if (!c.far) c.items.forEach(it => { if (!it.o.visible && near(it.s)) { it.o.visible = true; out.push(it.o); } }); c.batches.forEach(b => { if (!b.mesh.visible) { b.mesh.visible = true; out.push(b.mesh); } }); } });
    return out;
  }
  // hidden things cannot be tapped
  const shown = o => { for (; o && o !== pagoda; o = o.parent) if (!o.visible) return false; return true; };

