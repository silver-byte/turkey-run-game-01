import * as THREE from '../vendor/three.module.min.js';
import { createBarnBand } from './audio.js';
import { newRun, stepRun } from './game.js';
import { createHud } from './hud.js';
import { watchInput } from './input.js';
import { createFarmView } from './render.js';
import { stageShot } from './shots.js';
import { generateCourse, layoutScenery } from './world.js';

function boot() {
  const query = new URLSearchParams(location.search);
  const seed = Number.parseInt(query.get('seed') ?? '1', 10) | 0;
  const cabinet = document.querySelector('#cabinet');
  cabinet.dataset.three = THREE.REVISION;
  const course = generateCourse(seed);
  const view = createFarmView(document.querySelector('#farm'), course, layoutScenery(seed), seed);
  const hud = createHud(cabinet);
  const still = stageShot(query.get('shot'), course);
  if (still) {
    const paintShot = () => view.draw(still.run, still.phase);
    hud.draw(still.run);
    paintShot();
    window.addEventListener('resize', paintShot);
    cabinet.dataset.ready = 'true';
    return;
  }

  const band = createBarnBand();
  const readInput = watchInput(cabinet, band.wake);
  let run = newRun(course), phase = 0, timeBefore = null, remainder = 0, nextDraw = 0;
  const fixedStep = 1 / 120;
  const queued = {};
  function beginRun() {
    run = newRun(course, 'play');
    phase = 0;
    remainder = 0;
    for (const key of Object.keys(queued)) delete queued[key];
    band.effect('start');
  }
  function frame(now) {
    const dt = timeBefore === null ? 0 : Math.min(.12, Math.max(0, (now - timeBefore) / 1000));
    timeBefore = now;
    const input = readInput();
    if (input.mute) hud.sound(band.toggle());
    if (input.restart || (input.start && run.mode !== 'play')) beginRun();
    phase += dt;
    if (run.mode === 'play') {
      for (const key of ['left', 'right', 'jump', 'duck']) if (input[key]) queued[key] = true;
      remainder += dt;
      while (remainder >= fixedStep && run.mode === 'play') {
        stepRun(run, queued, fixedStep);
        remainder -= fixedStep;
        for (const key of Object.keys(queued)) delete queued[key];
      }
      for (const effect of run.events.splice(0)) band.effect(effect);
    }
    band.tick(run.mode === 'play');
    hud.draw(run);
    if (run.mode === 'play' || now >= nextDraw) {
      view.draw(run, phase, dt);
      nextDraw = now + 33;
    }
    requestAnimationFrame(frame);
  }
  hud.draw(run);
  view.draw(run, phase);
  cabinet.dataset.ready = 'true';
  requestAnimationFrame(frame);
}

boot();
