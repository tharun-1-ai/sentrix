import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmDialog({ open, onClose, onConfirm, title, message }: DeleteConfirmDialogProps) {
  const { t } = useLanguage();
  const [deleting, setDeleting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setDeleting(false); return; }
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (deleting) return;
    setDeleting(true);
    try { await onConfirm(); } finally { setDeleting(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-scale-in outline-none"
        style={{
          boxShadow: "0 0 40px hsl(185 100% 50% / 0.08), 0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" style={{ filter: "drop-shadow(0 0 8px hsl(0 80% 60% / 0.4))" }} />
          </div>
        </div>

        {/* Content */}
        <h3 id="delete-dialog-title" className="text-center font-display font-bold text-lg tracking-tight text-foreground">
          {title || t("confirmDelete") || "Confirm Deletion"}
        </h3>
        <p id="delete-dialog-desc" className="text-center text-sm text-muted-foreground mt-2 leading-relaxed">
          {message || "Are you sure you want to delete this item? This action cannot be undone."}
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-display font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-display font-bold bg-destructive text-destructive-foreground hover:bg-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ boxShadow: deleting ? "none" : "0 0 15px hsl(0 80% 60% / 0.2)" }}
          >
            {deleting ? (t("pleaseWait") || "Deleting...") : (t("confirm") || "Delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
