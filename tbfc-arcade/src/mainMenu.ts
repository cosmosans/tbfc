import { audio } from "./matchAudio";
import { reveal } from "./screenUI";
import type { MenuMusic } from "./menuMusic";
import crest from "./art/ground/crest.png?url";
import { menuPad, menuDirection, padStatus } from "./menuPad";
import css from "./mainMenu.css?inline";

export type Destination = "career" | "match" | "practice" | "celebrations" | "simulate" | "burnLab";

export function mountMenuBackdrop() {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  let feed: HTMLIFrameElement | undefined;
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
  }
  return () => { feed?.remove(); style.remove(); };
}

export function mainMenu(
  music: MenuMusic,
  showIntro = false,
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
    let screen: "intro" | "menu" | "settings" | "debug";
    const title =
      '<div class="menu-title"><img src="' +
      crest +
      '" alt=""><div><span>TURF BURNERS FC</span><h1 id="menu-title">ARCADE</h1></div></div>';
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
      if (screen && screen !== "intro") audio.menu(next === "menu" ? "nav" : "success");
      screen = next;
      root.dataset.screen = next;
      if (next === "intro")
        shell.innerHTML =
          title +
          '<button class="menu-start" data-action="start">START</button>';
      if (next === "menu")
        shell.innerHTML =
          title +
          '<nav aria-label="Main menu"><button data-action="career">Career Mode</button><button class="menu-kick" data-action="kick">Kick Off</button><button class="menu-practice" data-action="practice">Practice</button><button data-action="settings">Settings</button><button data-action="debug">Debug</button></nav><small class="menu-controller" role="status"></small>';
      if (next === "debug")
        shell.innerHTML = '<h1 id="menu-title">Debug</h1><nav aria-label="Debug"><button data-action="simulate">Random Match</button><button data-action="celebrations">Goal Celebrations</button><button data-action="burnLab">On Fire Scrimmage</button><button data-action="back">Back</button></nav>';
      if (next === "settings")
        shell.innerHTML =
          '<h1 id="menu-title">Settings</h1><nav aria-label="Settings">' +
          audioButton("music", "Music", music.musicEnabled) +
          audioButton("sound", "Sound effects", music.soundEnabled) +
          '<button data-action="back">Back</button></nav>';
      controllerStatus = shell.querySelector(".menu-controller");
      shell
        .querySelector<HTMLButtonElement>(
          returnFocus === "first" ? "button:enabled" : '[data-action="' + returnFocus + '"]',
        )!
        .focus({ preventScroll: true });
      reveal(shell, ".menu-title img,.menu-title>div,:scope>h1,button");
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
      switch (button?.dataset.action) {
        case "start":
          music.start();
          draw("menu");
          break;
        case "career": leave("career"); break;
        case "kick":
          leave("match");
          break;
        case "practice":
          leave("practice");
          break;
        case "debug": draw("debug"); break;
        case "simulate": leave("simulate"); break;
        case "burnLab": leave("burnLab"); break;
        case "celebrations": leave("celebrations"); break;
        case "settings":
          draw("settings");
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
          draw("menu", screen);
          break;
      }
    };
    function move(step: number) {
      const choices = Array.from(
        shell.querySelectorAll<HTMLButtonElement>("button:enabled"),
      );
      const index = choices.indexOf(
        document.activeElement as HTMLButtonElement,
      );
      const target = choices[(index + step + choices.length) % choices.length];
      if (target !== document.activeElement) {target.focus();audio.menu("nav");}
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
      if (e.key === "Escape" && (screen === "settings" || screen === "debug")) {
        e.preventDefault();
        draw("menu", screen);
      }
    };
    draw(showIntro ? "intro" : "menu");
    const confirm = (pad?: Gamepad) =>
      !!(pad?.buttons[0]?.pressed || pad?.buttons[9]?.pressed);
    const initial = menuPad();
    let held = screen! === "intro" ? false : confirm(initial),
      backHeld = !!initial?.buttons[1]?.pressed,
      direction = "";
    function poll() {
      const pad = menuPad(),
        dir = pad ? menuDirection(pad) : "";
      if (controllerStatus && controllerStatus.textContent !== padStatus) controllerStatus.textContent = padStatus;
      if (dir !== direction && (dir === "u" || dir === "d"))
        move(dir === "u" ? -1 : 1);
      direction = dir;
      const down = confirm(pad),
        back = !!pad?.buttons[1]?.pressed;
      if (back && !backHeld && (screen === "settings" || screen === "debug")) draw("menu", screen);
      else if (down && !held)
        shell.querySelector<HTMLButtonElement>(screen === "intro" ? ".menu-start" : "button:focus")?.click();
      held = down;
      backHeld = back;
      if (root.isConnected) frame = requestAnimationFrame(poll);
    }
    frame = requestAnimationFrame(poll);
  });
}
