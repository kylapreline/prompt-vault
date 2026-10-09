"use client";

import { useState } from "react";

export default function CopyPromptButton({
  text,
}: {
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy prompt:",
        error
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        border: "1px solid #ddd",
        background: "#111",
        color: "#fff",
        borderRadius: "8px",
        padding: "9px 14px",
        fontSize: "13px",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {copied
        ? "Copied!"
        : "Copy Prompt"}
    </button>
  );
}