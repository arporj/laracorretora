"use client";

import { Button } from "./Button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Substitui window.confirm()/alert() — nunca use os nativos do navegador
 * para confirmações neste projeto.
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="fade-in w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="confirm-modal-title" className="font-display text-lg font-semibold text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-muted">{description}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
