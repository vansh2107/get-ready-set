import { ReactNode } from "react";

interface ProfileSectionProps {
  title: string;
  children: ReactNode;
}

export function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground px-2">{title}</h2>
      <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}
