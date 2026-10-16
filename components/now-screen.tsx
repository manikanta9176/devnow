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
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pt-6 pb-40 md:px-10">
      <header className="flex items-center justify-between">
        <p className="text-sm font-medium tracking-tight">devnow</p>
        <p className="flex items-center gap-2 text-sm text-muted">
          <span className="size-2 rounded-full bg-accent" aria-hidden />
          {shared ? `Updated ${updated}` : "Nothing shared yet"}
        </p>
      </header>

      <section className="flex flex-1 flex-col justify-end py-10">
        {shared?.link ? (
          <a
            href={shared.link}
            className="mb-6 w-fit rounded-full bg-white/80 px-3 py-1 text-sm text-accent shadow-sm"
          >
            {shared.link.replace(/^https?:\/\//, "")}
          </a>
        ) : null}
        <h1
          className={`max-w-5xl text-[clamp(3.25rem,8vw,7.25rem)] leading-[0.92] font-medium tracking-[-0.055em] ${
            shared ? "text-foreground" : "text-[#c4beb4]"
          }`}
        >
          {shared?.text ?? "What are you on?"}
        </h1>
      </section>

      <form
        className="fixed inset-x-0 bottom-4 z-10 mx-auto grid w-[min(100%-1.5rem,40rem)] gap-3 rounded-[28px] bg-card p-3 shadow-[0_24px_60px_rgba(22,21,19,0.12)] ring-1 ring-black/5 md:bottom-8"
        onSubmit={(event) => {
          event.preventDefault();
          void publish();
        }}
      >
        <label className="sr-only" htmlFor="status">
          What you are on
        </label>
        <input
          id="status"
          value={draft.text}
          onChange={(event) => {
            setCopied(false);
            setDraft({ ...draft, text: event.target.value });
          }}
          placeholder="What are you on?"
          className="w-full bg-transparent px-3 pt-2 text-lg outline-none placeholder:text-[#b7b1a8]"
        />
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="link">
            Link
          </label>
          <input
            id="link"
            value={draft.link}
            onChange={(event) => {
              setCopied(false);
              setDraft({ ...draft, link: event.target.value });
            }}
            placeholder="Link, optional"
            className="min-w-0 flex-1 rounded-full bg-[#f6f3ee] px-4 py-3 text-sm outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-card"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        {error ? (
          <p role="alert" className="px-3 pb-1 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}

function subscribeHash(listener: () => void): () => void {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

function readHash(): string {
  return window.location.hash.replace(/^#/, "");
}
