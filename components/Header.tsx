"use client";

import { Moon, Settings, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "nour_theme_mode";
const DARK_THEME = "dark";
const LIGHT_THEME = "light";

function applyTheme(theme: string) {
  const isDark = theme === DARK_THEME;
  document.documentElement.classList.toggle(DARK_THEME, isDark);
  document.body.classList.toggle(DARK_THEME, isDark);
}

const links = [
  { href: "/about", label: "من نحن" },
  { href: "/privacy-policy", label: "الخصوصية" },
  { href: "/terms", label: "الشروط" },
  { href: "/contact", label: "تواصل" },
];

export default function Header() {
  const [theme, setTheme] = useState<string>(LIGHT_THEME);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY) || LIGHT_THEME;
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  const isDark = theme === DARK_THEME;

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
        padding: "12px 16px",
        background: isDark ? "#111827" : "#166534",
      }}
    >
      <strong style={{ color: "#fff" }}>نور</strong>

      <nav aria-label="روابط الصفحات الأساسية" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {links.map((link) => (
          <a key={link.href} href={link.href} style={{ color: "#fff", textDecoration: "none", fontSize: "14px" }}>
            {link.label}
          </a>
        ))}
      </nav>

      <div style={{ display: "flex", gap: "8px" }}>
        <a
          href="/settings.html"
          aria-label="الإعدادات"
          style={{ color: "#fff", display: "inline-flex" }}
        >
          <Settings size={20} />
        </a>

        <button
          type="button"
          aria-label={isDark ? "الوضع الفاتح" : "الوضع الليلي"}
          onClick={toggleTheme}
          style={{
            border: "none",
            background: "transparent",
            color: isDark ? "#f9fafb" : "#ffffff",
            cursor: "pointer",
            display: "inline-flex",
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
