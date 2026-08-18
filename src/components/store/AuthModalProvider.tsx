"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import AuthForm from "@/components/store/AuthForm";

type AuthModalContextValue = {
  openAuthModal: (next?: string) => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

// Guests get the popup once per browser tab session, not on every navigation.
const AUTO_PROMPT_KEY = "sj_auth_prompted";

export default function AuthModalProvider({
  isLoggedIn,
  children,
}: {
  isLoggedIn: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [next, setNext] = useState("/");

  const openAuthModal = useCallback((target?: string) => {
    setNext(target ?? window.location.pathname);
    setIsOpen(true);
  }, []);
  const closeAuthModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (isLoggedIn || pathname === "/auth") return;
    if (sessionStorage.getItem(AUTO_PROMPT_KEY)) return;
    sessionStorage.setItem(AUTO_PROMPT_KEY, "1");
    setNext(pathname);
    setIsOpen(true);
    // Only ever fires once per tab session, on whichever page the guest first lands on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoggedIn) setIsOpen(false);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeAuthModal]);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brown-dark/50 backdrop-blur-sm px-4"
          onClick={closeAuthModal}
        >
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeAuthModal}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-brown/60 hover:text-brown-dark transition-colors"
            >
              <X size={16} />
            </button>
            <AuthForm next={next} />
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}
