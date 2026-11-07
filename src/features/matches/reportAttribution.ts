import type { Match } from "../../model";
import importedReports from "../../data/turfbotReports.json";
import { storyToHtml } from "./matchStory";

// Recognize the original imported reports without bundling private chat text.
function fingerprint(text: string) {
  text = text.replace(/\s+/g, " ").trim();
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  }
  return `${text.length}:${(hash >>> 0).toString(16)}`;
}

export function isTurfbotReport(match: Match) {
  if (!match.report.trim()) return false;
  if (match.reportAuthor === "turfbot") return true;
  const originals = (importedReports as Record<string, string[]>)[match.id];
  if (!originals) return false;
  // Match authored paragraphs even after rich-text formatting or removal of a human preface.
  const content = document.createElement("div");
  content.innerHTML = storyToHtml(match.report);
  return Array.from(content.querySelectorAll("p")).some((paragraph) =>
    originals.includes(fingerprint(paragraph.textContent ?? "")),
  );
}
