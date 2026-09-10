"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const facebookUrl = "https://www.facebook.com/KylaPreline";
const instagramUrl = "https://www.instagram.com/kpreline/";

type SearchPrompt = {
  id: string;
  title: string;
  category: string | null;
  mainImageUrl: string | null;
};

type SearchResponse = {
  prompts: SearchPrompt[];
};

function SearchIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResponse, setSearchResponse] = useState<{
    query: string;
    prompts: SearchPrompt[];
    error: string | null;
  }>({ query: "", prompts: [], error: null });
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchInputRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsSearchOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen || !debouncedQuery) return;

    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => {
      if (!active) return;
      active = false;
      controller.abort();
      setSearchResponse({
        query: debouncedQuery,
        prompts: [],
        error: "การค้นหาใช้เวลานานเกินไป กรุณาลองอีกครั้ง",
      });
    }, 10_000);
    const params = new URLSearchParams({ q: debouncedQuery });

    fetch(`/api/prompts?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 504) throw new Error("Search timed out");
        if (!response.ok) throw new Error("Unable to search prompts");
        return (await response.json()) as SearchResponse;
      })
      .then((response) => {
        if (!active) return;
        if (!Array.isArray(response.prompts)) throw new Error("Invalid search response");
        setSearchResponse({
          query: debouncedQuery,
          prompts: response.prompts,
          error: null,
        });
      })
      .catch((searchError: unknown) => {
        if (!active) return;
        console.error(searchError);
        setSearchResponse({
          query: debouncedQuery,
          prompts: [],
          error: searchError instanceof Error && searchError.message === "Search timed out"
            ? "การค้นหาใช้เวลานานเกินไป กรุณาลองอีกครั้ง"
            : "ค้นหา Prompt ไม่สำเร็จ กรุณาลองอีกครั้ง",
        });
      })
      .finally(() => {
        active = false;
        window.clearTimeout(timeout);
      });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [debouncedQuery, isSearchOpen]);

  const isDebouncing = searchTerm.trim() !== debouncedQuery;
  const isSearching =
    Boolean(searchTerm.trim()) &&
    (isDebouncing || searchResponse.query !== debouncedQuery);
  const visiblePrompts =
    !isDebouncing && searchResponse.query === debouncedQuery
      ? searchResponse.prompts
      : [];

  function openSearch() {
    setIsSearchOpen(true);
  }

  function closeSearch() {
    setIsSearchOpen(false);
  }

  const searchButton = (mobile = false) => (
    <button
      type="button"
      onClick={openSearch}
      aria-label="ค้นหา Prompt"
      style={{
        width: "34px",
        height: "34px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: 0,
        background: "transparent",
        color: "#25232A",
        cursor: "pointer",
        borderRadius: mobile ? 0 : "50%",
        padding: 0,
      }}
    >
      <SearchIcon />
    </button>
  );

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

            {searchButton()}

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

            {searchButton(true)}

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

      {isSearchOpen && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "clamp(20px, 8vh, 72px) 16px 20px",
            background: "rgba(37, 35, 42, 0.58)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="header-search-title"
            style={{
              width: "min(620px, 100%)",
              maxHeight: "min(720px, calc(100vh - 40px))",
              overflow: "hidden",
              borderRadius: "18px",
              background: "#FCFBFD",
              boxShadow: "0 24px 80px rgba(37, 35, 42, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "18px 20px 12px",
              }}
            >
              <h2 id="header-search-title" style={{ margin: 0, fontSize: "20px" }}>
                ค้นหา Prompt
              </h2>
              <button
                type="button"
                onClick={closeSearch}
                aria-label="ปิดหน้าต่างค้นหา"
                style={{
                  width: "34px",
                  height: "34px",
                  border: 0,
                  borderRadius: "50%",
                  background: "#EEEAF1",
                  color: "#25232A",
                  cursor: "pointer",
                  fontSize: "22px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", padding: "0 20px 16px" }}>
              <input
                ref={searchInputRef}
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ค้นหาจากชื่อ Intro หรือ tags..."
                aria-label="คำค้นหา Prompt"
                style={{
                  width: "100%",
                  minWidth: 0,
                  padding: "11px 14px",
                  border: "1px solid #D8D3DC",
                  borderRadius: "10px",
                  background: "#fff",
                  color: "#25232A",
                  fontSize: "15px",
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="ล้างคำค้นหา"
                  style={{
                    flexShrink: 0,
                    padding: "0 15px",
                    border: "1px solid #D8D3DC",
                    borderRadius: "10px",
                    background: "#fff",
                    color: "#25232A",
                    cursor: "pointer",
                  }}
                >
                  ล้าง
                </button>
              )}
            </div>

            <div
              aria-live="polite"
              style={{
                maxHeight: "min(540px, calc(100vh - 190px))",
                overflowY: "auto",
                borderTop: "1px solid #E7E3EA",
                padding: "10px 20px 20px",
              }}
            >
              {!searchTerm.trim() ? (
                <p style={{ color: "#777", margin: "18px 0" }}>
                  พิมพ์คำค้นหาเพื่อค้นจาก Prompt ทั้งหมด
                </p>
              ) : isSearching ? (
                <p style={{ color: "#777", margin: "18px 0" }}>กำลังค้นหา...</p>
              ) : searchResponse.error && searchResponse.query === debouncedQuery ? (
                <p role="alert" style={{ color: "#b42318", margin: "18px 0" }}>
                  {searchResponse.error}
                </p>
              ) : visiblePrompts.length === 0 ? (
                <p style={{ color: "#777", margin: "18px 0" }}>
                  ไม่พบ Prompt สำหรับ “{debouncedQuery}”
                </p>
              ) : (
                <div>
                  {visiblePrompts.map((prompt) => (
                    <Link
                      key={prompt.id}
                      href={`/prompt/${prompt.id}`}
                      onClick={closeSearch}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "10px 0",
                        borderBottom: "1px solid #EEEAF1",
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "56px",
                          height: "68px",
                          flexShrink: 0,
                          overflow: "hidden",
                          borderRadius: "9px",
                          background: "#EEE2F2",
                        }}
                      >
                        {prompt.mainImageUrl && (
                          <Image
                            src={prompt.mainImageUrl}
                            alt=""
                            fill
                            sizes="56px"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3
                          style={{
                            margin: 0,
                            color: "#39324A",
                            fontSize: "15px",
                            lineHeight: 1.5,
                          }}
                        >
                          {prompt.title}
                        </h3>
                        {prompt.category && (
                          <p
                            style={{
                              margin: "4px 0 0",
                              color: "#8B8396",
                              fontSize: "12px",
                            }}
                          >
                            {prompt.category}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
