"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ListChecks,
  CalendarDays,
  Repeat,
  GanttChart,
  CircleUserRound,
  Bell,
  Menu,
  X,
  FolderKanban, // Adicionado para "Projetos"
} from "lucide-react";

// Mantido os navItems da versão original de schedule
const navItems = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/projects", icon: FolderKanban, label: "Projetos" },
  { href: "/tasks", icon: ListChecks, label: "Tarefas" },
  { href: "/schedule", icon: CalendarDays, label: "Agenda" },
  { href: "/habits", icon: Repeat, label: "Hábitos" },
  { href: "/daily-journal", icon: GanttChart, label: "Diário" },
];

// ---------- BUTTON BASE (Copiado do perfil/layout.tsx) ----------
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "icon";
};

const Button = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50";
  const sizes = { default: "h-10 py-2 px-4", icon: "h-10 w-10" };
  const style: React.CSSProperties =
    variant === "default"
      ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)" }
      : variant === "outline"
      ? { borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)", color: "var(--foreground)" }
      : { backgroundColor: "transparent", color: "var(--foreground)" };

  return (
    <button className={`${base} ${sizes[size]} ${className}`} style={style} {...props}>
      {children}
    </button>
  );
};

// ---------- SIDEBAR (Refatorado com CSS Vars) ----------
function Sidebar() {
  const pathname = usePathname();

  // Função helper para estilo dos links
  const getLinkStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? "#101828" : "transparent",
    color: "var(--foreground)",
  });

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col border-r md:flex"
      style={{ backgroundColor: "oklch(13% 0.028 261.692)", borderColor: "var(--card-border)" }}
    >
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:h-8 md:w-8 md:text-base"
          style={{ backgroundColor: "var(--button-bg)", color: "var(--button-text)" }}
          title="Organon"
        >
          <span className="text-xl">O</span>
        </Link>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
              title={item.label}
              style={getLinkStyle(isActive)}
            >
              <item.icon className="h-5 w-5 text-white" />
            </Link>
          );
        })}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/perfil"
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          style={getLinkStyle(pathname === "/perfil")}
          title="Perfil"
        >
          <CircleUserRound className="h-5 w-5" />
        </Link>
      </nav>
    </aside>
  );
}

// ---------- LAYOUT PRINCIPAL (Refatorado com CSS Vars) ----------
export default function AgendaLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getLinkStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? "var(--card-bg)" : "transparent",
    color: "var(--foreground)",
  });

  return (
    <div
      className="min-h-screen w-full flex transition-colors duration-300"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <Sidebar />

      {/* MENU MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MENU MOBILE */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 p-6 shadow-xl transition-transform duration-300 ease-in-out md:hidden`}
        style={{
          backgroundColor: "var(--background)",
          transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Organon</h3>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 transition-all"
                style={getLinkStyle(isActive)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-0 w-full px-6">
          <Link
            href="/perfil"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 transition-all"
            style={getLinkStyle(pathname === "/perfil")}
          >
            <CircleUserRound className="h-5 w-5" />
            Perfil
          </Link>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex flex-col flex-1 md:ml-20">
        <header
          className="sticky top-0 z-30 flex bg-gray-950 text-white h-16 items-center justify-between gap-4 border-b px-4 md:px-6"
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold">Agenda</h1>
          </div>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full"
                  style={{ backgroundColor: "#f87171" }} // Cor mantida pois é específica de notificação
                ></span>
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: "#ef4444" }} // Cor mantida
                ></span>
              </span>
            </Button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

