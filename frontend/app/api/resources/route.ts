import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl() {
  return (
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const targetUrl = new URL(`${getApiBaseUrl()}/api/resources`);
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
