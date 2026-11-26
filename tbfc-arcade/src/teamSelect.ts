import teamLegendTemplate from './templates/street/team-legend.html?raw';
import {renderMarkup} from './templates/renderMarkup'
import teamSelectTemplate from './templates/street/team-select.html?raw'
import teamHalfStarTemplate from './templates/street/team-half-star.html?raw'
import teamRankingTemplate from './templates/street/team-ranking.html?raw'
import teamCardTemplate from './templates/street/team-card.html?raw'
import { audio } from "./matchAudio";
import { padBadge, reveal } from "./screenUI";
import { burners, alternateOpponent, onsiderTrading, barelyUnited, atleticoEspresso, grassAssassins, netSixAndChill, crossbarCowboys, goalDiggers, cleatwoodMac, sweeperCreepers, clubAccent, clubs, type Fixture } from "./opponentSquads";
import { menuPad, menuDirection } from "./menuPad";
import css from "./teamSelect.css?inline";

const kitIcons = import.meta.glob<string>("./art/kit-icons/*.png", { eager:true, query:"?url", import:"default" });
function kitIcon(name: string, secondary: boolean) {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
  return kitIcons[`./art/kit-icons/${slug}${secondary ? (name === burners.name ? "-white" : "-secondary") : ""}.png`];
}

