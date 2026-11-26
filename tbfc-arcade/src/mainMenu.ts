import { audio } from "./matchAudio";
import { reveal, padBadge } from "./screenUI";
import type { MenuMusic } from "./menuMusic";
import crest from "./art/ground/crest.png?url";
import { loadingScreen } from "./loading";
import { menuPad, menuDirection, padStatus } from "./menuPad";
import careerClip from "./art/stadium-previews/grant-park-career.mp4?url";
import careerPoster from "./art/stadium-previews/grant-park-career.jpg?url";
import changeLog from "./changeLog.html?raw";
import css from "./mainMenu.css?inline";

import { grounds, stadiumName, type StadiumId } from "./stadiumSelect";

const introTimes = ["Day", "Evening", "Night"] as const;

export type Destination =
  | "career"
  | "match"
  | "practice"
  | "celebrations"
  | "simulate"
  | "penalties"
  | "burnLab"
  | "stadiumTest"
  | "gulchTest"
  | { kind: "matchIntro"; venue: StadiumId; time: typeof introTimes[number] }
  | "weatherLab"
  | "keeperLab"
  | "curveLab"
  | "spriteViewer";

export function mountMenuBackdrop(mode: "menu" | "career" = "menu") {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  if (mode === "career") {
    const shot = document.createElement("video");
    shot.className = "career-backdrop";
    shot.inert = true;
    shot.setAttribute("aria-hidden", "true");
    shot.poster = careerPoster;
    shot.muted = shot.loop = shot.playsInline = true;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const playback = () => {
      if (motion.matches || document.hidden) shot.pause();
      else {
        if (!shot.hasAttribute("src")) shot.src = careerClip;
        void shot.play().catch(() => {});
      }
    };
    document.body.append(shot);
    playback();
    motion.addEventListener("change", playback);
    document.addEventListener("visibilitychange", playback);
    return Object.assign(() => {
      motion.removeEventListener("change", playback);
      document.removeEventListener("visibilitychange", playback);
      shot.pause();
      shot.remove();
      shot.removeAttribute("src");
      shot.load();
      style.remove();
    }, { ready: Promise.resolve() });
  }
  let feed: HTMLIFrameElement | undefined;
  let finishReady = () => {};
  const ready = new Promise<void>((resolve) => {
    finishReady = resolve;
  });
  let observer: MutationObserver | undefined;
  let fallback = 0;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    feed = document.createElement("iframe");
    const url = new URL(location.href);
    url.searchParams.set("broadcast", "1");
    feed.src = url.href;
    feed.className = "menu-broadcast";
    feed.title = "Background match";
    feed.inert = true;
    feed.tabIndex = -1;
    feed.setAttribute("aria-hidden", "true");
    document.body.append(feed);
    observer = new MutationObserver(() => {
      if (!feed?.classList.contains("feed-live")) return;
      observer?.disconnect();
      clearTimeout(fallback);
      finishReady();
    });
    observer.observe(feed, { attributes: true, attributeFilter: ["class"] });
    // If the demo cannot render, keep the menu usable rather than loading forever.
    fallback = window.setTimeout(() => {
      observer?.disconnect();
      feed?.remove();
      finishReady();
    }, 15000);
  } else finishReady();
  const remove = () => {
    observer?.disconnect();
    clearTimeout(fallback);
    feed?.remove();
    style.remove();
  };
  return Object.assign(remove, { ready });
}

