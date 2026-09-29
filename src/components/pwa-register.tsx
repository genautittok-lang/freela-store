"use client";

import { useEffect } from "react";
import { registerFreelaServiceWorker } from "@/lib/pwa";

export function PwaRegister() {
  useEffect(() => {
    registerFreelaServiceWorker();
  }, []);
  return null;
}
