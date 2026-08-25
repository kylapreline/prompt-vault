import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

const dataSourceId = requireEnv("NOTION_DATA_SOURCE_ID");

/* -----------------------------
   Types
----------------------------- */

export type PromptBlock = {
  id: string;
  type: string;
  content: string;
  imageUrl?: string | null;
  mediaUrl?: string | null;
};

export type Prompt = {
  id: string;
  title: string;
  introTh: string;
  introEn: string;
  publishedDate: string | null;
  status: string | null;
  isPublished: boolean;

  // Tag ตัวที่ 1
  year: string | null;

  // Tag ตัวที่ 2
  category: string | null;

  // Tag ตัวที่ 3 เป็นต้นไป
  tags: string[];

  generatedBy: string[];

  // ภาพหลักจาก Image Block
  mainImageUrl: string | null;
  imageUrl: string | null;

  hasVideo: boolean;
  videoUrl: string | null;

  recommendation: string;

  // ใช้สำหรับหน้า Detail
  content: PromptBlock[];
};

/* -----------------------------
   Property Helpers
----------------------------- */

function getRichText(property: any): string {
  if (!property || property.type !== "rich_text") {
    return "";
  }

  return property.rich_text
    .map((item: any) => item.plain_text || "")
    .join("");
}

function getTitle(property: any): string {
  if (!property || property.type !== "title") {
    return "";
  }

  return property.title
    .map((item: any) => item.plain_text || "")
    .join("");
}

function getMultiSelect(property: any): string[] {
  if (!property || property.type !== "multi_select") {
    return [];
  }

  return property.multi_select.map(
    (item: any) => item.name
  );
}

function getDate(property: any): string | null {
  if (
    !property ||
    property.type !== "date" ||
    !property.date
  ) {
    return null;
  }

  return property.date.start;
}

function getSelect(property: any): string | null {
  if (
    !property ||
    property.type !== "select" ||
    !property.select
  ) {
    return null;
  }

  return property.select.name;
}

function getFormulaBoolean(property: any): boolean {
  if (!property || property.type !== "formula") {
    return false;
  }

  if (property.formula.type !== "boolean") {
    return false;
  }

  return property.formula.boolean;
}

/* -----------------------------
   Block Helpers
----------------------------- */

function getBlockText(block: any): string {
  const data = block[block.type];

  if (!data || !data.rich_text) {
    return "";
  }

  return data.rich_text
    .map((item: any) => item.plain_text || "")
    .join("");
}

function getBlockImageUrl(
  block: any
): string | null {
  if (block.type !== "image") {
    return null;
  }

  const image = block.image;

  if (!image) {
    return null;
  }

  if (
    image.type === "file" &&
    image.file?.url
  ) {
    return image.file.url;
  }

  if (
    image.type === "external" &&
    image.external?.url
  ) {
    return image.external.url;
  }

  return null;
}

function getBlockMediaUrl(
  block: any
): string | null {
  // Video block
  if (block.type === "video") {
    const video = block.video;

    if (!video) {
      return null;
    }

    if (
      video.type === "file" &&
      video.file?.url
    ) {
      return video.file.url;
    }

    if (
      video.type === "external" &&
      video.external?.url
    ) {
      return video.external.url;
    }
  }

  // Embed block
  if (block.type === "embed") {
    return block.embed?.url ?? null;
  }

  return null;
}

/* -----------------------------
   Find Main Image
----------------------------- */

/**
 * หา Image Block แรกของ Prompt
 *
 * รองรับ:
 * Page
 * └── Column List
 *     ├── Column
 *     │   └── Image
 *     └── Column
 *         └── Video / Embed
 *
 * จะหยุดทันทีเมื่อเจอ Image แรก
 * เพื่อไม่โหลด content ทั้งหมดโดยไม่จำเป็น
 */
async function findFirstImage(
  blockId: string
): Promise<string | null> {
  let startCursor: string | undefined =
    undefined;

  do {
    const response =
      await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100,

        ...(startCursor
          ? {
              start_cursor: startCursor,
            }
          : {}),
      });

    for (const block of response.results as any[]) {
      // ถ้าเป็น Image ให้ใช้ทันที
      const imageUrl =
        getBlockImageUrl(block);

      if (imageUrl) {
        return imageUrl;
      }

      // ถ้ามี children ให้ค้นต่อ
      if (block.has_children) {
        const childImageUrl =
          await findFirstImage(block.id);

        if (childImageUrl) {
          return childImageUrl;
        }
      }
    }

    startCursor = response.has_more
      ? response.next_cursor ?? undefined
      : undefined;
  } while (startCursor);

  return null;
}

