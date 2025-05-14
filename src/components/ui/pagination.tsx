// src/components/ui/pagination.tsx
import * as React from "react";

export function Pagination({ children }: { children: React.ReactNode }) {
  return <nav>{children}</nav>;
}
export function PaginationContent({ children }: { children: React.ReactNode }) {
  return <ul style={{ display: "flex", listStyle: "none", padding: 0 }}>{children}</ul>;
}
export function PaginationItem({ children }: { children: React.ReactNode }) {
  return <li style={{ margin: "0 4px" }}>{children}</li>;
}
export function PaginationLink({ isActive, onClick, children }: { isActive?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      style={{
        fontWeight: isActive ? "bold" : "normal",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function PaginationPrevious({ onClick }: { onClick?: () => void }) {
  return <button onClick={onClick}>Previous</button>;
}
export function PaginationNext({ onClick }: { onClick?: () => void }) {
  return <button onClick={onClick}>Next</button>;
}