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

        <ul
          role="list"
          className="col-start-2 flex list-none gap-8 m-0 justify-self-center p-0"
        >
          {(["Home", "Services", "Contact"] as const).map((link) => (
            <li key={link}>
              <Link
                href={link === "Home" ? "/" : `#${link.toLowerCase()}`}
                aria-label={`Go to ${link}`}
                className="text-[0.9375rem] text-[var(--color-text-secondary)] no-underline transition-colors duration-[var(--transition-fast)] hover:text-[var(--color-text-primary)]"
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>

        <div className="min-w-0" aria-hidden="true" />
      </div>
    </nav>
  );
}
