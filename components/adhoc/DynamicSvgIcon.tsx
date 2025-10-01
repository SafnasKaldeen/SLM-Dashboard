// components/DynamicSvgIcon.tsx
import React from "react";

interface DynamicSvgIconProps {
  iconKey: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export default function DynamicSvgIcon({
  iconKey,
  size = 24,
  color = "currentColor",
  style = {},
}: DynamicSvgIconProps) {
  const iconUrl = `https://lucide.dev/icons/${iconKey}.svg`;

  return (
    <img
      src={iconUrl}
      alt={iconKey}
      width={size}
      height={size}
      style={{ filter: color === "white" ? "invert(1)" : undefined, ...style }}
    />
  );
}
