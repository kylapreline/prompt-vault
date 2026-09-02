"use client";

import { useState } from "react";
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
  const [pages, setPages] = useState<Record<string, PromptPage>>({
    All: initialPage,
  });
  const [loadingTheme, setLoadingTheme] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPage = pages[activeTheme];
  const prompts = currentPage?.prompts ?? [];
  const isLoading = loadingTheme === activeTheme;

  async function fetchPage(theme: string, cursor?: string | null) {
    const params = new URLSearchParams();

    if (theme !== "All") params.set("category", theme);
    if (cursor) params.set("cursor", cursor);

    const response = await fetch(`/api/prompts?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Unable to load prompts");
    }

    return (await response.json()) as PromptPage;
  }

  async function selectTheme(theme: string) {
    if (loadingTheme && loadingTheme !== theme) return;

    setActiveTheme(theme);
    setError(null);

    if (pages[theme] || loadingTheme === theme) return;

    setLoadingTheme(theme);

    try {
      const page = await fetchPage(theme);
      setPages((current) => ({ ...current, [theme]: page }));
    } catch (loadError) {
      console.error(loadError);
      setError("โหลด Prompt ไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setLoadingTheme(null);
    }
  }

  async function loadMore() {
    if (!currentPage?.nextCursor || isLoading) return;

    setLoadingTheme(activeTheme);
    setError(null);

    try {
      const nextPage = await fetchPage(activeTheme, currentPage.nextCursor);
      setPages((current) => ({
        ...current,
        [activeTheme]: {
          prompts: [
            ...(current[activeTheme]?.prompts ?? []),
            ...nextPage.prompts,
          ],
          nextCursor: nextPage.nextCursor,
          hasMore: nextPage.hasMore,
        },
      }));
    } catch (loadError) {
      console.error(loadError);
      setError("โหลด Prompt เพิ่มไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setLoadingTheme(null);
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
              onClick={() => selectTheme(theme)}
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
