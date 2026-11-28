import { renderMarkup } from "./templates/renderMarkup";
import lineupPlayerNumberTemplate from "./templates/street/lineup-player-number.html?raw";
import lineupQuitTemplate from "./templates/street/lineup-quit.html?raw";
import lineupSettingsTemplate from "./templates/street/lineup-settings.html?raw";
import lineupAutoPickTemplate from "./templates/street/lineup-auto-pick.html?raw";
import lineupFormationTemplate from "./templates/street/lineup-formation.html?raw";
import lineupClassicRulesTemplate from "./templates/street/lineup-classic-rules.html?raw";
import lineupLegendTemplate from "./templates/street/lineup-legend.html?raw";
import lineupChemistryTemplate from "./templates/street/lineup-chemistry.html?raw";
import lineupTiredMarkerTemplate from "./templates/street/lineup-tired-marker.html?raw";
import lineupRoleCategoryTemplate from "./templates/street/lineup-role-category.html?raw";
import lineupPlayerSlotTemplate from "./templates/street/lineup-player-slot.html?raw";
import lineupBenchSlotTemplate from "./templates/street/lineup-bench-slot.html?raw";
import lineupRosterCategoryTemplate from "./templates/street/lineup-roster-category.html?raw";
import lineupRosterPlayerTemplate from "./templates/street/lineup-roster-player.html?raw";
import lineupClearTemplate from "./templates/street/lineup-clear.html?raw";
import lineupRosterTemplate from "./templates/street/lineup-roster.html?raw";
import lineupTemplate from "./templates/street/lineup.html?raw";
import { streetArena } from "./streetArena";
import {
  classicRules,
  streetShapes,
  isStreetShape,
  streetFormations,
  courtPresets,
  type MatchRules,
} from "./matchRules";
import {
  autoStreet,
  assignStreet,
  category,
  squadRatings,
  suitability,
  naturalCategory,
} from "./streetSquad";
import { rivalWomen } from "./rivalRoster";
import { careerRating } from "./careerDevelopment";
import type { Career } from "./careerSeason";
import { profiles, rememberDivision } from "./difficulty";
import { lineupChemistry } from "./lineupChemistry";
import type { MenuMusic } from "./menuMusic";
import { audio } from "./matchAudio";
import { menuBumper, hint, padBadge, reveal } from "./screenUI";
import { playerRatings, ratingLabels } from "./playerRatings";
import { clubAccent, burners, type Fixture } from "./opponentSquads";
import { menuDirection, menuPad } from "./menuPad";
import {
  defaultSettings,
  matchConfirmDialog,
  settingsOptions,
  type MatchSettings,
} from "./matchSettings";
import css from "./lineup.css?inline";

import { formations, classicFormations, bios, type Shape } from "./lineupRoles";
export { bios, type Shape } from "./lineupRoles";
const classicShapes = Object.keys(formations).filter(
  (s) => !isStreetShape(s),
) as Shape[];
const forwardY = 14;
const keeperY = 86;
export function positions(shape: Shape) {
  const rows = formations[shape];
  const sx = isStreetShape(shape) ? streetArena.length / 42 : 1,
    sz = isStreetShape(shape) ? streetArena.width / 24 : 1;
  return rows.flatMap((roles, line) =>
    roles.map((role, i) => {
      const back = rows.length > 1 && line === rows.length - 1,
        front = line === 0;
      const width = back ? 7 : role === "ST" && roles.length === 2 ? 3.5 : 10;
      return {
        role,
        back,
        front,
        lane:
          roles.length === 1
            ? 0
            : width * sz * ((2 * i) / (roles.length - 1) - 1),
        depth:
          sx *
          (rows.length === 1
            ? -7 - (i === 1 ? 2 : 0)
            : -3 - (10 * line) / (rows.length - 1)),
        y:
          rows.length === 1
            ? 45 + (i === 1 ? 12 : 0)
            : forwardY + (line * (keeperY - forwardY)) / rows.length,
      };
    }),
  );
}
export type Selection = {
  shape: Shape;
  starters: string[];
  bench: string[];
};

