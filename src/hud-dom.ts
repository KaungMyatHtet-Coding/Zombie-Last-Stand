// Patch live HUD nodes in place so hover, focus and pointer presses survive updates.
export function updateHud(container: HTMLElement, html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const key = (node: Node) => node instanceof Element
    ? `${node.tagName}:${node.getAttribute('data-hp-popup') || node.getAttribute('data-hud') || ''}:${node.classList[0] || ''}`
    : node.nodeType.toString();
  function patch(parent: Node, incoming: Node) {
    let current: Node | null = parent.firstChild;
    for (const next of Array.from(incoming.childNodes)) {
      if (!current || key(current) !== key(next)) {
        let match = current?.nextSibling || null;
        while (match && key(match) !== key(next)) match = match.nextSibling;
        if (match) {
          while (current !== match) {
            const obsolete = current!;
            current = obsolete.nextSibling;
            parent.removeChild(obsolete);
          }
        } else {
          const added = next.cloneNode(true);
          parent.insertBefore(added, current);
          current = added;
        }
      }
      const live = current!;
      if (live instanceof Element && next instanceof Element) {
        for (const attr of Array.from(live.attributes)) {
          if (!next.hasAttribute(attr.name)) live.removeAttribute(attr.name);
        }
        for (const attr of Array.from(next.attributes)) {
          if (live.getAttribute(attr.name) !== attr.value) live.setAttribute(attr.name, attr.value);
        }
        patch(live, next);
      } else if (live.nodeValue !== next.nodeValue) live.nodeValue = next.nodeValue;
      current = live.nextSibling;
    }
    while (current) {
      const next = current.nextSibling;
      parent.removeChild(current);
      current = next;
    }
  }
  patch(container, template.content);
}
