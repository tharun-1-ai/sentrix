import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeleteAccountSection() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [step, setStep] = useState<"initial" | "confirm">("initial");
  const [deletionToken, setDeletionToken] = useState("");

  const handleRequestDeletion = async () => {
    setDeleteLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("delete-account", {
        body: { action: "request" },
      });

      if (response.error) throw new Error(response.error.message);

      const result = response.data;
      if (result.confirmation_token) {
        setDeletionToken(result.confirmation_token);
        setStep("confirm");
        toast({
          title: t("deleteRequestSent"),
          description: t("deleteRequestSentDesc"),
        });
      }
    } catch (err: any) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (confirmText !== "DELETE") return;
    setDeleteLoading(true);
    try {
      const response = await supabase.functions.invoke("delete-account", {
        body: { action: "confirm", token: deletionToken },
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: t("accountDeleted"),
        description: t("accountDeletedDesc"),
      });

      await signOut();
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="cyber-card p-5 border-destructive/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-display font-bold text-sm text-destructive">{t("deleteAccount")}</p>
            <p className="text-xs text-muted-foreground font-medium">{t("deleteAccountDesc")}</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-xs font-display font-bold hover:bg-destructive/90 transition-colors">
              {t("deleteAccountBtn")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border-destructive/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {step === "initial" ? t("deleteAccountWarningTitle") : t("deleteAccountConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                {step === "initial" ? (
                  <>
                    <p>{t("deleteAccountWarning1")}</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>{t("deleteWarningProfile")}</li>
                      <li>{t("deleteWarningScanHistory")}</li>
                      <li>{t("deleteWarningReports")}</li>
                      <li>{t("deleteWarningData")}</li>
                    </ul>
                    <p className="font-medium text-destructive">{t("deleteWarningIrreversible")}</p>
                  </>
                ) : (
                  <>
                    <p>{t("deleteConfirmInstruction")}</p>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={e => setConfirmText(e.target.value)}
                      placeholder='Type "DELETE"'
                      className="w-full px-3 py-2 bg-secondary/50 border border-destructive/30 rounded-md text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-destructive/50"
                    />
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setStep("initial"); setConfirmText(""); setDeletionToken(""); }}>
                {t("cancel")}
              </AlertDialogCancel>
              {step === "initial" ? (
                <button
                  onClick={handleRequestDeletion}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-bold hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? t("pleaseWait") : t("deleteAccountProceed")}
                </button>
              ) : (
                <button
                  onClick={handleConfirmDeletion}
                  disabled={deleteLoading || confirmText !== "DELETE"}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-bold hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? t("pleaseWait") : t("deleteAccountFinal")}
                </button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
