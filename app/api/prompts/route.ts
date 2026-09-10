import { NextResponse } from "next/server";
import { getPromptVaultPage } from "../../lib/notion";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim() || null;
  const cursor = searchParams.get("cursor")?.trim() || null;
  const query = searchParams.get("q")?.trim() || null;

  if (
    (category?.length ?? 0) > 100 ||
    (cursor?.length ?? 0) > 500 ||
    (query?.length ?? 0) > 200
  ) {
    return NextResponse.json(
      { error: "Invalid gallery query" },
      { status: 400 }
    );
  }

  try {
    const page = await getPromptVaultPage({ category, cursor, query });

    return NextResponse.json(page, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Prompt gallery API error:", error);

    return NextResponse.json(
      { error: "Failed to load prompts" },
      { status: 502 }
    );
  }
}
