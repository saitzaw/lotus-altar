    /* ---------- the ensemble at the sides of the stage, Shan musicians in Shan dress, tan jackets, baggy tan trousers and headcloths, the gong and cymbal players with big straw hats hung on their backs: the
       two long drums on the left, the row of gongs and the cymbals on the right (players and instruments from ensembleKit). The
       dancers keep to them: every bar opens on the drum's deep stroke and the gongs, on which the kinnara lands from a hop ---------- */
    const E = ensembleKit(), shownD = D => () => D.visible;
    // the long drums at the left of the stage, side by side: the first leads, the second answers and fills in
    const drummers = [E.longDrummer(G, C.x - 5.6, C.y, C.z - 1.05, 1.0, 0xe88a8a), E.longDrummer(G, C.x - 5.6, C.y, C.z + .15, 1.0, 0xf0f0e8)];
    drummers.forEach(d => E.gate(d.D, list, E.INFO.drums, shownD(d.D)));
    /* the gongs at the front right of the stage, facing the crowd, the big gong at the stage's edge; the player sits on a stool
       beyond the big gong's end, facing along the case, his left hand on the rod's grip */
    const gonger = (() => {
      const FX = C.x + 5.0, FZ = C.z + 1.45, gc = E.gongCase(G, FX, C.y, FZ, Math.PI);
      const m = E.musician(G, FX + gc.L / 2 + .55, C.y, FZ + .05, -Math.PI / 2, 0xe8a040, true), { D, B, hd } = m, l = m.arm(1), r = m.arm(-1);
      mesh(new THREE.SphereGeometry(.045, 8, 6), skin, 0, -.28, 0, l.e); mesh(new THREE.SphereGeometry(.045, 8, 6), skin, 0, -.28, 0, r.e);
      r.a.rotation.set(-.6, 0, -.15); r.e.rotation.x = -.9;   // the right hand on his knee
      G.updateMatrixWorld(true);
      const p = E.gongPlayer(gc, D, l.e.children[l.e.children.length - 1], l);
      const info = { tip: "Gongs · မွင်း", toast: "Five bronze bossed gongs (မွင်း), graduated from the largest and deepest to the smallest, hung in a painted case: yellow posts, red dividers, a blue back, and a crest board with gilt scrolls round the Shan flag. One player sounds all five at once: a yellow padded beater hangs on an arm before each gong, the arms joined by a rod, and he pushes the rod from his stool at the end so every beater strikes together. The gongs ring as one chord on every second beat, lightly on the half beat before it, and the long drum is tuned to the big gong's note, so their hum never stops under the dance. With the long drums and the cymbals they make the Shan ensemble for the ka nok." };
      E.gate(D, list, info, shownD(D)); E.gate(gc.F, list, info, shownD(gc.F));
      const step = dt => { const k = p.step(dt); B.rotation.z = -k * .03; hd.rotation.x = .1; };   // leaning into the push
      return { D, D2: gc.F, hit: p.hit, step, poses: p.poses };
    })();
    // the cymbal player, at the back right corner
    const cymbaler = E.cymbaler(G, C.x + 5.45, C.y, C.z - 1.6, -.6, 0xe8c040);
    E.gate(cymbaler.D, list, E.INFO.cym, shownD(cymbaler.D));
    const band = [...drummers, gonger, cymbaler];
    // play one stroke: the player moves and the sound is queued for the ambience
    // each sound carries `due`, the moment (performance.now(), s) the stroke fell, so the ambience can place it exactly on the audio
    // clock rather than on whichever frame noticed it: the rhythm keeps time however uneven the frames are
    const play = (kind, v, who = 0, due = 0) => {
      if (kind === "gong") gonger.hit(); else if (kind === "cym") cymbaler.hit(); else drummers[who].hit(kind, v);
      E.sound(kind, v, who, due);
    };
    const strokes = (c0, c1, marks, sec) => E.strokes(c0, c1, marks, sec, play), frame = E.frame;
    pose();
    return (dt, motion) => {
      const show = FOLK.dance;
      const alone = show === "solo" || show === "toKinnara";   // the kinnara dancing alone: on his own, or between the two to
      pair[0].D.visible = alone || show === "pair"; pair[1].D.visible = show === "pair";   // the band plays for the to too
      // the singer stands alone between the dances, with no band and no sound: the players step off with their drums and cymbals,
      // leaving the gongs in their case, and no stroke is played; out of the show hours the stage is empty but for the gong case
      const off = !show || show === "singer"; band.forEach(b => b.D.visible = !off);
      if (!show || off) return;
      const d = dt * motion, q0 = t / BAR - .5, c0 = hn + ht / BAR;
      t += d;
      const sec = BAR / Math.max(motion, .01);
      if (alone) { solo(d); strokes(c0, hn + ht / BAR, frame, sec); }
      else {
        if (show === "pair") pose();   // the pair dip into their knees on the deep strokes and open and fold their wings gong to gong
        strokes(q0, t / BAR - .5, frame, sec);
      }
      band.forEach(b => b.step(d));
      return show === "toKinnara" ? hn + ht / BAR : show === "to" || show === "twoTo" ? t / BAR - .5 : undefined;   // the bar count, for the to to keep time to
    };
  }
