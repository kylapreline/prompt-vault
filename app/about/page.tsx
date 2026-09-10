import Image from "next/image";
import SocialLinks from "../components/SocialLinks";

const interests = [
  {
    title: "TECHNOLOGY & AI",
    description: "ชอบตามดูของใหม่ ๆ และลองอะไรที่น่าสนใจ",
  },
  {
    title: "MUSIC",
    description: "เพลงที่ฟังแล้วชอบ หรืออะไรใหม่ ๆ ที่อยากค้นหา",
  },
  {
    title: "ANIME",
    description: "เรื่องที่ดูแล้วสนุก รวมถึงโลกของอนิเมะที่น่าค้นหา",
  },
  {
    title: "JAPAN",
    description: "ชอบเรื่องราว ภาษา วัฒนธรรม และบรรยากาศแบบญี่ปุ่น",
  },
  {
    title: "GAMES",
    description: "เกมที่เล่นเพลิน ๆ และโลกใหม่ ๆ ที่ได้เข้าไปลอง",
  },
  {
    title: "CATS & CUTE THINGS",
    description: "ของน่ารัก ๆ ที่เห็นแล้วอดยิ้มไม่ได้",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-6">
        <div className="relative overflow-hidden">
          <Image
            src="/Kyla-about-me-hero.jpg"
            alt="Kyla Preline"
            width={1600}
            height={900}
            priority
            className="h-auto w-full"
          />

          <div className="absolute inset-0 flex items-start">
            <div className="px-[8%] pt-[9%]">
              <p className="text-4xl font-medium tracking-tight text-[#39324a] sm:text-5xl">
                Kyla Preline
              </p>

              <p className="mt-2 text-sm tracking-wide text-[#39324a] sm:text-base">
                EXPLORE | CREATE | SHARE
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <h2 className="text-3xl font-semibold tracking-tight text-[#39324a] sm:text-4xl">
          HELLO, I’M KYLA
        </h2>

        <div className="mt-8 space-y-5 text-base leading-8 text-[#39324a] sm:text-lg sm:leading-9">
          <p>
            สวัสดีจ้า เคียล่าเองน้า ดีใจที่ได้รู้จักทุกคน
          </p>

          <p>
            เคียล่าเป็นคนที่ชอบค้นหาอะไรใหม่ ๆ อยู่เสมอ ถ้าเจออะไรน่าสนใจก็มักอยากลองด้วยตัวเอง และถ้าเจออะไรที่ชอบ ก็อยากเอามาแบ่งปันให้ทุกคนได้รู้จักไปด้วยกัน
          </p>
        </div>

        {/* Quote */}
        <div className="mt-10 max-w-4xl rounded-3xl bg-[#eee2f2] px-6 py-6 sm:px-8 sm:py-7">
          <p className="text-base leading-7 text-[#39324a] sm:text-lg sm:leading-8">
            “เรื่องสนุก ๆ บางครั้งก็เริ่มต้นจากการลองอะไรใหม่ ๆ เพียงเล็กน้อยนี่แหละ”
          </p>
        </div>

        {/* Character */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm tracking-wide text-[#39324a] sm:text-base">
          <span>CURIOUS</span>
          <span aria-hidden="true">·</span>
          <span>FRIENDLY</span>
          <span aria-hidden="true">·</span>
          <span>PLAYFUL</span>
        </div>
      </section>

      {/* Things Kyla Loves */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-16 sm:px-10 sm:pb-20 lg:px-16">
        <h2 className="text-3xl font-semibold tracking-tight text-[#39324a] sm:text-4xl">
          THINGS KYLA LOVES
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest) => (
            <details
              key={interest.title}
              className="group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-full bg-[#a9f1f4] px-5 py-3 text-sm font-medium text-[#39324a] transition hover:bg-[#9be9ec] sm:text-base">
                <span>{interest.title}</span>

                <span className="ml-4 shrink-0 text-lg leading-none">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>

              <div className="px-5 pt-3 text-sm leading-7 text-[#39324a] sm:text-base">
                {interest.description}
              </div>
            </details>
          ))}
        </div>
      </section>

            {/* Explore | Create | Share */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <h2 className="text-3xl font-semibold tracking-tight text-[#39324a] sm:text-4xl">
          EXPLORE | CREATE | SHARE
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Explore */}
          <div className="border-t border-[#d9d3df] pt-5">
            <p className="text-sm tracking-widest text-[#8b8396]">
              01
            </p>

            <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#39324a]">
              EXPLORE
            </h3>

            <p className="mt-3 text-base leading-8 text-[#39324a]">
              ค้นหาอะไรใหม่ ๆ รอบตัว
              เปิดใจลองสิ่งที่ยังไม่เคยรู้จัก
              และสนุกไปกับการค้นพบเรื่องเล็ก ๆ ที่น่าสนใจ
            </p>
          </div>

          {/* Create */}
          <div className="border-t border-[#d9d3df] pt-5">
            <p className="text-sm tracking-widest text-[#8b8396]">
              02
            </p>

            <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#39324a]">
              CREATE
            </h3>

            <p className="mt-3 text-base leading-8 text-[#39324a]">
              หยิบสิ่งที่สนใจมาลองทำ
              ทดลองไอเดียใหม่ ๆ
              และสร้างอะไรในแบบที่เป็นตัวเอง
            </p>
          </div>

          {/* Share */}
          <div className="border-t border-[#d9d3df] pt-5">
            <p className="text-sm tracking-widest text-[#8b8396]">
              03
            </p>

            <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#39324a]">
              SHARE
            </h3>

            <p className="mt-3 text-base leading-8 text-[#39324a]">
              ถ้าเจออะไรที่ชอบ
              ก็อยากเอามาแบ่งปัน
              ให้ทุกคนได้รู้จักและสนุกไปด้วยกัน
            </p>
          </div>
        </div>
      </section>

            {/* Kyla's Prompt Collection */}
<section className="mx-auto w-full max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
  <div className="rounded-[2rem] bg-[#eee2f2] px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
    <div className="max-w-3xl">
      <p className="text-sm tracking-[0.2em] text-[#8b8396]">
        KYLA'S PROMPT COLLECTION
      </p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#39324a] sm:text-4xl">
        Prompt ที่เคียล่าอยากแบ่งปัน
      </h2>

      <p className="mt-6 text-base leading-8 text-[#39324a] sm:text-lg sm:leading-9">
        รวม Prompt สำหรับสร้างภาพของน้องเคียล่า
        ถ่ายทอดไอเดีย ลุค และเรื่องราวต่าง ๆ
      </p>

      <details className="group mt-6">
        <summary className="flex cursor-pointer list-none items-center text-sm font-medium tracking-wide text-[#39324a]">
          <span className="group-open:hidden">＋ READ MORE</span>
          <span className="hidden group-open:inline">− CLOSE</span>
        </summary>

        <div className="mt-6 space-y-5 text-base leading-8 text-[#39324a] sm:text-lg sm:leading-9">
          {/* Thai */}
          <div>
            <p>
              Prompt Collection นี้เน้นการสร้างภาพด้วย Gemini และ ChatGPT
              โดยแต่ละ Prompt ถ่ายทอดไอเดีย ลุค และเรื่องราวในรูปแบบต่าง ๆ
            </p>

            <p className="mt-4">
              สำหรับงานวิดีโอ จะนำภาพที่สร้างจาก Gemini
              ไปใช้เป็นพื้นฐานในการสร้างต่อด้วย Grok
            </p>

            <p className="mt-4">
              ทุก Prompt ถูกจัดหมวดหมู่ตาม Theme
              เพื่อให้เลือกชมและค้นหาไอเดียที่สนใจได้ง่ายขึ้น
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#d9d3df]" />

          {/* English */}
          <div>
            <p>
              This Prompt Collection focuses on image creation with Gemini
              and ChatGPT, exploring different ideas, looks, and stories
              through each prompt.
            </p>

            <p className="mt-4">
              For video projects, images created with Gemini are used as the
              foundation for further creation with Grok.
            </p>

            <p className="mt-4">
              All prompts are organized by Theme, making it easy to browse
              and discover ideas that interest you.
            </p>
          </div>
        </div>
      </details>

      <a
        href="/"
        className="mt-8 inline-flex items-center rounded-full border border-[#39324a] px-6 py-3 text-sm font-medium tracking-wide text-[#39324a] transition hover:bg-[#39324a] hover:text-white"
      >
        EXPLORE PROMPT COLLECTION
      </a>
    </div>
  </div>
</section>

      {/* Let's Stay in Touch */}
<section className="mx-auto w-full max-w-[1400px] px-6 pb-16 pt-16 sm:px-10 sm:pb-20 sm:pt-20 lg:px-16">
  <div className="border-t border-[#d9d3df] pt-10 sm:pt-12">
    <p className="text-sm tracking-[0.2em] text-[#8b8396]">
      LET'S STAY IN TOUCH
    </p>

    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#39324a] sm:text-4xl">
      อยากรู้จักเคียล่ามากขึ้นอีกนิดไหม
    </h2>

    <p className="mt-5 max-w-2xl text-base leading-8 text-[#39324a] sm:text-lg sm:leading-9">
      ถ้าอยากติดตามเรื่องราวใหม่ ๆ
      หรืออยากมาพูดคุยและแบ่งปันสิ่งที่ชอบไปด้วยกัน
      สามารถแวะมาทักทายกันได้เสมอ
    </p>

    <div className="mt-8 flex items-center gap-5">
      <SocialLinks variant="about" order={["instagram", "facebook", "x"]} />
    </div>
  </div>
</section>
    </main>
  );
}