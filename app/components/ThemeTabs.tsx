"use client";

import { useEffect, useRef, useState } from "react";
import type { Prompt, PromptPage } from "../lib/notion";
import PromptCard from "./PromptCard";

export default function ThemeTabs({
  initialPage,
  themes,
}: {
  initialPage: PromptPage;
  themes: string[];
}) {
  const [activeTheme, setActiveTheme] = useState("All");
  const [page, setPage] = useState(initialPage);
  const [loadedTheme, setLoadedTheme] = useState("All");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentTheme = useRef(activeTheme);

  const currentPage =
    loadedTheme === activeTheme ? page : null;
  const prompts = currentPage?.prompts ?? [];
  const isLoading = loadedTheme !== activeTheme || isLoadingMore;

  async function fetchPage(
    theme: string,
    cursor?: string | null,
    signal?: AbortSignal
  ) {
    const params = new URLSearchParams();

    if (theme !== "All") params.set("category", theme);
    if (cursor) params.set("cursor", cursor);

    const response = await fetch(`/api/prompts?${params.toString()}`, {
      signal,
    });

    if (!response.ok) {
      throw new Error("Unable to load prompts");
    }

    return (await response.json()) as PromptPage;
  }

  useEffect(() => {
    currentTheme.current = activeTheme;
  }, [activeTheme]);

  useEffect(() => {
    if (loadedTheme === activeTheme) return;

    const controller = new AbortController();
    const requestedTheme = activeTheme;

    fetchPage(activeTheme, null, controller.signal)
      .then((nextPage) => {
        if (currentTheme.current !== requestedTheme) return;
        setPage(nextPage);
        setLoadedTheme(requestedTheme);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        console.error(loadError);
        setPage({ prompts: [], nextCursor: null, hasMore: false });
        setLoadedTheme(requestedTheme);
        setError("โหลด Prompt ไม่สำเร็จ กรุณาลองอีกครั้ง");
      });

    return () => controller.abort();
  }, [activeTheme, loadedTheme]);

  async function loadMore() {
    if (!currentPage?.nextCursor || isLoading) return;

    const requestedTheme = activeTheme;
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = await fetchPage(
        activeTheme,
        currentPage.nextCursor
      );

      if (currentTheme.current !== requestedTheme) return;

      setPage((current) => ({
        prompts: [...current.prompts, ...nextPage.prompts],
        nextCursor: nextPage.nextCursor,
        hasMore: nextPage.hasMore,
      }));
    } catch (loadError) {
      if (currentTheme.current !== requestedTheme) return;
      console.error(loadError);
      setError("โหลด Prompt เพิ่มไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      if (currentTheme.current === requestedTheme) {
        setIsLoadingMore(false);
      }
    }
  }

  return (
    <section>
      {/* Tabs */}
      <nav
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "10px",
          marginBottom: "30px",
        }}
      >
        {["All", ...themes].map((theme) => {
          const active = activeTheme === theme;

          return (
            <button
              key={theme}
              type="button"
              onClick={() => {
                setActiveTheme(theme);
                setError(null);
                setIsLoadingMore(false);
              }}
              style={{
                flexShrink: 0,
                padding: "9px 18px",
                borderRadius: "999px",
                border: "1px solid #ddd",
                background: active ? "#111" : "#fff",
                color: active ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {theme}
            </button>
          );
        })}
      </nav>

      {/* Current Theme */}
      <h2
        style={{
          marginBottom: "20px",
          fontSize: "24px",
        }}
      >
        {activeTheme}
      </h2>

      {/* Gallery */}
      {prompts.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {prompts.map((prompt: Prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
            />
          ))}
        </div>
      ) : isLoading ? (
        <p style={{ color: "#777" }}>กำลังโหลด Prompt...</p>
      ) : (
        <p
          style={{
            color: "#777",
          }}
        >
          ยังไม่มี Prompt ใน Theme นี้
        </p>
      )}

      {error && (
        <p role="alert" style={{ color: "#b42318", marginTop: "20px" }}>
          {error}
        </p>
      )}

      {currentPage?.hasMore && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            style={{
              padding: "10px 22px",
              borderRadius: "999px",
              border: "1px solid #ddd",
              background: "#fff",
              color: "#333",
              cursor: isLoading ? "wait" : "pointer",
            }}
          >
            {isLoading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
          </button>
        </div>
      )}
    </section>
  );
}
