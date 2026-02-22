import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Toast } from "@/components/Toast";

type ToastType = "success" | "error" | "info";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
    key: number;
  }>({ message: "", type: "info", visible: false, key: 0 });
  const keyRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    keyRef.current += 1;
    setState({ message, type, visible: true, key: keyRef.current });
  }, []);

  const hideToast = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        key={state.key}
        message={state.message}
        type={state.type}
        visible={state.visible}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
