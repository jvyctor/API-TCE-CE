"use client";

import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

type HeaderProps = {
  resourceCount: number;
  municipalityCount: number;
};

export function Header({ resourceCount, municipalityCount }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fEec74DCqI36CQSIHnEzdbBV5yHnJw.png"
              alt="Logo Grupo S&S"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                API TCE-CE
              </h1>
              <p className="text-sm text-muted-foreground">
                Consulta de Dados Abertos do TCE-CE
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5">
              <span className="text-muted-foreground">Endpoints:</span>
              <span className="font-medium text-secondary-foreground">{resourceCount}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5">
              <span className="text-muted-foreground">Municipios:</span>
              <span className="font-medium text-secondary-foreground">{municipalityCount}</span>
            </div>
            <a
              href="https://api-dados-abertos.tce.ce.gov.br/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Documentacao
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
