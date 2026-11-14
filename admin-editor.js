(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('edit') !== '1') return;

  const pageKey = window.location.pathname.split('/').pop() || 'index.html';
  const storageKey = 'dso-editor-draft:' + pageKey;
  const selector = 'main h1, main h2, main h3, main p, main .section-kicker, main .eyebrow, main .coming, main .image-note, main .gallery-tile, footer .footer-message h2, footer .footer-message p';
  const nodes = [...document.querySelectorAll(selector)].filter(node => !node.closest('nav'));
  nodes.forEach((node, index) => {
    node.dataset.adminEditable = String(index);
    node.setAttribute('contenteditable', 'true');
    node.setAttribute('spellcheck', 'true');
    node.classList.add('admin-editable');
  });

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    nodes.forEach((node, index) => {
      if (typeof saved[index] === 'string') node.innerHTML = saved[index];
    });
  } catch (error) {
    console.warn('DSO local draft could not be loaded.', error);
  }

  const bar = document.createElement('aside');
  bar.className = 'dso-editor-bar';
  bar.setAttribute('aria-label', 'DSO website editing preview');
  bar.innerHTML = '<div class="dso-editor-brand"><strong>DSO SITE EDITOR</strong><span>Prototype · local drafts only</span></div><div class="dso-editor-actions"><button type="button" data-action="save">Save draft</button><button type="button" data-action="export">Export draft</button><button type="button" data-action="public">Public view</button></div><p class="dso-editor-notice">Editing preview only. No secure admin login, database or public publishing is connected yet.</p>';
  document.body.appendChild(bar);

  bar.addEventListener('click', event => {
    const action = event.target.closest('button')?.dataset.action;
    if (!action) return;
    if (action === 'save') {
      const draft = {};
      nodes.forEach((node, index) => { draft[index] = node.innerHTML; });
      try {
        localStorage.setItem(storageKey, JSON.stringify(draft));
        const button = bar.querySelector('[data-action="save"]');
        button.textContent = 'Draft saved here';
        window.setTimeout(() => { button.textContent = 'Save draft'; }, 1800);
      } catch (error) {
        window.alert('This browser could not save the draft. Try Export draft instead.');
      }
    }
    if (action === 'export') {
      const draft = { page: pageKey, exportedAt: new Date().toISOString(), content: {} };
      nodes.forEach((node, index) => { draft.content[index] = node.innerHTML; });
      const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'dso-' + pageKey.replace(/[^a-z0-9.-]/gi, '-') + '-draft.json';
      link.click();
      URL.revokeObjectURL(url);
    }
    if (action === 'public') {
      window.location.href = window.location.pathname;
    }
  });
})();
