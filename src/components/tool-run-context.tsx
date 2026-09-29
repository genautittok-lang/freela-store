"use client";

import { createContext, useContext } from "react";

export type ToolRunState = {
  busy: boolean;
};

const ToolRunContext = createContext<ToolRunState>({ busy: false });

export function ToolRunProvider({
  busy,
  children,
}: {
  busy: boolean;
  children: React.ReactNode;
}) {
  return <ToolRunContext.Provider value={{ busy }}>{children}</ToolRunContext.Provider>;
}

export function useToolRun(): ToolRunState {
  return useContext(ToolRunContext);
}
