const BALLAD = [62, 66, 69, 71, 69, 66, 64, 57, 59, 62, 66, 64, 62, 57, 54, 57];
const hz = note => 440 * 2 ** ((note - 69) / 12);

export function createBarnBand() {
  let context, master, muted = false, cursor = 0, beat = 0, active = false;
  function tone(frequency, end, time, duration, volume, type = 'triangle') {
    const voice = context.createOscillator();
    const envelope = context.createGain();
    voice.type = type;
    voice.frequency.setValueAtTime(frequency, time);
    voice.frequency.exponentialRampToValueAtTime(end, time + duration);
    envelope.gain.setValueAtTime(.0001, time);
    envelope.gain.exponentialRampToValueAtTime(volume, time + .012);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    voice.connect(envelope).connect(master);
    voice.start(time);
    voice.stop(time + duration + .016);
  }
  function wake() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      if (!context) {
        context = new Audio();
        master = context.createGain();
        master.gain.value = muted ? 0 : .30;
        master.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume().catch(() => {});
    } catch { /* Sound never blocks a run. */ }
  }
  function toggle() {
    muted = !muted;
    if (master) master.gain.setTargetAtTime(muted ? 0 : .30, context.currentTime, .035);
    return muted;
  }
  function effect(name) {
    if (!master || muted || context.state !== 'running') return;
    const t = context.currentTime;
    if (name === 'start' || name === 'caught') {
      [1, .88, 1.10, .69, .92].forEach((n, i) => tone(320 * n, 143 * n, t + i * .067, .10, .14, 'sawtooth'));
    } else if (name === 'jump') tone(145, 720, t, .17, .16, 'sine');
    else if (name === 'slide') tone(220, 80, t, .21, .11, 'sawtooth');
    else if (name === 'hit') {
      tone(88, 31, t, .32, .30);
      tone(147, 44, t + .025, .22, .13, 'square');
    } else if (name === 'corn') {
      tone(784, 776, t, .14, .17);
      tone(1175, 1160, t + .065, .23, .13, 'sine');
    } else if (name === 'escaped') {
      [62, 66, 69, 74, 78].forEach((n, i) => tone(hz(n), hz(n), t + i * .115, .55, .18));
    }
  }
  function tick(playing) {
    if (!master || muted || context.state !== 'running' || !playing) { active = false; return; }
    const now = context.currentTime;
    if (!active || cursor < now) cursor = now + .025;
    active = true;
    while (cursor < now + .13) {
      const note = hz(BALLAD[beat % BALLAD.length]);
      tone(note, note * .998, cursor, .17, .095);
      if (beat % 4 === 0) {
        const bass = hz([38, 43, 35, 45][Math.floor(beat / 4) % 4]);
        tone(bass, bass, cursor, .35, .14);
      }
      if (beat % 4 === 2) tone(note / 2, note / 2, cursor, .14, .044);
      cursor += beat % 2 ? .156 : .245;
      beat++;
    }
  }
  return { wake, toggle, effect, tick };
}
