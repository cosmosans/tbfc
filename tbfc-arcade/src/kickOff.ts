import { renderMarkup } from "./templates/renderMarkup";
import { mountModeCarousel } from "./modeCarousel";
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
import { menuCursor } from "./menuCursor";
import {
  readStreetPreferences,
  saveStreetPreferences,
  courtPresets,
  type GameMode,
  type StreetPreferences,
} from "./matchRules";
import { selectableDivisions, profiles } from "./difficulty";
import firstToFiveArt from "./art/mode-cards/first-to-five.png";
import streetArt from "./art/mode-cards/street.png";
import classicModeArt from "./art/mode-cards/classic.png";
import snowpocalypseArt from "./art/mode-cards/snowpocalypse.png";
import infernoArt from "./art/mode-cards/inferno.png";
import penaltyShootoutArt from "./art/mode-cards/penalty-shootout.png";
import longRangeArt from "./art/mode-cards/long-range.png";
import survivalArt from "./art/mode-cards/survival.png";
import beatTheClockArt from "./art/mode-cards/beat-the-clock.png";
import airBallsArt from "./art/mode-cards/air-balls.png";
import houseRulesArt from "./art/mode-cards/house-rules.png";
import mysteryMatchArt from "./art/mode-cards/mystery-match.png";
import "./kickOff.css";

