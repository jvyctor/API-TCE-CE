import { AlertTriangle } from "lucide-react";

type ErrorCardProps = {
  title: string;
  detail: string;
  status?: number;
};

export function ErrorCard({ title, detail, status }: ErrorCardProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-destructive">
            {title}
            {status ? <span className="ml-2 text-sm font-normal">({status})</span> : null}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  );
}
