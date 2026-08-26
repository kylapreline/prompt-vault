import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

type RouteContext = {
  params: Promise<{
    pageId: string;
    index: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { pageId, index } = await params;

    const imageIndex = Number(index);

    if (
      !Number.isInteger(imageIndex) ||
      imageIndex < 0
    ) {
      return NextResponse.json(
        { error: "Invalid image index" },
        { status: 400 }
      );
    }

    const page =
      await notion.pages.retrieve({
        page_id: pageId,
      });

    const properties =
      (page as any).properties;

    const filesProperty =
      properties["Files & media"];

    if (
      !filesProperty ||
      filesProperty.type !== "files"
    ) {
      return NextResponse.json(
        { error: "Files & media not found" },
        { status: 404 }
      );
    }

    const files =
      filesProperty.files ?? [];

    const file = files[imageIndex];

    if (!file) {
      return NextResponse.json(
        { error: "Reference image not found" },
        { status: 404 }
      );
    }

    let imageUrl: string | null = null;

    if (
      file.type === "file" &&
      file.file?.url
    ) {
      imageUrl = file.file.url;
    }

    if (
      file.type === "external" &&
      file.external?.url
    ) {
      imageUrl = file.external.url;
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL not available" },
        { status: 404 }
      );
    }

    return NextResponse.redirect(imageUrl);
  } catch (error) {
    console.error(
      "Reference image proxy error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}