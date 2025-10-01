// PingIcon.tsx
import { ReactNode } from "react";

export function PingIcon({
  icon,
  color = "text-white",
  pingColor = "bg-white",
}: {
  icon: ReactNode;
  color?: string;
  pingColor?: string;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <span
        className={`absolute inline-flex h-6 w-6 rounded-full ${pingColor} opacity-75 animate-ping`}
      />
      <span className={`relative z-10 ${color}`}>{icon}</span>
    </div>
  );
}
