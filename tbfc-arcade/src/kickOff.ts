import { renderMarkup } from "./templates/renderMarkup";
import modeCardTemplate from "./templates/street/mode-card.html?raw";
import modeEmptyTemplate from "./templates/street/mode-empty.html?raw";
import modeLegendTemplate from "./templates/street/mode-legend.html?raw";
import modeSelectTemplate from "./templates/street/mode-select.html?raw";
import teamSizeDotTemplate from "./templates/street/team-size-dot.html?raw";
import teamSizeCardTemplate from "./templates/street/team-size-card.html?raw";
import teamSizeTemplate from "./templates/street/team-size.html?raw";
import courtSwatchTemplate from "./templates/street/court-swatch.html?raw";
import durationOptionTemplate from "./templates/street/duration-option.html?raw";
import timeOptionTemplate from "./templates/street/time-option.html?raw";
import weatherOptionTemplate from "./templates/street/weather-option.html?raw";
import difficultyOptionTemplate from "./templates/street/difficulty-option.html?raw";
import courtSettingsTemplate from "./templates/street/court-settings.html?raw";
import { audio } from "./matchAudio";
import { padBadge, reveal } from "./screenUI";
import { menuPad, menuDirection } from "./menuPad";
import {
  readStreetPreferences,
  saveStreetPreferences,
  courtPresets,
  type GameMode,
  type StreetPreferences,
} from "./matchRules";
import { selectableDivisions, profiles } from "./difficulty";
import classicArt from "./art/stadium-previews/maynard.jpg";
import streetArt from "./art/stadium-previews/gulch.jpg";
import "./kickOff.css";

// One input lifecycle shared by the mode grid, team sizes and court settings.
function screen<T>(
  draw: (root: HTMLElement, finish: (value: T | null) => void) => void,
): Promise<T | null> {
  const root = document.createElement("section");
  root.className = "kickoff-screen";
  root.setAttribute("aria-label", "Kickoff setup");
  document.body.append(root);
  const main = document.querySelector("main")!;
  main.inert = true;
  return new Promise((resolve) => {
    let frame = 0,
      done = false,
      dir = "",
      repeat = 0,
      held = Array.from(menuPad()?.buttons ?? [], (b) => b.pressed);
    function finish(value: T | null) {
      if (done) return;
      done = true;
      cancelAnimationFrame(frame);
      root.remove();
      main.inert = false;
      audio.menu(value === null ? "nav" : "success");
      resolve(value);
    }
    function move(direction: string) {
      const buttons = [
          ...root.querySelectorAll<HTMLButtonElement>("button:enabled"),
        ],
        current = document.activeElement as HTMLButtonElement;
      if (!buttons.includes(current)) {
        buttons[0]?.focus();
        return;
      }
      const r = current.getBoundingClientRect(),
        dx = direction === "r" ? 1 : direction === "l" ? -1 : 0,
        dy = direction === "d" ? 1 : direction === "u" ? -1 : 0;
      let best = Infinity,
        target = current;
      for (const b of buttons) {
        const p = b.getBoundingClientRect(),
          x = p.x + p.width / 2 - r.x - r.width / 2,
          y = p.y + p.height / 2 - r.y - r.height / 2,
          forward = x * dx + y * dy,
          cost = forward + 3 * Math.abs(x * dy - y * dx);
        if (forward > 2 && cost < best) {
          best = cost;
          target = b;
        }
      }
      if (target !== current) {
        target.focus();
        audio.menu("nav");
      }
    }
    root.onkeydown = (e) => {
      const direction = (
        {
          ArrowLeft: "l",
          ArrowRight: "r",
          ArrowUp: "u",
          ArrowDown: "d",
        } as Record<string, string>
      )[e.key];
      if (direction) {
        e.preventDefault();
        move(direction);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (!e.repeat) finish(null);
      }
      if (e.repeat && (e.key === "Enter" || e.key === " ")) e.preventDefault();
    };
    draw(root, finish);
    root
      .querySelector<HTMLButtonElement>('[aria-pressed="true"],button')
      ?.focus();
    reveal(root, "h1,.ko-card,.ko-preview,.ko-settings,footer,.ko-mode-legend");
    function poll(now: number) {
      if (done) return;
      const pad = menuPad(),
        next = pad ? menuDirection(pad) : "",
        down = Array.from(pad?.buttons ?? [], (b) => b.pressed);
      if (next && (next !== dir || now >= repeat)) {
        move(next);
        repeat = now + (next === dir ? 160 : 380);
      }
      if (down[1] && !held[1]) finish(null);
      else if (down[0] && !held[0])
        (document.activeElement as HTMLButtonElement)?.click();
      else if (down[9] && !held[9])
        root.querySelector<HTMLButtonElement>("[data-next]")?.click();
      held = down;
      dir = next;
      if (!done) frame = requestAnimationFrame(poll);
    }
    frame = requestAnimationFrame(poll);
  });
}
// Both selection screens share markup and controller badges to keep navigation consistent.
const selectionLegend = () =>
  renderMarkup(modeLegendTemplate, {
    moveHint: padBadge("LS"),
    selectHint: padBadge("A"),
    backHint: padBadge("B"),
  });
