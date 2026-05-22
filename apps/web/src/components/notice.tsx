import type { ReactNode } from "react";

interface NoticeProps {
  tone: "error" | "success";
  children: ReactNode;
}

export function Notice({ tone, children }: NoticeProps): ReactNode {
  return (
    <p className={`notice notice-${tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
