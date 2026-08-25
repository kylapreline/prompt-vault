import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function GET() {
  try {
    const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;

    if (!dataSourceId) {
      return NextResponse.json(
        { error: "NOTION_DATA_SOURCE_ID is missing" },
        { status: 500 }
      );
    }

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 5,
    });

    return NextResponse.json({
      success: true,
      count: response.results.length,
      results: response.results,
    });
  } catch (error) {
    console.error("Notion API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}