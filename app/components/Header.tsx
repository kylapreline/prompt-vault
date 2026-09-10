"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import SocialLinks from "./SocialLinks";

type SearchPrompt = {
  id: string;
  title: string;
  category: string | null;
  mainImageUrl: string | null;
};

type SearchResponse = {
  prompts: SearchPrompt[];
  hasMore: boolean;
  nextCursor: string | null;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function closeMobileMenu(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    }
    const desktop = window.matchMedia("(min-width: 641px)");
    function closeOnDesktop() {
      if (desktop.matches) setIsMobileMenuOpen(false);
    }
    window.addEventListener("keydown", closeMobileMenu);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeMobileMenu);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [isMobileMenuOpen]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResponse, setSearchResponse] = useState<SearchResponse & {
    query: string;
    error: string | null;
  }>({ query: "", prompts: [], hasMore: false, nextCursor: null, error: null });
  const [loadMoreState, setLoadMoreState] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });
  const loadMoreRequestRef = useRef<AbortController | null>(null);
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
        hasMore: false,
        nextCursor: null,
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
          hasMore: response.hasMore,
          nextCursor: response.nextCursor,
          error: null,
        });
      })
      .catch((searchError: unknown) => {
        if (!active) return;
        console.error(searchError);
        setSearchResponse({
          query: debouncedQuery,
          prompts: [],
          hasMore: false,
          nextCursor: null,
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

  useEffect(() => {
    return () => {
      loadMoreRequestRef.current?.abort();
      loadMoreRequestRef.current = null;
      setLoadMoreState({ loading: false, error: null });
    };
  }, [searchTerm, isSearchOpen]);

  const isDebouncing = searchTerm.trim() !== debouncedQuery;
  const isSearching =
    Boolean(searchTerm.trim()) &&
    (isDebouncing || searchResponse.query !== debouncedQuery);
  const visiblePrompts =
    !isDebouncing && searchResponse.query === debouncedQuery
      ? searchResponse.prompts
      : [];

  async function loadMore() {
    const { query, nextCursor, hasMore } = searchResponse;
    if (
      loadMoreRequestRef.current || !isSearchOpen || isSearching ||
      !hasMore || !nextCursor || query !== searchTerm.trim()
    ) return;

    const controller = new AbortController();
    loadMoreRequestRef.current = controller;
    setLoadMoreState({ loading: true, error: null });
    const timeout = window.setTimeout(() => {
      if (loadMoreRequestRef.current !== controller) return;
      controller.abort();
      loadMoreRequestRef.current = null;
      setLoadMoreState({
        loading: false,
        error: "โหลดเพิ่มเติมใช้เวลานานเกินไป กรุณาลองอีกครั้ง",
      });
    }, 10_000);

    try {
      const params = new URLSearchParams({ q: query, cursor: nextCursor });
      const response = await fetch(`/api/prompts?${params.toString()}`, {
        signal: controller.signal,
      });
      if (response.status === 504) throw new Error("Search timed out");
      if (!response.ok) throw new Error("Unable to load more prompts");
      const page = (await response.json()) as SearchResponse;
      if (!Array.isArray(page.prompts)) throw new Error("Invalid search response");
      if (loadMoreRequestRef.current !== controller) return;

      setSearchResponse((previous) => {
        if (previous.query !== query || previous.nextCursor !== nextCursor) return previous;
        const seen = new Set(previous.prompts.map((prompt) => prompt.id));
        const additional = page.prompts.filter((prompt) => {
          if (seen.has(prompt.id)) return false;
          seen.add(prompt.id);
          return true;
        });
        return {
          ...previous,
          prompts: [...previous.prompts, ...additional],
          hasMore: page.hasMore,
          nextCursor: page.nextCursor,
        };
      });
      setLoadMoreState({ loading: false, error: null });
    } catch (error) {
      if (loadMoreRequestRef.current !== controller) return;
      setLoadMoreState({
        loading: false,
        error: error instanceof Error && error.message === "Search timed out"
          ? "โหลดเพิ่มเติมใช้เวลานานเกินไป กรุณาลองอีกครั้ง"
          : "โหลดเพิ่มเติมไม่สำเร็จ กรุณาลองอีกครั้ง",
      });
    } finally {
      window.clearTimeout(timeout);
      if (loadMoreRequestRef.current === controller) {
        loadMoreRequestRef.current = null;
      }
    }
  }

  function openSearch() {
    setSearchResponse({ query: "", prompts: [], hasMore: false, nextCursor: null, error: null });
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

        .mobile-nav, .mobile-menu {
          display: none;
        }

        .mobile-menu a, .mobile-menu button {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          min-height: 44px;
          padding: 10px 16px;
          color: #25232A;
          text-decoration: none;
          font-size: 15px;
          text-align: left;
          background: transparent;
          border: 0;
          cursor: pointer;
        }

        .mobile-menu a:hover, .mobile-menu button:hover {
          background: #eee2f2;
        }

        .mobile-menu a:focus-visible, .mobile-menu button:focus-visible,
        .mobile-nav:focus-visible {
          outline: 2px solid #39324a;
          outline-offset: -2px;
        }

        @media (max-width: 640px) {
          .desktop-nav {
            display: none;
          }

          .mobile-nav {
            display: flex;
            margin-left: auto;
            flex-shrink: 0;
          }

          .mobile-menu:not([hidden]) {
            display: block;
          }
        }
      `}</style>

      <header
        style={{
          position: "relative",
          background: "#FCFBFD",
          borderBottom: "1px solid #E7E3EA",
        }}
      >
        <div
          className="header-inner"
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
            onClick={() => setIsMobileMenuOpen(false)}
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

            <SocialLinks variant="header-desktop" />
          </nav>

          {/* Mobile Navigation */}
          <button
            ref={mobileMenuButtonRef}
            type="button"
            className="mobile-nav"
            aria-label={isMobileMenuOpen ? "ปิดเมนูนำทาง" : "เปิดเมนูนำทาง"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            style={{
              width: "44px",
              height: "44px",
              alignItems: "center",
              justifyContent: "center",
              border: 0,
              borderRadius: "8px",
              background: "transparent",
              color: "#25232A",
              cursor: "pointer",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <nav
          id="mobile-navigation"
          className="mobile-menu"
          aria-label="Mobile navigation"
          hidden={!isMobileMenuOpen}
          style={{
            position: "absolute",
            top: "100%",
            left: "20px",
            right: "20px",
            zIndex: 100,
            padding: "8px 0",
            border: "1px solid #E7E3EA",
            borderRadius: "12px",
            background: "#FCFBFD",
            boxShadow: "0 8px 24px rgba(37, 35, 42, 0.12)",
            maxHeight: "calc(100dvh - 130px)",
            overflowY: "auto",
          }}
        >
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>About Me</Link>
          <button type="button" onClick={() => {
            setIsMobileMenuOpen(false);
            openSearch();
          }}>Search</button>
          <hr style={{ margin: "8px 16px", border: 0, borderTop: "1px solid #D8D3DC" }} />
          <SocialLinks
            variant="header-mobile"
            showLabels
            onLinkClick={() => {
              setIsMobileMenuOpen(false);
              mobileMenuButtonRef.current?.focus();
            }}
          />
        </nav>
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
                  {searchResponse.hasMore && searchResponse.nextCursor && (
                    <div style={{ paddingTop: "16px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadMoreState.loading}
                        aria-busy={loadMoreState.loading}
                        style={{
                          padding: "10px 18px",
                          border: "1px solid #D8D3DC",
                          borderRadius: "10px",
                          background: "#EEEAF1",
                          color: "#39324A",
                          cursor: loadMoreState.loading ? "wait" : "pointer",
                          opacity: loadMoreState.loading ? 0.65 : 1,
                        }}
                      >
                        {loadMoreState.loading ? "กำลังโหลดเพิ่มเติม..." : "โหลดเพิ่มเติม"}
                      </button>
                      {loadMoreState.error && (
                        <p role="alert" style={{ color: "#b42318", fontSize: "13px", margin: "8px 0 0" }}>
                          {loadMoreState.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
