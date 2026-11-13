import meghanHead from "./art/headshots/meghan.png?url";
import nelsonHead from "./art/headshots/nelson.png?url";
import mandyHead from "./art/headshots/mandy.png?url";
import chrisHead from "./art/headshots/chris.png?url";
import seanHead from "./art/headshots/sean.png?url";
import stevenHead from "./art/headshots/steven.png?url";
import danielHead from "./art/headshots/daniel.png?url";
import nadiaHead from "./art/headshots/nadia.png?url";
import janHead from "./art/headshots/jan.png?url";
import jeremyHead from "./art/headshots/jeremy.png?url";
import joseHead from "./art/headshots/jose.png?url";
import pamHead from "./art/headshots/pam.png?url";
import stubbsHead from "./art/headshots/stubbs.png?url";
import { hint } from "./screenUI";
import { scoreRow } from "./leagueBoard";
import { burners, clubs, type Fixture } from "./opponentSquads";
import {
  bios,
  burnerEligibility,
  selectLineup,
  type Selection,
} from "./lineup";
import { lineupChemistry } from "./lineupChemistry";
import {
  availableUpgrades,
  careerRating,
  spendUpgrade,
  type Attribute,
} from "./careerDevelopment";
import { playerRatings, ratingLabels } from "./playerRatings";
import { menuPad, menuDirection } from "./menuPad";
import {
  kickoffTime,
  bookRound,
  createCareer,
  calendarTime,
  calendarDate,
  seasonName,
  finishRound,
  nextWeek,
  opponent,
  outcome,
  simulateMatch,
  stage,
  table,
  tiers,
  type Career,
} from "./careerSeason";
import { deleteSlot, loadSlot, saveSlot } from "./careerStore";
import type { MatchSettings } from "./matchSettings";
import css from "./career.css?inline";

export const headshots: Partial<Record<string, string>> = {
  Meghan: meghanHead,
  Nelson: nelsonHead,
  Mandy: mandyHead,
  Chris: chrisHead,
  Sean: seanHead,
  Steven: stevenHead,
  Daniel: danielHead,
  Nadia: nadiaHead,
  Jan: janHead,
  Jeremy: jeremyHead,
  José: joseHead,
  Pam: pamHead,
  Stubbs: stubbsHead,
};

export type Ticket = {
  career: Career;
  slot: number;
  lineup: Selection;
  fixture: Fixture;
};
export const ratings = clubs.map((team) => team.stars);
const division = (s: string) =>
  s === "beginners" ? "Beginners" : s.toUpperCase();
const btn = (action: string, label: string, primary = false) =>
  `<button data-action="${action}" class="${primary ? "primary" : ""}">${label}</button>`;
const panel = (title: string, body: string) =>
  `<section class="cr-panel"><h2>${title}</h2>${body}</section>`;
