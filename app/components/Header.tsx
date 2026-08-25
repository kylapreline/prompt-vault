import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
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
          gap: "30px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
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

        {/* Navigation */}
        <nav
          style={{
            display: "flex",
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
        </nav>
      </div>
    </header>
  );
}