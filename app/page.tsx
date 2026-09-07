import {
  getPromptThemes,
  getPromptVaultPage,
} from "./lib/notion";
import type { PromptPage } from "./lib/notion";
import ThemeTabs from "./components/ThemeTabs";
import Hero from "./components/Hero";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialPage: PromptPage = {
    prompts: [],
    nextCursor: null,
    hasMore: false,
  };
  let themes: string[] = [];

  const [promptResult, themeResult] = await Promise.allSettled([
    getPromptVaultPage(),
    getPromptThemes(),
  ]);

  if (promptResult.status === "fulfilled") {
    initialPage = promptResult.value;
  } else {
    console.error("Failed to load prompt gallery:", promptResult.reason);
  }

  if (themeResult.status === "fulfilled") {
    themes = themeResult.value;
  } else {
    console.error("Failed to load prompt themes:", themeResult.reason);
  }

  if (themes.length === 0) {
    themes = Array.from(
      new Set(
        initialPage.prompts.flatMap((prompt) =>
          prompt.category ? [prompt.category] : []
        )
      )
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        color: "#111",
      }}
    >


      {/* Hero */}
      <Hero />

      {/* Intro */}
<section
  style={{
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 20px 20px",
    textAlign: "center",
  }}
>
  <div
    style={{
      maxWidth: "700px",
      margin: "0 auto",
      lineHeight: 1.8,
      color: "#555",
    }}
  >
    {/* Thai */}
    <p style={{ margin: 0 }}>
      รวม Prompt สำหรับสร้างภาพของน้องเคียล่า
      <br />
      ถ่ายทอดไอเดีย ลุค และเรื่องราวผ่าน Gemini และ ChatGPT
      <br />
      เลือกดู Prompt ที่สนใจได้จาก Theme ด้านล่างเลยจ้า
    </p>

    {/* English */}
    <p
      style={{
        margin: "16px 0 0",
      }}
    >
      Kyla’s Prompt Collection for image creation
      <br />
      Exploring ideas, looks, and stories with Gemini and ChatGPT
      <br />
      Browse the Themes below and find a prompt that inspires you.
    </p>
  </div>
</section>

      {/* Theme Tabs + Gallery */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <ThemeTabs initialPage={initialPage} themes={themes} />
      </section>
    </main>
  );
}
