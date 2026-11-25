import * as T from "three";
import { rollBall } from "./ballSpin";
import type { Club } from "./opponentSquads";
import { cinematicPlayerSize } from "./replay";
import { spriteGroundPadding } from "./spriteGround";
import kachunkUrl from "./audio/grant-park-kachunk.mp3?url";
import { daytimeSweepAt, lampSwitchAt, lapPosition, montageAt, grantParkShots, type IntroShot as Shot } from "./grantParkIntro";
import grantParkUrl from "./audio/grant-park-intro.mp3?url";
import { audio, type IntroVenue } from "./matchAudio";
import beatUrl from "./audio/kassabeat-musical-beat-511114.mp3?url";
import trafficUrl from "./audio/west-end-intro-traffic.mp3?url";
import { menuPad } from "./menuPad";
import markup from "./matchIntro.html?raw";
import "./matchIntro.css";

// The horn resolves 6.3 seconds into the train recording.
const crestRevealAt = 6.3;
const westEndOpening: Shot = {
  name: "MARTA arrival",
  seconds: 8.5,
  from: [-13, 5, -10],
  to: [-4, 9, -9],
  lookFrom: [-15, 5.3, -20],
  lookTo: [1, 0, 3],
  fov: 60,
};
const pitchShots: Shot[] = [
  {
    name: "Passing circles",
    seconds: 6,
    from: [-5, 34, 5],
    to: [5, 32, 7],
    lookFrom: [-2, 0, 0],
    lookTo: [2, 0, 0],
    fov: 58,
  },
  {
    name: "Touchline",
    seconds: 4,
    from: [-18, 1.6, 10],
    to: [-4, 2.3, 10],
    lookFrom: [-5, 2, -5],
    lookTo: [8, 2, -4],
    fov: 59,
  },
  {
    name: "Supporters",
    seconds: 4,
    from: [-23, 2, -10],
    to: [-16, 2, -10],
    lookFrom: [-19, 2.7, -16],
    lookTo: [-18, 2.7, -16],
    fov: 53,
  },
  {
    name: "Goal mouth",
    seconds: 3.5,
    from: [-20.5, 1.7, 1.4],
    to: [-20, 2, -1.4],
    lookFrom: [-13, 2.9, 0],
    lookTo: [-13, 3.1, 0],
    fov: 62,
  },
  {
    name: "Taking position",
    seconds: 6,
    from: [-4, 15, 20],
    to: [4, 12, 19],
    lookFrom: [-2, 0, 0],
    lookTo: [1, 0, 0],
    fov: 62,
  },
];
type Actor = {
  sprite: T.Sprite;
  maps: T.Texture[];
  runRows: number;
  runFrames: number;
};
type Intro = {
  scene: T.Scene;
  renderer: T.WebGLRenderer;
  root: HTMLElement;
  teams: [Actor[], Actor[]];
  clubs: [Club, Club];
  ball: T.Sprite;
  hide: T.Object3D[];
  venue: string;
  time: string;
  kind: string;
  date?: string;
  season?: string;
  introVenue: IntroVenue;
  schoolLights?: {positions: T.Vector3[]; lightBanks: (count: number) => void};
  train: (progress: number | null) => void;
};

export function prepareMatchIntro(venue: IntroVenue) {
  if (venue === "grantPark") return Promise.all([
    audio.prepareCue("grantPark", grantParkUrl),
    audio.prepareCue("kachunk", kachunkUrl),
  ]);
  const cues = [audio.prepareCue("introBeat", beatUrl)];
  if (venue === "westend") cues.push(audio.prepareCue("introTraffic", trafficUrl));
  return Promise.all(cues);
}

