import DOMPurify from "dompurify";

const richTextPrefix = "<!--tbfc-rich-text-->";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function storyToHtml(report: string) {
  if (report.startsWith(richTextPrefix)) {
    return DOMPurify.sanitize(report.slice(richTextPrefix.length));
  }
  return report
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function saveStoryHtml(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "hr"],
    ALLOWED_ATTR: [],
  });
  return clean.replace(/<[^>]+>/g, "").trim() ? richTextPrefix + clean : "";
}
