import type { Player } from "./model";

export function byPlayerNumber(a: Player, b: Player) {
  const aNumber = a.number.trim();
  const bNumber = b.number.trim();
  if (!aNumber || !bNumber) {
    return Number(!aNumber) - Number(!bNumber) || a.name.localeCompare(b.name);
  }
  return aNumber.localeCompare(bNumber, undefined, { numeric: true }) ||
    a.name.localeCompare(b.name);
}
