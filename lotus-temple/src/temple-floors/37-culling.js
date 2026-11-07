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
      if (Math.hypot(s.center.x, s.center.z) > CULL.far) return;   // the far hills and fields stay
      ch.traverse(n => { if (n.isInstancedMesh) n.frustumCulled = false; });   // the cell test does it, by the instances' real bounds
      const k = Math.floor(s.center.x / CULL.cell) + "," + Math.floor(s.center.z / CULL.cell);
      let c = cells.get(k); if (!c) cells.set(k, c = { items: [], box: new THREE.Box3(), sphere: new THREE.Sphere(), vis: true });
      c.items.push({ o: ch, s }); c.box.union(s.getBoundingBox(_cbx));
    });
    walk(g);
    CULL.cells = [...cells.values()];
    CULL.cells.forEach(c => c.box.getBoundingSphere(c.sphere));
  }
  // called every frame from the main script with the canvas height in pixels; works only when the view has changed
  function cull(cam, heightPx) {
    if (!CULL.on || !pagoda || !pagoda.visible) return;
    cam.updateMatrixWorld();
    const far = world.fog ? world.fog.far : Infinity;
    if (CULL.n++ % 30 && cam.matrixWorld.equals(CULL.lastM) && far === CULL.lastFar) return;   // nothing moved (a full pass now and then anyway)
    CULL.lastM.copy(cam.matrixWorld); CULL.lastFar = far;
    pagoda.updateMatrixWorld();
    const eye = _cv.setFromMatrixPosition(cam.matrixWorld).applyMatrix4(_cinv.copy(pagoda.matrixWorld).invert());   // the camera in the grounds' frame
    _frustum.setFromProjectionMatrix(_cm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).multiply(pagoda.matrixWorld));
    const focal = heightPx / 2 / Math.tan(cam.fov * Math.PI / 360);   // pixels per unit at unit distance
    CULL.cells.forEach(c => {
      if (eye.distanceTo(c.sphere.center) - c.sphere.radius > far || !_frustum.intersectsSphere(c.sphere)) {
        if (c.vis) { c.items.forEach(it => it.o.visible = false); c.vis = false; }
        return;
      }
      c.vis = true;
      c.items.forEach(({ o, s }) => {
        const d = eye.distanceTo(s.center);
        o.visible = d - s.radius < far && s.radius * focal / Math.max(d, .1) >= CULL.minPx && _frustum.intersectsSphere(s);
      });
    });
  }
  // hidden things cannot be tapped
  const shown = o => { for (; o && o !== pagoda; o = o.parent) if (!o.visible) return false; return true; };

