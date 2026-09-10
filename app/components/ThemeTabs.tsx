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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(initialPage);
  const [loadedQueryKey, setLoadedQueryKey] = useState("All\u0000");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryKey = `${activeTheme}\u0000${debouncedQuery}`;
  const currentQueryKey = useRef(queryKey);

  const isDebouncing = searchTerm.trim() !== debouncedQuery;
  const currentPage =
    !isDebouncing && loadedQueryKey === queryKey ? page : null;
  const prompts = currentPage?.prompts ?? [];
  const isLoading = loadedQueryKey !== queryKey || isLoadingMore;

  async function fetchPage(
    theme: string,
    query: string,
    cursor?: string | null,
    signal?: AbortSignal
  ) {
    const params = new URLSearchParams();

    if (theme !== "All") params.set("category", theme);
    if (query) params.set("q", query);
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
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    currentQueryKey.current = queryKey;
  }, [queryKey]);

  useEffect(() => {
    if (loadedQueryKey === queryKey) return;

    const controller = new AbortController();
    const requestedKey = queryKey;

    fetchPage(activeTheme, debouncedQuery, null, controller.signal)
      .then((nextPage) => {
        if (currentQueryKey.current !== requestedKey) return;
        setPage(nextPage);
        setLoadedQueryKey(requestedKey);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        console.error(loadError);
        setPage({ prompts: [], nextCursor: null, hasMore: false });
        setLoadedQueryKey(requestedKey);
        setError("โหลด Prompt ไม่สำเร็จ กรุณาลองอีกครั้ง");
      });

    return () => controller.abort();
  }, [activeTheme, debouncedQuery, loadedQueryKey, queryKey]);

  async function loadMore() {
    if (!currentPage?.nextCursor || isLoading) return;

    const requestedKey = queryKey;
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = await fetchPage(
        activeTheme,
        debouncedQuery,
        currentPage.nextCursor
      );

      if (currentQueryKey.current !== requestedKey) return;

      setPage((current) => ({
        prompts: [...current.prompts, ...nextPage.prompts],
        nextCursor: nextPage.nextCursor,
        hasMore: nextPage.hasMore,
      }));
    } catch (loadError) {
      if (currentQueryKey.current !== requestedKey) return;
      console.error(loadError);
      setError("โหลด Prompt เพิ่มไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      if (currentQueryKey.current === requestedKey) {
        setIsLoadingMore(false);
      }
    }
  }

  function updateSearch(value: string) {
    setSearchTerm(value);
    setError(null);
    setIsLoadingMore(false);
  }

  return (
    <section>
      <div
        role="search"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => updateSearch(event.target.value)}
          placeholder="ค้นหา Prompt..."
          aria-label="ค้นหา Prompt"
          style={{
            width: "100%",
            padding: "11px 14px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#fff",
            color: "#111",
            fontSize: "15px",
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => updateSearch("")}
            aria-label="ล้างคำค้นหา"
            style={{
              flexShrink: 0,
              padding: "0 16px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              background: "#fff",
              color: "#333",
              cursor: "pointer",
            }}
          >
            ล้าง
          </button>
        )}
      </div>

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
      ) : isLoading || isDebouncing ? (
        <p style={{ color: "#777" }}>กำลังค้นหา Prompt...</p>
      ) : (
        <p
          style={{
            color: "#777",
          }}
        >
          {debouncedQuery
            ? `ไม่พบ Prompt สำหรับ “${debouncedQuery}” ใน Theme นี้`
            : "ยังไม่มี Prompt ใน Theme นี้"}
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
