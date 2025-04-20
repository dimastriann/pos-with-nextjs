import React from "react";

export function Card({
  children,
  className="",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-md p-1 bg-white shadow-lg hover:shadow-blue-500 ${className}`} {...props}>{children}</div>
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
