import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = true, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`glossy rounded-2xl p-6 ${hover ? "glossy-hover" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