export function selectTeams(
  previous?: Fixture,
  standings?: ReadonlyMap<string, number>,
  _navigation?: {back:string;next:string},
): Promise<Fixture | null> {
  const selectable=[...clubs,alternateOpponent,onsiderTrading,barelyUnited,atleticoEspresso,grassAssassins,netSixAndChill,crossbarCowboys,goalDiggers,cleatwoodMac,sweeperCreepers]
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  const picks = [
    previous?.home ?? clubs[0],
    previous?.away ?? clubs[clubs.length - 1],
  ];
  const orange = "Orange Slices";
  const inter = "Inter Your Mom";
  const crossbar = "Crossbar Cowboys";
  const fleet = "Fleet Feet FC";
  const whiff = "Whiff City FC";
  const stars = "Shooting Stars FC";
  const pandas = "Trash Pandas FC";
  const mac = "Cleatwood Mac";
  const barely = "Barely United";
  const diggers = "Goal Diggers";
  const net = "Net Six & Chill";
  const onsider = "Onsider Trading FC";
  const espresso = "Atlético Espresso";
  const grass = "Grass Assassins";
  const dancers = "Goal Dancers FC";
  const wonders = "One Kick Wonders";
  const secondaryKits = new Set<string>();
  if (previous?.burnersKit === "white") secondaryKits.add(burners.name);
  if (previous?.creepersKit === "secondary") secondaryKits.add(sweeperCreepers.name);
  if (previous?.orangeKit === "secondary") secondaryKits.add(orange);
  if (previous?.interKit === "secondary") secondaryKits.add(inter);
  if (previous?.crossbarKit === "secondary") secondaryKits.add(crossbar);
  if (previous?.fleetKit === "secondary") secondaryKits.add(fleet);
  if (previous?.whiffKit === "secondary") secondaryKits.add(whiff);
  if (previous?.starsKit === "secondary") secondaryKits.add(stars);
  if (previous?.pandasKit === "secondary") secondaryKits.add(pandas);
  if (previous?.macKit === "secondary") secondaryKits.add(mac);
  if (previous?.barelyKit === "secondary") secondaryKits.add(barely);
  if (previous?.diggersKit === "secondary") secondaryKits.add(diggers);
  if (previous?.netKit === "secondary") secondaryKits.add(net);
  if (previous?.onsiderKit === "secondary") secondaryKits.add(onsider);
  if (previous?.espressoKit === "secondary") secondaryKits.add(espresso);
  if (previous?.grassKit === "secondary") secondaryKits.add(grass);
  if (previous?.dancersKit === "secondary") secondaryKits.add(dancers);
  if (previous?.wondersKit === "secondary") secondaryKits.add(wonders);
  const root = document.createElement("section");
  root.id = "team-select";
  root.setAttribute("aria-label", "Select teams");
  const style = document.createElement("style");
  style.textContent = css;
  root.innerHTML = renderMarkup(teamSelectTemplate, {
  legend: renderMarkup(teamLegendTemplate, {
    backHint: padBadge("B"),
    clubHint: padBadge("LS"),
    sideHint: padBadge("LS"),
    kitHint: padBadge("Y"),
    continueHint: padBadge("A"),
  })
});
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
    const canSwap = club === burners || club === sweeperCreepers || club.name === wonders || club.name === dancers || club.name === grass || club.name === espresso || club.name === onsider || club.name === net || club.name === diggers || club.name === barely || club.name === mac || club.name === pandas || club.name === stars || club.name === whiff || club.name === orange || club.name === inter || club.name === crossbar || club.name === fleet;
    const secondary = secondaryKits.has(club.name);
    const label = secondary ? "Secondary" : "Primary";
    const rank = standings?.get(club.name);
    card.style.setProperty("--club", clubAccent(club));
    card.innerHTML = renderMarkup(teamCardTemplate, {
  role: role,
  role_2: role,
  club_crest: club.crest,
  role_4: role,
  club_name: club.name,
  club_stars: club.stars,
  slot07: "★".repeat(Math.floor(club.stars)),
  slot08: club.stars % 1 ? teamHalfStarTemplate.slice(0, -1) : "",
  slot09: "☆".repeat(5 - Math.ceil(club.stars)),
  club_name_10: club.name,
  label: label,
  slot12: canSwap ? ", swap kit" : ", locked",
  slot13: canSwap ? "" : "disabled",
  slot14: kitIcon(club.name, secondary),
  label_15: label,
  slot16: rank == null ? "" : renderMarkup(teamRankingTemplate, {
  rank: rank
})
});
  }
  function focusSide(i: number) {
    side = i;
    cards.forEach((c, j) => (c.dataset.active = String(j === side)));
    cards[i].querySelector("button")!.focus({ preventScroll: true });
  }
  function swapKit(i: number) {
    const club = picks[i];
    if (club !== burners && club !== sweeperCreepers && club.name !== wonders && club.name !== dancers && club.name !== grass && club.name !== espresso && club.name !== onsider && club.name !== net && club.name !== diggers && club.name !== barely && club.name !== mac && club.name !== pandas && club.name !== stars && club.name !== whiff && club.name !== orange && club.name !== inter && club.name !== crossbar && club.name !== fleet) return;
    if (secondaryKits.has(club.name)) secondaryKits.delete(club.name);
    else secondaryKits.add(club.name);
    audio.menu("nav");
    paint(i);
    focusSide(i);
  }
  function cycle(i: number, step: number) {
    let index = selectable.indexOf(picks[i]);
    do {
      index = (index + step + selectable.length) % selectable.length;
    } while (selectable[index] === picks[1 - i]);
    audio.menu("nav");
    picks[i] = selectable[index];
    paint(i);
    focusSide(i);
  }
  cards.forEach((card, i) => {
    paint(i);
    card.onclick = (e) => {
      const btn = (e.target as HTMLElement).closest("button");
      if (btn?.hasAttribute("data-kit")) swapKit(i);
      else if (btn) cycle(i, Number(btn.dataset.step));
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
              orangeKit: picks.some(club => club.name === orange) && secondaryKits.has(orange) ? "secondary" : "primary",
              interKit: picks.some(club => club.name === inter) && secondaryKits.has(inter) ? "secondary" : "primary",
              crossbarKit: picks.some(club => club.name === crossbar) && secondaryKits.has(crossbar) ? "secondary" : "primary",
              fleetKit: picks.some(club => club.name === fleet) && secondaryKits.has(fleet) ? "secondary" : "primary",
              whiffKit: picks.some(club => club.name === whiff) && secondaryKits.has(whiff) ? "secondary" : "primary",
              starsKit: picks.some(club => club.name === stars) && secondaryKits.has(stars) ? "secondary" : "primary",
              pandasKit: picks.some(club => club.name === pandas) && secondaryKits.has(pandas) ? "secondary" : "primary",
              macKit: picks.some(club => club.name === mac) && secondaryKits.has(mac) ? "secondary" : "primary",
              barelyKit: picks.some(club => club.name === barely) && secondaryKits.has(barely) ? "secondary" : "primary",
              diggersKit: picks.some(club => club.name === diggers) && secondaryKits.has(diggers) ? "secondary" : "primary",
              netKit: picks.some(club => club.name === net) && secondaryKits.has(net) ? "secondary" : "primary",
              onsiderKit: picks.some(club => club.name === onsider) && secondaryKits.has(onsider) ? "secondary" : "primary",
              espressoKit: picks.some(club => club.name === espresso) && secondaryKits.has(espresso) ? "secondary" : "primary",
              grassKit: picks.some(club => club.name === grass) && secondaryKits.has(grass) ? "secondary" : "primary",
              dancersKit: picks.some(club => club.name === dancers) && secondaryKits.has(dancers) ? "secondary" : "primary",
              wondersKit: picks.some(club => club.name === wonders) && secondaryKits.has(wonders) ? "secondary" : "primary",
              creepersKit: picks.includes(sweeperCreepers) && secondaryKits.has(sweeperCreepers.name) ? "secondary" : "primary",
              burnersKit: picks.includes(burners) && secondaryKits.has(burners.name) ? "white" : "black",
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
        if (!e.repeat) swapKit(side);
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
      if (swap && !swapHeld) swapKit(side);
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
