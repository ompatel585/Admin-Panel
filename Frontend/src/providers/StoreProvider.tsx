"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser: the store is created once per mounted provider.
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
