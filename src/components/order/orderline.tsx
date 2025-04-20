import React from "react";

export function OrderLine({
  children,
  className="",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl p-1 bg-white shadow-lg ${className}`} {...props}>{children}</div>
  );
}