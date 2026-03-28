"use client";

import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

type HeaderProps = {
  resourceCount: number;
  municipalityCount: number;
};

export function Header({ resourceCount, municipalityCount }: HeaderProps) {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fEec74DCqI36CQSIHnEzdbBV5yHnJw.png"
              alt="Logo Grupo S&S"
              width={48}
              height={48}
              className="h-12 w-auto rounded-xl border border-border/70 bg-card/80 p-1.5 shadow-sm"
            />
            <div className="space-y-1">
              <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Painel de Consulta
              </div>
              <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground">
                API TCE-CE
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <div className="surface-panel rounded-2xl px-4 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Endpoints
              </div>
              <div className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                {resourceCount}
              </div>
            </div>
            <div className="surface-panel rounded-2xl px-4 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Municipios
              </div>
              <div className="mt-1 text-base font-bold tracking-[-0.02em] text-foreground">
                {municipalityCount}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://api-dados-abertos.tce.ce.gov.br/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/70 px-4 py-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
