"use client";

import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 h-[var(--nav-height)] bg-[var(--color-bg)]"
    >
      <div className="mx-auto grid h-full w-full max-w-[var(--max-width)] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <div className="flex min-w-0 justify-start">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
            aria-label="Kanmani Dental Clinic home"
          >
            <img
              src="/logo.png"
              alt=""
              width={150}
              height={200}
            />
          </Link>
        </div>

        <div className="col-start-2" />

        <div className="min-w-0" aria-hidden="true" />
      </div>
    </nav>
  );
}
