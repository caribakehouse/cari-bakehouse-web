"use client";

// Truyền dữ liệu công khai mà layout gốc đã tải từ Supabase (trên server) xuống mọi component.
// Các hook trong src/lib/db.ts đọc giá trị ban đầu từ đây.

import { createContext, useContext, type ReactNode } from "react";
import type { PublicData } from "@/lib/supabase/public-data";

const PublicDataContext = createContext<PublicData | null>(null);

export function PublicDataProvider({ data, children }: { data: PublicData; children: ReactNode }) {
  return <PublicDataContext.Provider value={data}>{children}</PublicDataContext.Provider>;
}

export function usePublicData(): PublicData {
  const data = useContext(PublicDataContext);
  if (!data) throw new Error("usePublicData phải nằm trong <PublicDataProvider>");
  return data;
}
