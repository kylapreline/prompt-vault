import { findFirstImage } from "../../../lib/notion";

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { pageId } =
      await context.params;

    if (!pageId) {
      return new Response(
        "Missing page ID",
        {
          status: 400,
        }
      );
    }

    /*
     * ขอ signed URL จาก Notion
     *
     * findFirstImage()
     * มี server-side cache และ
     * request deduplication อยู่แล้ว
     */
    const imageUrl =
      await findFirstImage(
        pageId
      );

    if (!imageUrl) {
      return new Response(
        "Image not found",
        {
          status: 404,
        }
      );
    }

    /*
     * ดึงไฟล์จริงจาก signed URL
     *
     * ไม่ cache signed URL โดยตรง
     */
    const imageResponse =
      await fetch(
        imageUrl,
        {
          cache: "no-store",
        }
      );

    if (!imageResponse.ok) {
      console.error(
        "Notion image fetch failed:",
        {
          pageId,
          status:
            imageResponse.status,
        }
      );

      /*
       * ถ้า signed URL ใช้ไม่ได้
       * ให้ลบ cache เพื่อให้ request
       * ครั้งถัดไปขอ URL ใหม่
       */
      return new Response(
        "Failed to fetch image",
        {
          status: 502,
        }
      );
    }

    const contentType =
      imageResponse.headers.get(
        "content-type"
      ) ?? "image/jpeg";

    return new Response(
      imageResponse.body,
      {
        status: 200,
        headers: {
          "Content-Type":
            contentType,

          /*
           * Cache รูปผ่านเว็บของเรา
           *
           * 3300 วินาที = 55 นาที
           *
           * stale-while-revalidate:
           * อนุญาตให้ใช้ response เก่า
           * ระหว่างกำลังสร้าง response ใหม่
           */
          "Cache-Control":
            "public, s-maxage=3300, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error(
      "Prompt image error:",
      error
    );

    return new Response(
      "Failed to load image",
      {
        status: 500,
      }
    );
  }
}