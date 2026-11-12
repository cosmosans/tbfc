import moment from "moment";
import type { ClubData, Lineup, Match } from "../../model";
import { isMatchCompleted, record } from "../../model";
import { opponentFor, opponentName, seasonName } from "../../clubView";
import { formationPoints, formationSlots, normalizeLineupRoles } from "./formations";
import PitchImage from "../../img/pitch.png";
import PitchOverlay from "../../img/pitch-overlay.png";
import WhiteLabel from "../../img/lineup-label-white.png";
import BlackLabel from "../../img/lineup-label-black.png";
import PinkLabel from "../../img/lineup-label-gk-pink.png";
import BlueLabel from "../../img/lineup-label-gk-blue.png";
import GreenLabel from "../../img/lineup-label-gk-green.png";
import WhiteKit from "../../img/white-front.png";
import BlackKit from "../../img/black-front.png";
import { goalkeeperPlate } from "../../components/LineupNameplate";

const W = 1080;
const H = 1920;
const ORANGE = "#d05227";
const WHITE = "#f8f8f8";
const MUTED = "#b9b9b9";

async function image(url?: string): Promise<HTMLImageElement | null> {
  if (!url) return null;
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function contain(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, w: number, h: number) {
  if (!img) return;
  const scale = Math.min(w / img.width, h / img.height);
  const iw = img.width * scale;
  const ih = img.height * scale;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

function label(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, maxWidth: number, size: number, color = WHITE, weight = 700, align: CanvasTextAlign = "center") {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.font = `${weight} ${size}px Oxanium, sans-serif`;
  while (ctx.measureText(value).width > maxWidth && size > 15) {
    size -= 1;
    ctx.font = `${weight} ${size}px Oxanium, sans-serif`;
  }
  ctx.fillText(value, x, y);
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export async function createShareLineupImage(data: ClubData, match: Match, savedLineup: Lineup): Promise<Blob> {
  await document.fonts.load("700 32px Oxanium");
  const lineup = normalizeLineupRoles(savedLineup);
  const opponent = opponentFor(data, match);
  const location = data.locations.find(item => item.id === match.locationId);
  const coverPhoto = match.photos?.find(photo => photo.cover && photo.src);
  const [background, tbfcCrest, opponentCrest, tbfcKit, opponentKit, pitchImage, pitchOverlay, whitePlate, blackPlate, pinkPlate, bluePlate, greenPlate] = await Promise.all([
    image(coverPhoto?.src || location?.imageUrl), image("/crests/tbfc.png"), image(opponent?.crestUrl),
    image(match.kit === "White" ? WhiteKit : BlackKit), image(opponent?.kitImageUrl),
    image(PitchImage), image(PitchOverlay), image(WhiteLabel), image(BlackLabel),
    image(PinkLabel), image(BlueLabel), image(GreenLabel),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export is unavailable in this browser.");
  ctx.fillStyle = "#0c1012";
  ctx.fillRect(0, 0, W, H);

  // Match banner: its cover, venue, teams, score, kits, and head-to-head bar.
  ctx.fillStyle = "#192023";
  ctx.fillRect(0, 0, W, 610);
  if (background) cover(ctx, background, 0, 0, W, 610);
  const shade = ctx.createLinearGradient(0, 0, 0, 610);
  shade.addColorStop(0, "#080a0bdc");
  shade.addColorStop(0.55, "#080a0bbf");
  shade.addColorStop(1, "#080a0bf5");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, 610);
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 0, W, 8);
  const seasonAndCompetition = [seasonName(data, match), match.competition].filter(Boolean).join("  •  ").toUpperCase();
  label(ctx, seasonAndCompetition, W / 2, 57, 970, 30, MUTED, 700);
  label(ctx, `${moment(match.date).format("MMMM Do YYYY")}  ${match.kickoff || "TBD"}`, W / 2, 113, 970, 34);
  label(ctx, [match.venue || "Venue TBD", match.pitch ? `Pitch ${match.pitch}` : ""].filter(Boolean).join("  •  "), W / 2, 155, 970, 25, MUTED, 500);
  const awayIsTbfc = match.homeAway === "away";
  const leftName = awayIsTbfc ? "Turf Burners FC" : opponentName(data, match);
  const rightName = awayIsTbfc ? opponentName(data, match) : "Turf Burners FC";
  contain(ctx, awayIsTbfc ? tbfcCrest : opponentCrest, 157, 201, 190, 190);
  contain(ctx, awayIsTbfc ? opponentCrest : tbfcCrest, 733, 201, 190, 190);
  label(ctx, leftName, 252, 421, 340, 31);
  label(ctx, rightName, 828, 421, 340, 31);
  label(ctx, "AWAY", 252, 452, 300, 19, MUTED, 600);
  label(ctx, "HOME", 828, 452, 300, 19, MUTED, 600);
  contain(ctx, awayIsTbfc ? tbfcKit : opponentKit, 219, 472, 66, 70);
  contain(ctx, awayIsTbfc ? opponentKit : tbfcKit, 795, 472, 66, 70);
  const score = isMatchCompleted(match) || match.status === "in_progress"
    ? `${awayIsTbfc ? match.goalsFor : match.goalsAgainst}–${awayIsTbfc ? match.goalsAgainst : match.goalsFor}`
    : "VS";
  label(ctx, score, W / 2, 301, 255, 92, WHITE, 800);
  if (isMatchCompleted(match)) label(ctx, match.resultLabel === "W" ? "WIN" : match.resultLabel === "L" ? "LOSS" : "DRAW", W / 2, 358, 180, 23, match.resultLabel === "W" ? "#70c778" : match.resultLabel === "L" ? "#ff514a" : MUTED);

  const h2h = record(data.matches.filter(item => item.opponentId === match.opponentId && item.opponentId));
  const counts = awayIsTbfc ? [h2h.W, h2h.D, h2h.L] : [h2h.L, h2h.D, h2h.W];
  const total = counts.reduce((sum, count) => sum + count, 0);
  const shares = total ? counts.map(count => count / total) : [1 / 3, 1 / 3, 1 / 3];
  const barX = 118, barY = 565, barW = 844, barH = 27;
  let cursor = barX;
  shares.forEach((share, index) => {
    const width = index === 2 ? barX + barW - cursor : barW * share;
    ctx.fillStyle = index === 1 ? "#aeb0b1" : (awayIsTbfc ? index === 0 : index === 2) ? ORANGE : opponent?.color || "#465260";
    ctx.fillRect(cursor, barY, width, barH);
    if (width > 40) label(ctx, `${counts[index]}${index === 1 ? "D" : (awayIsTbfc ? index === 0 : index === 2) ? "W" : "W"}`, cursor + width / 2, barY + barH / 2, width - 8, 18, index === 1 ? "#111" : WHITE, 700);
    cursor += width;
  });

  // Portrait pitch. The saved formation points stay in their match positions.
  label(ctx, "STARTING VII", 60, 649, 500, 38, WHITE, 800, "left");
  label(ctx, lineup.formation, 1020, 649, 300, 30, MUTED, 700, "right");
  const px = 60, py = 682, pw = 960, ph = 886;
  ctx.fillStyle = "#173021";
  ctx.fillRect(px, py, pw, ph);
  if (pitchImage) { ctx.globalAlpha = 0.56; cover(ctx, pitchImage, px, py, pw, ph); ctx.globalAlpha = 1; }
  if (pitchOverlay) { ctx.globalAlpha = 0.66; cover(ctx, pitchOverlay, px, py, pw, ph); ctx.globalAlpha = 1; }
  ctx.strokeStyle = "#ffffffad";
  ctx.lineWidth = 3;
  ctx.strokeRect(px + 24, py + 24, pw - 48, ph - 48);
  line(ctx, px + 24, py + ph / 2, px + pw - 24, py + ph / 2);
  ctx.beginPath(); ctx.arc(px + pw / 2, py + ph / 2, 106, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeRect(px + pw * .34, py + 24, pw * .32, 88);
  ctx.strokeRect(px + pw * .34, py + ph - 112, pw * .32, 88);
  const slots = formationSlots[lineup.formation];
  const plates = { white: whitePlate, black: blackPlate, pink: pinkPlate, blue: bluePlate, green: greenPlate };
  formationPoints[lineup.formation].forEach(([x, y], index) => {
    const player = data.players.find(item => item.id === lineup.starters[index]);
    const cx = px + pw * x / 100, cy = py + ph * y / 100;
    const role = slots[index];
    label(ctx, role, cx, cy - 41, 220, 22, WHITE, 800);
    const gk = goalkeeperPlate(player?.id, role);
    const plate = gk ? plates[gk] : match.kit === "White" ? plates.white : plates.black;
    if (plate) contain(ctx, plate, cx - 126, cy - 15, 252, 57);
    else { ctx.fillStyle = "#111"; ctx.fillRect(cx - 124, cy - 12, 248, 50); }
    const name = player ? `${player.number} ${player.name.split(" ")[0]}` : "—";
    label(ctx, name.toUpperCase(), cx, cy + 12, 210, 24, gk ? WHITE : match.kit === "White" ? "#ed623e" : "#f47730", 800);
  });

  // All saved substitutes remain visible on a phone-sized image.
  const bench = data.players.filter(player => lineup.bench.includes(player.id) && !lineup.starters.includes(player.id));
  label(ctx, "SUBSTITUTES", 60, 1625, 500, 38, WHITE, 800, "left");
  if (!bench.length) label(ctx, "No substitutes selected", 60, 1687, 800, 26, MUTED, 500, "left");
  const columns = 3;
  const rows = Math.max(1, Math.ceil(bench.length / columns));
  const rowHeight = Math.min(64, 220 / rows);
  bench.forEach((player, index) => {
    const x = 60 + (index % columns) * 324;
    const y = 1667 + Math.floor(index / columns) * rowHeight;
    const role = lineup.benchPositions?.[player.id] || player.preferredPosition || "SUB";
    label(ctx, `${player.number} ${player.name.split(" ")[0]}`.toUpperCase(), x, y, 285, 25, WHITE, 700, "left");
    label(ctx, role, x + 282, y, 40, 18, "#f47730", 700, "right");
  });
  label(ctx, "TURF BURNERS FC", W / 2, 1880, 800, 24, MUTED, 800);
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, H - 8, W, 8);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Could not create the share image.")), "image/png"));
}
