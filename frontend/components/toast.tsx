"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
};

export function Toast({ message, type = "success", duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setVisible(true);
    setFading(false);

    const fadeTimer = window.setTimeout(() => {
      setFading(true);
    }, duration - 300);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [message, duration]);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      role="status"
      className={cn(
        "fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border bg-card p-4 shadow-lg transition-all duration-300",
        type === "success" && "border-success/30 bg-success/10",
        type === "error" && "border-destructive/30 bg-destructive/10",
        fading ? "animate-fade-out" : "animate-slide-in"
      )}
    >
      {type === "success" && (
        <CheckCircle className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
      )}
      <p className={cn(
        "text-sm font-medium",
        type === "success" && "text-success",
        type === "error" && "text-destructive"
      )}>
        {message}
      </p>
      <button
        onClick={() => setFading(true)}
        className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Fechar notificacao"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
