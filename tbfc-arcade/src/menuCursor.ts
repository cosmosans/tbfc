/** Free-moving controller pointer for settings screens. Coordinates are viewport pixels. */
export function menuCursor(root: HTMLElement) {
  const pointer = document.createElement('div');
  pointer.className = 'house-pad-cursor';
  pointer.setAttribute('aria-hidden', 'true');
  pointer.hidden = true;
  document.body.append(pointer);
  const initial = (root.contains(document.activeElement) ? document.activeElement : root)?.getBoundingClientRect();
  let x = initial ? initial.left + initial.width / 2 : innerWidth / 2;
  let y = initial ? initial.top + initial.height / 2 : innerHeight / 2;
  let lastTime = 0;
  let hovered: HTMLElement | null = null;
  const clearHover = () => { hovered?.classList.remove('house-cursor-hover'); hovered = null; };
  const hide = () => {
    pointer.hidden = true;
    root.classList.remove('house-cursor-active');
    clearHover();
  };
  window.addEventListener('pointermove', hide);
  window.addEventListener('pointerdown', hide);
  window.addEventListener('keydown', hide);
  const hit = () => {
    const element = document.elementFromPoint(x, y);
    return element && root.contains(element) ? element : null;
  };
  return {
    update(pad: Gamepad | undefined, now: number) {
      const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 1 / 60;
      lastTime = now;
      if (!pad) { hide(); return; }
      let ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
      // D-pad also nudges the pointer, without switching back to button focus.
      if (pad.buttons[14]?.pressed) ax = -1;
      else if (pad.buttons[15]?.pressed) ax = 1;
      if (pad.buttons[12]?.pressed) ay = -1;
      else if (pad.buttons[13]?.pressed) ay = 1;
      const magnitude = Math.hypot(ax, ay);
      const moving = magnitude > .18;
      if (moving || pad.buttons.some(b => b.pressed)) {
        pointer.hidden = false;
        root.classList.add('house-cursor-active');
      }
      if (pointer.hidden) return;
      if (moving) {
        // Gentle deflection is precise; full deflection crosses the panel quickly.
        const speed = 850 * Math.pow((Math.min(1, magnitude) - .18) / .82, 1.5);
        x += ax / magnitude * speed * dt;
        y += ay / magnitude * speed * dt;
      }
      const bounds = root.getBoundingClientRect();
      x = Math.max(Math.max(0, bounds.left) + 2, Math.min(Math.min(innerWidth, bounds.right) - 2, x));
      y = Math.max(Math.max(0, bounds.top) + 2, Math.min(Math.min(innerHeight, bounds.bottom) - 2, y));
      pointer.style.transform = `translate(${x}px, ${y}px)`;
      let element = hit();
      // Holding the stick into a scrollable panel's top/bottom edge reveals more settings.
      for (let panel: Element | null = element; panel && root.contains(panel); panel = panel.parentElement) {
        if (!(panel instanceof HTMLElement) || panel.scrollHeight <= panel.clientHeight || !/auto|scroll/.test(getComputedStyle(panel).overflowY)) continue;
        const rect = panel.getBoundingClientRect();
        if (moving && ay < -.18 && y < rect.top + 36) panel.scrollTop -= 420 * dt;
        if (moving && ay > .18 && y > rect.bottom - 36) panel.scrollTop += 420 * dt;
        break;
      }
      element = hit();
      const next = element?.closest<HTMLElement>('button:enabled,input:enabled') ?? null;
      if (next !== hovered) {
        clearHover();
        hovered = next;
        hovered?.classList.add('house-cursor-hover');
      }
      pointer.classList.toggle('house-pad-cursor-clickable', !!hovered);
    },
    click() {
      const target = hit()?.closest<HTMLElement>('button:enabled,input:enabled');
      if (!target || pointer.hidden) return;
      target.focus({preventScroll: true});
      target.click();
    },
    destroy() {
      hide();
      pointer.remove();
      window.removeEventListener('pointermove', hide);
      window.removeEventListener('pointerdown', hide);
      window.removeEventListener('keydown', hide);
    },
  };
}
