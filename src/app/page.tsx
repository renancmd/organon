// app/page.tsx
// This is the main component for the Home page of your application.
// It has been updated to include an attachments section in the Daily Journal.
// Built with Next.js (App Router), TypeScript, and Tailwind CSS.

"use client"; // Required for useState

import React, { useState } from "react";
import {
  Home,
  ListChecks,
  CalendarDays,
  Repeat,
  GanttChart,
  CircleUserRound,
  Bell,
  Flame,
  X,
  MapPin,
  Paperclip,
} from "lucide-react";

// --- Start: Data Structures ---
type SubTask = { id: string; name: string; completed: boolean };
type Attachment = { id: string; name: string; url: string };
type Task = {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  priority: "Baixa" | "Média" | "Alta";
  completed: boolean;
  subtasks: SubTask[];
  color: string;
  attachments?: Attachment[];
  day: "today" | "tomorrow";
};
type Event = {
  id: string;
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  recurrence?: "Nenhuma" | "Diário" | "Semanal" | "Mensal";
  color: string;
  attachments?: Attachment[];
  day: "today" | "tomorrow";
};
// --- End: Data Structures ---

// --- Start: Mock Data ---
const mockTasks: Task[] = [
  {
    id: "task-1",
    name: "Finalize sales report",
    description:
      "Finish the Q2 sales report for the management meeting. Include charts for regional performance.",
    dueDate: "2025-06-26T17:00:00",
    priority: "Alta",
    completed: false,
    subtasks: [
      { id: "sub-1-1", name: "Gather data from CRM", completed: true },
      { id: "sub-1-2", name: "Create performance charts", completed: false },
      { id: "sub-1-3", name: "Write summary and conclusion", completed: false },
    ],
    color: "bg-blue-500",
    attachments: [{ id: "attach-1", name: "template_report.docx", url: "#" }],
    day: "today",
  },
  {
    id: "task-2",
    name: "Schedule doctor's appointment",
    description: "",
    priority: "Média",
    completed: false,
    subtasks: [],
    color: "bg-green-500",
    day: "today",
  },
  {
    id: "task-3",
    name: "Buy groceries",
    description: "Milk, Eggs, Bread, and Fruits.",
    priority: "Baixa",
    completed: false,
    subtasks: [],
    color: "bg-green-500",
    day: "tomorrow",
  },
];

const mockEvents: Event[] = [
  {
    id: "event-1",
    name: "Project Meeting",
    date: "2025-06-26",
    startTime: "14:00",
    endTime: "15:30",
    location: "Conference Room 4",
    recurrence: "Nenhuma",
    color: "bg-red-500",
    day: "today",
  },
  {
    id: "event-2",
    name: "Team Lunch",
    date: "2025-06-27",
    startTime: "12:30",
    endTime: "13:30",
    location: "Central Restaurant",
    recurrence: "Nenhuma",
    color: "bg-yellow-500",
    day: "tomorrow",
    attachments: [{ id: "attach-2", name: "menu.pdf", url: "#" }],
  },
];
// --- End: Mock Data ---

