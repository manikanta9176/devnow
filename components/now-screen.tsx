"use client";

import { useState, useSyncExternalStore } from "react";
import {
  decodeStatus,
  encodeStatus,
  validateDraft,
  type StatusDraft,
} from "@/lib/status";

const emptyDraft = (): StatusDraft => ({ text: "", link: "" });

export function NowScreen() {
  const payload = useSyncExternalStore(subscribeHash, readHash, () => "");
  const shared = decodeStatus(payload);
  const [draft, setDraft] = useState<StatusDraft>(emptyDraft());
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function publish() {
    const result = validateDraft(draft);
    if (!result.ok) {
      setError(result.error);
      setCopied(false);
      return;
    }

    const encoded = encodeStatus({
      ...result.value,
      updatedAt: new Date().toISOString(),
    });
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    window.location.hash = encoded;
    setError("");

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const updated = shared
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(shared.updatedAt))
    : "";

  return (
    <main className="mx-auto grid min-h-full w-full max-w-2xl gap-10 px-4 py-16">
      <header className="grid gap-3">
        <p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">
          devnow
        </p>
        {shared ? (
          <div className="grid gap-3">
            <h1 className="text-4xl leading-tight tracking-tight">{shared.text}</h1>
            {shared.link ? (
              <a href={shared.link} className="font-mono text-sm text-signal underline">
                {shared.link}
              </a>
            ) : null}
            <p className="font-mono text-sm text-muted">Updated {updated}</p>
          </div>
        ) : (
          <h1 className="text-4xl leading-tight tracking-tight">
            Share what you are on.
          </h1>
        )}
      </header>

      <form
        className="grid gap-4 rounded-lg border border-line bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void publish();
        }}
      >
        <label className="grid gap-2 text-sm text-muted">
          What you are on
          <textarea
            value={draft.text}
            onChange={(event) => setDraft({ ...draft, text: event.target.value })}
            rows={3}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Link
          <input
            value={draft.link}
            onChange={(event) => setDraft({ ...draft, link: event.target.value })}
            placeholder="https://"
            className={fieldClass}
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-signal">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="w-fit rounded-md bg-signal px-3 py-2 text-sm font-medium text-background"
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
      </form>
    </main>
  );
}

const fieldClass =
  "w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-signal";

function subscribeHash(listener: () => void): () => void {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

function readHash(): string {
  return window.location.hash.replace(/^#/, "");
}
