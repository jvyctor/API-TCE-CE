"use client";

import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

type HeaderProps = {
  resourceCount: number;
  municipalityCount: number;
};

export function Header({ resourceCount, municipalityCount }: HeaderProps) {
  return (
    <header className="border-b border-border/60 bg-background/72 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/Grupo-SS.png"
              alt="Grupo S&S"
              width={377}
              height={98}
              className="h-10 w-auto shrink-0 object-contain sm:h-12"
            />
            <div>
              <h1 className="text-[1.6rem] font-extrabold tracking-[-0.04em] text-foreground">
                API TCE-CE
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="surface-panel min-w-[112px] rounded-md px-4 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Endpoints
              </div>
              <div className="mt-1 text-base font-extrabold tracking-[-0.03em] text-foreground">
                {resourceCount}
              </div>
            </div>
            <div className="surface-panel min-w-[112px] rounded-md px-4 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Municipios
              </div>
              <div className="mt-1 text-base font-extrabold tracking-[-0.03em] text-foreground">
                {municipalityCount}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://api-dados-abertos.tce.ce.gov.br/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card/68 px-4 py-2.5 text-muted-foreground shadow-[0_8px_20px_hsl(190_20%_30%_/_0.05)] transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Documentacao
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
