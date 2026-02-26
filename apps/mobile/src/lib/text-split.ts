/**
 * Split a greeting string into uppercase words for multi-slot text display.
 * Last word becomes its own slot, everything else becomes the first slot.
 *
 * "Eid Mubarak" → ["EID", "MUBARAK"]
 * "Eid ul-Fitr Mubarak" → ["EID UL-FITR", "MUBARAK"]
 * "Eid" → ["EID"]
 * "" → [""]
 */
export function splitGreeting(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [""];

  const words = trimmed.split(/\s+/);
  if (words.length === 1) return [words[0].toUpperCase()];

  const last = words[words.length - 1].toUpperCase();
  const rest = words
    .slice(0, -1)
    .map((w) => w.toUpperCase())
    .join(" ");

  return [rest, last];
}
