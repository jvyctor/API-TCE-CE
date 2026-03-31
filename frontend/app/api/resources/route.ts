import { NextResponse } from "next/server";
import { getCatalogResponse } from "@/lib/tcece";

export async function GET() {
  try {
    return NextResponse.json(await getCatalogResponse(), { status: 200 });
  } catch {
    return NextResponse.json(
      {
        title: "Falha no catalogo",
        status: 502,
        detail: "Nao foi possivel carregar o catalogo de recursos do TCE-CE.",
      },
      { status: 502 }
    );
  }
}
