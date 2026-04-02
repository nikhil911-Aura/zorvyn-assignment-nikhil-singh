"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({ children, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[100] overflow-y-auto animate-fade-in-overlay" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        {children}
      </div>
    </div>,
    document.body
  );
}
