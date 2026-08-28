import { getPromptVault } from "./lib/notion";
import ThemeTabs from "./components/ThemeTabs";
import AutoRefresh from "./components/AutoRefresh";
import Hero from "./components/Hero";

export const dynamic = "force-dynamic";

export default async function Home() {
  const prompts = await getPromptVault();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        color: "#111",
      }}
    >
      <AutoRefresh />

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
        <p
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: 1.8,
            color: "#555",
          }}
        >
          รวม Prompt สำหรับสร้างภาพ
          พร้อมจัดหมวดหมู่ตาม Theme
        </p>
      </section>

      {/* Theme Tabs + Gallery */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <ThemeTabs prompts={prompts} />
      </section>
    </main>
  );
}