export function mainMenu(
  music: MenuMusic,
  showIntro = false,
  backdropReady: Promise<void> = Promise.resolve(),
  initialMenu: "menu" | "debug" | Extract<Destination, { kind: "matchIntro" }> = "menu",
): Promise<Destination> {
  const root = document.createElement("section");
  root.id = "main-menu";
  root.setAttribute("aria-labelledby", "menu-title");
  const shell = document.createElement("div");
  shell.className = "menu-shell";
  root.append(shell);
  document.body.append(root);
  const main = document.querySelector("main")!;
  main.inert = true;

  return new Promise((resolve) => {
    let frame = 0;
    let controllerStatus: HTMLElement | null = null;
    let screen: "loading" | "intro" | "menu" | "settings" | "debug" | "introWorkshop" | "introTime" | "changeLog";
    let introField: StadiumId = typeof initialMenu === "object" ? initialMenu.venue : "school";
    const openedAt = performance.now();
    const title =
      '<div class="menu-title"><img src="' +
      crest +
      '" alt=""><div><span style="letter-spacing: 4.1px">TURF BURNERS</span><h1 id="menu-title" style="letter-spacing: 0.03em">ARCADE</h1></div></div>';
    function audioButton(
      action: "music" | "sound",
      label: string,
      on: boolean,
    ) {
      return (
        '<button data-action="' +
        action +
        '" aria-label="' +
        label +
        '" aria-pressed="' +
        on +
        '">' +
        label +
        "<span>" +
        (on ? "On" : "Off") +
        "</span></button>"
      );
    }
    function draw(next: typeof screen, returnFocus = "first") {
      if (screen && screen !== "intro" && screen !== "loading")
        audio.menu(next === "menu" ? "nav" : "success");
      screen = next;
      root.dataset.screen = next;
      root.scrollTop = 0;
      if (next === "loading") shell.replaceChildren(loadingScreen());
      if (next === "intro")
        shell.innerHTML =
          title +
          '<button class="menu-start" data-action="start">START</button>';
      if (next === "menu")
        shell.innerHTML =
          title +
          '<nav aria-label="Main menu"><button class="menu-kick" data-action="kick">Kick Off</button><button data-action="career">Career Mode</button><button class="menu-practice" data-action="practice">Practice</button><button data-action="settings">Settings</button><button data-action="debug">Debug</button></nav><small class="menu-controller" role="status"></small>';
      if (next === "debug")
        shell.innerHTML =
          '<h1 id="menu-title">Debug</h1><nav aria-label="Debug"><button data-action="gulchTest">The Gulch · 3v3</button><button data-action="spriteViewer">Sprite Viewer</button><button data-action="celebrations">Goal Celebrations</button><button data-action="introWorkshop">Match Intros</button><button data-action="weatherLab">Weather Playground</button><button data-action="penalties">Penalty Shootout Test</button><button data-action="burnLab">On Fire Scrimmage</button><button data-action="stadiumTest">Stadium Test</button></nav>';
      if (next === "introWorkshop")
        shell.innerHTML = `<h1 id="menu-title">Match Intros</h1><nav aria-label="Choose field">${grounds.map(g => `<button data-action="${g.id}">${g.name}</button>`).join("")}</nav>`;
      if (next === "introTime")
        shell.innerHTML = `<h1 id="menu-title">${stadiumName(introField)} Intro</h1><nav aria-label="Choose time of day">${introTimes.map(t => `<button data-action="${t}">${t}</button>`).join("")}</nav>`;
      if (next === "changeLog") shell.innerHTML = changeLog;
      if (next === "settings")
        shell.innerHTML =
          '<h1 id="menu-title">Settings</h1><nav aria-label="Settings">' +
          audioButton("music", "Music", music.musicEnabled) +
          audioButton("sound", "Sound effects", music.soundEnabled) +
          '<button data-action="changeLog">Change log</button>' +
          '</nav>';
      if (!["loading", "intro"].includes(next)) {
        const canBack = next !== "menu";
        shell.insertAdjacentHTML("beforeend", `<div class="menu-legend controller-legend" aria-label="Menu controls">${canBack ? `<button data-action="back">${padBadge("B")} Back</button>` : ""}<span>${padBadge("LS")} ${next === "changeLog" ? "Scroll" : "Move"}</span>${next === "changeLog" ? "" : `<span>${padBadge("A")} Select</span>`}</div>`);
      }
      controllerStatus = shell.querySelector(".menu-controller");
      shell
        .querySelector<HTMLButtonElement>(
          returnFocus === "first"
            ? "button:enabled"
            : '[data-action="' + returnFocus + '"]',
        )
        ?.focus({ preventScroll: true });
      if (next !== "loading")
        reveal(shell, ".menu-title img,.menu-title>div,:scope>h1,button");
      if (next === "menu") {
        const brand = shell.querySelector<HTMLElement>(".menu-title span")!;
        const arcade = shell.querySelector<HTMLElement>(".menu-title h1")!;
        const alignTitle = () => {
          arcade.style.transform = "none";
          arcade.style.transform = `scaleX(${brand.getBoundingClientRect().width / arcade.getBoundingClientRect().width})`;
        };
        void document.fonts.ready.then(alignTitle);
      }
    }
    function leave(destination: Destination) {
      audio.menu("success");
      cancelAnimationFrame(frame);
      root.remove();
      main.inert = false;
      resolve(destination);
    }
    shell.onclick = (e) => {
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "button:enabled",
      );
      const action = button?.dataset.action;
      if (screen === "introWorkshop") {
        const field = grounds.find(g => g.id === action);
        if (field) {
          introField = field.id;
          draw("introTime");
          return;
        }
      }
      if (screen === "introTime") {
        const time = introTimes.find(t => t === action);
        if (time) {
          leave({ kind: "matchIntro", venue: introField, time });
          return;
        }
      }
      switch (button?.dataset.action) {
        case "start":
          music.start();
          draw("menu");
          break;
        case "career":
          leave("career");
          break;
        case "kick":
          leave("match");
          break;
        case "practice":
          leave("practice");
          break;
        case "debug":
          draw("debug");
          break;
        case "penalties":
          leave("penalties");
          break;
        case "spriteViewer":
          leave("spriteViewer");
          break;
        case "introWorkshop":
          draw("introWorkshop");
          break;
        case "weatherLab":
          leave("weatherLab");
          break;
        case "stadiumTest":
          leave("stadiumTest");
          break;
        case "gulchTest":
          leave("gulchTest");
          break;
        case "burnLab":
          leave("burnLab");
          break;
        case "celebrations":
          leave("celebrations");
          break;
        case "settings":
          draw("settings");
          break;
        case "changeLog":
          draw("changeLog");
          break;
        case "music":
        case "sound": {
          const isMusic = button.dataset.action === "music";
          if (isMusic) music.toggleMusic();
          else music.toggleSound();
          audio.menu("nav");
          const on = isMusic ? music.musicEnabled : music.soundEnabled;
          button.setAttribute("aria-pressed", String(on));
          button.querySelector("span")!.textContent = on ? "On" : "Off";
          break;
        }
        case "back":
          goBack();
          break;
      }
    };
    function goBack() {
      if (screen === "changeLog") draw("settings", "changeLog");
      else if (screen === "introTime") draw("introWorkshop", introField);
      else if (screen === "introWorkshop") draw("debug", "introWorkshop");
      else draw("menu", screen);
    }
    function move(step: number) {
      if (screen === "changeLog") {
        root.scrollBy(0, step * root.clientHeight * .75);
        return;
      }
      const choices = Array.from(
        shell.querySelectorAll<HTMLButtonElement>("button:enabled"),
      );
      if (!choices.length) return;
      const index = choices.indexOf(
        document.activeElement as HTMLButtonElement,
      );
      const target = choices[(index + step + choices.length) % choices.length];
      if (target !== document.activeElement) {
        target.focus();
        audio.menu("nav");
      }
    }
    root.onkeydown = (e) => {
      if (e.repeat && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        move(e.key === "ArrowUp" ? -1 : 1);
      }
      if (e.key === "Escape" && (screen === "settings" || screen === "debug" || screen === "introWorkshop" || screen === "introTime" || screen === "changeLog")) {
        e.preventDefault();
        goBack();
      }
    };
    draw("loading");
    const minimum = new Promise<void>((resolve) =>
      setTimeout(resolve, Math.max(0, 1500 - (performance.now() - openedAt))),
    );
    void Promise.all([backdropReady, minimum]).then(() => {
      if (!root.isConnected) return;
      if (typeof initialMenu === "object") draw("introTime", initialMenu.time);
      else draw(showIntro ? "intro" : initialMenu);
    });
    const confirm = (pad?: Gamepad) =>
      !!(pad?.buttons[0]?.pressed || pad?.buttons[9]?.pressed);
    const initial = menuPad();
    let held = screen! === "intro" ? false : confirm(initial),
      backHeld = !!initial?.buttons[1]?.pressed,
      direction = "";
    function poll() {
      const pad = menuPad(),
        dir = pad ? menuDirection(pad) : "";
      if (screen === "loading") {
        const dots = shell.querySelector(".menu-loading-dots");
        if (dots)
          dots.textContent = Array(
            1 + (Math.floor((performance.now() - openedAt) / 350) % 3),
          )
            .fill(".")
            .join(" ");
      }
      if (controllerStatus && controllerStatus.textContent !== padStatus)
        controllerStatus.textContent = padStatus;
      if (dir !== direction && (dir === "u" || dir === "d"))
        move(dir === "u" ? -1 : 1);
      direction = dir;
      const down = confirm(pad),
        back = !!pad?.buttons[1]?.pressed;
      if (back && !backHeld && (screen === "settings" || screen === "debug" || screen === "introWorkshop" || screen === "introTime" || screen === "changeLog"))
        goBack();
      else if (down && !held)
        shell
          .querySelector<HTMLButtonElement>(
            screen === "intro" ? ".menu-start" : "button:focus",
          )
          ?.click();
      held = down;
      backHeld = back;
      if (root.isConnected) frame = requestAnimationFrame(poll);
    }
    frame = requestAnimationFrame(poll);
  });
}
