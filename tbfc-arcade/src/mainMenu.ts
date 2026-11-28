import { audio } from "./matchAudio";
import { reveal, padBadge } from "./screenUI";
import type { MenuMusic } from "./menuMusic";
import ArcadeLogo from "../../src/img/arcade-logo.png?url";
import { loadingScreen } from "./loading";
import { menuPad, menuDirection, padStatus } from "./menuPad";
import careerClip from "./art/stadium-previews/grant-park-career.mp4?url";
import careerPoster from "./art/stadium-previews/grant-park-career.jpg?url";
import changeLog from "./changeLog.html?raw";
import css from "./mainMenu.css?inline";
import controlsImage from "./art/controller-controls.png?url";

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
  | { kind: "matchIntro"; venue: StadiumId; time: (typeof introTimes)[number] }
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
    return Object.assign(
      () => {
        motion.removeEventListener("change", playback);
        document.removeEventListener("visibilitychange", playback);
        shot.pause();
        shot.remove();
        shot.removeAttribute("src");
        shot.load();
        style.remove();
      },
      { ready: Promise.resolve() },
    );
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
  initialMenu:
    | "menu"
    | "debug"
    | Extract<Destination, { kind: "matchIntro" }> = "menu",
): Promise<Destination> {
  const root = document.createElement("section");
  root.id = "main-menu";
  root.tabIndex = -1; // The button-free title screen still receives keyboard input.
  root.setAttribute("aria-labelledby", "menu-title");
  const shell = document.createElement("div");
  shell.className = "menu-shell";
  root.append(shell);
  document.body.append(root);
  const main = document.querySelector("main")!;
  main.inert = true;

  return new Promise((resolve) => {
    let frame = 0;
    let controlsDialog: HTMLDialogElement | null = null;
    let controllerStatus: HTMLElement | null = null;
    let screen:
      | "loading"
      | "intro"
      | "menu"
      | "settings"
      | "debug"
      | "introWorkshop"
      | "introTime"
      | "changeLog";
    let introField: StadiumId =
      typeof initialMenu === "object" ? initialMenu.venue : "school";
    const openedAt = performance.now();
    const title =
      '<div class="menu-title"><div class="menu-logo"><img src="' +
      ArcadeLogo +
      '" alt="Turf Burners Arcade"></div><div class="menu-early-access">EARLY ACCESS</div></div>';

    function audioButton(
      action: "music" | "sound",
      label: string,
      on: boolean,
    ) {
      return `<button data-action="${action}" aria-label="${label}" aria-pressed="${on}"><span>${label} <span class="menu-toggle-state">${on ? "On" : "Off"}</span></span></button>`;
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
          '<p class="menu-start-prompt">Press any button to continue</p>';
      if (next === "menu")
        shell.innerHTML =
          title +
          '<nav class="menu-ball-options" aria-label="Main menu"><button class="menu-kick" data-action="kick"><span>Kick Off</span></button><button data-action="career"><span>Career Mode</span></button><button class="menu-practice" data-action="practice"><span>Practice</span></button><button data-action="settings"><span>Settings</span></button><button data-action="debug"><span>Debug</span></button></nav>';
      if (next === "debug")
        shell.innerHTML =
          '<h1 id="menu-title">Debug</h1><nav aria-label="Debug"><button data-action="gulchTest">The Gulch · 3v3</button><button data-action="spriteViewer">Sprite Viewer</button><button data-action="celebrations">Goal Celebrations</button><button data-action="introWorkshop">Match Intros</button><button data-action="weatherLab">Weather Playground</button><button data-action="curveLab">Shot Curve Lab</button><button data-action="penalties">Penalty Shootout Test</button><button data-action="burnLab">On Fire Scrimmage</button><button data-action="stadiumTest">Stadium Test</button></nav>';
      if (next === "introWorkshop")
        shell.innerHTML = `<h1 id="menu-title">Match Intros</h1><nav aria-label="Choose field">${grounds.map((g) => `<button data-action="${g.id}">${g.name}</button>`).join("")}</nav>`;
      if (next === "introTime")
        shell.innerHTML = `<h1 id="menu-title">${stadiumName(introField)} Intro</h1><nav aria-label="Choose time of day">${introTimes.map((t) => `<button data-action="${t}">${t}</button>`).join("")}</nav>`;
      if (next === "changeLog") shell.innerHTML = changeLog;
      if (next === "settings")
        shell.innerHTML =
          '<h1 id="menu-title">Settings</h1><nav class="menu-ball-options" aria-label="Settings">' +
          audioButton("music", "Music", music.musicEnabled) +
          audioButton("sound", "Sound effects", music.soundEnabled) +
          '<button data-action="controls"><span>Controls</span></button><button data-action="changeLog"><span>Change log</span></button>' +
          "</nav>";
      if (!["loading", "intro"].includes(next)) {
        const canBack = next !== "menu";
        shell.insertAdjacentHTML(
          "beforeend",
          `<div class="menu-legend controller-legend" aria-label="Menu controls">${canBack ? `<button data-action="back">${padBadge("B")} Back</button>` : ""}<span>${padBadge("LS")} ${next === "changeLog" ? "Scroll" : "Move"}</span>${next === "changeLog" ? "" : `<span>${padBadge("A")} Select</span>`}</div>`,
        );
      }
      if (next === "intro") root.focus({ preventScroll: true });
      if (next === "menu")
        shell.insertAdjacentHTML(
          "beforeend",
          '<small class="menu-controller" role="status"></small>',
        );
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
        const brand = shell.querySelector<HTMLElement>(".menu-title span");
        const arcade = shell.querySelector<HTMLElement>(".menu-title h1");
        if (!brand || !arcade) return;
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
    function continueFromIntro() {
      music.start();
      draw("menu");
    }
    shell.onpointermove = (event) => {
      if (
        (screen !== "menu" && screen !== "settings") ||
        event.pointerType !== "mouse"
      )
        return;
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "nav button",
      );
      if (button && button !== document.activeElement)
        button.focus({ preventScroll: true });
    };
    shell.onclick = (e) => {
      if (screen === "intro") {
        continueFromIntro();
        return;
      }
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "button:enabled",
      );
      const action = button?.dataset.action;
      if (screen === "introWorkshop") {
        const field = grounds.find((g) => g.id === action);
        if (field) {
          introField = field.id;
          draw("introTime");
          return;
        }
      }
      if (screen === "introTime") {
        const time = introTimes.find((t) => t === action);
        if (time) {
          leave({ kind: "matchIntro", venue: introField, time });
          return;
        }
      }
      switch (button?.dataset.action) {
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
        case "curveLab":
          leave("curveLab");
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
        case "controls": {
          if (controlsDialog) break;
          const dialog = document.createElement("dialog");
          controlsDialog = dialog;
          dialog.className = "menu-controls-modal";
          dialog.setAttribute("aria-label", "Controller controls");
          dialog.innerHTML = `<img src="${controlsImage}" alt="Controller controls: left stick Move, right stick Camera, left bumper Change Player, right trigger Sprint, Y Through Ball, X Cross, B Shoot, A Pass."><div class="menu-legend controller-legend" aria-label="Controls navigation"><button data-action="close-controls">${padBadge("B")} Back</button></div>`;
          dialog.addEventListener("cancel", (event) => { event.preventDefault(); goBack(); });
          shell.append(dialog);
          dialog.showModal();
          dialog.querySelector<HTMLButtonElement>("button")!.focus();
          break;
        }
        case "close-controls":
          goBack();
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
          button.querySelector(".menu-toggle-state")!.textContent = on
            ? "On"
            : "Off";
          break;
        }
        case "back":
          goBack();
          break;
      }
    };
    function goBack() {
      if (controlsDialog) {
        controlsDialog.close();
        controlsDialog.remove();
        controlsDialog = null;
        shell.querySelector<HTMLButtonElement>('[data-action="controls"]')?.focus();
        return;
      }
      if (screen === "changeLog") draw("settings", "changeLog");
      else if (screen === "introTime") draw("introWorkshop", introField);
      else if (screen === "introWorkshop") draw("debug", "introWorkshop");
      else draw("menu", screen);
    }
    function move(step: number) {
      if (controlsDialog) return;
      if (screen === "changeLog") {
        root.scrollBy(0, step * root.clientHeight * 0.75);
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
      if (screen === "intro") {
        e.preventDefault();
        if (!e.repeat) continueFromIntro();
        return;
      }
      if (e.repeat && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        move(e.key === "ArrowUp" ? -1 : 1);
      }
      if (
        e.key === "Escape" &&
        (screen === "settings" ||
          screen === "debug" ||
          screen === "introWorkshop" ||
          screen === "introTime" ||
          screen === "changeLog")
      ) {
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
    let introButtonHeld = !!initial?.buttons.some((button) => button.pressed);
    let held = screen! === "intro" ? false : confirm(initial),
      backHeld = !!initial?.buttons[1]?.pressed,
      direction = "";
    function poll() {
      const pad = menuPad(),
        dir = pad ? menuDirection(pad) : "";
      // Consume the opening press so A/Start cannot also launch the focused menu item.
      const anyButton = !!pad?.buttons.some((button) => button.pressed);
      const openingIntro = screen === "intro" && anyButton && !introButtonHeld;
      introButtonHeld = anyButton;
      if (openingIntro) {
        held = confirm(pad);
        backHeld = !!pad?.buttons[1]?.pressed;
        direction = dir;
        continueFromIntro();
        frame = requestAnimationFrame(poll);
        return;
      }
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
      if (
        back &&
        !backHeld &&
        (screen === "settings" ||
          screen === "debug" ||
          screen === "introWorkshop" ||
          screen === "introTime" ||
          screen === "changeLog")
      )
        goBack();
      else if (down && !held)
        shell.querySelector<HTMLButtonElement>("button:focus")?.click();
      held = down;
      backHeld = back;
      if (root.isConnected) frame = requestAnimationFrame(poll);
    }
    frame = requestAnimationFrame(poll);
  });
}
