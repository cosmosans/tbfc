import { audio } from "./matchAudio";
import { hint, padBadge, reveal } from "./screenUI";
import { clubAccent, clubs, type Fixture } from "./opponentSquads";
import { menuPad, menuDirection } from "./menuPad";
import css from "./teamSelect.css?inline";

export function selectTeams(
  previous?: Fixture,
  standings?: ReadonlyMap<string, number>,
): Promise<Fixture | null> {
  const picks = [
    previous?.home ?? clubs[0],
    previous?.away ?? clubs[clubs.length - 1],
  ];
  const root = document.createElement("section");
  root.id = "team-select";
  root.setAttribute("aria-label", "Select teams");
  const style = document.createElement("style");
  style.textContent = css;
  root.innerHTML = `<div class="ts-wrap"><header class="ts-heading"><h1>Select teams</h1></header><div class="ts-match"><article></article><span class="ts-vs">VS</span><article></article></div><div class="ts-foot"><button class="ts-back">${padBadge("B")} Main Menu</button><span>${hint("↑ ↓", "LS ↕")} Club · ${hint("← →", "LS ↔")} Side · ${hint("Y", "Y")} Swap Home/Away · ${hint("Enter", "A")} Continue</span><button class="ts-next">${padBadge("Menu")} Side Select</button></div></div>`;
  root.prepend(style);
  document.body.append(root);
  const main = document.querySelector("main")!;
  main.inert = true;
  const cards = Array.from(root.querySelectorAll("article"));
  let side = 1,
    frame = 0;
  function paint(i: number) {
    const club = picks[i],
      card = cards[i],
      role = i === 0 ? "Home" : "Away";
    const rank = standings?.get(club.name);
    card.style.setProperty("--club", clubAccent(club));
    card.innerHTML = `<div class="ts-side">${role}</div><div class="ts-crest"><button data-step="-1" aria-label="Previous ${role} club">▴</button><img src="${club.crest}" alt=""><button data-step="1" aria-label="Next ${role} club">▾</button></div><h2>${club.name}</h2><div class="ts-stars" aria-label="${club.stars} out of 5 stars"><span>${"★".repeat(club.stars)}</span>${club.stars % 1 ? '<i class="ts-half">☆</i>' : ""}${"☆".repeat(5 - Math.ceil(club.stars))}</div>${rank == null ? "" : `<small>League position · ${rank}</small>`}`;
  }
  function focusSide(i: number) {
    side = i;
    cards.forEach((c, j) => (c.dataset.active = String(j === side)));
    cards[i].querySelector("button")!.focus({ preventScroll: true });
  }
  function swapSides() {
    picks.reverse();
    audio.menu("nav");
    paint(0);
    paint(1);
    focusSide(side);
  }
  function cycle(i: number, step: number) {
    let index = clubs.indexOf(picks[i]);
    do {
      index = (index + step + clubs.length) % clubs.length;
    } while (clubs[index] === picks[1 - i]);
    audio.menu("nav");
    picks[i] = clubs[index];
    paint(i);
    focusSide(i);
  }
  cards.forEach((card, i) => {
    paint(i);
    card.onclick = (e) => {
      const btn = (e.target as HTMLElement).closest("button");
      if (btn) cycle(i, Number(btn.dataset.step));
      else if (i !== side) {
        audio.menu("nav");
        focusSide(i);
      }
    };
  });
  root.addEventListener("focusin", (e) => {
    const i = cards.findIndex((c) => c.contains(e.target as Node));
    if (i >= 0) {
      side = i;
      cards.forEach((c, j) => (c.dataset.active = String(i === j)));
    }
  });
  focusSide(side);
  reveal(root, ".ts-heading,article,.ts-foot");
  return new Promise((resolve) => {
    function finish(back = false) {
      audio.menu(back ? "nav" : "success");
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", key);
      root.remove();
      main.inert = false;
      resolve(
        back
          ? null
          : {
              home: picks[0],
              away: picks[1],
            },
      );
    }
    root.querySelector<HTMLButtonElement>(".ts-next")!.onclick = () => finish();
    root.querySelector<HTMLButtonElement>(".ts-back")!.onclick = () =>
      finish(true);
    function navigate(dir: string) {
      if (dir === "u" || dir === "d") cycle(side, dir === "u" ? -1 : 1);
      else {
        const nextSide = dir === "l" ? 0 : 1;
        if (nextSide !== side) {
          focusSide(nextSide);
          audio.menu("nav");
        }
      }
    }
    function key(e: KeyboardEvent) {
      if (e.code === "KeyY") {
        e.preventDefault();
        if (!e.repeat) swapSides();
        return;
      }
      const dir = (
        {
          ArrowLeft: "l",
          ArrowRight: "r",
          ArrowUp: "u",
          ArrowDown: "d",
        } as Record<string, string>
      )[e.key];
      if (dir) {
        e.preventDefault();
        navigate(dir);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        finish(true);
        return;
      }
      if (
        e.key === "Enter" &&
        document.activeElement !== root.querySelector(".ts-back")
      ) {
        e.preventDefault();
        finish();
      }
    }
    window.addEventListener("keydown", key);
    let last = "",
      next = 0,
      pressed = !!menuPad()?.buttons.some(
        (b, i) => (i === 0 || i === 9) && b.pressed,
      );
    let swapHeld = !!menuPad()?.buttons[3]?.pressed;
    let backHeld = !!menuPad()?.buttons[1]?.pressed;
    function poll(now: number) {
      const pad = menuPad(),
        dir = pad ? menuDirection(pad) : "";
      if (dir && (dir !== last || now >= next)) {
        navigate(dir);
        next = now + (dir === last ? 190 : 330);
      }
      last = dir;
      const swap = !!pad?.buttons[3]?.pressed;
      if (swap && !swapHeld) swapSides();
      swapHeld = swap;
      const back = !!pad?.buttons[1]?.pressed;
      if (back && !backHeld) {
        finish(true);
        return;
      }
      backHeld = back;
      const down = !!(pad?.buttons[0]?.pressed || pad?.buttons[9]?.pressed);
      if (down && !pressed) {
        finish();
        return;
      }
      pressed = down;
      frame = requestAnimationFrame(poll);
    }
    frame = requestAnimationFrame(poll);
  });
}
