export type StatusDraft = {
  text: string;
  link: string;
};

export type Status = StatusDraft & {
  updatedAt: string;
};

export type StatusResult =
  | { ok: true; value: StatusDraft }
  | { ok: false; error: string };

export function validateDraft(draft: StatusDraft): StatusResult {
  const text = draft.text.trim();
  const link = draft.link.trim();
  if (text === "") return { ok: false, error: "Write what you're on" };
  if (link !== "" && !isHttpUrl(link)) {
    return { ok: false, error: "Enter an http or https link" };
  }
  return { ok: true, value: { text, link } };
}

export function encodeStatus(status: Status): string {
  const bytes = new TextEncoder().encode(JSON.stringify(status));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

export function decodeStatus(payload: string): Status | null {
  try {
    const padded =
      payload.replaceAll("-", "+").replaceAll("_", "/") +
      "=".repeat((4 - (payload.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!isStatus(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isStatus(value: unknown): value is Status {
  if (!value || typeof value !== "object") return false;
  const status = value as Partial<Status>;
  return (
    typeof status.text === "string" &&
    status.text.trim() !== "" &&
    typeof status.link === "string" &&
    typeof status.updatedAt === "string"
  );
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname !== ""
    );
  } catch {
    return false;
  }
}
