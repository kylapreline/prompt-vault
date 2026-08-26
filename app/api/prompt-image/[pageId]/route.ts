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
    const { pageId } = await context.params;

    if (!pageId) {
      return new Response("Missing page ID", {
        status: 400,
      });
    }

    // ขอ Notion signed URL ใหม่
    const imageUrl =
      await findFirstImage(pageId);

    if (!imageUrl) {
      return new Response("Image not found", {
        status: 404,
      });
    }

    // ดึงไฟล์จริงจาก Notion
    const imageResponse =
      await fetch(imageUrl, {
        cache: "no-store",
      });

    if (!imageResponse.ok) {
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
          "Content-Type": contentType,

          /*
           * Cache รูปที่เว็บเราเอง
           *
           * ไม่ได้ cache Notion signed URL
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