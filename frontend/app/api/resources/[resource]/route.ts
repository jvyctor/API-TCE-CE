import { NextRequest, NextResponse } from "next/server";
import { getResourceResponse } from "@/lib/tcece";

type RouteContext = {
  params: Promise<{
    resource: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { resource } = await context.params;
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "25");
  const result = await getResourceResponse(
    resource,
    page,
    pageSize,
    request.nextUrl.searchParams
  );

  return NextResponse.json(result.body, { status: result.status });
}
