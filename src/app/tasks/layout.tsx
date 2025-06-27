import React from "react";
import {
  Home,
  ListChecks,
  CalendarDays,
  Repeat,
  GanttChart,
  CircleUserRound,
  Bell,
} from "lucide-react";

// Componente da Barra Lateral (reutilizado da Home)
function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800 md:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <a
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 text-lg font-semibold text-white dark:bg-gray-50 dark:text-gray-900 md:h-8 md:w-8 md:text-base"
          title="Organon"
        >
          <span className="text-xl">O</span>
        </a>
        <a
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <Home className="h-5 w-5" />
        </a>
        {/* O link de Tarefas agora está ativo */}
        <a
          href="/tasks"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-900 transition-colors hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50"
        >
          <ListChecks className="h-5 w-5" />
        </a>
        <a
          href="/schedule"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <CalendarDays className="h-5 w-5" />
        </a>
        <a
          href="/habits"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <Repeat className="h-5 w-5" />
        </a>
        <a
          href="/daily-journal"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <GanttChart className="h-5 w-5" />
        </a>
      </nav>
    </aside>
  );
}

// Botão (Mock)
const Button = ({
  children,
  className = "",
  variant = "default",
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "icon";
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = {
    default:
      "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    outline:
      "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
  };
  const sizeClasses = { default: "h-10 py-2 px-4", icon: "h-10 w-10" };
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-20">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm px-6">
          <h1 className="text-xl font-semibold">Tarefas</h1>
          <div>
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
            <Button variant="ghost" size="icon" className="rounded-full ml-2">
              <CircleUserRound className="h-6 w-6" />
            </Button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
