// Read sibling modules through Chrome's local folder picker when file:// imports are blocked.
(() => {
  const panel = document.querySelector('#file-access');
  const status = panel.querySelector('p');
  const picker = document.querySelector('#folder');
  panel.hidden = false;
  picker.addEventListener('change', async () => {
    const files = new Map([...picker.files].map(file => [file.webkitRelativePath.split('/').slice(1).join('/'), file]));
    const urls = new Map();
    async function link(path) {
      if (!urls.has(path)) {
        const file = files.get(path);
        if (!file) throw new Error('Select the game folder itself, which contains index.html');
        const source = await file.text();
        const imports = path.startsWith('vendor/') ? [] : [...source.matchAll(/^(?:import|export)\s+[^\n]*?\bfrom\s+['"](\.[^'"\n]+)['"]/gm)];
        let code = source;
        for (const match of imports.reverse()) {
          const reference = new URL(match[1], `file:///${path}`).pathname.slice(1);
          const dependency = await link(reference);
          code = code.slice(0, match.index) + match[0].replace(match[1], dependency) + code.slice(match.index + match[0].length);
        }
        urls.set(path, URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
      }
      return urls.get(path);
    }
    try {
      await import(await link('src/main.js'));
      panel.hidden = true;
    } catch (error) {
      status.textContent = error.message;
      picker.value = '';
    } finally {
      for (const url of urls.values()) URL.revokeObjectURL(url);
    }
  });
})();