type MatchSquad = {
  current: Selection;
  unavailable: Set<string>;
  exhausted: Set<string>;
  stamina: ReadonlyMap<string, { charge: number; capacity: number }>;
  music: MenuMusic;
};
export const burnerEligibility = new Set([
  "Meghan",
  "Jan",
  "Mandy",
  "Nadia",
  "Pam",
]);
export function selectLineup(
  portraits: Record<string, string>,
  fixture: Fixture,
  match?: MatchSquad,
  settings?: MatchSettings,
  career?: Selection,
  bonds?: Record<string, number>,
  progress?: Career,
  managedClub?: typeof burners,
  turn?: {
    number: number;
    devices: number[];
    first: boolean;
    draft?: Selection;
  },
): Promise<(Selection & { shape: keyof typeof classicFormations }) | null>;
export function selectLineup(
  portraits: Record<string, string>,
  fixture: Fixture,
  match?: MatchSquad,
  settings?: MatchSettings,
  career?: Selection,
  bonds?: Record<string, number>,
  progress?: Career,
  managedClub?: typeof burners,
  turn?: {
    number: number;
    devices: number[];
    first: boolean;
    draft?: Selection;
  },
  rules?: MatchRules,
): Promise<Selection | null>;
export function selectLineup(
  portraits: Record<string, string>,
  fixture: Fixture,
  match?: MatchSquad,
  settings: MatchSettings = defaultSettings(),
  career?: Selection,
  bonds?: Record<string, number>,
  progress?: Career,
  managedClub = fixture.home,
  turn?: {
    number: number;
    devices: number[];
    first: boolean;
    draft?: Selection;
  },
  rules: MatchRules = classicRules(),
): Promise<Selection | null> {
  const street = rules.goalkeepers === 0,
    count = rules.teamSize;
  const shapes: Shape[] = street ? streetShapes(count) : classicShapes;
  const home = managedClub;
  const key = street
    ? `tbfc.street.lineup.v1.${count}.${home.name}`
    : home === burners
      ? "tbfc.match.lineup.v1"
      : "tbfc.match.lineup.v1." + home.name;
  const countsTowardMinimum =
    home === burners ? burnerEligibility : rivalWomen[home.name];
  const names = Object.keys(portraits);
  let shape: Shape = shapes[0];
  const slots: (string | null)[] =
    home !== burners
      ? [...home.outfield, home.keeper]
      : [
          "Meghan",
          "Pam",
          new URLSearchParams(location.search).get("wing") === "stubbs"
            ? "Stubbs"
            : "Jan",
          "Mandy",
          "Jeremy",
          "Chris",
          "Sean",
        ];
  if (street)
    slots.splice(
      0,
      slots.length,
      ...autoStreet(home, names, shape as keyof typeof streetFormations),
    );
  slots.push(names.find((n) => !slots.includes(n)) ?? null, null, null, null);
  try {
    const saved =
      match?.current ??
      career ??
      turn?.draft ??
      JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      saved &&
      shapes.includes(saved.shape) &&
      Array.isArray(saved.starters) &&
      saved.starters.length === count &&
      Array.isArray(saved.bench) &&
      saved.bench.length <= 4
    ) {
      const team = [...saved.starters, ...saved.bench];
      if (home.name === "Whiff City FC") {
        const renamed: Record<string, string> = {
          Wyatt: "Parmesan",
          Cruz: "Swiss",
          Lex: "Cheddar",
          Una: "Gouda",
          Liv: "Brie",
        };
        team.forEach((name, i) => {
          if (Object.hasOwn(renamed, name)) team[i] = renamed[name];
        });
      }
      if (
        team.every((n) => names.includes(n)) &&
        new Set(team).size === team.length
      ) {
        shape = saved.shape;
        slots.fill(null);
        team.forEach((n, i) => (slots[i] = n));
      }
    }
  } catch {}
  const availableWomen = (team: (string | null)[]) =>
    team
      .slice(0, count)
      .filter(
        (n) => n && countsTowardMinimum.has(n) && !match?.unavailable.has(n),
      ).length;
  function legalSwap(incoming: string) {
    if (!match) return true;
    const trial = slots.slice();
    trial[editing] = incoming;
    return street || availableWomen(trial) >= 2;
  }
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  const root = document.createElement("section");
  root.id = "lineup";
  root.style.setProperty("--club", clubAccent(home));
  root.toggleAttribute("data-substitutions", !!match);
  if (street) {
    root.dataset.street = String(count);
    root.style.setProperty(
      "--court",
      courtPresets.find((c) => c.id === rules.court)!.color,
    );
  }
  root.setAttribute(
    "aria-label",
    match ? "Match substitutions" : "Pre-match lineup",
  );
  document.body.append(root);
  document.querySelector("main")!.inert = true;
  let highlighted: number = 1;
  let editing = -1;
  let pickerFocus = "";
  function nameplate(name: string) {
    const energy = match?.stamina.get(name);
    if (!energy)
      return `<span class="lu-name">${street && home === burners ? "#" + bios[name][0] + " " : ""}${name}</span>`;
    return `<span class="lu-name lu-energy" title="${Math.round(energy.charge)}% stamina remaining" style="--charge:${energy.charge}%;--capacity:${energy.capacity}%">${name}</span>`;
  }
  const avatar = (name: string) =>
    `<span class="lu-avatar" style="background-image:url('${portraits[name]}')"></span>`;
  return new Promise((resolve) => {
    function finish(back = false) {
      const result = {
        shape,
        starters: slots.slice(0, count) as string[],
        bench: slots.slice(count).filter((n): n is string => !!n),
      };
      if (!back && !match && !street && availableWomen(slots) < 2) return;
      if (!match) audio.menu(back ? "nav" : "success");
      if (!back && !match && !career)
        try {
          localStorage.setItem(key, JSON.stringify(result));
        } catch {}
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", keydown);
      root.remove();
      style.remove();
      document.querySelector("main")!.inert = false;
      resolve(back ? null : result);
    }
    const revealLineup = () =>
      reveal(
        root,
        ".lu-heading,.lu-form:not([hidden]),.lu-field,.lu-details,.lu-bench",
      );
    let dialog: HTMLDialogElement | null = null;
    function openAudioSettings() {
      if (!match || dialog) return;
      const music = match.music;
      dialog = document.createElement("dialog");
      dialog.className = "lu-confirm lu-audio";
      dialog.setAttribute("aria-labelledby", "audio-heading");
      dialog.innerHTML =
        `<h2 id="audio-heading">Settings</h2><div><button data-channel="music"></button><button data-channel="effects"></button></div><div class="menu-legend controller-legend"><button id="lu-cancel">${padBadge('B')} Back</button><span>${padBadge('LS')} Move</span><span>${padBadge('A')} Select</span></div>`;
      for (const btn of dialog.querySelectorAll<HTMLButtonElement>(
        "[data-channel]",
      )) {
        const isMusic = btn.dataset.channel === "music";
        const update = () => {
          const on = isMusic ? music.musicEnabled : music.soundEnabled;
          btn.textContent =
            (isMusic ? "Music" : "Sound effects") + " · " + (on ? "On" : "Off");
          btn.setAttribute("aria-pressed", String(on));
        };
        btn.onclick = () => {
          if (isMusic) music.toggleMusic();
          else music.toggleSound();
          update();
          audio.menu("nav");
        };
        update();
      }
      root.append(dialog);
      dialog.onclose = () => {
        dialog?.remove();
        dialog = null;
        root.querySelector<HTMLElement>("#lu-audio")?.focus();
      };
      audio.menu("open");
      dialog.showModal();
    }
    function confirmQuit() {
      if (!match || dialog) return;
      dialog = document.createElement("dialog");
      dialog.className = "lu-confirm lu-quit-confirm";
      dialog.setAttribute("aria-labelledby", "quit-question");
      dialog.innerHTML = `<h2 id="quit-question">Quit match?</h2><p>Are you sure? This match will end.</p><div class="menu-legend controller-legend"><button id="quit-yes">${hint("Enter", "A")} Quit</button><button id="lu-cancel">${hint("Esc", "B")} Keep Playing</button></div>`;
      root.append(dialog);
      dialog.onclose = () => {
        dialog?.remove();
        dialog = null;
        root.querySelector<HTMLElement>("#lu-quit")?.focus();
      };
      audio.menu("open");
      dialog.showModal();
      dialog.querySelector<HTMLElement>("#quit-yes")!.focus();
    }
    function confirmKickoff() {
      if (dialog) return;
      if (match) {
        finish();
        return;
      }
      if (!street && availableWomen(slots) < 2) return;
      if (street || career || turn?.first || rules.mode === "houseRules") {
        finish();
        return;
      }
      const previous = document.activeElement as HTMLElement | null;
      dialog = matchConfirmDialog(fixture, settings, rules.mode === "snowpocalypse", rules.mode === "firstToFive" ? rules.targetScore : undefined);
      root.append(dialog);
      dialog.onclose = () => {
        dialog?.remove();
        dialog = null;
        if (root.isConnected) {
          audio.menu("nav");
          previous?.focus();
          revealLineup();
        }
      };
      audio.menu("success");
      dialog.showModal();
      reveal(dialog, "h2,fieldset,#lu-confirm,#lu-cancel");
      root.querySelector<HTMLElement>("#lu-confirm")!.focus();
    }
    let lastShape = shape;
    function draw(focus: string) {
      const moving = lastShape !== shape && !still.matches;
      const previous = moving
        ? Array.from(
            root.querySelectorAll<HTMLElement>(".lu-marker"),
            (marker) => {
              const style = getComputedStyle(marker);
              return {
                left: style.left,
                top: style.top,
                name: marker.dataset.player,
              };
            },
          )
        : [];
      lastShape = shape;
      const field = [
        ...positions(shape),
        ...(street ? [] : [{ role: "GK", lane: 0, y: keeperY }]),
      ];
      const chemistry = !match
        ? lineupChemistry(home.name, shape, slots, bonds)
        : null;
      const web = chemistry
        ? `<svg class="lu-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${chemistry.links
            .map(({ a, b, rating }) => {
              const color =
                rating >= 70 ? "#74df85" : rating >= 40 ? "#ffc763" : "#ff7971";
              return `<line x1="${50 + field[a].lane * 3.5}" y1="${field[a].y}" x2="${50 + field[b].lane * 3.5}" y2="${field[b].y}" stroke="${color}" stroke-width="${rating >= 70 ? 4 : rating >= 40 ? 2.5 : 1.25}" vector-effect="non-scaling-stroke"/>`;
            })
            .join("")}</svg>`
        : "";
      const role = (i: number) =>
        i < 0 ? "Available" : i >= count ? "Sub" : field[i].role;
      root.innerHTML = renderMarkup(lineupTemplate, {
        home_crest: home.crest,
        playerNumber: turn
          ? renderMarkup(lineupPlayerNumberTemplate, {
              turn_number: turn.number,
            })
          : "",
        home_name: home.name,
        title: match
          ? "Substitutions"
          : street
            ? "STREET LINEUP"
            : "Lineup Select",
        navigation: match
          ? lineupSettingsTemplate.slice(0, -1) +
            (progress ? "" : lineupQuitTemplate.slice(0, -1))
          : "",
        formationHidden: match ? "hidden" : "",
        previousFormation: menuBumper(
          "previous",
          "Previous Formation",
          'id="lu-prev"',
        ),
        formations: shapes
          .map((f, i) =>
            renderMarkup(lineupFormationTemplate, {
              i: i,
              f: f,
              slot03: f === shape,
              slot04: isStreetShape(f) ? streetFormations[f].label : f,
            }),
          )
          .join(""),
        nextFormation: menuBumper("next", "Next formation", 'id="lu-next"'),
        rulesHidden: street ? "hidden" : "",
        rules: street
          ? ""
          : renderMarkup(lineupClassicRulesTemplate, {
              slot01: match ? shape + " · " : "",
              slot02: availableWomen(slots),
              slot03:
                match && !slots.slice(count).some(Boolean)
                  ? " · No substitutes named"
                  : "",
            }),
        chemistry: chemistry
          ? renderMarkup(lineupChemistryTemplate, {
              chemistry_score: chemistry.score,
              chemistry_score_2: chemistry.score,
              slot03: chemistryText(chemistry),
            })
          : "",
        web: web,
        playerSlots: field
          .map((p, i) =>
            renderMarkup(lineupPlayerSlotTemplate, {
              slot01: slots[i],
              slot02:
                match &&
                (match.unavailable.has(slots[i]!) ||
                  !slots.slice(count).some(Boolean))
                  ? "disabled"
                  : "",
              slot03: editing === i,
              slot04: i === highlighted,
              i: i,
              i_6: i,
              p_role: p.role,
              slot08: slots[i],
              slot09: match?.exhausted.has(slots[i]!) ? ", exhausted" : "",
              slot10: 50 + p.lane * 3.5,
              p_y: p.y,
              slot12: match?.exhausted.has(slots[i]!)
                ? lineupTiredMarkerTemplate.slice(0, -1)
                : "",
              slot13: street
                ? renderMarkup(lineupRoleCategoryTemplate, {
                    slot01: category(p.role),
                  })
                : "",
              p_role_14: p.role,
              slot15: avatar(slots[i]!),
              slot16: nameplate(slots[i]!),
            }),
          )
          .join(""),
        benchCount: slots.slice(count).filter(Boolean).length,
        benchSlots: slots
          .slice(count)
          .map((n, i) =>
            renderMarkup(lineupBenchSlotTemplate, {
              slot01: match ? "disabled" : "",
              slot02: editing === i + count,
              slot03: i + count,
              slot04: i + count,
              slot05: i + 1,
              slot06: n ?? "empty",
              slot07: n ? avatar(n) : "",
              slot08: n ? nameplate(n) : "+ Empty",
            }),
          )
          .join(""),
        roster:
          editing >= 0
            ? renderMarkup(lineupRosterTemplate, {
                slot01:
                  editing < 0
                    ? "Match squad"
                    : "Choose for " +
                      (editing < count ? role(editing) : "bench"),
                slot02: (match
                  ? slots.slice(count).filter((n): n is string => !!n)
                  : names
                      .filter((n) => !slots.includes(n))
                      .sort((a, b) =>
                        street && editing < count
                          ? suitability(home, b, field[editing].role) -
                            suitability(home, a, field[editing].role)
                          : 0,
                      )
                )
                  .map((n) =>
                    renderMarkup(lineupRosterPlayerTemplate, {
                      slot01: street
                        ? renderMarkup(lineupRosterCategoryTemplate, {
                            slot01: naturalCategory(home, n) ?? "OPEN",
                          })
                        : "",
                      slot02: names.indexOf(n),
                      n: n,
                      slot04:
                        !legalSwap(n) ||
                        editing < 0 ||
                        (editing >= count &&
                          !slots[editing] &&
                          slots.slice(0, count).includes(n))
                          ? "disabled"
                          : "",
                      slot05: avatar(n),
                      slot06: nameplate(n),
                      slot07: street ? "" : role(slots.indexOf(n)),
                    }),
                  )
                  .join(""),
                slot03:
                  editing >= count ? lineupClearTemplate.slice(0, -1) : "",
              })
            : "",
        legend: renderMarkup(lineupLegendTemplate, {
          // Keep the primary action last, with the same Start shortcut as before.
        startDisabled:
          !match && !street && availableWomen(slots) < 2 ? "disabled" : "",
        startHint: padBadge("Menu"),
        startLabel: match
          ? "Resume"
          : turn?.first
            ? "Next lineup"
            : career
              ? "Confirm Lineup"
              : "Match Settings",

          moveHint: street ? padBadge("LS") : hint("Arrows", "LS"),
          selectHint: street ? padBadge("A") : hint("Enter", "A"),
          backHint: street ? padBadge("B") : hint("Esc", "B"),
          autoPick:
            street && !match
              ? renderMarkup(lineupAutoPickTemplate, {
                  autoPickHint: padBadge("Y"),
                })
              : "",
        }),
      });
      const slideDuration = 340;
      root.querySelectorAll<HTMLElement>(".lu-marker").forEach((marker, i) => {
        const before = previous.find((p) => p.name === slots[i]);
        if (before)
          marker.animate(
            [
              { left: before.left, top: before.top },
              { left: marker.style.left, top: marker.style.top },
            ],
            { duration: slideDuration, easing: "ease-out" },
          );
      });
      if (moving) {
        const links = root.querySelector<SVGElement>(".lu-links");
        links?.animate(
          [{ opacity: 0 }, { opacity: getComputedStyle(links).opacity }],
          {
            delay: slideDuration,
            duration: 180,
            easing: "ease-out",
            fill: "backwards",
          },
        );
      }
      profile(slots[highlighted]);
      root.querySelector<HTMLElement>("#" + focus)?.focus();
    }
    let fire: CanvasRenderingContext2D | null = null;
    let fireFrame = -1;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    function paintFire(frame: number) {
      if (!fire || frame === fireFrame) return;
      fireFrame = frame;
      fire.clearRect(0, 0, 96, 20);
      const phase = (frame * Math.PI) / 16;
      for (let x = 0; x < 96; x++) {
        const drift = x + 0.9 * Math.sin(phase + x * 0.24);
        const crest =
          1 -
          Math.abs(Math.sin(drift * 0.27 + 0.35 * Math.sin(x * 0.11 - phase)));
        const height =
          2 + Math.round(crest ** 2 * (6 + 3 * Math.sin(x * 0.4 + phase)));
        for (const [scale, color] of [
          [1, "#923327"],
          [0.62, "#c5461a"],
          [0.24, "#ed7529"],
        ] as const) {
          const h = Math.max(1, Math.round(scale * height));
          fire.fillStyle = color;
          fire.fillRect(x, 20 - h, 1, h);
        }
      }
    }
    function profile(name: string | null) {
      const panel = root.querySelector<HTMLElement>("#lu-profile");
      if (!panel) return;
      fire = null;
      fireFrame = -1;
      if (!name) {
        panel.textContent = "Empty bench slot";
        return;
      }
      const [number, role] =
        home === burners
          ? bios[name]
          : [null, name === home.keeper ? "Goalkeeper" : "Outfield"];

      const ratings =
        typeof number === "number"
          ? playerRatings[number]?.map((base, i) =>
              careerRating(progress, name, ratingLabels[i], base),
            )
          : street
            ? squadRatings(home.name, name)
            : undefined;
      const stats = ratings
        ? `<dl class="lu-ratings" aria-label="Player ratings out of 100">${ratingLabels
            .map(
              (label, i) =>
                `<div><dt>${label}</dt><dd>${ratings[i]}</dd><i aria-hidden="true" style="--rating:${ratings[i]}%"></i></div>`,
            )
            .join("")}</dl>`
        : "";
      panel.innerHTML = `<div class="lu-portrait" data-player="${name}"><span class="lu-portrait-field" aria-hidden="true"></span><canvas class="lu-fire" width="96" height="20" aria-hidden="true"></canvas>${avatar(name)}</div><small>${number ? "#" + number + " · " : ""}${role}</small><h3>${name === "Stubbs" ? "STUBBS" : name}</h3>${stats}`;
      fire = panel.querySelector("canvas")!.getContext("2d");
      paintFire(0);
    }
    function chemistryText(result: ReturnType<typeof lineupChemistry>) {
      return result.score + "/100";
    }
    function previewSwap(button: HTMLElement) {
      if (editing < 0 || match) return;
      const trial = slots.slice();
      if (button.dataset.name) {
        const previous = trial.indexOf(button.dataset.name);
        if (previous >= 0) trial[previous] = trial[editing];
        trial[editing] = button.dataset.name;
      } else if (button.dataset.slot !== undefined) {
        const target = Number(button.dataset.slot);
        [trial[target], trial[editing]] = [trial[editing], trial[target]];
      }
      const valid = trial.slice(0, count).every(Boolean);
      const result = lineupChemistry(
        home.name,
        shape,
        valid ? trial : slots,
        bonds,
      );
      const lines = root.querySelectorAll<SVGLineElement>(".lu-links line");
      result.links.forEach(({ a, b, rating }, i) => {
        const line = lines[i];
        const color =
          rating >= 70 ? "#74df85" : rating >= 40 ? "#ffc763" : "#ff7971";
        line.setAttribute("stroke", color);
        line.style.color = color;
        line.setAttribute(
          "stroke-width",
          String(rating >= 70 ? 4 : rating >= 40 ? 2.5 : 1.25),
        );
        line.classList.toggle(
          "lu-preview",
          valid && (slots[a] !== trial[a] || slots[b] !== trial[b]),
        );
      });
      const meter = root.querySelector<HTMLElement>(".lu-chem-meter")!;
      root.querySelector(".lu-fit")!.textContent = chemistryText(result);
      meter.setAttribute("aria-valuenow", String(result.score));
      meter.querySelector("i")!.style.width = result.score + "%";
    }
    root.addEventListener("pointerover", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-slot],[data-name]",
      );
      if (
        event.pointerType === "mouse" &&
        button &&
        button !== document.activeElement
      )
        button.focus({ preventScroll: true });
    });
    root.addEventListener("focusin", (event) => {
      const b = event.target as HTMLElement;
      previewSwap(b);
      if (b.dataset.name)
        root
          .querySelectorAll<HTMLElement>(".lu-marker")
          .forEach((m) => (m.dataset.current = "false"));
      if (b.closest(".lu-roster") || b.dataset.slot !== undefined)
        pickerFocus = b.id;
      if (b.dataset.slot !== undefined) {
        highlighted = Number(b.dataset.slot);
        root
          .querySelectorAll<HTMLElement>(".lu-marker")
          .forEach((m) => (m.dataset.current = String(m === b)));
        profile(slots[highlighted]);
      } else if (b.dataset.name) profile(b.dataset.name);
    });
    function cycleShape(step: number) {
      const index =
        (shapes.indexOf(shape) + step + shapes.length) % shapes.length;
      audio.menu("nav");
      shape = shapes[index];
      if (street)
        slots.splice(
          0,
          count,
          ...assignStreet(
            home,
            slots.slice(0, count) as string[],
            shape as keyof typeof streetFormations,
          ),
        );
      const current = document.activeElement as HTMLElement | null;
      const focus =
        current && root.contains(current) && current.id ? current.id : "slot-1";
      draw(
        editing >= 0 && pickerFocus
          ? pickerFocus
          : focus.startsWith("form-")
            ? "form-" + index
            : focus,
      );
    }
    function close() {
      audio.menu("nav");
      const slot = editing;
      editing = -1;
      draw("slot-" + slot);
    }
    root.onclick = (e) => {
      const b = (e.target as HTMLElement).closest("button");
      if (!b) return;
      if (dialog) {
        if (b.id === "quit-yes") {
          history.replaceState({ ...history.state, arcadeMenu: true }, "");
          location.reload();
          return;
        }
        const key = b.dataset.setting;
        if (
          key === "speed" ||
          key === "targetScore" ||
          key === "time" ||
          key === "weather" ||
          key === "difficulty"
        ) {
          if (b.getAttribute("aria-pressed") !== "true") audio.menu("nav");
          if (key === "difficulty") {
            const division = settingsOptions.difficulty.find(
              (v) => v === b.value,
            );
            if (division) {
              settings.difficulty = division;
              rememberDivision(division);
              dialog.querySelector<HTMLElement>(
                ".lu-division-detail",
              )!.textContent = profiles[division].label;
            }
          }
          if (key === "targetScore" && rules.mode === "firstToFive") {
            const target = Number(b.value);
            if (target === 3 || target === 5 || target === 10) rules.targetScore = target;
          }
          if (key === "speed")
            settings.speed =
              settingsOptions.speed.find((v) => String(v) === b.value) ??
              settings.speed;
          if (key === "time")
            settings.time =
              settingsOptions.time.find((v) => v === b.value) ?? settings.time;
          if (key === "weather")
            settings.weather =
              settingsOptions.weather.find((v) => v === b.value) ??
              settings.weather;
          dialog
            .querySelectorAll<HTMLButtonElement>('[data-setting="' + key + '"]')
            .forEach((btn) =>
              btn.setAttribute("aria-pressed", String(btn === b)),
            );
          return;
        }
        if (b.id === "lu-confirm") finish();
        else if (b.id === "lu-cancel") dialog.close();
        return;
      }
      if (b.id === "lu-auto") {
        autoPickLineup();
        return;
      }
      if (b.id === "lu-prev" || b.id === "lu-next") {
        cycleShape(b.id === "lu-prev" ? -1 : 1);
        return;
      }
      if (b.dataset.slot !== undefined) {
        audio.menu("nav");
        const target = Number(b.dataset.slot);
        if (!match && editing >= 0) {
          if (
            (target < count && !slots[editing]) ||
            (editing < count && !slots[target])
          )
            return;
          [slots[target], slots[editing]] = [slots[editing], slots[target]];
          close();
          return;
        }
        editing = target;
        if (match) {
          const candidate = slots.slice(count).find((n) => n && legalSwap(n));
          draw(candidate ? "name-" + names.indexOf(candidate) : "lu-legend-back");
          return;
        }
        draw(b.id);
        return;
      }
      if (b.dataset.name && editing >= 0) {
        if (
          match &&
          (!legalSwap(b.dataset.name) ||
            !slots.slice(count).includes(b.dataset.name))
        )
          return;
        const old = slots.indexOf(b.dataset.name);
        // A filled starting spot always needs a replacement.
        if (old >= 0 && old < count && !slots[editing] && editing >= count)
          return;
        if (old >= 0) slots[old] = slots[editing];
        slots[editing] = b.dataset.name;
        close();
        return;
      }
      if (b.hasAttribute("data-clear")) {
        slots[editing] = null;
        close();
        return;
      }
      if (b.dataset.shape) {
        if (b.dataset.shape !== shape) audio.menu("nav");
        shape = b.dataset.shape as Shape;
        if (street)
          slots.splice(
            0,
            count,
            ...assignStreet(
              home,
              slots.slice(0, count) as string[],
              shape as keyof typeof streetFormations,
            ),
          );
        draw(editing >= 0 ? pickerFocus : "slot-" + highlighted);
        return;
      }
      if (b.id === "lu-audio") {
        openAudioSettings();
        return;
      }
      if (b.id === "lu-quit") {
        confirmQuit();
        return;
      }
      if (b.id === "lu-legend-back") {
        if (editing >= 0) close();
        else if (match) finish();
        else finish(true);
        return;
      }
      if (b.id === "lu-start") confirmKickoff();
    };
    function move(dx: number, dy: number) {
      const items = Array.from(
        root.querySelectorAll<HTMLButtonElement>(
          dialog
            ? "dialog button"
            : editing >= 0 && !match
              ? "[data-slot],.lu-roster button:not(:disabled)"
              : editing >= 0
                ? ".lu-roster button:not(:disabled)"
                : "button:not(:disabled)",
        ),
      ).filter((b) => b.getClientRects().length > 0);
      const current = document.activeElement as HTMLButtonElement;
      const focus = (item?: HTMLButtonElement) => {
        if (item && item !== current) {
          item.focus();
          audio.menu("nav");
        }
      };
      if (match && editing >= 0 && !dialog && dy && items.includes(current)) {
        focus(
          items[
            Math.max(0, Math.min(items.length - 1, items.indexOf(current) + dy))
          ],
        );
        return;
      }
      if (!items.includes(current)) {
        focus(items[0]);
        return;
      }
      const rect = current.getBoundingClientRect();
      let best: HTMLButtonElement | undefined,
        score = Infinity;
      for (const b of items) {
        const r = b.getBoundingClientRect(),
          x = r.x + r.width / 2 - rect.x - rect.width / 2,
          y = r.y + r.height / 2 - rect.y - rect.height / 2;
        const along = x * dx + y * dy,
          across = Math.abs(x * dy - y * dx);
        if (along < 2 || across > along * 2) continue;
        const cost = along + across * 2.5;
        if (cost < score) {
          score = cost;
          best = b;
        }
      }
      if (!best) {
        // Keep every control reachable when the lineup geometry puts it off axis.
        best = items
          .filter((b) => b !== current)
          .map((b) => {
            const r = b.getBoundingClientRect();
            const x = r.x + r.width / 2 - rect.x - rect.width / 2;
            const y = r.y + r.height / 2 - rect.y - rect.height / 2;
            const along = x * dx + y * dy;
            return { b, along, across: Math.abs(x * dy - y * dx) };
          })
          .filter((v) => v.along > 2)
          .sort(
            (a, b) => a.along + a.across * 2.5 - b.along - b.across * 2.5,
          )[0]?.b;
      }
      focus(best);
    }
    // Share the same guarded action across the legend, keyboard and gamepad.
    // Rebuild the bench from unused players and return focus to the pitch.
    function autoPickLineup() {
      if (!street || match || dialog) return;
      const picked = autoStreet(
        home,
        names,
        shape as keyof typeof streetFormations,
      );
      const bench = names.filter((name) => !picked.includes(name)).slice(0, 4);
      slots.splice(0, slots.length, ...picked, ...bench);
      editing = -1;
      highlighted = 0;
      audio.menu("success");
      draw("slot-0");
    }
    function keydown(e: KeyboardEvent) {
      if (!dialog && !e.repeat) {
        if (street && !match && e.code === "KeyY") {
          e.preventDefault();
          autoPickLineup();
          return;
        }
        if (e.code === "KeyP") {
          e.preventDefault();
          confirmKickoff();
          return;
        }
        if (!match && (e.code === "BracketLeft" || e.code === "BracketRight")) {
          e.preventDefault();
          cycleShape(e.code === "BracketLeft" ? -1 : 1);
          return;
        }
      }
      const d: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      if (d[e.key]) {
        e.preventDefault();
        move(...d[e.key]);
      }
      if (e.key === "Escape" && !dialog) {
        e.preventDefault();
        if (editing >= 0) close();
        else if (match) finish();
        else finish(true);
      }
    }
    const lineupPad = () =>
      turn
        ? Array.from(navigator.getGamepads?.() ?? []).find(
            (p) =>
              p &&
              turn.devices.includes(p.index) &&
              (p.buttons.some((b) => b.pressed) ||
                p.axes.some((v) => Math.abs(v) > 0.3)),
          )
        : menuPad();
    let frame = 0,
      lastMove = 0,
      held = "",
      a = !!lineupPad()?.buttons[0]?.pressed,
      b = !!lineupPad()?.buttons[1]?.pressed,
      y = !!lineupPad()?.buttons[3]?.pressed;
    let lb = false,
      rb = false,
      startHeld = !!lineupPad()?.buttons[9]?.pressed;
    function poll(t: number) {
      paintFire(still.matches ? 0 : Math.floor(t / 130) % 32);
      const pad = lineupPad();
      if (pad) {
        const start = !!pad.buttons[9]?.pressed,
          opening = start && !startHeld && !dialog;
        const launchSettings = start && !startHeld && dialog?.classList.contains("lu-settings");
        startHeld = start;
        if (opening) confirmKickoff();
        // Match the Start/Menu shortcut advertised by the settings legend.
        if (launchSettings) {
          dialog?.querySelector<HTMLButtonElement>("#lu-confirm")?.click();
          return;
        }
        const autoPickPressed = !!pad.buttons[3]?.pressed;
        if (!opening && !dialog && autoPickPressed && !y) autoPickLineup();
        y = autoPickPressed;
        const left = !!pad.buttons[4]?.pressed,
          right = !!pad.buttons[5]?.pressed;
        if (!match && !dialog && left && !lb && !right) cycleShape(-1);
        if (!match && !dialog && right && !rb && !left) cycleShape(1);
        lb = left;
        rb = right;
        const dir = menuDirection(pad);
        if (dir && (dir !== held || t - lastMove > 240)) {
          move(
            dir === "l" ? -1 : dir === "r" ? 1 : 0,
            dir === "u" ? -1 : dir === "d" ? 1 : 0,
          );
          lastMove = t;
        }
        held = dir;
        if (!opening && pad.buttons[1]?.pressed && !b) {
          if (dialog) dialog.close();
          else if (editing >= 0) close();
          else if (match) finish();
          else finish(true);
        }
        if (!opening && pad.buttons[0]?.pressed && !a)
          (document.activeElement as HTMLElement)?.click();
        a = !!pad.buttons[0]?.pressed;
        b = !!pad.buttons[1]?.pressed;
      } else {
        a = b = y = lb = rb = startHeld = false;
        held = "";
      }
      if (root.isConnected) frame = requestAnimationFrame(poll);
    }
    draw("slot-0");
    revealLineup();
    window.addEventListener("keydown", keydown);
    frame = requestAnimationFrame(poll);
  });
}