export function selectGameMode(initial: GameMode = "classic") {
  return screen<GameMode>((root, finish) => {
    root.innerHTML = renderMarkup(modeSelectTemplate, {
      modeCards: [
        {
          id: "classic",
          title: "CLASSIC",
          subtitle: "7V7 SOCCER",
          tag: "The beautiful game.",
          image: classicArt,
        },
        {
          id: "street",
          title: "STREET (BETA)",
          subtitle: "3V3 / 5V5 — NO KEEPERS",
          tag: "Off the wall action.",
          image: streetArt,
        },
      ]
        .map((m) =>
          renderMarkup(modeCardTemplate, {
            m_id: m.id,
            selected: initial === m.id,
            m_image: m.image,
            m_title: m.title,
            m_subtitle: m.subtitle,
            m_tag: m.tag,
          }),
        )
        .join(""),
      emptySlots: modeEmptyTemplate.slice(0, -1).repeat(7),
      footer: selectionLegend(),
    });
    root
      .querySelectorAll<HTMLButtonElement>("[data-mode]")
      .forEach((b) => (b.onclick = () => finish(b.dataset.mode as GameMode)));
    root.querySelector<HTMLButtonElement>("[data-back]")!.onclick = () =>
      finish(null);
  });
}
export function selectStreetSize(preferences = readStreetPreferences()) {
  return screen<StreetPreferences>((root, finish) => {
    root.innerHTML = renderMarkup(teamSizeTemplate, {
      sizeCards: [3, 5]
        .map((n) =>
          renderMarkup(teamSizeCardTemplate, {
            n: n,
            selected: n === preferences.teamSize,
            playerDots: teamSizeDotTemplate.slice(0, -1).repeat(n),
            n_4: n,
            n_5: n,
            n_6: n,
          }),
        )
        .join(""),
      footer: selectionLegend(),
    });
    root.querySelectorAll<HTMLButtonElement>("[data-size]").forEach(
      (b) =>
        (b.onclick = () => {
          const p = {
            ...preferences,
            teamSize: Number(b.dataset.size) as 3 | 5,
          };
          saveStreetPreferences(p);
          finish(p);
        }),
    );
    root.querySelector<HTMLButtonElement>("[data-back]")!.onclick = () =>
      finish(null);
  });
}
export function customizeStreet(preferences: StreetPreferences) {
  return screen<StreetPreferences>((root, finish) => {
    let p = { ...preferences };
    root.innerHTML = renderMarkup(courtSettingsTemplate, {
      p_teamSize: p.teamSize,
      p_teamSize_2: p.teamSize,
      courtSwatches: courtPresets
        .map((c) =>
          renderMarkup(courtSwatchTemplate, {
            c_id: c.id,
            c_color: c.color,
            c_name: c.name,
            c_name_4: c.name,
          }),
        )
        .join(""),
      durationOptions: [2, 3, 5]
        .map((n) =>
          renderMarkup(durationOptionTemplate, {
            n: n,
            n_2: n,
          }),
        )
        .join(""),
      timeOptions: ["Day", "Evening", "Night"]
        .map((t) =>
          renderMarkup(timeOptionTemplate, {
            t: t,
            t_2: t,
          }),
        )
        .join(""),
      weatherOptions: ["Sun", "Clouds", "Rain", "Snow"]
        .map((w) =>
          renderMarkup(weatherOptionTemplate, {
            w: w,
            w_2: w,
          }),
        )
        .join(""),
      difficultyOptions: selectableDivisions
        .map((d) =>
          renderMarkup(difficultyOptionTemplate, {
            d: d,
            slot02: d.toUpperCase(),
          }),
        )
        .join(""),
      backHint: padBadge("B"),
      moveHint: padBadge("LS"),
      selectHint: padBadge("A"),
      startHint: padBadge("Menu"),
    });
    function sync() {
      saveStreetPreferences(p);
      const c = courtPresets.find((c) => c.id === p.court)!;
      root.style.setProperty("--court", c.color);
      root.querySelector("[data-court-name]")!.textContent = c.name;
      root
        .querySelectorAll<HTMLElement>(
          "[data-court],[data-rule],[data-minutes],[data-difficulty],[data-time],[data-weather]",
        )
        .forEach((b) =>
          b.setAttribute(
            "aria-pressed",
            String(
              b.dataset.court === p.court ||
                b.dataset.rule === p.winCondition ||
                Number(b.dataset.minutes) === p.halfMinutes ||
                b.dataset.difficulty === p.difficulty ||
                b.dataset.time === p.time ||
                b.dataset.weather === p.weather,
            ),
          ),
        );
      root
        .querySelectorAll<HTMLButtonElement>("[data-minutes]")
        .forEach((b) => (b.disabled = p.winCondition === "target"));
      root.querySelector("[data-difficulty-label]")!.textContent =
        profiles[p.difficulty as keyof typeof profiles]?.label ?? "";
    }
    root.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
      if (!b) return;
      if (b.hasAttribute("data-back")) {
        finish(null);
        return;
      }
      if (b.hasAttribute("data-next")) {
        saveStreetPreferences(p);
        finish(p);
        return;
      }
      if (b.dataset.time) p.time = b.dataset.time as typeof p.time;
      if (b.dataset.weather) p.weather = b.dataset.weather as typeof p.weather;
      if (b.dataset.court) p.court = b.dataset.court as typeof p.court;
      if (b.dataset.rule)
        p.winCondition = b.dataset.rule as typeof p.winCondition;
      if (b.dataset.minutes) p.halfMinutes = Number(b.dataset.minutes);
      if (b.dataset.difficulty) p.difficulty = b.dataset.difficulty;
      audio.menu("nav");
      sync();
    };
    sync();
  });
}