export function matchIntro(a: Intro) {
  let soundtrack: ReturnType<typeof audio.introSoundtrack>;
  let beatStarted = false;
  const view = document.createElement("template");
  view.innerHTML = markup;
  const overlay = view.content.firstElementChild as HTMLElement;
  for (const [i, side] of ["home", "away"].entries()) {
    const crest = overlay.querySelector<HTMLImageElement>(`[data-${side}]`)!;
    crest.src = a.clubs[i].crest;
    crest.alt = a.clubs[i].name;
  }
  const details = {
    venue: a.venue,
    time: a.time,
    kind: a.kind,
    date: a.date,
    season: a.season,
  };
  for (const [key, text] of Object.entries(details)) {
    for (const field of overlay.querySelectorAll<HTMLElement>(
      `[data-${key}]`,
    )) {
      field.textContent = text ?? "";
      field.hidden = !text;
    }
  }
  a.root.append(overlay);
  a.root.dataset.matchIntro = "";
  const grantPark = a.introVenue === "grantPark";
  const lamp = grantPark && a.time !== "Day" ? a.schoolLights?.positions[0] : undefined;
  const revealAt = lamp ? montageAt : daytimeSweepAt;
  const shots = grantPark ? grantParkShots(lamp) :
    a.introVenue === "westend" ? [westEndOpening, ...pitchShots] : pitchShots;
  let switched = false;
  if (lamp) a.schoolLights!.lightBanks(0);
  const walkAt = shots.slice(0, -1).reduce((time, shot) => time + shot.seconds, 0);
  const camera = new T.PerspectiveCamera(55, 1, 0.1, 160);
  const group = new T.Group();
  a.scene.add(group);
  const hide = [
    ...a.hide,
    a.ball,
    ...a.teams.flat().map((actor) => actor.sprite),
  ];
  const visibility = hide.map((obj) => obj.visible);
  hide.forEach((obj) => (obj.visible = false));
  const teams = a.teams.map((team, side) =>
    team.map((actor, i) => {
      const angle = (i * 2 * Math.PI) / (grantPark ? team.length - 3 : team.length);
      const circle = new T.Vector3(
        (side ? 10 : -10) + 5.5 * Math.cos(angle),
        0,
        5.5 * Math.sin(angle),
      );
      if (grantPark && i === team.length - 2) circle.set(side ? 15 : -15, 0, 3);
      if (grantPark && i === team.length - 1) circle.set(side ? 20 : -20, 0, 0);
      const sprite = actor.sprite.clone();
      sprite.visible = true;
      sprite.material = actor.sprite.material.clone();
      group.add(sprite);
      return {
        actor,
        sprite,
        circle,
        end: actor.sprite.position.clone(),
        maps: actor.maps.slice(0, 3).map((map) => map.clone()),
      };
    }),
  );
  function introBall() {
    const sprite = a.ball.clone();
    sprite.material = a.ball.material.clone();
    sprite.material.map = a.ball.material.map!.clone();
    sprite.visible = true;
    group.add(sprite);
    return { sprite, phase: 0, previous: sprite.position.clone(), placed: false };
  }
  const balls = teams.map(introBall);
  const shotBalls = grantPark ? teams.map(introBall) : [];
  const lapOrigin = new T.Vector3(), lapAhead = new T.Vector3();
  let elapsed = 0,
    requested = false,
    previousA = !!menuPad()?.buttons[0]?.pressed;
  const start = overlay.querySelector<HTMLButtonElement>("[data-start]")!;
  const pauseButton =
    overlay.querySelector<HTMLButtonElement>("[data-intro-pause]")!;
  let paused = false;
  function setPaused(on: boolean) {
    paused = on;
    audio.setIntroPaused(on);
    pauseButton.textContent = on ? "Resume" : "Pause";
    start.disabled = on;
  }
  pauseButton.onclick = () => setPaused(!paused);
  start.onclick = () => {
    if (!paused) requested = true;
  };
  let previousMenu = !!menuPad()?.buttons[9]?.pressed;
  start.focus();
  function keyboard(event: KeyboardEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type !== "keydown" || event.repeat) return;
    if (
      event.code === "Escape" ||
      (document.activeElement === pauseButton &&
        ["Enter", "Space"].includes(event.code))
    )
      setPaused(!paused);
    else if (!paused && ["KeyJ", "Enter", "Space"].includes(event.code))
      requested = true;
  }
  window.addEventListener("keydown", keyboard, true);
  window.addEventListener("keyup", keyboard, true);
  const eye = new T.Vector3(),
    aim = new T.Vector3(),
    end = new T.Vector3();
  function draw(dt: number) {
    const pad = menuPad(),
      down = !!pad?.buttons[0]?.pressed,
      menu = !!pad?.buttons[9]?.pressed;
    if (menu && !previousMenu) setPaused(!paused);
    previousMenu = menu;
    if (!paused && down && !previousA) requested = true;
    previousA = down;
    if (paused || document.hidden) return true;
    if (requested) return false;
    if (!soundtrack && !document.hidden) {
      audio.state(false, true);
      soundtrack = audio.introSoundtrack(a.introVenue);
    }
    elapsed = soundtrack?.elapsed() ?? elapsed + dt;
    let local = elapsed,
      index = 0;
    while (index < shots.length - 1 && local >= shots[index].seconds)
      local -= shots[index++].seconds;
    const shot = shots[index],
      p = Math.min(1, local / shot.seconds);
    overlay.dataset.shot = shot.name;
    const trainShot = shot === westEndOpening,
      walking = index === shots.length - 1;
    const turn = trainShot ? T.MathUtils.smoothstep(p, 0.52, 0.97) : p;
    camera.position.copy(
      eye.fromArray(shot.from).lerp(end.fromArray(shot.to), p),
    );
    aim.fromArray(shot.lookFrom).lerp(end.fromArray(shot.lookTo), turn);
    if (grantPark && shot.name === "Track runners") {
      // Follow the same lane as the runner, looking ahead into the bend.
      lapPosition(elapsed - 1.35, 0, camera.position);
      camera.position.y = 2.65;
      lapPosition(elapsed + .55, 0, aim);
      aim.y = 1.15;
    }
    if (walking && local > shot.seconds)
      camera.position.x += 0.9 * Math.sin((local - shot.seconds) * 0.22);
    camera.aspect = a.root.clientWidth / Math.max(1, a.root.clientHeight);
    camera.fov = T.MathUtils.lerp(shot.fov, shot.endFov ?? shot.fov, p);
    camera.updateProjectionMatrix();
    camera.lookAt(aim);
    if (a.introVenue === "westend") a.train(trainShot ? 0.35 + p * 0.36 : null);
    if (lamp) {
      if (!switched && elapsed >= lampSwitchAt) {
        switched = true;
        if (elapsed < montageAt) {
          a.schoolLights!.lightBanks(1);
          soundtrack?.switchLamp();
        }
      }
      if (elapsed >= montageAt)
        a.schoolLights!.lightBanks(a.schoolLights!.positions.length);
    }
    const reveal = grantPark ? T.MathUtils.smoothstep(elapsed,
      revealAt, revealAt + 1.2) : trainShot
      ? T.MathUtils.smoothstep(local, crestRevealAt, crestRevealAt + 1.35)
      : 1;
    overlay.style.setProperty("--reveal", String(reveal));
    if (!grantPark && reveal > 0 && !beatStarted && soundtrack) {
      soundtrack.startBeat();
      beatStarted = true;
    }
    const cameraAngle = Math.atan2(
      camera.position.x - aim.x,
      camera.position.z - aim.z,
    );
    teams.forEach((team, side) => {
      const beat = elapsed / (1.12 + side * 0.12),
        pass = Math.floor(beat),
        fraction = beat - pass;
      const inCircle =
        grantPark ? team.length - 3 : shot.name === "Goal mouth" ? team.length - 1 : team.length;
      const interval = inCircle === 6 ? 5 : 3;
      const passer = (pass * interval) % inCircle,
        next = ((pass + 1) * interval) % inCircle;
      const centerX = side ? 10 : -10;
      const shotPhase = ((elapsed + side * 1.4) % 3.2) / 3.2;
      const practiceBall = shotBalls[side]?.sprite;
      if (practiceBall) {
        practiceBall.visible = !walking;
        const travel = shotPhase < .44 ? shotPhase / .44 : Math.max(0, 1 - (shotPhase - .44) / .44);
        practiceBall.position.set((side ? 1 : -1) * (15 + 5 * travel),
          .19 + Math.sin(Math.PI * travel) * 1.2, 3 - 3 * travel);
      }
      team.forEach(({ actor, sprite, circle, end: position, maps }, i) => {
        // The keepers peel away first, arriving at their goals ahead of the outfielders.
        const keeper = i === team.length - 1;
        const runner = grantPark && i === inCircle;
        const shooter = grantPark && i === team.length - 2;
        const stride =
          keeper && shot.name === "Goal mouth"
            ? T.MathUtils.smoothstep(p, 0, 1)
            : keeper && walking && !grantPark
              ? 1
              : walking
                ? T.MathUtils.smoothstep(local - i * 0.09, 0, 4.8)
                : 0;
        const origin = runner ? lapPosition(Math.min(elapsed, walkAt), side, lapOrigin) : circle;
        sprite.position.lerpVectors(origin, position, stride);
        const moving = (runner && !walking) || (stride > 0 && stride < 1);
        const target = moving || walking ? position : team[next].circle;
        let dx =
          walking && stride === 1
            ? -centerX
            : !walking && !moving && i !== passer
              ? centerX - circle.x
              : target.x - circle.x;
        let dz =
          walking && stride === 1
            ? 0
            : !walking && !moving && i !== passer
              ? -circle.z
              : target.z - circle.z;
        if (runner && !walking) {
          lapPosition(elapsed + .05, side, lapAhead);
          dx = lapAhead.x - origin.x;
          dz = lapAhead.z - origin.z;
        } else if (grantPark && (shooter || keeper) && !walking) {
          dx = (side ? 1 : -1) * (shooter ? 5 : -5);
          dz = shooter ? -3 : 3;
        } else if (runner && walking && stride < 1) {
          dx = position.x - origin.x;
          dz = position.z - origin.z;
        }
        const face = T.MathUtils.euclideanModulo(
          Math.round((Math.atan2(dx, dz) - cameraAngle) / (Math.PI / 4)),
          8,
        );
        const kicking =
          !walking &&
          !moving &&
          ((i === passer && fraction < .35) || (shooter && shotPhase < .15)) &&
          maps[2]?.image.height >= 384;
        const mode = moving ? 1 : kicking ? 2 : 0,
          map = maps[mode];
        const rows = moving ? actor.runRows : kicking ? 8 : 1,
          cell = map.image.height / rows;
        const cols = map.image.width / cell;
        const col = moving
          ? Math.floor(local * 7 + i) % actor.runFrames
          : kicking
            ? Math.min(cols - 1, Math.floor((shooter ? shotPhase / .15 : fraction / .35) * cols))
            : face;
        const row = mode === 0 ? 0 : face % rows;
        map.repeat.set(1 / cols, 1 / rows);
        map.offset.set(col / cols, (rows - row - 1) / rows);
        sprite.material.map = map;
        sprite.scale.setScalar((cinematicPlayerSize * cell) / 48);
        sprite.center.set(
          0.5,
          spriteGroundPadding(map.image, cols, rows, row, col) / cell,
        );
      });
      const ball = balls[side].sprite;
      ball.visible = !walking || side === 0;
      if (walking) ball.position.set(0, 0.19, 0);
      else {
        ball.position.lerpVectors(
          team[passer].circle,
          team[next].circle,
          fraction,
        );
        ball.position.y = 0.19 + 0.16 * Math.sin(Math.PI * fraction);
      }
    });
    for (const collection of [balls, shotBalls]) {
      for (const copy of collection) {
        const pos = copy.sprite.position;
        if (copy.placed && !walking) {
          copy.phase = rollBall(copy.sprite, copy.phase, pos.x - copy.previous.x,
            pos.z - copy.previous.z, -cameraAngle / (Math.PI / 4));
        }
        copy.previous.copy(pos);
        copy.placed = true;
      }
    }
    a.renderer.render(a.scene, camera);
    return true;
  }
  function dispose() {
    audio.setIntroPaused(false);
    soundtrack?.fade();
    window.removeEventListener("keydown", keyboard, true);
    window.removeEventListener("keyup", keyboard, true);
    overlay.remove();
    delete a.root.dataset.matchIntro;
    if (lamp) a.schoolLights!.lightBanks(a.schoolLights!.positions.length);
    a.train(null);
    hide.forEach((obj, i) => (obj.visible = visibility[i]));
    group.removeFromParent();
    for (const {sprite} of [...balls, ...shotBalls]) {
      sprite.material.map!.dispose();
      sprite.material.dispose();
    }
    for (const player of teams.flat()) {
      player.sprite.material.dispose();
      player.maps.forEach((map) => map.dispose());
    }
  }
  return {
    draw,
    dispose,
    setPaused,
    get paused() {
      return paused;
    },
  };
}
