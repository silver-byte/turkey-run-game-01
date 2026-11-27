const ACTIONS = new Map(Object.entries({
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', ArrowDown: 'duck', KeyS: 'duck',
  Enter: 'start', KeyR: 'restart', KeyM: 'mute',
}));

export function watchInput(cabinet, onGesture) {
  const pending = new Set();
  window.addEventListener('keydown', event => {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    const action = ACTIONS.get(event.code);
    if (!action) return;
    if (event.target instanceof HTMLButtonElement && (event.code === 'Enter' || event.code === 'Space')) return;
    event.preventDefault();
    if (!event.repeat) {
      onGesture();
      pending.add(action);
    }
  });
  cabinet.addEventListener('click', event => {
    onGesture();
    const action = event.target.closest('[data-action]')?.dataset.action;
    pending.add(action || 'start');
  });
  window.addEventListener('blur', () => pending.clear());
  return () => {
    const commands = Object.fromEntries([...pending].map(action => [action, true]));
    pending.clear();
    return commands;
  };
}
