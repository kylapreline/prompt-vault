"use client";

import { useState } from "react";
import type { Prompt } from "../lib/notion";
import PromptCard from "./PromptCard";

export default function ThemeTabs({
  prompts,
}: {
  prompts: Prompt[];
}) {
  const [activeTheme, setActiveTheme] = useState("All");

  const themes = Array.from(
    new Set(
      prompts
        .map((prompt) => prompt.category)
        .filter(Boolean)
    )
  ) as string[];

  const filteredPrompts =
    activeTheme === "All"
      ? prompts
      : prompts.filter(
          (prompt) => prompt.category === activeTheme
        );

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
              onClick={() => setActiveTheme(theme)}
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
      {filteredPrompts.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
            />
          ))}
        </div>
      ) : (
        <p
          style={{
            color: "#777",
          }}
        >
          ยังไม่มี Prompt ใน Theme นี้
        </p>
      )}
    </section>
  );
}