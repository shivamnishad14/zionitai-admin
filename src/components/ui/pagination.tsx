// src/components/ui/pagination.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Pagination({ children }: { children: React.ReactNode }) {
  return <nav>{children}</nav>;
}

export function PaginationContent({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-wrap items-center gap-1">{children}</ul>;
}

export function PaginationItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

export function PaginationLink({ 
  isActive, 
  onClick, 
  children,
  className,
}: { 
  isActive?: boolean; 
  onClick?: () => void; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground",
        "h-9 px-4 py-2",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function PaginationPrevious({ 
  onClick, 
  disabled,
  className,
}: { 
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "hover:bg-accent hover:text-accent-foreground",
        "h-9 px-4 py-2",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      Previous
    </button>
  );
}

export function PaginationNext({ 
  onClick, 
  disabled,
  className,
}: { 
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "hover:bg-accent hover:text-accent-foreground",
        "h-9 px-4 py-2",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      Next
    </button>
  );
}