/* -----------------------------
   Full Page Content
----------------------------- */

/**
 * ดึง Blocks ทั้งหมดของ Prompt
 *
 * ใช้สำหรับหน้า Detail
 *
 * รองรับ nested blocks เช่น
 * Column List
 * Column
 * Image
 * Video
 * Embed
 */
export async function getPromptContent(
  blockId: string
): Promise<PromptBlock[]> {
  const allBlocks: PromptBlock[] = [];

  let startCursor: string | undefined =
    undefined;

  do {
    const response =
      await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100,

        ...(startCursor
          ? {
              start_cursor: startCursor,
            }
          : {}),
      });

    for (const block of response.results as any[]) {
      allBlocks.push({
        id: block.id,
        type: block.type,
        content: getBlockText(block),
        imageUrl: getBlockImageUrl(block),
        mediaUrl: getBlockMediaUrl(block),
      });

      // รองรับ Column / Column List / nested blocks
      if (block.has_children) {
        const childBlocks =
          await getPromptContent(block.id);

        allBlocks.push(...childBlocks);
      }
    }

    startCursor = response.has_more
      ? response.next_cursor ?? undefined
      : undefined;
  } while (startCursor);

  return allBlocks;
}

/* -----------------------------
   Prompt Vault
----------------------------- */

export async function getPromptVault(): Promise<
  Prompt[]
> {
  const allResults: any[] = [];

  let startCursor: string | undefined =
    undefined;

  /*
   * ดึง Prompt ทั้งหมดแบบ pagination
   */
  do {
    const response =
      await notion.dataSources.query({
        data_source_id: dataSourceId,

        filter: {
          property: "Is Published?",
          formula: {
            checkbox: {
              equals: true,
            },
          },
        },

        sorts: [
          {
            property: "Published Date",
            direction: "descending",
          },
        ],

        page_size: 100,

        ...(startCursor
          ? {
              start_cursor: startCursor,
            }
          : {}),
      });

    allResults.push(
      ...response.results
    );

    startCursor = response.has_more
      ? response.next_cursor ?? undefined
      : undefined;
  } while (startCursor);

  /*
   * แปลง Database properties
   *
   * สำคัญ:
   * ภาพหลักจะมาจาก Image Block
   * ไม่ใช่ Files & media
   */
  const prompts = await Promise.all(
    allResults.map(
      async (page: any): Promise<Prompt> => {
        const properties =
          page.properties;

        const allTags =
          getMultiSelect(
            properties["แท็ก"]
          );

        /*
         * หา Image Block แรก
         *
         * รองรับ Image ที่อยู่ใน Column
         * หรือ nested block
         */
        const mainImageUrl =
          await findFirstImage(page.id);

        return {
          id: page.id,

          title: getTitle(
            properties["ชื่อ"]
          ),

          introTh: getRichText(
            properties["Intro (TH)"]
          ),

          introEn: getRichText(
            properties["Intro (EN)"]
          ),

          publishedDate: getDate(
            properties["Published Date"]
          ),

          status: getSelect(
            properties["Status"]
          ),

          isPublished:
            getFormulaBoolean(
              properties["Is Published?"]
            ),

          // Tag 1 = Year
          year:
            allTags[0] ?? null,

          // Tag 2 = Category / Theme
          category:
            allTags[1] ?? null,

          // Tag 3+ = Tags
          tags:
            allTags.slice(2),

          generatedBy:
            getMultiSelect(
              properties["Generated by"]
            ),

          /*
           * ภาพหลักของ Prompt
           *
           * ใช้ Image Block
           * ไม่ใช้ Files & media
           */
          mainImageUrl,

          /*
           * imageUrl ยังคงเก็บค่าเดียวกับ
           * mainImageUrl เพื่อให้ component
           * เดิมที่เรียก imageUrl ยังทำงานได้
           */
          imageUrl: mainImageUrl,

          /*
           * Gallery ยังไม่ตรวจ Video
           *
           * Video / Embed จะถูกโหลดใน
           * getPromptContent() ตอนหน้า Detail
           */
          hasVideo: false,

          videoUrl: null,

          recommendation:
            getRichText(
              properties["แนะนำ"]
            ),

          /*
           * Gallery ไม่โหลด content ทั้งหมด
           */
          content: [],
        };
      }
    )
  );

  return prompts;
}