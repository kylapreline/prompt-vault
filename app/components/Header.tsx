import Image from "next/image";
import Link from "next/link";

const facebookUrl = "https://www.facebook.com/KylaPreline";
const instagramUrl = "https://www.instagram.com/kpreline/";

export default function Header() {
  return (
    <>
      <style>{`
        .desktop-nav {
          display: flex;
        }

        .mobile-nav {
          display: none;
        }

        @media (max-width: 640px) {
          .desktop-nav {
            display: none;
          }

          .mobile-nav {
            display: flex;
          }
        }
      `}</style>

      <header
        style={{
          background: "#FCFBFD",
          borderBottom: "1px solid #E7E3EA",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Image
              src="/Kyla-Preline_logo.png"
              alt="Kyla Preline"
              width={180}
              height={50}
              priority
              style={{
                width: "180px",
                height: "auto",
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="desktop-nav"
            aria-label="Main navigation"
            style={{
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Link
              href="/"
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                color: "#25232A",
                textDecoration: "none",
                fontSize: "15px",
              }}
            >
              Home
            </Link>

            <Link
              href="/about"
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                color: "#25232A",
                textDecoration: "none",
                fontSize: "15px",
              }}
            >
              About Me
            </Link>

            {/* Divider */}
            <span
              aria-hidden="true"
              style={{
                width: "1px",
                height: "22px",
                background: "#D8D3DC",
                margin: "0 6px",
              }}
            />

            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kyla Preline on Facebook"
              style={{
                width: "34px",
                height: "34px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#25232A",
                textDecoration: "none",
                borderRadius: "50%",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.66.34-1 1-1z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kyla Preline on Instagram"
              style={{
                width: "34px",
                height: "34px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#25232A",
                textDecoration: "none",
                borderRadius: "50%",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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
          </nav>

          {/* Mobile Navigation */}
          <nav
            className="mobile-nav"
            aria-label="Mobile navigation"
            style={{
              alignItems: "center",
              gap: "2px",
            }}
          >
            {/* About */}
            <Link
              href="/about"
              style={{
                padding: "8px 10px",
                color: "#25232A",
                textDecoration: "none",
                fontSize: "15px",
              }}
            >
              About
            </Link>

            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kyla Preline on Facebook"
              style={{
                width: "34px",
                height: "34px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#25232A",
                textDecoration: "none",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.66.34-1 1-1z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kyla Preline on Instagram"
              style={{
                width: "34px",
                height: "34px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#25232A",
                textDecoration: "none",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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
          </nav>
        </div>
      </header>
    </>
  );
}