export type DocLineKind =
  | "name"
  | "meta"
  | "summary"
  | "heading"
  | "plain"
  | "kept"
  | "rephrased"
  | "keyed";

export interface DocLine {
  text: string;
  kind: DocLineKind;
  indent?: boolean;
  terms?: string[];
}

export interface TrimmedLine {
  text: string;
}

const STOP = new Set([
  "about", "after", "again", "also", "and", "are", "been", "being", "but",
  "best", "both", "can", "come", "does", "each", "even", "ever", "from",
  "good", "have", "into", "just", "like", "more", "most", "much", "must",
  "need", "new", "now", "over", "real", "same", "such", "team", "than",
  "that", "their", "them", "then", "there", "these", "they", "this",
  "through", "under", "using", "want", "were", "what", "when", "where",
  "which", "will", "with", "work", "your", "you",
]);

export function extractKeywords(jdText: string): string[] {
  const words = jdText.toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? [];
  const freq = new Map<string, number>();
  for (const w of words) {
    if (STOP.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.keys()]
    .filter((w) => w.length >= 5)
    .sort((a, b) => (freq.get(b) ?? 0) - (freq.get(a) ?? 0))
    .slice(0, 40);
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isBullet(s: string): boolean {
  return /^[\s]*([-•*]|\d{1,2}[.)])\s+/.test(s.trim());
}

/** Best-effort flatten of a parsed resume (any shape) into lines. */
export function flattenResume(obj: unknown, out: string[] = []): string[] {
  if (obj == null) return out;
  if (typeof obj === "string") {
    for (const line of obj.split(/\r?\n/)) {
      const t = line.trim();
      if (t) out.push(t);
    }
    return out;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) flattenResume(item, out);
    return out;
  }
  if (typeof obj === "object") {
    for (const v of Object.values(obj as Record<string, unknown>)) {
      flattenResume(v, out);
    }
    return out;
  }
  return out;
}

/** Turn the tailor response into a plain text to render. */
export function extractTailoredText(result: unknown): string {
  if (result == null) return "";
  if (typeof result === "string") return result;

  if (Array.isArray(result)) {
    return result
      .map((x) => extractTailoredText(x))
      .filter(Boolean)
      .join("\n");
  }

  const j = result as Record<string, unknown>;
  const preferred = [
    "tailored_resume", "tailored", "resume_text", "content", "text",
    "markdown", "result", "output",
  ];
  for (const k of preferred) {
    const v = j[k];
    if (typeof v === "string" && v.trim().length > 20) return v;
  }

  const chunks: string[] = [];
  for (const [k, v] of Object.entries(j)) {
    if (["ok", "status", "usage", "message", "detail"].includes(k)) continue;
    if (typeof v === "string" || typeof v === "number") {
      if (String(v).trim().length > 3) chunks.push(String(v));
    } else if (v != null) {
      const sub = extractTailoredText(v);
      if (sub) chunks.push(sub);
    }
  }
  return chunks.join("\n").trim();
}

/** Parse tailored text into document lines with annotation kinds. */
export function buildDocument(
  tailoredText: string,
  originalResume: unknown,
  jdText: string
): { lines: DocLine[]; trimmed: TrimmedLine[]; keywords: string[]; keyed: number; rephrased: number } {
  const keywords = extractKeywords(jdText);
  const original = flattenResume(originalResume);
  const origNorm = new Set(original.map(norm));
  const origBullets = original.filter(isBullet).map(norm);

  const rawLines = tailoredText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const lines: DocLine[] = [];
  const usedNorms = new Set<string>();

  let prevKind: DocLineKind | null = null;

  for (const raw of rawLines) {
    const n = norm(raw);
    const isBulletLine = isBullet(raw);
    const text = isBulletLine ? raw.replace(/^[\s]*([-•*]|\d{1,2}[.)])\s+/, "") : raw;

    let kind: DocLineKind;
    let terms: string[] | undefined;

    if (!isBulletLine) {
      if (/^[A-Z][A-Z0-9 /&+-]{2,}$/.test(text) && text.length <= 48 && prevKind !== "name") {
        kind = "heading";
      } else if (prevKind === "name" || (text.length < 140 && prevKind === null)) {
        kind = prevKind === null && text.length > 0 ? "name" : text.length <= 70 ? "name" : "summary";
      } else {
        kind = "summary";
      }
    } else {
      usedNorms.add(n);
      const hit = keywords.filter((k) => text.toLowerCase().includes(k));
      if (hit.length > 0) {
        kind = "keyed";
        terms = hit.slice(0, 3);
      } else if (origNorm.has(n)) {
        kind = "kept";
      } else {
        kind = "rephrased";
      }
    }

    lines.push({ text, kind, indent: isBulletLine, terms });
    prevKind = kind === "name" ? "name" : kind === "heading" ? "heading" : kind;
  }

  const trimmed = origBullets
    .filter((n) => !usedNorms.has(n) && !rawLines.some((l) => norm(l) === n))
    .map((n) => ({ text: n }));

  const keyed = lines.filter((l) => l.kind === "keyed").length;
  const rephrased = lines.filter((l) => l.kind === "rephrased").length;

  return { lines, trimmed, keywords, keyed, rephrased };
}