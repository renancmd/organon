"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  ListChecks,
  CalendarDays,
  Repeat,
  GanttChart,
  CircleUserRound,
} from "lucide-react";

function Sidebar() {
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
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <Home className="h-5 w-5" />
        </Link>
        <Link
          href="/tasks"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-900 transition-colors hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50"
        >
          <ListChecks className="h-5 w-5" />
        </Link>
        <Link
          href="/schedule"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <CalendarDays className="h-5 w-5" />
        </Link>
        <Link
          href="/habits"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <Repeat className="h-5 w-5" />
        </Link>
        <Link
          href="/daily-journal"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <GanttChart className="h-5 w-5" />
        </Link>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/perfil"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <CircleUserRound className="h-5 w-5" />
        </Link>
      </nav>
    </aside>
  );
}

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
          <div></div>
        </header>
        {children}
      </div>
    </div>
  );
}
