import type { Prompt } from "../lib/notion";

export default function PromptCard({
  prompt,
}: {
  prompt: Prompt;
}) {
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {prompt.mainImageUrl ? (
        <img
          src={prompt.mainImageUrl}
          alt={prompt.title}
          style={{
            width: "100%",
            aspectRatio: "4 / 5",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "4 / 5",
            background: "#eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
          }}
        >
          No Image
        </div>
      )}

      <div style={{ padding: "14px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "17px",
            lineHeight: 1.4,
          }}
        >
          {prompt.title}
        </h3>

        {prompt.category && (
          <p
            style={{
              marginTop: "8px",
              marginBottom: "6px",
              fontSize: "13px",
              color: "#666",
            }}
          >
            {prompt.category}
          </p>
        )}

        {prompt.tags.length > 0 && (
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#888",
              lineHeight: 1.5,
            }}
          >
            {prompt.tags.join(" · ")}
          </p>
        )}
      </div>
    </article>
  );
}