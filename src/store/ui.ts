"use client";

import { create } from "zustand";

export type DrawerTab = "bag" | "orders";

type UiState = {
  drawerOpen: boolean;
  drawerTab: DrawerTab;
  openDrawer: (tab?: DrawerTab) => void;
  closeDrawer: () => void;
  setDrawerTab: (tab: DrawerTab) => void;
  infoOpen: boolean;
  openInfo: () => void;
  closeInfo: () => void;
};

/**
 * Global UI state (Zustand). Holds only flags + setters — any real logic lives
 * in hooks/components (architecture guardrail).
 */
export const useUi = create<UiState>((set) => ({
  drawerOpen: false,
  drawerTab: "bag",
  openDrawer: (tab) => set((s) => ({ drawerOpen: true, drawerTab: tab ?? s.drawerTab })),
  closeDrawer: () => set({ drawerOpen: false }),
  setDrawerTab: (tab) => set({ drawerTab: tab }),
  infoOpen: false,
  openInfo: () => set({ infoOpen: true }),
  closeInfo: () => set({ infoOpen: false }),
}));