// --- Start: Mock shadcn/ui Components ---
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100 ${className}`}
  >
    {children}
  </h3>
);
const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const CardFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
);

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

const Checkbox = ({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked?: boolean;
  onChange?: () => void;
}) => (
  <div className="flex items-center">
    {" "}
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 shrink-0 rounded-sm border border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-gray-600"
    />{" "}
  </div>
);
const Input = ({
  className = "",
  type = "text",
  placeholder = "",
  value,
  onChange,
}: {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:placeholder:text-gray-400 ${className}`}
  />
);
const Textarea = ({
  className = "",
  placeholder = "",
  value,
  onChange,
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`flex min-h-[80px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:placeholder:text-gray-400 ${className}`}
  />
);
const Label = ({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) => (
  <label
    htmlFor={htmlFor}
    className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
  >
    {" "}
    {children}{" "}
  </label>
);
const TabsList = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
    {children}
  </div>
);
const TabsTrigger = ({
  children,
  onClick,
  isActive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 ${
      isActive
        ? "bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50"
        : ""
    }`}
  >
    {" "}
    {children}{" "}
  </button>
);
const Select = ({
  children,
  value,
  onChange,
}: {
  children: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => (
  <select
    value={value}
    onChange={onChange}
    className="h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-gray-800"
  >
    {" "}
    {children}{" "}
  </select>
);
// --- End: Mock shadcn/ui Components ---

// --- Start: Task Detail Modal Component ---
function TaskDetailModal({
  task,
  isOpen,
  onClose,
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !task) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-4">
        <div className="flex items-start justify-between p-6 border-b dark:border-gray-800">
          <div className="w-full flex items-center gap-4">
            <Checkbox id={`modal-status-${task.id}`} />
            <Input
              value={task.name}
              className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Adicionar detalhes, links e anotações..."
              value={task.description}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={
                  task.dueDate
                    ? new Date(task.dueDate).toISOString().slice(0, 16)
                    : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select id="priority" value={task.priority}>
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Código de Cores</Label>
            <div className="flex gap-2 pt-2">
              {[
                "bg-blue-500",
                "bg-green-500",
                "bg-purple-500",
                "bg-yellow-500",
                "bg-red-500",
              ].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full ${color} ${
                    task.color === color
                      ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-offset-gray-900 dark:ring-white"
                      : ""
                  }`}
                ></button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Label>Sub-tarefas</Label>
            <div className="space-y-3">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50"
                >
                  <Checkbox id={sub.id} checked={sub.completed} />
                  <Input
                    value={sub.name}
                    className="border-none p-0 h-auto text-sm focus-visible:ring-0 bg-transparent"
                  />
                </div>
              ))}
            </div>
            <Button variant="outline" size="default" className="w-full text-sm">
              Adicionar sub-tarefa
            </Button>
          </div>
          <div className="space-y-3">
            <Label>Anexos</Label>
            <div className="flex flex-wrap gap-2">
              {task.attachments?.map((file) => (
                <a
                  href={file.url}
                  key={file.id}
                  className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
                >
                  <Paperclip className="h-4 w-4" /> {file.name}
                </a>
              ))}
            </div>
            <Button variant="outline" size="default" className="w-full text-sm">
              Adicionar anexo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
// --- End: Task Detail Modal Component ---