function scores(c: Career, week: number) {
  return c.schedule[week].map((_, i) => fixtureRow(c, week, i)).join("");
}
function fixtureRow(
  c: Career,
  week: number,
  index: number,
  includeStage = true,
) {
  const g = c.schedule[week][index],
    label = includeStage && week >= 6 ? stage(week, index) : "";
  if (g.score)
    return scoreRow(
      g.a,
      g.b,
      g.score,
      g.pens ? "FINAL · " + g.pens.join("–") + " PENS" : "FINAL",
      label,
    );
  return scoreRow(
    g.a,
    g.b,
    null,
    calendarDate({ ...c, round: week }, 5),
    label,
    kickoffTime(g.kickoff!),
  );
}
const weekDays = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
function weekStrip(c: Career) {
  const current = (new Date(calendarTime(c)).getUTCDay() + 2) % 7;
  const cells = weekDays
    .map((day, i) => {
      const offset = c.day - current + i,
        date = new Date(calendarTime(c, offset));
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
      return `<li ${i === current ? 'aria-current="date"' : ""}><b>${day}</b><span>${label}</span>${offset === 5 ? "<small>Matchday</small>" : ""}</li>`;
    })
    .join("");
  return `<ol class="cr-week" aria-label="Career week" style="--day:${current}">${cells}</ol>`;
}
function standings(c: Career) {
  return (
    '<table><thead><tr><th>#</th><th class="team">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>' +
    table(c)
      .map(
        (r, i) =>
          `<tr data-club="${r.club}" class="${r.club === 0 ? "tb" : ""}"><td>${i + 1}</td><td class="team"><img class="cr-crest" src="${clubs[r.club].crest}" alt="">${clubs[r.club].name}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf - r.ga}</td><td>${r.pts}</td></tr>`,
      )
      .join("") +
    "</tbody></table>"
  );
}
function championshipBracket(c: Career) {
  const seeds = table(c, Math.min(6, c.reports.length))
    .slice(0, 4)
    .map((row) => row.club);
  const semifinals = c.schedule[6]?.slice(0, 2) ?? [
    { a: seeds[0], b: seeds[3] },
    { a: seeds[1], b: seeds[2] },
  ];
  const final = c.schedule[7]?.[0];
  const entrant = (club: number | undefined, score?: number, winner = false) =>
    `<div class="cr-bracket-entrant ${winner ? "cr-bracket-winner" : ""}">${club === undefined ? '<span class="cr-bracket-empty">TBD</span>' : `<img src="${clubs[club].crest}" alt=""><span>${clubs[club].name}</span>`}${score === undefined ? "" : `<b>${score}</b>`}</div>`;
  const match = (
    game:
      | {
          a: number | undefined;
          b: number | undefined;
          score?: [number, number];
          pens?: [number, number];
        }
      | undefined,
    label: string,
    a?: number,
    b?: number,
  ) => {
    const first = game?.a ?? a,
      second = game?.b ?? b;
    const decided = !!game?.score;
    const win = decided
      ? outcome(game as NonNullable<typeof final>)[0]
      : undefined;
    return `<div class="cr-bracket-match"><h3>${label}</h3>${entrant(first, game?.score?.[0], win === first)}${entrant(second, game?.score?.[1], win === second)}${game?.pens ? `<small>Penalties ${game.pens[0]}–${game.pens[1]}</small>` : ""}</div>`;
  };
  const finalistA = semifinals[0]?.score
    ? outcome(semifinals[0])[0]
    : undefined;
  const finalistB = semifinals[1]?.score
    ? outcome(semifinals[1])[0]
    : undefined;
  return `<div class="cr-bracket"><div class="cr-bracket-semis">${match(semifinals[0], "Semifinal 1")}${match(semifinals[1], "Semifinal 2")}</div><div class="cr-bracket-final">${match(final, "Championship Final", finalistA, finalistB)}</div></div>${c.round === 5 ? '<p class="cr-bracket-note">Projected seeds · Final bracket locks after Week 6</p>' : ""}`;
}
export function careerHub(
  portraits: Record<string, string>,
  settings: MatchSettings,
  resume?: number,
): Promise<Ticket | null> {
  const roster = Object.keys(portraits);
  const root = document.createElement("div");
  root.id = "career";
  const style = document.createElement("style");
  style.textContent = css;
  root.append(style);
  const shell = document.createElement("div");
  shell.className = "cr-shell";
  root.append(shell);
  document.body.append(root);
  const main = document.querySelector("main")!;
  main.inert = true;
  let slot = resume ?? 0,
    c: Career | null = null,
    screen: "slots" | "setup" | "hub" = "slots",
    tab = "Central",
    timer = 0,
    frame = 0;
  const face = (n: string) =>
    headshots[n]
      ? `<img class="cr-face cr-headshot" src="${headshots[n]}" alt="">`
      : `<span class="cr-face" style="background-image:url('${portraits[n]}')"></span>`;
  function chatRow(name: string, text: string, date: string) {
    return `<div class="msg">${portraits[name] ? face(name) : ""}<div><small>${name} · ${date}</small><p>${text}</p></div></div>`;
  }
  function reactionRow(line: string, date: string) {
    const separator = line.indexOf(" · ");
    return separator < 0
      ? chatRow("Full Time", line, date)
      : chatRow(line.slice(0, separator), line.slice(separator + 3), date);
  }
  const defaults = () => ({
    player: roster[0],
    division: "d5",
    chaos: "Authentic",
    sim: "Allowed",
    speed: "10",
  });
  let chosen: Attribute | undefined;
  let setup = defaults();
  const tabs = ["Central", "Calendar", "Squad", "My career"];
  return new Promise((resolve) => {
    function leave(ticket: Ticket | null) {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      root.remove();
      main.inert = false;
      resolve(ticket);
    }
    function save() {
      bookRound(c!, ratings);
      saveSlot(slot, c!);
    }
    function error(e: unknown) {
      clearTimeout(timer);
      timer = 0;
      shell.innerHTML = panel(
        "Career save",
        `<p class="cr-error"></p>${btn("back", "Back to main menu")}`,
      );
      shell.querySelector("p")!.textContent = String(e);
    }
    function draw(focus = "") {
      const state = c;
      let content = "";
      if (screen === "slots") {
        content =
          panel(
            "Career saves",
            [0, 1, 2]
              .map((i) => {
                try {
                  const s = loadSlot(i);
                  return btn(
                    "slot" + i,
                    s
                      ? `Continue · ${s.player} · ${seasonName(s.season)} · ${division(s.division)}`
                      : "New career · Slot " + (i + 1),
                  );
                } catch {
                  return "<p>Slot " + (i + 1) + " · Unable to read save</p>";
                }
              })
              .join(" "),
          ) + btn("back", "Back to arcade");
      } else if (screen === "setup") {
        const choices = (
          key: keyof typeof setup,
          label: string,
          options: readonly string[],
        ) =>
          `<fieldset><legend>${label}</legend><div class="cr-options">${options.map((v, i) => `<button data-action="pick-${key}-${i}" data-field="${key}" value="${v}" aria-pressed="${setup[key] === v}">${key === "division" ? division(v) : key === "speed" ? v + "×" : v}</button>`).join("")}</div></fieldset>`;
        const [number, position] = bios[setup.player];
        const stats = playerRatings[number]!;
        const bars = ratingLabels
          .map(
            (label, i) =>
              `<div class="cr-rating"><span>${label}</span><b>${stats[i]}</b><div class="cr-track"><i style="transform:scaleX(${stats[i] / 100})"></i></div></div>`,
          )
          .join("");
        const grid = roster
          .map(
            (n, i) =>
              `<button data-action="pick-player-${i}" data-field="player" value="${n}" aria-pressed="${setup.player === n}">${face(n)}${n}</button>`,
          )
          .join("");
        const settings =
          choices("division", "Starting Division", tiers) +
          choices("chaos", "Team Availability", ["Authentic", "Chaos"]) +
          choices("sim", "Match Simulation", ["Allowed", "Disabled"]) +
          choices("speed", "Match Clock", ["5", "10", "20"]);
        content =
          '<div class="cr-setup">' +
          panel(
            "Select Player",
            `<div class="cr-hero" data-player="${setup.player}" style="background-image:url('${portraits[setup.player]}')"></div><h3>${setup.player}</h3><small>#${number} · ${position}</small><div class="cr-bars">${bars}</div>`,
          ) +
          panel(
            "Roster",
            `<div class="cr-roster">${grid}</div><h2>Season Settings</h2>${settings}<div class="cr-actions cr-start">${btn("slots", "Back")}${btn("create", "Start Career", true)}</div>`,
          ) +
          "</div>";
      } else if (state) {
        const s = state,
          done = s.reports.length > s.round,
          gameIndex = s.schedule[s.round].findIndex((g) => !g.a || !g.b);
        const visible = s.week.events.filter((e) => e.day <= s.day);
        const report = s.reports[s.round];
        content = `<nav aria-label="Career sections">${tabs.map((t, i) => `<button data-action="tab${i}" aria-current="${t === tab ? "page" : "false"}">${t}${t === "My career" && availableUpgrades(s) ? " (+" + availableUpgrades(s) + ")" : ""}</button>`).join("")}${btn("slots", "Save slots")}</nav>`;
        if (tab === "Central") {
          content += weekStrip(s);
          const title = stage(s.round, gameIndex);
          let actions = "",
            summary = "";
          if (done) {
            summary = `<p>${report.simulatedFrom !== undefined ? "Remainder Simulated From " + Math.floor(report.simulatedFrom) + "′" : report.simulated ? "Simulated" : "Played"} · Shots ${report.shots.join(" – ")}${report.pens ? " · Penalties " + report.pens.join(" – ") : ""}</p>`;
            summary +=
              report.goals
                .map(
                  (g) =>
                    `<div>${g.minute}′ · ${g.player} · ${clubs[g.club].name}</div>`,
                )
                .join("") || "<p>No goals.</p>";
            if (report.performance) {
              const p = report.performance;
              summary += `<div class="msg">${face(p.name)}<div><b>${p.name}</b><p>Goals ${p.goals} · Assists ${p.assists} · Completed passes ${p.passes} · +${p.xpAfter - p.xpBefore} XP</p></div></div>`;
            }
            if (s.round === 7) {
              const place = s.schedule[7].flatMap(outcome).indexOf(0) + 1;
              summary +=
                "<h2>" +
                (place === 1
                  ? division(s.division) + " champions!"
                  : place === 5
                    ? "Best of the Rest winners!"
                    : "Season complete · Place " + place) +
                "</h2>";
              if (place === 1 && s.division !== "d4") {
                summary += `<p>You’ve conquered ${division(s.division)}. Do you want to promote Turf Burners FC?</p>`;
                actions =
                  btn("promote", "Accept promotion", true) +
                  btn("next", "Defend title");
              } else actions = btn("next", "Start next season", true);
            } else actions = btn("next", "Continue to next week", true);
          } else if (s.day === 5)
            actions =
              btn("lineup", "Set lineup & play", true) +
              (s.simulate ? btn("simline", "Set lineup & simulate") : "");
          else
            actions =
              btn("advance", "Advance day", true) +
              btn(
                timer ? "stop" : "fast",
                timer ? "Pause calendar" : "Advance to matchday",
              );
          const poll = roster
            .map((n) => {
              const v = visible.filter((e) => e.name === n).at(-1);
              const answer = v?.answer ?? "No response";
              return `<div class="poll" data-vote="${answer}">${face(n)}<b>${n}</b><span>${answer === "Yes" || answer === "Late" ? "✓ " : ""}${answer}</span></div>`;
            })
            .join("");
          const archive = s.chat.slice();
          const previous = archive.at(-1);
          const carried =
            !done &&
            previous?.name === "Full time" &&
            previous.text === s.reaction
              ? archive.pop()
              : undefined;
          const attendance = visible
            .filter((e) => e.message)
            .slice()
            .reverse()
            .map((e) => chatRow(e.name, e.message, calendarDate(s, e.day)))
            .join("");
          const messages =
            (done && s.reaction
              ? reactionRow(s.reaction, calendarDate(s, 5))
              : "") +
            attendance +
            (carried ? reactionRow(carried.text, carried.date) : "");
          const earlier = archive.length
            ? "<details><summary>Earlier Messages</summary>" +
              archive
                .reverse()
                .map((e) =>
                  e.name === "Full time"
                    ? reactionRow(e.text, e.date)
                    : chatRow(e.name, e.text, e.date),
                )
                .join("") +
              "</details>"
            : "";
          content += `<div class="cr-grid"><div>${panel(title, `<strong class="cr-day">${calendarDate(s)}</strong> · ${s.day < -1 ? "Off-week" : done ? "Full time" : s.day === 5 ? "Matchday" : "Next kickoff " + calendarDate(s, 5)} · ${s.week.conditions.time} · ${{ Sun: "Clear", Clouds: "Cloudy", Rain: "Rain" }[s.week.conditions.weather]}${fixtureRow(s, s.round, gameIndex, false)}${summary}<div class="cr-actions">${actions}</div>`)}${s.round >= 6 ? panel("Playoff Fixtures", scores(s, s.round)) : ""}${s.round >= 5 ? panel("Championship Bracket", championshipBracket(s)) : ""}${panel(s.round >= 6 ? "Final league table" : "League table", standings(s))}${s.round < 6 && done ? panel("Around the league", scores(s, s.round)) : ""}${panel("Team Chat", messages + earlier)}</div><aside>${panel("Matchday poll", poll)}</aside></div>`;
          content += btn("delete", "Delete career");
        } else if (tab === "Calendar") {
          content +=
            s.schedule
              .map((_, i) => panel("Week " + (i + 1), scores(s, i)))
              .join("") +
            (s.schedule.length < 8
              ? "<p>Weeks 7 and 8 · Playoff opponents are decided by league position and semifinal results.</p>"
              : "");
        } else if (tab === "Squad") {
          content += panel(
            "Squad",
            `<table class="cr-squad-table"><thead><tr><th scope="col">Player</th><th scope="col">Position</th><th scope="col">Appearances</th><th scope="col">Goals</th></tr></thead><tbody>${roster.map((n) => `<tr><td class="cr-squad-player">${face(n)}<b>${n}</b></td><td class="cr-squad-position">${bios[n]?.[1] ?? ""}</td><td class="cr-squad-count">${s.stats[n]?.apps ?? 0}</td><td class="cr-squad-count">${s.stats[n]?.goals ?? 0}</td></tr>`).join("")}</tbody></table>`,
          );
        } else {
          const stats = s.stats[s.player];
          const base = playerRatings[bios[s.player][0]]!,
            credits = availableUpgrades(s);
          const choices = ratingLabels
            .map((stat, i) => {
              const value = careerRating(s, s.player, stat, base[i]),
                canSpend = credits > 0 && value < 100;
              return `<button data-action="train-${i}" ${canSpend ? "" : "disabled"} aria-pressed="${stat === chosen}">${stat}<b>${value}${canSpend ? " → " + Math.min(100, value + 2) : ""}</b></button>`;
            })
            .join("");
          const training = panel(
            "Player development",
            `<div class="cr-profile">${face(s.player)}<b>${s.player}</b></div><p>${credits ? credits + " upgrade" + (credits === 1 ? "" : "s") + " available" : "Next upgrade in " + (100 - (s.xp % 100)) + " XP"}</p><div class="cr-training">${choices}</div>${chosen ? btn("upgrade", "Improve " + chosen, true) : ""}`,
          );
          content +=
            panel(
              s.player,
              `<p>Player-manager · Level ${1 + Math.floor(s.xp / 100)} · ${s.xp} XP</p><p>${stats?.apps ?? 0} appearances · ${stats?.goals ?? 0} goals</p>`,
            ) +
            training +
            panel(
              "Season history",
              s.history
                .map(
                  (h) =>
                    `<details><summary>${seasonName(h.season)} · ${division(h.division)} · ${h.place === 1 ? "🏆 Champions" : h.place === 5 ? "Best of the Rest winners" : "Place " + h.place}</summary><p>${h.points} league points</p>${h.reports.map((r, i) => `<p>Week ${i + 1} · TBFC ${r.score.join(" – ")} ${clubs[opponent({ ...s, round: i, schedule: h.schedule })].name}</p>`).join("")}</details>`,
                )
                .join("") || "Your first season is underway.",
            );
        }
      }
      shell.innerHTML = `<div class="cr-heading"><img src="${burners.crest}" alt=""><div><small>TURF BURNERS FC · CAREER MODE</small><h1 class="${screen === "hub" ? "cr-season-title" : ""}">${screen === "hub" && state ? seasonName(state.season) + " · " + division(state.division) : "Clubhouse"}</h1></div>${
        screen === "hub" && state
          ? `<div class="cr-header-player">${state.player}<span aria-hidden="true" style="background-image:url('${portraits[state.player]}')"></span></div>`
          : ""
      }</div>${content}<div class="cr-help">${hint("Arrows", "LS")} Move　${hint("Enter", "A")} Select　${hint("Esc", "B")} Back ${screen === "hub" ? hint("[ ]", "LB") + " / RB Tabs" : ""}</div>`;
      const target = shell.querySelector<HTMLElement>(
        focus ? `[data-action="${focus}"]` : "button,select",
      );
      target?.focus({ preventScroll: true });
    }
    function advance() {
      if (!c || c.day >= 5) return;
      c.day++;
      if (c.day === 5) {
        clearTimeout(timer);
        timer = 0;
      }
      save();
      draw(c.day === 5 ? "lineup" : timer ? "stop" : "advance");
      const current = shell.querySelector<HTMLElement>(
        ".cr-week [aria-current=date]",
      );
      if (current && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const rollover = current === current.parentElement?.firstElementChild;
        if (rollover)
          current.parentElement?.animate([{ opacity: 0.4 }, { opacity: 1 }], {
            duration: 260,
          });
        if (!rollover)
          current.parentElement?.animate(
            [
              { transform: "translateX(-100%)" },
              { transform: "translateX(0)" },
            ],
            { duration: 260, easing: "ease-out", pseudoElement: "::before" },
          );
      }
    }
    function tick() {
      try {
        advance();
        if (timer) timer = window.setTimeout(tick, 320);
      } catch (e) {
        error(e);
      }
    }
    async function action(a: string) {
      if (a === "back") {
        leave(null);
        return;
      }
      if (a === "stop") {
        clearTimeout(timer);
        timer = 0;
        draw("fast");
        return;
      }
      clearTimeout(timer);
      timer = 0;
      if (a === "delete" && c) {
        const dialog = document.createElement("dialog");
        dialog.className = "cr-keypad";
        dialog.innerHTML = `<h2>Delete career?</h2><p>${c.player} · ${seasonName(c.season)} · ${division(c.division)} · Slot ${slot + 1}</p><p>This permanently deletes this career and its season history.</p>${btn("cancel-delete", "Keep career")} ${btn("confirm-delete", "Delete save")}`;
        shell.append(dialog);
        dialog.showModal();
        dialog.querySelector("button")!.focus();
        dialog.onclose = () => {
          dialog.remove();
          shell.querySelector<HTMLElement>('[data-action="delete"]')?.focus();
        };
        return;
      }
      if (a === "cancel-delete") {
        shell.querySelector("dialog")?.close();
        return;
      }
      if (a === "confirm-delete" && c && shell.querySelector("dialog[open]")) {
        deleteSlot(slot, c);
        history.replaceState({ ...history.state, arcadeCareer: undefined }, "");
        chosen = undefined;
        c = null;
        screen = "slots";
        draw("slot" + slot);
        return;
      }
      if (a === "slots") {
        chosen = undefined;
        screen = "slots";
        c = null;
        draw();
        return;
      }
      if (a.startsWith("slot")) {
        setup = defaults();
        slot = Number(a.slice(4));
        c = loadSlot(slot);
        screen = c ? "hub" : "setup";
        tab = "Central";
        draw();
        return;
      }
      if (a.startsWith("pick-")) {
        const b = shell.querySelector<HTMLButtonElement>(
          `[data-action="${a}"]`,
        )!;
        setup[b.dataset.field as keyof typeof setup] = b.value;
        for (const option of shell.querySelectorAll<HTMLButtonElement>(
          `[data-field="${b.dataset.field}"]`,
        )) {
          option.setAttribute("aria-pressed", String(option === b));
        }
        previewPlayer(setup.player);
        return;
      }
      if (a === "create") {
        const value = (id: keyof typeof setup) => setup[id];
        c = createCareer(
          value("player"),
          value("division") as Career["division"],
          crypto.getRandomValues(new Uint32Array(1))[0],
          roster,
          burnerEligibility,
          clubs.length,
          value("chaos") === "Chaos",
          value("sim") === "Allowed",
        );
        c.speed = Number(value("speed")) as Career["speed"];
        save();
        screen = "hub";
        draw();
        return;
      }
      if (!c) return;
      if (a.startsWith("train-")) {
        chosen = ratingLabels[Number(a.slice(6))];
        draw("upgrade");
        return;
      }
      if (a === "upgrade" && chosen) {
        const i = ratingLabels.indexOf(chosen),
          base = playerRatings[bios[c.player][0]]![i];
        if (spendUpgrade(c, chosen, base)) save();
        chosen = undefined;
        draw("tab3");
        return;
      }
      if (a.startsWith("tab")) {
        chosen = undefined;
        tab = tabs[Number(a.slice(3))];
        draw(a);
        return;
      }
      if (a === "advance") {
        advance();
        return;
      }
      if (a === "fast") {
        timer = window.setTimeout(tick, 200);
        draw("stop");
        return;
      }
      if (a === "next" || a === "promote") {
        nextWeek(c, roster, burnerEligibility, a === "promote");
        save();
        root.scrollTop = 0;
        draw();
        return;
      }
      if (a === "lineup" || a === "simline") {
        const fixture = { home: burners, away: clubs[opponent(c)] },
          sheet = c.week.sheet;
        const eligible = Object.fromEntries(
          [
            ...sheet.starters,
            ...sheet.bench,
            ...c.week.events
              .filter((e) => e.answer === "Yes" || e.answer === "Late")
              .map((e) => e.name),
          ].map((n) => [n, portraits[n]]),
        );
        root.hidden = true;
        settings.difficulty = c.division;
        settings.speed = c.speed;
        Object.assign(settings, c.week.conditions);
        const lineup = await selectLineup(
          eligible,
          fixture,
          undefined,
          settings,
          sheet,
          c.bonds,
          c,
        );
        root.hidden = false;
        main.inert = true;
        if (!lineup) {
          draw(a);
          return;
        }
        c.week.sheet = lineup;
        if (a === "lineup") {
          save();
          leave({ career: c, slot, lineup, fixture });
          return;
        }
        const idx = lineup.starters.indexOf(c.player);
        const base = playerRatings[bios[c.player][0]]!;
        const gains = ratingLabels.map(
          (stat, i) => careerRating(c!, c!.player, stat, base[i]) - base[i],
        );
        const development =
          idx < 0
            ? 0
            : idx === 6
              ? gains[5] / 40
              : gains.slice(0, 5).reduce((a, b) => a + b, 0) / 80;
        const report = simulateMatch(
          c,
          ratings,
          lineupChemistry(burners.name, lineup.shape, lineup.starters, c.bonds)
            .score,
          fixture.away.outfield,
          development,
        );
        finishRound(c, report, ratings);
        save();
        draw();
        animateTable();
      }
    }
    function animateTable() {
      if (
        !c ||
        c.round >= 6 ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const old = table(c, c.round);
      shell.querySelectorAll<HTMLElement>("[data-club]").forEach((r, i) => {
        const dy =
          (old.findIndex((row) => row.club === Number(r.dataset.club)) - i) *
          r.offsetHeight;
        r.animate(
          [
            { transform: "translateY(" + dy + "px)" },
            { transform: "translateY(0)" },
          ],
          { duration: 750, easing: "ease-out" },
        );
      });
    }
    function previewPlayer(name: string) {
      const hero = shell.querySelector<HTMLElement>(".cr-hero");
      if (!hero || hero.dataset.player === name) return;
      hero.dataset.player = name;
      hero.style.backgroundImage = `url('${portraits[name]}')`;
      const panel = hero.closest(".cr-panel")!;
      const [number, position] = bios[name];
      panel.querySelector("h3")!.textContent = name;
      panel.querySelector("small")!.textContent = `#${number} · ${position}`;
      const stats = playerRatings[number]!;
      panel.querySelectorAll(".cr-rating").forEach((row, i) => {
        row.querySelector("b")!.textContent = String(stats[i]);
        row.querySelector("i")!.style.transform = `scaleX(${stats[i] / 100})`;
      });
    }
    shell.addEventListener("focusin", (e) => {
      if (screen !== "setup") return;
      const head = (e.target as Element).closest<HTMLButtonElement>(
        '[data-field="player"]',
      );
      previewPlayer(head?.value ?? setup.player);
    });
    shell.onclick = (e) => {
      const button = (e.target as Element).closest<HTMLElement>(
        "[data-action]",
      );
      if (button) void action(button.dataset.action!).catch(error);
    };
    function back() {
      const dialog = shell.querySelector("dialog");
      if (dialog) dialog.close();
      else void action(screen === "slots" ? "back" : "slots").catch(error);
    }
    function changeTab(step: number) {
      if (screen === "hub" && !root.hidden)
        void action(
          "tab" + ((tabs.indexOf(tab) + step + tabs.length) % tabs.length),
        ).catch(error);
    }
    function move(dir: string) {
      const area = shell.querySelector("dialog") ?? shell,
        from = document.activeElement as HTMLElement;
      const nodes = Array.from(
        area.querySelectorAll<HTMLElement>("button:enabled,summary"),
      ).filter((n) => n.offsetWidth);
      if (!nodes.includes(from)) {
        nodes[0]?.focus();
        return;
      }
      const r = from.getBoundingClientRect(),
        horizontal = dir === "r" || dir === "l",
        sign = dir === "r" || dir === "d" ? 1 : -1;
      const rank = (n: HTMLElement) => {
        const t = n.getBoundingClientRect(),
          dx = (t.left + t.right - r.left - r.right) / 2,
          dy = (t.top + t.bottom - r.top - r.bottom) / 2;
        const forward = sign * (horizontal ? dx : dy),
          side = Math.abs(horizontal ? dy : dx);
        if (
          forward < 2 ||
          (horizontal && side > Math.max(r.height, t.height) * 0.55)
        )
          return Infinity;
        return forward + 3 * side;
      };
      const nearest = nodes
        .map((n) => ({ n, score: rank(n) }))
        .filter((x) => Number.isFinite(x.score))
        .sort((a, b) => a.score - b.score)[0];
      if (nearest) nearest.n.focus();
      else if (!horizontal)
        root.scrollBy({
          top: sign * root.clientHeight * 0.65,
          behavior: "instant",
        });
    }
    shell.onkeydown = (e) => {
      const dirs: Record<string, string> = {
        ArrowUp: "u",
        ArrowDown: "d",
        ArrowLeft: "l",
        ArrowRight: "r",
      };
      if (dirs[e.key]) {
        e.preventDefault();
        move(dirs[e.key]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        back();
      } else if (e.key === "[" || e.key === "]") {
        e.preventDefault();
        changeTab(e.key === "[" ? -1 : 1);
      }
    };
    const buttons = () =>
      [0, 1, 4, 5].map((i) => !!menuPad()?.buttons[i]?.pressed);
    let previous = buttons(),
      dir = "",
      repeatAt = 0;
    function pad(now: number) {
      if (!root.isConnected) return;
      const p = menuPad(),
        d = p ? menuDirection(p) : "",
        pressed = buttons();
      if (!root.hidden && p) {
        if (d && (dir !== d || now >= repeatAt)) {
          move(d);
          repeatAt = now + (dir === d ? 150 : 380);
        }
        if (pressed[0] && !previous[0])
          (document.activeElement as HTMLElement)?.click();
        if (pressed[1] && !previous[1]) back();
        if (pressed[2] && !previous[2]) changeTab(-1);
        if (pressed[3] && !previous[3]) changeTab(1);
        const scroll = p.axes[3] ?? 0;
        if (Math.abs(scroll) > 0.22) root.scrollBy(0, scroll * 12);
      }
      dir = d;
      previous = pressed;
      frame = requestAnimationFrame(pad);
    }
    try {
      if (resume !== undefined) {
        c = loadSlot(slot);
        screen = c ? "hub" : "slots";
      }
      draw();
      if (c && c.reports.length > c.round) animateTable();
    } catch (e) {
      error(e);
    }
    frame = requestAnimationFrame(pad);
  });
}
