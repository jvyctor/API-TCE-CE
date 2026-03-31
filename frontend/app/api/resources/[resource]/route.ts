import { NextRequest, NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/lib/api-base-url";

type RouteContext = {
  params: Promise<{
    resource: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { resource } = await context.params;
  const targetUrl = new URL(
    `${getServerApiBaseUrl()}/api/resources/${encodeURIComponent(resource)}`
  );

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const response = await fetch(targetUrl.toString(), {
    cache: "no-store",
    headers: {
      accept: request.headers.get("accept") ?? "application/json",
    },
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  });
}