// --- Start: Event Detail Modal Component ---
function EventDetailModal({
  event,
  isOpen,
  onClose,
}: {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-4">
        <div className="flex items-start justify-between p-6 border-b dark:border-gray-800">
          <div className="w-full flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${event.color}`}></div>
            <Input
              value={event.name}
              className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Data</Label>
              <Input id="eventDate" type="date" value={event.date} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurrence">Recorrência</Label>
              <Select id="recurrence" value={event.recurrence}>
                <option>Nenhuma</option>
                <option>Diário</option>
                <option>Semanal</option>
                <option>Mensal</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de Início</Label>
              <Input id="startTime" type="time" value={event.startTime} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora de Fim</Label>
              <Input id="endTime" type="time" value={event.endTime} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              type="text"
              value={event.location}
              placeholder="Adicionar localização"
            />
          </div>
          <div className="space-y-2">
            <Label>Código de Cores</Label>
            <div className="flex gap-2 pt-2">
              {[
                "bg-red-500",
                "bg-blue-500",
                "bg-green-500",
                "bg-yellow-500",
                "bg-purple-500",
              ].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full ${color} ${
                    event.color === color
                      ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-offset-gray-900 dark:ring-white"
                      : ""
                  }`}
                ></button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>Anexos</Label>
            <div className="flex flex-wrap gap-2">
              {event.attachments?.map((file) => (
                <a
                  href={file.url}
                  key={file.id}
                  className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
                >
                  <Paperclip className="h-4 w-4" /> {file.name}
                </a>
              ))}
            </div>
            <Button variant="outline" size="default" className="w-full text-sm">
              Adicionar anexo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
// --- End: Event Detail Modal Component ---

/**
 * Sidebar Component
 */
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
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-900 transition-colors hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50"
        >
          <Home className="h-5 w-5" />
        </a>
        <a
          href="/tasks"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
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

/**
 * Day Summary Module
 */
function DailySummaryCard() {
  const [activeTab, setActiveTab] = useState<
    "today" | "tomorrow" | "next7days"
  >("today");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleTaskClick = (task: Task) => setSelectedTask(task);
  const handleEventClick = (event: Event) => setSelectedEvent(event);

  const renderContent = () => {
    const tasksForTab = mockTasks.filter((t) => t.day === activeTab);
    const eventsForTab = mockEvents.filter((e) => e.day === activeTab);

    if (activeTab === "next7days") {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overview of tasks and events for the upcoming week.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-800 dark:text-gray-200">
            Tasks
          </h4>
          <div className="mt-2 space-y-2">
            {tasksForTab.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer"
              >
                <Checkbox id={task.id} />
                <div
                  className={`w-2 h-2 rounded-full ${task.color} shrink-0`}
                ></div>
                <label
                  htmlFor={task.id}
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {task.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">
            Events
          </h4>
          <div className="mt-2 space-y-2">
            {eventsForTab.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer"
              >
                <div
                  className={`w-2 h-2 rounded-full ${event.color} shrink-0`}
                ></div>
                <p className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  {event.name} - {event.startTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Day Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <TabsList>
            <TabsTrigger
              onClick={() => setActiveTab("today")}
              isActive={activeTab === "today"}
            >
              Today
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setActiveTab("tomorrow")}
              isActive={activeTab === "tomorrow"}
            >
              Tomorrow
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setActiveTab("next7days")}
              isActive={activeTab === "next7days"}
            >
              Next 7 Days
            </TabsTrigger>
          </TabsList>
          <div className="mt-4">{renderContent()}</div>
        </CardContent>
      </Card>
    </>
  );
}

/**
 * Daily Journal Module - Updated with Attachments
 */
function JournalCard() {
  const journalAttachments: Attachment[] = [
    { id: "journal-attach-1", name: "foto_do_dia.jpg", url: "#" },
  ];

  return (
    <Card className="col-span-1 flex flex-col">
      <CardHeader>
        <CardTitle>Daily Journal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="gratitude">What are you grateful for today?</Label>
          <Textarea
            id="gratitude"
            placeholder="Write something that made you smile..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memory">What memory do you want to cherish?</Label>
          <Textarea id="memory" placeholder="Describe a special moment..." />
        </div>
        {/* Attachments Section */}
        <div className="space-y-3 pt-2">
          <Label>Anexos</Label>
          <div className="flex flex-wrap gap-2">
            {journalAttachments.map((file) => (
              <a
                href={file.url}
                key={file.id}
                className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Paperclip className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-800 dark:text-gray-200">
                  {file.name}
                </span>
              </a>
            ))}
          </div>
          <Button variant="outline" size="default" className="w-full text-sm">
            <Paperclip className="h-4 w-4 mr-2" />
            Adicionar anexo
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Save Entry</Button>
      </CardFooter>
    </Card>
  );
}

// --- Start: New Ring Input Component for Habits ---
const RingInput = ({
  progress,
  total,
  onProgressChange,
  size = 60,
  stroke = 4,
}: {
  progress: number;
  total: number;
  onProgressChange: (newProgress: number) => void;
  size?: number;
  stroke?: number;
}) => {
  const radius = size / 2 - stroke * 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / total) * circumference;

  const handleClick = () => {
    const newProgress = (progress + 1) % (total + 1);
    onProgressChange(newProgress);
  };

  const isComplete = progress === total;

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer"
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`transition-all duration-300 ${
            isComplete ? "text-green-500" : "text-blue-500"
          }`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <div className="absolute flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
          {progress}/{total}
        </span>
      </div>
    </div>
  );
};
// --- End: New Ring Input Component ---

/**
 * Habits Tracker Module - With New Ring Input
 */
function HabitsPanelCard() {
  const [waterProgress, setWaterProgress] = useState(1);
  const waterGoal = 4;

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Habits Tracker</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Hábito Binário */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              Make bed
            </p>
            <p className="flex items-center text-sm text-orange-500">
              <Flame className="w-4 h-4 mr-1" /> 15 dias
            </p>
          </div>
          <Checkbox id="habit1" />
        </div>
        {/* Hábito Quantitativo (Água) com Anel */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              Drink water
            </p>
            <p className="flex items-center text-sm text-orange-500">
              <Flame className="w-4 h-4 mr-1" /> 5 dias
            </p>
          </div>
          <RingInput
            progress={waterProgress}
            total={waterGoal}
            onProgressChange={setWaterProgress}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Home Page component that organizes all modules.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-20">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm px-6">
          <h1 className="text-xl font-semibold">Home</h1>
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
        <main className="flex-1 p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <DailySummaryCard />
            <JournalCard />
            <HabitsPanelCard />
          </div>
        </main>
      </div>
    </div>
  );
}
