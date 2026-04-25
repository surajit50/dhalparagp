"use client";

import { AdUnit } from "./AdSense";

// Pre-configured ad layouts for common use cases
export const BannerAd = ({
  slot,
  className,
}: {
  slot: string;
  className?: string;
}) => (
  <AdUnit
    slot={slot}
    format="horizontal"
    style={{ width: "100%", height: "90px" }}
    className={className}
  />
);

export const SquareAd = ({
  slot,
  className,
}: {
  slot: string;
  className?: string;
}) => (
  <AdUnit
    slot={slot}
    format="rectangle"
    style={{ width: "300px", height: "250px" }}
    className={className}
  />
);

export const SidebarAd = ({
  slot,
  className,
}: {
  slot: string;
  className?: string;
}) => (
  <AdUnit
    slot={slot}
    format="vertical"
    style={{ width: "160px", height: "600px" }}
    className={className}
  />
);

export const ResponsiveAd = ({
  slot,
  className,
}: {
  slot: string;
  className?: string;
}) => (
  <AdUnit
    slot={slot}
    format="auto"
    responsive={true}
    style={{ display: "block" }}
    className={className}
  />
);
