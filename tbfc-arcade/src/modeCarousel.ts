import { audio } from './matchAudio';
import type { ScreenNavigation } from './kickOff';
import { wrapIndex, carouselOffset } from './carouselPosition';
import './modeCarousel.css';

type Mode<Id extends string> = {id: Id; title: string; tag: string; image: string};
export function mountModeCarousel<Id extends string>(root: HTMLElement, modes: readonly Mode<Id>[], initial: Id, finish: (mode: Id | null) => void): ScreenNavigation {
  const viewport = root.querySelector<HTMLElement>('.mode-carousel-viewport')!;
  const heading = root.querySelector<HTMLElement>('.mode-carousel-title')!;
  const description = root.querySelector<HTMLElement>('.mode-carousel-description')!;
  const pips = root.querySelector<HTMLElement>('.mode-carousel-pips')!;
  const count = root.querySelector<HTMLElement>('.mode-carousel-count')!;
  let selected = Math.max(0, modes.findIndex(mode => mode.id === initial));
  let lastSound = -Infinity;
  let suppressClickUntil = 0;
  let previousOffsets: number[] = [];
  // Mount every image once. Offscreen cards remain loaded for rapid browsing.
  const cards = modes.map((mode, i) => {
    const button = document.createElement('button');
    button.className = 'mode-carousel-card';
    button.dataset.mode = mode.id;
    button.setAttribute('aria-label', mode.title);
    const img = document.createElement('img');
    img.src = mode.image; img.alt = ''; img.draggable = false;
    img.loading = 'eager'; img.decoding = 'async';
    button.append(img); viewport.append(button);
    button.onclick = () => {
      if (performance.now() < suppressClickUntil) return;
      if (i === selected) confirm(); else select(i);
    };
    const pip = document.createElement('button');
    pip.type = 'button'; pip.className = 'mode-carousel-pip';
    pip.setAttribute('aria-label', mode.title);
    pip.onclick = () => select(i);
    pips.append(pip);
    return button;
  });
  function paint(animate = true) {
    cards.forEach((card, i) => {
      const offset = carouselOffset(i, selected, modes.length);
      // Recycle only offscreen cards across the seam, never sweep through the centre.
      const recycled = previousOffsets[i] !== undefined && Math.abs(offset - previousOffsets[i]) > modes.length / 2;
      card.classList.toggle('carousel-snap', !animate || recycled);
      card.style.setProperty('--offset', String(offset));
      card.dataset.distance = String(Math.min(3, Math.abs(offset)));
      card.style.zIndex = String(10 - Math.abs(offset));
      card.tabIndex = i === selected ? 0 : -1;
      card.setAttribute('aria-current', String(i === selected));
      card.setAttribute('aria-hidden', String(Math.abs(offset) > 2));
      const pip = pips.children[i] as HTMLButtonElement;
      pip.setAttribute('aria-current', String(i === selected));
      pip.tabIndex = -1;
      previousOffsets[i] = offset;
    });
    heading.textContent = modes[selected].title;
    description.textContent = modes[selected].tag;
    count.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(modes.length).padStart(2, '0')}`;
    cards[selected].focus({preventScroll: true});
  }
  function select(index: number) {
    const next = wrapIndex(index, modes.length);
    if (next === selected) return;
    selected = next;
    paint();
    const now = performance.now();
    if (now - lastSound >= 70) { audio.menu('nav'); lastSound = now; }
  }
  function confirm() { finish(modes[selected].id); }
  root.querySelector<HTMLButtonElement>('[data-confirm]')!.onclick = confirm;
  root.querySelector<HTMLButtonElement>('[data-back]')!.onclick = () => finish(null);
  root.querySelector<HTMLButtonElement>('[data-pad-button="4"]')!.onclick = () => select(selected - 3);
  root.querySelector<HTMLButtonElement>('[data-pad-button="5"]')!.onclick = () => select(selected + 3);
  let touch: {x: number; y: number; id: number} | undefined;
  viewport.onpointerdown = event => {
    if (event.pointerType === 'touch') touch = {x: event.clientX, y: event.clientY, id: event.pointerId};
  };
  viewport.onpointerup = event => {
    if (!touch || touch.id !== event.pointerId) return;
    const dx = event.clientX - touch.x, dy = event.clientY - touch.y;
    touch = undefined;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
      suppressClickUntil = performance.now() + 350;
      select(selected + (dx < 0 ? 1 : -1));
    }
  };
  viewport.onpointercancel = () => { touch = undefined; };
  paint(false);
  // Establish the initial transforms before enabling transitions; input never waits.
  void viewport.offsetWidth;
  cards.forEach(card => card.classList.remove('carousel-snap'));
  return {
    move(direction) { if (direction === 'l') select(selected - 1); else if (direction === 'r') select(selected + 1); },
    confirm, repeatDelay: 275, repeatInterval: 115,
  };
}
