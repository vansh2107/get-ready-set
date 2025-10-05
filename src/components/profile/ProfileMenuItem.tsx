import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProfileMenuItemProps {
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function ProfileMenuItem({ label, onClick, href, className }: ProfileMenuItemProps) {
  const content = (
    <div className={cn(
      "flex items-center justify-between py-4 px-4 smooth hover:bg-muted/50 cursor-pointer",
      className
    )}>
      <span className="text-foreground font-normal">{label}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick}>
      {content}
    </div>
  );
}
