import { FINISH, MAX_LIVES, sectorAt } from './config.js';
import { finishGrade } from './game.js';

const SCORE = new Intl.NumberFormat('en-US');
const padded = (value, length) => String(value).padStart(length, '0');

function statCell(label, reading) {
  const cell = document.createElement('div');
  const key = document.createElement('span');
  const value = document.createElement('b');
  cell.className = 'result-cell';
  key.textContent = label;
  value.textContent = reading;
  cell.append(key, value);
  return cell;
}

export function createHud(cabinet) {
  const $ = id => cabinet.querySelector(`#${id}`);
  const el = Object.fromEntries(['score', 'distance', 'lives', 'sector-number', 'sector-name', 'heat', 'heat-label', 'heat-detail',
    'notice', 'banner', 'banner-index', 'banner-kicker', 'headline', 'subtitle', 'story', 'result', 'cta', 'track', 'fill', 'sound-label', 'sound']
    .map(id => [id, $(id)]));
  let previousMode, previousLives, previousDistance, previousSector;
  const distanceNumber = document.createTextNode('000 ');
  el.distance.replaceChildren(distanceNumber, el.distance.querySelector('small'));
  const set = (id, text) => { if (el[id].textContent !== text) el[id].textContent = text; };

  function changeBanner(run) {
    const mode = run.mode;
    cabinet.dataset.mode = mode;
    el.banner.hidden = mode === 'play';
    el.result.hidden = mode === 'title';
    if (mode === 'title' || mode === 'play') return;
    const escaped = mode === 'escaped';
    set('banner-index', escaped ? '04' : '×');
    set('banner-kicker', escaped ? 'THE GREAT THANKSGIVING ESCAPE' : 'THE DINNER BELL RINGS');
    set('headline', escaped ? 'ESCAPED!' : 'CAUGHT!');
    set('subtitle', escaped ? 'Free at last.' : 'Thanksgiving is saved… for the farmer.');
    set('story', escaped ? 'One turkey. Five hundred metres. No leftovers.' : 'The wild gate is still out there. Give it another run.');
    set('cta', 'PRESS R OR CLICK TO RUN AGAIN');
    const stats = [['FINAL SCORE', SCORE.format(run.score)], ['DISTANCE', `${Math.floor(run.distance)} M`]];
    if (escaped) stats.push(['TIME', `${run.time.toFixed(1)} S`], ['GRADE', finishGrade(run)]);
    else stats.push(['CORN', String(run.corn)]);
    el.result.replaceChildren(...stats.map(([label, reading]) => statCell(label, reading)));
  }

  function draw(run) {
    if (run.mode !== previousMode) { changeBanner(run); previousMode = run.mode; }
    set('score', padded(run.score, 5));
    const distance = Math.floor(run.distance);
    if (distance !== previousDistance) {
      previousDistance = distance;
      distanceNumber.data = `${padded(distance, 3)} `;
      el.track.setAttribute('aria-valuenow', String(distance));
    }
    el.fill.style.width = `${run.distance / FINISH * 100}%`;
    if (run.lives !== previousLives) {
      previousLives = run.lives;
      el.lives.replaceChildren(...Array.from({ length: MAX_LIVES }, (_, i) => {
        const heart = document.createElement('span');
        heart.textContent = i < run.lives ? '♥' : '♡';
        if (i >= run.lives) heart.className = 'lost';
        return heart;
      }));
      el.lives.setAttribute('aria-label', `${run.lives} ${run.lives === 1 ? 'life' : 'lives'}`);
    }
    const sector = sectorAt(distance);
    if (sector !== previousSector) {
      previousSector = sector;
      set('sector-number', sector.number); set('sector-name', sector.name);
    }
    const danger = run.gap < 5.2;
    el.heat.dataset.danger = danger;
    set('heat-label', danger ? 'FARMER CLOSING IN' : 'FARMER BEHIND');
    set('heat-detail', `${run.gap.toFixed(1)} M BACK`);
    el.notice.hidden = run.mode !== 'play' || !run.noticeTime;
    el.notice.dataset.hit = run.notice.includes('FEATHER');
    set('notice', run.notice);
  }
  function sound(muted) {
    set('sound-label', muted ? 'SOUND OFF' : 'SOUND ON');
    el.sound.setAttribute('aria-pressed', String(!muted));
  }
  return { draw, sound };
}
