import Link from "next/link";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer className="border-t border-[#d9d3df] bg-[#fafafa] text-[#39324a]">
      <div className="mx-auto grid w-full max-w-[1100px] gap-10 px-5 py-10 sm:grid-cols-2 sm:items-end sm:py-12">
        <div>
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-baseline sm:gap-x-4 sm:gap-y-2 sm:text-left">
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
            className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm sm:justify-start"
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

        <div className="text-center sm:text-right">
          <div className="flex items-center justify-center gap-5 sm:justify-end">
            <SocialLinks variant="footer" />
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