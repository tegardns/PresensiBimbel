import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/alert-dialog";
import { AlertTriangle, Trash2, Info, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ConfirmVariant = "danger" | "warning" | "info" | "success";

interface ConfirmOptions {
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<(value: boolean) => void>();

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    setIsOpen(false);
  };

  const getVariantStyles = (variant: ConfirmVariant) => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          button: "bg-red-500 hover:bg-red-600 text-white",
          bg: "bg-red-50",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
          button: "bg-orange-500 hover:bg-orange-600 text-white",
          bg: "bg-orange-50",
        };
      case "success":
        return {
          icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
          button: "bg-emerald-500 hover:bg-emerald-600 text-white",
          bg: "bg-emerald-50",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-500" />,
          button: "bg-blue-500 hover:bg-blue-600 text-white",
          bg: "bg-blue-50",
        };
    }
  };

  const styles = options ? getVariantStyles(options.variant || "info") : getVariantStyles("info");

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-full ${styles.bg} dark:bg-slate-800 flex items-center justify-center`}>
                      {styles.icon}
                    </div>
                    <div className="flex-1 pt-1">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                          {options?.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 dark:text-slate-400 mt-2 text-sm whitespace-pre-line leading-relaxed">
                          {options?.description}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <AlertDialogCancel
                    onClick={handleCancel}
                    className="mt-0 bg-white hover:bg-slate-100 text-slate-700 border-slate-200 rounded-xl"
                  >
                    {options?.cancelText || "Batal"}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirm}
                    className={`rounded-xl shadow-sm ${styles.button}`}
                  >
                    {options?.confirmText || "Konfirmasi"}
                  </AlertDialogAction>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
};
