"use client";

import { useState } from "react";

type Props = {
  text: string;
};

export default function CopyPromptButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: "8px 14px",
        borderRadius: "6px",
        border: "1px solid #444",
        background: "#222",
        color: "#fff",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      {copied ? "✓ Copied" : "Copy Prompt"}
    </button>
  );
}