// One input lifecycle shared by the mode grid, team sizes and court settings.
export type ScreenNavigation = {
  move: (direction: string) => void;
  confirm: () => void;
  repeatDelay?: number;
  repeatInterval?: number;
};
export function screen<T>(
  draw: (
    root: HTMLElement,
    finish: (value: T | null) => void,
  ) => void | ScreenNavigation,
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
    let cursor: ReturnType<typeof menuCursor> | undefined;
    let navigation: ScreenNavigation | undefined;
    function finish(value: T | null) {
      if (done) return;
      done = true;
      cancelAnimationFrame(frame);
      cursor?.destroy();
      root.remove();
      main.inert = false;
      audio.menu(value === null ? "nav" : "success");
      resolve(value);
    }
    function move(direction: string) {
      const buttons = [
          ...root.querySelectorAll<HTMLElement>(
            'button:enabled,input[type="range"]:enabled,input[type="text"]:enabled',
          ),
        ],
        current = document.activeElement as HTMLElement;
      if (
        current instanceof HTMLInputElement &&
        current.type === "range" &&
        (direction === "l" || direction === "r")
      ) {
        const before = current.value;
        current.stepUp(direction === "l" ? -1 : 1);
        if (current.value === before) return;
        current.dispatchEvent(new Event("input", { bubbles: true }));
        current.dispatchEvent(new Event("change", { bubbles: true }));
        audio.menu("nav");
        return;
      }
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
        target.scrollIntoView({ block: "nearest", inline: "nearest" });
        audio.menu("nav");
      }
    }
    root.onkeydown = (e) => {
      if (
        e.target instanceof HTMLInputElement &&
        e.target.type === "text" &&
        e.key !== "Escape"
      )
        return;
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
        if (navigation) navigation.move(direction);
        else move(direction);
      }
      if (
        navigation &&
        (e.key === "Enter" || e.key === " ") &&
        (e.target as HTMLElement).closest("[data-mode]")
      ) {
        e.preventDefault();
        if (!e.repeat) navigation.confirm();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (!e.repeat) finish(null);
      }
      if (e.repeat && (e.key === "Enter" || e.key === " ")) e.preventDefault();
    };
    navigation = draw(root, finish) || undefined;
    if (!root.contains(document.activeElement))
      root.querySelector<HTMLButtonElement>("button")?.focus();
    if (root.classList.contains("house-builder")) cursor = menuCursor(root);
    reveal(root, "h1,.ko-card,.ko-preview,.ko-settings,footer,.ko-mode-legend");
    function poll(now: number) {
      if (done) return;
      const pad = menuPad(),
        next = pad ? menuDirection(pad) : "",
        down = Array.from(pad?.buttons ?? [], (b) => b.pressed);
      cursor?.update(pad, now);
      if (!cursor && next && (next !== dir || now >= repeat)) {
        if (navigation) navigation.move(next);
        else move(next);
        repeat =
          now +
          (next === dir
            ? (navigation?.repeatInterval ?? 160)
            : (navigation?.repeatDelay ?? 380));
      }
      if (down[1] && !held[1]) finish(null);
      else if (down[0] && !held[0]) {
        if (cursor) cursor.click();
        else if (navigation) navigation.confirm();
        else (document.activeElement as HTMLButtonElement)?.click();
      } else if (down[9] && !held[9]) {
        if (navigation) navigation.confirm();
        else root.querySelector<HTMLButtonElement>("[data-next]")?.click();
      } else if (down[2] && !held[2])
        root
          .querySelector<HTMLButtonElement>('[data-pad-button="2"]:enabled')
          ?.click();
      else if (down[3] && !held[3])
        root
          .querySelector<HTMLButtonElement>('[data-pad-button="3"]:enabled')
          ?.click();
      else if (down[4] && !held[4])
        root
          .querySelector<HTMLButtonElement>('[data-pad-button="4"]:enabled')
          ?.click();
      else if (down[5] && !held[5])
        root
          .querySelector<HTMLButtonElement>('[data-pad-button="5"]:enabled')
          ?.click();
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
    const modes = [
      {
        id: "classic",
        title: "CLASSIC",
        tag: "Grown adults playing recreational coed 7v7 soccer after work. You know, the beautiful game.",
        image: classicModeArt,
      },
      {
        id: "street",
        title: "STREET",
        tag: "3v3 or 5v5 on enclosed courts with mini goals, rebound walls, and absolutely no keepers.",
        image: streetArt,
      },
      {
        id: "firstToFive",
        title: "FIRST TO 5",
        tag: "Be the first team to score 3, 5, or 10 goals and take home the win. No time limit, no halftime.",
        image: firstToFiveArt,
      },
      {
        id: "longRange",
        title: "LONG RANGE",
        tag: "Shooting stats are boosted for all players, and goals from outside the dotted box count double.",
        image: longRangeArt,
      },
      {
        id: "snowpocalypse",
        title: "SNOWPOCALYPSE",
        tag: "A completely snow-covered pitch, slippery physics, and messier tackles. Bring the bread and milk.",
        image: snowpocalypseArt,
      },
      {
        id: "survival",
        title: "SURVIVAL",
        tag: "Every goal costs your team a random player. Build a lead, then fight to defend it.",
        image: survivalArt,
      },
      {
        id: "inferno",
        title: "INFERNO",
        tag: "Both teams have permanently charged BURN. Unleash spectacular shots from the opening whistle.",
        image: infernoArt,
      },
      {
        id: "beatTheClock",
        title: "BEAT THE CLOCK",
        tag: "Start with 90 seconds. Score a goal and gain 30 more seconds, but concede and lose 15. How long can you last?",
        image: beatTheClockArt,
      },
      {
        id: "airBalls",
        title: "AIR BALLS",
        tag: "Enhanced aerial assistance makes spectacular finishes easier, so only headers, volleys, free kicks, and penalties count.",
        image: airBallsArt,
      },
      {
        id: "mysteryMatch",
        title: "MYSTERY MATCH",
        tag: "Every 30 seconds a random match effect is applied. Fire, ice, and unpredictable arcade chaos.",
        image: mysteryMatchArt,
      },
      {
        id: "penaltyShootout",
        title: "PENALTIES",
        tag: "Take your kicks, make your saves, and settle it from the spot.",
        image: penaltyShootoutArt,
      },
      {
        id: "houseRules",
        title: "HOUSE RULES",
        tag: "Combine all available gameplay modifiers to create your perfect flavor of soccer chaos.",
        image: houseRulesArt,
      },
    ] satisfies { id: GameMode; title: string; tag: string; image: string }[];
    root.classList.add("mode-carousel-screen");
    root.innerHTML = renderMarkup(modeSelectTemplate, {
      moveHint: padBadge("LS"),
      leftHint: padBadge("LB"),
      rightHint: padBadge("RB"),
      selectHint: padBadge("A"),
      backHint: padBadge("B"),
    });
    return mountModeCarousel(root, modes, initial, finish);
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
