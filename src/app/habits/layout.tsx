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
  FolderKanban,
} from "lucide-react";

// --- DADOS DE NAVEGAÇÃO CENTRALIZADOS ---
const navItems = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/projects", icon: FolderKanban, label: "Projetos" },
  { href: "/tasks", icon: ListChecks, label: "Tarefas" },
  { href: "/schedule", icon: CalendarDays, label: "Agenda" },
  { href: "/habits", icon: Repeat, label: "Hábitos" },
  { href: "/daily-journal", icon: GanttChart, label: "Diário" },
];

// --- COMPONENTE SIDEBAR (Desktop com link ativo dinâmico) ---
function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800 md:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 text-lg font-semibold text-white dark:bg-gray-50 dark:text-gray-900 md:h-8 md:w-8 md:text-base"
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
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-gray-900 dark:hover:text-gray-50 ${
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/perfil"
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-gray-900 dark:hover:text-gray-50 ${
            pathname === "/perfil"
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
              : "text-gray-500 dark:text-gray-400"
          }`}
          title="Perfil"
        >
          <CircleUserRound className="h-5 w-5" />
        </Link>
      </nav>
    </aside>
  );
}

// --- COMPONENTE BOTÃO (Versão aprimorada) ---
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
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = {
    default:
      "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    outline:
      "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
  };
  const sizeClasses = { default: "h-10 py-2 px-4", icon: "h-10 w-10" };
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- COMPONENTE LAYOUT PRINCIPAL DE HÁBITOS ---
export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />

      {/* --- MENU MOBILE --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transform bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-950 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Organon</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="h-8 w-8"
          >
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
                className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                  isActive
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                }`}
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
            className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
              pathname === "/perfil"
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
            }`}
          >
            <CircleUserRound className="h-5 w-5" />
            Perfil
          </Link>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL DA PÁGINA --- */}
      <div className="flex flex-col flex-1 md:ml-20">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold">Hábitos</h1>
          </div>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </Button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
