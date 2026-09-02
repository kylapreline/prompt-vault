import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#d9d3df] bg-[#fafafa] text-[#39324a]">
      <div className="mx-auto grid w-full max-w-[1100px] gap-10 px-5 py-10 sm:grid-cols-2 sm:items-end sm:py-12">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p className="text-lg font-semibold tracking-tight">
              Kyla Preline
            </p>
            <p className="text-sm tracking-[0.16em] text-[#8b8396]">
              Explore <span aria-hidden="true">|</span> Create{" "}
              <span aria-hidden="true">|</span> Share
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm"
          >
            <Link className="transition-opacity hover:opacity-60" href="/">
              Home
            </Link>
            <Link
              className="transition-opacity hover:opacity-60"
              href="/about"
            >
              About
            </Link>
          </nav>
        </div>

        <div className="sm:text-right">
          <div className="flex items-center gap-5 sm:justify-end">
            <a
              className="text-[#39324a] transition-opacity hover:opacity-60"
              href="https://www.facebook.com/KylaPreline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kyla Preline on Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V10H8v3h2.3v8h3.2Z" />
              </svg>
            </a>

            <a
              className="text-[#39324a] transition-opacity hover:opacity-60"
              href="https://www.instagram.com/kpreline/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kyla Preline on Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
          </div>

          <p className="mt-6 text-xs text-[#8b8396]">
            Created by{" "}
            <a
              className="text-[#39324a] transition-opacity hover:opacity-60"
              href="https://www.facebook.com/profile.php?id=61591561763415"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kyla Preline
            </a>
          </p>
        </div>
      </div>

      <div className="h-2 bg-[#eee2f2]" aria-hidden="true" />
    </footer>
  );
}
