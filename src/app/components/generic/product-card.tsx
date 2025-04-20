import React from "react";

export function Card({
  children,
  className="",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl p-1 bg-white shadow-lg ${className}`} {...props}>{children}</div>
  );
}

export function CardContent({
  children,
  className="",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-2 ${className}`} {...props}>{children}</div>
  );
}
