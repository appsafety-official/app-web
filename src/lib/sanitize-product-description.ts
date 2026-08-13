import sanitizeHtml from "sanitize-html";

const DESCRIPTION_ALLOWED_TAGS = [
  "p",
  "strong",
  "em",
  "u",
  "s",
  "strike",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "code",
  "pre",
  "hr",
  "br",
  "span",
];

const DESCRIPTION_ALLOWED_ATTRIBUTES = {
  a: ["href", "title", "target", "rel"],
  span: ["class"],
  code: ["class"],
};

export function sanitizeProductDescription(html: string | null | undefined) {
  if (!html) return "";

  if (!html.includes("<")) {
    return `<p>${escapeHtml(html)}</p>`;
  }

  return sanitizeHtml(html, {
    allowedTags: DESCRIPTION_ALLOWED_TAGS,
    allowedAttributes: DESCRIPTION_ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}