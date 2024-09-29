"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { MoonIcon, SunIcon } from "lucide-react";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="px-2 cursor-pointer">
      {theme === "dark" ? (
        <SunIcon
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      ) : (
        <MoonIcon
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      )}
    </div>
  );
}
