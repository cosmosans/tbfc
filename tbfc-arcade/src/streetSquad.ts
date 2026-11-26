import { playerRatings } from "./playerRatings.ts";
import { barelyRatings } from "./barelyRatings.ts";
import { netRatings } from "./netRatings.ts";
import { grassRatings } from "./grassRatings.ts";
import { crossbarRatings } from "./crossbarRatings.ts";
import { goalDiggerRatings } from "./goalDiggerRatings.ts";
import { bios } from "./lineupRoles.ts";
import { pairRating } from "./lineupChemistry.ts";
import { streetFormations, type StreetShape } from "./matchRules.ts";
import type { Club } from "./opponentSquads.ts";
export function squadRatings(
  club: string,
  name: string,
): readonly number[] | undefined {
  if (club === "Turf Burners FC") return playerRatings[bios[name]?.[0]];
  const tables: Record<string, Record<string, readonly number[]>> = {
    "Barely United": barelyRatings,
    "Net Six & Chill": netRatings,
    "Grass Assassins": grassRatings,
    "Crossbar Cowboys": crossbarRatings,
    "Goal Diggers": goalDiggerRatings,
  };
  return tables[club]?.[name];
}
export const category = (role: string) =>
  /B$|Defender/.test(role) ? "DEF" : /M$|Midfielder/.test(role) ? "MID" : "ATT";
export function naturalCategory(club: Club, name: string) {
  if (club.name === "Turf Burners FC")
    return bios[name]?.[1] === "Goalkeeper"
      ? "GK"
      : category(bios[name]?.[1] ?? "Forward");
  if (name === club.keeper) return "GK";
  const i = club.outfield.indexOf(name);
  return i < 0 ? null : i < 3 ? "ATT" : i === 4 ? "MID" : "DEF";
}
export function suitability(club: Club, name: string, role: string) {
  const c = category(role),
    natural = naturalCategory(club, name),
    ratings = squadRatings(club.name, name);
  if (natural === c) return 100;
  if (ratings) return ratings[c === "DEF" ? 3 : c === "MID" ? 1 : 2];
  return natural ? 55 : 65;
}
// Exhaustive assignment is tiny (at most 5!) and keeps every selected player.
export function assignStreet(club: Club, names: string[], shape: StreetShape) {
  const roles = streetFormations[shape].rows.flat();
  let best = -Infinity,
    result = names.slice();
  function visit(left: string[], chosen: string[], score: number) {
    if (!left.length) {
      if (score > best) {
        best = score;
        result = chosen;
      }
      return;
    }
    left.forEach((n, i) =>
      visit(
        left.filter((_, j) => i !== j),
        [...chosen, n],
        score + suitability(club, n, roles[chosen.length]),
      ),
    );
  }
  visit(names, [], 0);
  return result;
}
export function autoStreet(club: Club, names: string[], shape: StreetShape) {
  const picked: string[] = [];
  // Fill scarce defensive/midfield roles first, then favour complimentary chemistry.
  const roles = [...streetFormations[shape].rows.flat()].sort(
    (a, b) =>
      ({ DEF: 0, MID: 1, ATT: 2 })[category(a)] -
      { DEF: 0, MID: 1, ATT: 2 }[category(b)],
  );
  for (const role of roles) {
    const ranked = names
      .filter((n) => !picked.includes(n))
      .sort((a, b) => {
        const score = (n: string) =>
          suitability(club, n, role) +
          (squadRatings(club.name, n)
            ?.slice(0, 5)
            .reduce((a, b) => a + b, 0) ?? 0) /
            50 +
          (picked.length
            ? (picked.reduce((s, p) => s + pairRating(club.name, n, p), 0) /
                picked.length) *
              0.12
            : 0);
        return score(b) - score(a);
      });
    picked.push(ranked[0]);
  }
  return assignStreet(club, picked, shape);
}
