"use client";

import Link from "next/link";

export default function NowError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="mx-auto grid max-w-lg gap-4 px-6 py-16">
      <p className="text-lg">This page hit a problem</p>
      <div className="flex gap-4 text-sm">
        <Link href="/" className="text-signal underline">
          Back to devnow
        </Link>
        <button type="button" onClick={() => retry()} className="text-muted">
          Try again
        </button>
      </div>
    </div>
  );
}
