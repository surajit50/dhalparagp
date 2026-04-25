import { ReactNode } from "react";
import AdSense from "./AdSense";

interface AdWrapperProps {
  children: ReactNode;
  pId: string;
}

export function AdWrapper({ children, pId }: AdWrapperProps) {
  return (
    <div className="ad-content-wrapper">
      <div className="main-content min-h-[400px]">{children}</div>
      {children && <AdSense pId={pId} />}
    </div>
  );
}
