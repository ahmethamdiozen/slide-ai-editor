import { ReactNode } from "react";

type IconDef = {
  viewBox: string;
  path: ReactNode;
};

export const ICONS: Record<string, IconDef> = {
  database: {
    viewBox: "0 0 24 24",
    path: (
      <path d="M4 6c0-1.1 3.6-2 8-2s8 .9 8 2v12c0 1.1-3.6 2-8 2s-8-.9-8-2V6z" />
    ),
  },
  document: {
    viewBox: "0 0 24 24",
    path: (
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" />
    ),
  },
};

export const DEFAULT_ICON = "document";
