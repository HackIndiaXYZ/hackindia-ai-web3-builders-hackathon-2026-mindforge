"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showText?: boolean;
  withLink?: boolean;
  href?: string;
  className?: string;
  textClassName?: string;
  subtitle?: string;
}

export function Logo({
  size = 28,
  showText = true,
  withLink = true,
  href = "/",
  className,
  textClassName,
  subtitle,
}: LogoProps) {
  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none group", className)}>
      <div
        style={{ width: size, height: size }}
        className="relative shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black shadow-subtle transition-transform duration-200 group-hover:scale-105"
      >
        <Image
          src="/logo.png"
          alt="AgentForge Logo"
          width={size}
          height={size}
          priority
          className="w-full h-full object-cover"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-semibold text-base tracking-tight text-primary-text leading-tight group-hover:text-primary-text transition-colors",
              textClassName
            )}
          >
            AgentForge
          </span>
          {subtitle && (
            <span className="text-[10px] text-muted-text uppercase tracking-wider font-mono">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
