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

export type ReferenceImage = {
  name: string;
  url: string | null;
};

export type Prompt = {
  id: string;
  title: string;
  introTh: string;
  introEn: string;
  publishedDate: string | null;
  status: string | null;
  isPublished: boolean;

  year: string | null;
  category: string | null;
  tags: string[];

  generatedBy: string[];

  referenceImages: ReferenceImage[];

  mainImageUrl: string | null;
  imageUrl: string | null;

  hasVideo: boolean;
  videoUrl: string | null;

  recommendation: string;

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

function getFiles(property: any): ReferenceImage[] {
  if (!property || property.type !== "files") {
    return [];
  }

  return property.files.map((file: any) => {
    let url: string | null = null;

    if (
      file.type === "file" &&
      file.file?.url
    ) {
      url = file.file.url;
    }

    if (
      file.type === "external" &&
      file.external?.url
    ) {
      url = file.external.url;
    }

    return {
      name: file.name || "",
      url,
    };
  });
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

  if (block.type === "embed") {
    return block.embed?.url ?? null;
  }

  return null;
}

/* -----------------------------
   Notion Request Queue
----------------------------- */

/*
 * ป้องกันไม่ให้หลาย request ยิง Notion API
 * พร้อมกันจนเกิด rate limit
 *
 * เราจะเว้นระยะเล็กน้อยระหว่าง request
 * ที่เข้าคิวจาก process เดียวกัน
 */

let notionQueue: Promise<void> = Promise.resolve();

let lastNotionRequestTime = 0;

const NOTION_REQUEST_DELAY = 350;

async function waitForNotionSlot(): Promise<void> {
  const previous = notionQueue;

  let release!: () => void;

  notionQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  const elapsed =
    Date.now() - lastNotionRequestTime;

  const waitTime =
    NOTION_REQUEST_DELAY - elapsed;

  if (waitTime > 0) {
    await new Promise((resolve) =>
      setTimeout(resolve, waitTime)
    );
  }

  lastNotionRequestTime = Date.now();

  release();
}

async function notionRequest<T>(
  request: () => Promise<T>
): Promise<T> {
  await waitForNotionSlot();

  try {
    return await request();
  } catch (error) {
    console.error(
      "Notion API request failed:",
      error
    );

    throw error;
  }
}

/* -----------------------------
   Main Image Cache
----------------------------- */

/*
 * Signed URL ของ Notion ไม่ควรเก็บไว้นานเกินไป
 *
 * ใช้ cache ประมาณ 50 นาที
 * เพื่อให้มี margin ก่อน URL หมดอายุ
 */

const IMAGE_CACHE_TTL =
  50 * 60 * 1000;

type ImageCacheEntry = {
  url: string;
  expiresAt: number;
};

const imageCache =
  new Map<string, ImageCacheEntry>();

/*
 * ป้องกัน request เดียวกันหลายตัว
 * ที่เข้ามาพร้อมกัน
 *
 * เช่นรูป page เดียวกันถูกเรียก 5 ครั้ง
 * จะใช้ Notion request เดียว
 */

const imageRequests =
  new Map<string, Promise<string | null>>();

/* -----------------------------
   Find Main Image
----------------------------- */

/**
 * หา Image Block แรกของ Prompt
 *
 * รองรับ:
 *
 * Page
 * └── Column List
 *     ├── Column
 *     │   └── Image
 *     └── Column
 *         └── Video / Embed
 *
 * จะหยุดทันทีเมื่อเจอ Image แรก
 */
export async function findFirstImage(
  blockId: string
): Promise<string | null> {
  /*
   * ตรวจ cache ก่อน
   */
  const cached =
    imageCache.get(blockId);

  if (
    cached &&
    cached.expiresAt > Date.now()
  ) {
    return cached.url;
  }

  /*
   * ถ้ามี request ที่กำลังทำอยู่
   * ใช้ Promise เดิมแทน
   */
  const existingRequest =
    imageRequests.get(blockId);

  if (existingRequest) {
    return existingRequest;
  }

  const request =
    findFirstImageUncached(blockId);

  imageRequests.set(
    blockId,
    request
  );

  try {
    const imageUrl =
      await request;

    if (imageUrl) {
      imageCache.set(blockId, {
        url: imageUrl,
        expiresAt:
          Date.now() +
          IMAGE_CACHE_TTL,
      });
    }

    return imageUrl;
  } finally {
    imageRequests.delete(blockId);
  }
}

/**
 * ค้นหา Image จาก Notion จริง ๆ
 *
 * ฟังก์ชันนี้จะถูกเรียกเฉพาะเมื่อ
 * cache ไม่มีหรือหมดอายุ
 */
async function findFirstImageUncached(
  blockId: string
): Promise<string | null> {
  let startCursor:
    | string
    | undefined = undefined;

  do {
    const response =
      await notionRequest(() =>
        notion.blocks.children.list({
          block_id: blockId,
          page_size: 100,

          ...(startCursor
            ? {
                start_cursor:
                  startCursor,
              }
            : {}),
        })
      );

    for (
      const block of
      response.results as any[]
    ) {
      /*
       * Image โดยตรง
       */
      const imageUrl =
        getBlockImageUrl(block);

      if (imageUrl) {
        return imageUrl;
      }

      /*
       * ค้นต่อเฉพาะ container
       */
      const shouldSearchChildren =
        block.type ===
          "column_list" ||
        block.type ===
          "column";

      if (
        shouldSearchChildren &&
        block.has_children
      ) {
        const childImageUrl =
          await findFirstImage(
            block.id
          );

        if (childImageUrl) {
          return childImageUrl;
        }
      }
    }

    startCursor =
      response.has_more
        ? response.next_cursor ??
          undefined
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
 */
export async function getPromptContent(
  blockId: string
): Promise<PromptBlock[]> {
  const allBlocks: PromptBlock[] =
    [];

  let startCursor:
    | string
    | undefined = undefined;

  do {
    const response =
      await notionRequest(() =>
        notion.blocks.children.list({
          block_id: blockId,
          page_size: 100,

          ...(startCursor
            ? {
                start_cursor:
                  startCursor,
              }
            : {}),
        })
      );

    for (
      const block of
      response.results as any[]
    ) {
      allBlocks.push({
        id: block.id,
        type: block.type,
        content:
          getBlockText(block),
        imageUrl:
          getBlockImageUrl(
            block
          ),
        mediaUrl:
          getBlockMediaUrl(
            block
          ),
      });

      /*
       * ดึง nested blocks
       * เฉพาะเมื่อมีจริง
       */
      if (block.has_children) {
        const childBlocks =
          await getPromptContent(
            block.id
          );

        allBlocks.push(
          ...childBlocks
        );
      }
    }

    startCursor =
      response.has_more
        ? response.next_cursor ??
          undefined
        : undefined;
  } while (startCursor);

  return allBlocks;
}

/* -----------------------------
   Prompt Mapper
----------------------------- */

/**
 * แปลง Notion Page → Prompt
 */
function mapPageToPrompt(
  page: any,
  content: PromptBlock[] = []
): Prompt {
  const properties =
    page.properties;

  const allTags =
    getMultiSelect(
      properties["แท็ก"]
    );

  /*
   * ภาพหลักใช้ Image Proxy
   *
   * ไม่เก็บ Notion signed URL
   */
  const mainImageUrl =
    `/api/prompt-image/${page.id}`;

  return {
    id: page.id,

    title:
      getTitle(
        properties["ชื่อ"]
      ),

    introTh:
      getRichText(
        properties["Intro (TH)"]
      ),

    introEn:
      getRichText(
        properties["Intro (EN)"]
      ),

    publishedDate:
      getDate(
        properties[
          "Published Date"
        ]
      ),

    status:
      getSelect(
        properties["Status"]
      ),

    isPublished:
      getFormulaBoolean(
        properties[
          "Is Published?"
        ]
      ),

    year:
      allTags[0] ?? null,

    category:
      allTags[1] ?? null,

    tags:
      allTags.slice(2),

    generatedBy:
      getMultiSelect(
        properties[
          "Generated by"
        ]
      ),

    referenceImages:
      getFiles(
        properties[
          "Files & media"
        ]
      ),

    mainImageUrl,

    imageUrl:
      mainImageUrl,

    hasVideo: false,

    videoUrl: null,

    recommendation:
      getRichText(
        properties["แนะนำ"]
      ),

    content,
  };
}

/* -----------------------------
   Prompt Vault
----------------------------- */

export async function getPromptVault(): Promise<
  Prompt[]
> {
  const allResults: any[] =
    [];

  let startCursor:
    | string
    | undefined = undefined;

  do {
    const response =
      await notionRequest(() =>
        notion.dataSources.query({
          data_source_id:
            dataSourceId,

          filter: {
            property:
              "Is Published?",
            formula: {
              checkbox: {
                equals: true,
              },
            },
          },

          sorts: [
            {
              property:
                "Published Date",
              direction:
                "descending",
            },
          ],

          page_size: 100,

          ...(startCursor
            ? {
                start_cursor:
                  startCursor,
              }
            : {}),
        })
      );

    allResults.push(
      ...response.results
    );

    startCursor =
      response.has_more
        ? response.next_cursor ??
          undefined
        : undefined;
  } while (startCursor);

  /*
   * Gallery ไม่เรียก
   * getPromptContent()
   *
   * ดังนั้น query หนึ่งครั้ง
   * ไม่ตามด้วย request
   * ของทุก Block
   */
  return allResults.map(
    (page): Prompt =>
      mapPageToPrompt(page)
  );
}

/* -----------------------------
   Single Prompt
----------------------------- */

export async function getPromptById(
  pageId: string
): Promise<Prompt | null> {
  try {
    /*
     * ดึงข้อมูล Page ก่อน
     */
    const page =
      await notionRequest(() =>
        notion.pages.retrieve({
          page_id: pageId,
        })
      );

    /*
     * ดึง Content เฉพาะหน้า Detail
     *
     * Gallery จะไม่เรียกส่วนนี้
     */
    const content =
      await getPromptContent(
        pageId
      );

    return mapPageToPrompt(
      page,
      content
    );
  } catch (error) {
    console.error(
      "Failed to get prompt:",
      error
    );

    return null;
  }
}