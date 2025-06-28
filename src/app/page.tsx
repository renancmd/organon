"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Home,
  ListChecks,
  CalendarDays,
  Repeat,
  GanttChart,
  CircleUserRound,
  Bell,
  Check,
  Flame,
  Minus,
  Plus,
  X,
  Paperclip,
  Edit,
  Trash2,
} from "lucide-react";

// --- ESTRUTURAS DE DADOS ---
type Area = { id: string; name: string; color: string };
type SubTask = { id: string; name: string; completed: boolean };
type Attachment = { id: string; name: string; url: string };
type Task = {
  id: string;
  name: string;
  description?: string;
  date?: string;
  time?: string;
  priority: "Baixa" | "Média" | "Alta" | "Urgente";
  completed: boolean;
  subtasks: SubTask[];
  color: string;
  attachments?: Attachment[];
};
type Event = {
  id: string;
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color: string;
  location?: string;
  recurrence?: "Nenhuma" | "Diário" | "Semanal" | "Mensal";
  attachments?: Attachment[];
};
type Habit = {
  id: string;
  name: string;
  type: "binario" | "quantitativo";
  goal: number;
  streak: number;
  color: string;
  dailyProgress?: { [date: string]: number };
  duration?: number;
};
type JournalEntry = {
  gratitude: string;
  memory: string;
  attachments?: Attachment[];
};

// --- COMPONENTES UI MOCK ---
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6">{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);
const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pt-0 flex-1 ${className}`}>{children}</div>;
const CardFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center p-6 pt-0">{children}</div>
);

// CORREÇÃO 1: TIPAGEM DO BOTÃO
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
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
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
  const variants = {
    default:
      "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    outline: "border border-gray-200 dark:border-gray-700",
  };
  const sizes = { default: "h-10 px-4 py-2", icon: "h-9 w-9" };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
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
  onChange?: (checked: boolean) => void;
}) => (
  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
    <input
      id={id}
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange?.(e.target.checked)}
      className="h-4 w-4 shrink-0 rounded-sm border-gray-300"
    />
  </div>
);
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm ${
      props.className || ""
    }`}
    {...props}
  />
);
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="text-sm font-medium" {...props}>
    {props.children}
  </label>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${
      props.className || ""
    }`}
  />
);
const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
  >
    {props.children}
  </select>
);
const Tabs = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);
const TabsList = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 dark:bg-gray-800">
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
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
      isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
    }`}
  >
    {children}
  </button>
);
const TabsContent = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4">{children}</div>
);

// --- MODAIS COMPLETOS ---
const TaskDetailModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
  areas,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  task: Partial<Task> | null;
  areas: Area[];
}) => {
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(task);
  useEffect(() => {
    setCurrentTask(task);
  }, [task]);
  if (!isOpen || !currentTask) return null;
  const handleSave = () => {
    onSave(currentTask);
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative z-50 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Editar Tarefa</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X />
          </Button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <Input
            value={currentTask.name || ""}
            // CORREÇÃO 2.1: TIPO DE EVENTO
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCurrentTask({ ...currentTask, name: e.target.value })
            }
          />
          <Textarea
            value={currentTask.description || ""}
            // CORREÇÃO 2.2: TIPO DE EVENTO
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setCurrentTask({ ...currentTask, description: e.target.value })
            }
          />
        </div>
        <div className="p-4 flex justify-between items-center border-t">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(currentTask.id!)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>
    </div>
  );
};
const EventDetailModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<Event>) => void;
  onDelete: (eventId: string) => void;
  event: Partial<Event> | null;
}) => {
  const [currentEvent, setCurrentEvent] = useState(event);
  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);
  if (!isOpen || !currentEvent) return null;
  const handleSave = () => {
    onSave(currentEvent);
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative z-50 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Editar Evento</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X />
          </Button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            value={currentEvent.name || ""}
            // CORREÇÃO 2.3: TIPO DE EVENTO
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCurrentEvent({ ...currentEvent, name: e.target.value })
            }
          />
        </div>
        <div className="p-4 flex justify-between items-center border-t">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(currentEvent.id!)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES DO DASHBOARD ---
function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800 md:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <a
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 text-lg font-semibold text-white dark:bg-gray-50 dark:text-gray-900"
          title="Organon"
        >
          <span className="text-xl">O</span>
        </a>
        <a
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-900 dark:bg-gray-800"
        >
          <Home className="h-5 w-5" />
        </a>
        <a
          href="/tasks"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900"
        >
          <ListChecks className="h-5 w-5" />
        </a>
        <a
          href="/agenda"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900"
        >
          <CalendarDays className="h-5 w-5" />
        </a>
        <a
          href="/habitos"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900"
        >
          <Repeat className="h-5 w-5" />
        </a>
        <a
          href="/daily-journal"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900"
        >
          <GanttChart className="h-5 w-5" />
        </a>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <a
          href="/perfil"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900"
        >
          <CircleUserRound className="h-5 w-5" />
        </a>
      </nav>
    </aside>
  );
}

const DailySummaryCard = ({
  tasks,
  events,
  onTaskClick,
  onEventClick,
  onUpdateTask,
}: {
  tasks: Task[];
  events: Event[];
  onTaskClick: (t: Task) => void;
  onEventClick: (e: Event) => void;
  onUpdateTask: (t: Partial<Task>) => void; // Corrigido para Partial<Task> para corresponder ao uso
}) => {
  const [activeTab, setActiveTab] = useState<
    "today" | "tomorrow" | "next7days"
  >("today");

  const filteredData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    switch (activeTab) {
      case "today":
        return {
          tasks: tasks.filter((t) => t.date === todayStr && !t.completed),
          events: events.filter((e) => e.date === todayStr),
          isRange: false,
        };
      case "tomorrow":
        return {
          tasks: tasks.filter((t) => t.date === tomorrowStr && !t.completed),
          events: events.filter((e) => e.date === tomorrowStr),
          isRange: false,
        };
      case "next7days":
        return {
          tasks: tasks.filter((t) => {
            if (!t.date) return false;
            const d = new Date(t.date);
            d.setUTCHours(0, 0, 0, 0);
            return d >= today && d <= sevenDaysFromNow && !t.completed;
          }),
          events: events.filter((e) => {
            const d = new Date(e.date);
            d.setUTCHours(0, 0, 0, 0);
            return d >= today && d <= sevenDaysFromNow;
          }),
          isRange: true,
        };
      default:
        return { tasks: [], events: [], isRange: false };
    }
  }, [activeTab, tasks, events]);

  const formatDateForTab = (dateString: string) =>
    new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Resumo do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs>
          <TabsList>
            <TabsTrigger
              onClick={() => setActiveTab("today")}
              isActive={activeTab === "today"}
            >
              Hoje
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setActiveTab("tomorrow")}
              isActive={activeTab === "tomorrow"}
            >
              Amanhã
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setActiveTab("next7days")}
              isActive={activeTab === "next7days"}
            >
              Próximos 7 Dias
            </TabsTrigger>
          </TabsList>
          <TabsContent>
            <div className="space-y-4">
              <h4 className="font-medium text-sm pt-2">Tarefas</h4>
              {filteredData.tasks.length > 0 ? (
                filteredData.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <Checkbox
                      id={task.id}
                      checked={task.completed}
                      onChange={(c) =>
                        onUpdateTask({ id: task.id, completed: c })
                      }
                    />
                    <div
                      className={`w-2 h-2 rounded-full ${task.color} shrink-0`}
                    ></div>
                    <Label
                      htmlFor={task.id}
                      className="cursor-pointer"
                      onClick={() => onTaskClick(task)}
                    >
                      {task.name}
                    </Label>
                    {filteredData.isRange && (
                      <span className="ml-auto text-xs text-gray-500">
                        {formatDateForTab(task.date!)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhuma tarefa para este período.
                </p>
              )}
              <h4 className="font-medium text-sm pt-4">Eventos</h4>
              {filteredData.events.length > 0 ? (
                filteredData.events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        event.color || "bg-red-500"
                      } shrink-0`}
                    ></div>
                    <p className="text-sm">
                      {event.startTime} - {event.name}
                    </p>
                    {filteredData.isRange && (
                      <span className="ml-auto text-xs text-gray-500">
                        {formatDateForTab(event.date!)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhum evento para este período.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const JournalCard = ({
  onSave,
  initialEntry,
}: {
  onSave: (entry: JournalEntry) => void;
  initialEntry: JournalEntry;
}) => {
  const [entry, setEntry] = useState(initialEntry);
  useEffect(() => {
    setEntry(initialEntry);
  }, [initialEntry]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro do Dia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Pelo que você é grato hoje?</Label>
          <Textarea
            placeholder="Escreva aqui..."
            value={entry.gratitude}
            // CORREÇÃO 2.4: TIPO DE EVENTO
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setEntry({ ...entry, gratitude: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Qual memória você quer guardar?</Label>
          <Textarea
            placeholder="Escreva aqui..."
            value={entry.memory}
            // CORREÇÃO 2.5: TIPO DE EVENTO
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setEntry({ ...entry, memory: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Anexos</Label>
          <Button variant="outline" className="w-full text-sm font-normal">
            <Paperclip className="w-4 h-4 mr-2" />
            Adicionar Anexo
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onSave(entry)}>
          Salvar Registro
        </Button>
      </CardFooter>
    </Card>
  );
};

const HabitsPanelCard = ({
  habits,
  onUpdateProgress,
}: {
  habits: Habit[];
  onUpdateProgress: (habit: Habit, amount: number) => void;
}) => {
  const activeHabits = habits.filter(
    (h) => h.streak < (h.duration || Infinity)
  );
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Painel de Hábitos</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {activeHabits.length > 0 ? (
          activeHabits.map((habit) => {
            const progress = habit.dailyProgress?.[todayStr] || 0;
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{habit.name}</p>
                  <p className="flex items-center text-sm text-orange-500">
                    <Flame className="w-4 h-4 mr-1" /> {habit.streak} dias
                  </p>
                </div>
                {habit.type === "binario" ? (
                  <Checkbox
                    id={`h-${habit.id}`}
                    checked={progress >= 1}
                    onChange={(c) => onUpdateProgress(habit, c ? 1 : 0)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onUpdateProgress(habit, -1)}
                    >
                      <Minus />
                    </Button>
                    <span className="font-bold text-base w-12 text-center">
                      {progress}/{habit.goal}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onUpdateProgress(habit, 1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 col-span-full text-center">
            Nenhum hábito ativo. Crie um na página de Hábitos!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA HOME ---
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [journalEntry, setJournalEntry] = useState<JournalEntry>({
    gratitude: "",
    memory: "",
  });

  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Partial<Event> | null>(
    null
  );

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      const unsubTasks = onSnapshot(
        collection(db, "users", user.uid, "tasks"),
        (snap) =>
          setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task)))
      );
      const unsubEvents = onSnapshot(
        collection(db, "users", user.uid, "events"),
        (snap) =>
          setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event)))
      );
      const unsubHabits = onSnapshot(
        collection(db, "users", user.uid, "habits"),
        (snap) =>
          setHabits(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Habit)))
      );
      const unsubAreas = onSnapshot(
        collection(db, "users", user.uid, "areas"),
        (snap) =>
          setAreas(
            snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Area))
          )
      );

      const journalRef = doc(
        db,
        "users",
        user.uid,
        "journal_entries",
        todayStr
      );
      const unsubJournal = onSnapshot(journalRef, (docSnap) => {
        if (docSnap.exists()) {
          setJournalEntry(docSnap.data() as JournalEntry);
        } else {
          setJournalEntry({ gratitude: "", memory: "" });
        }
      });

      return () => {
        unsubTasks();
        unsubEvents();
        unsubHabits();
        unsubAreas();
        unsubJournal();
      };
    }
  }, [user, loading, router, todayStr]);

  const handleSaveTask = async (task: Partial<Task>) => {
    if (!user || !task.id) return;
    const taskRef = doc(db, "users", user.uid, "tasks", task.id);
    await updateDoc(taskRef, task);
  };
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
    setSelectedTask(null);
  };

  const handleSaveEvent = async (event: Partial<Event>) => {
    if (!user || !event.id) return;
    await updateDoc(doc(db, "users", user.uid, "events", event.id), event);
  };
  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "events", eventId));
    setSelectedEvent(null);
  };

  const handleUpdateHabitProgress = async (habit: Habit, amount: number) => {
    if (!user) return;
    const currentProgress = habit.dailyProgress?.[todayStr] || 0;
    const newProgress = Math.max(0, currentProgress + amount);
    const dailyProgress = { ...habit.dailyProgress, [todayStr]: newProgress };

    // Lógica de Streak simplificada
    const newStreak =
      newProgress >= habit.goal && currentProgress < habit.goal
        ? (habit.streak || 0) + 1
        : habit.streak;

    await updateDoc(doc(db, "users", user.uid, "habits", habit.id), {
      dailyProgress,
      streak: newStreak,
    });
  };
  const handleSaveJournal = async (entry: JournalEntry) =>
    await setDoc(
      doc(db, "users", user!.uid, "journal_entries", todayStr),
      entry,
      { merge: true }
    );

  if (loading || !user)
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-20">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm px-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell />
            </Button>
            <a href="/perfil">
              <Button variant="ghost" size="icon">
                <CircleUserRound />
              </Button>
            </a>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <TaskDetailModal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={handleSaveTask}
            onDelete={handleDeleteTask}
            task={selectedTask}
            areas={areas}
          />
          <EventDetailModal
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            event={selectedEvent}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <DailySummaryCard
              tasks={tasks}
              events={events}
              onTaskClick={(task) => setSelectedTask(task)}
              onEventClick={(event) => setSelectedEvent(event)}
              onUpdateTask={handleSaveTask}
            />
            <JournalCard
              onSave={handleSaveJournal}
              initialEntry={journalEntry}
            />
            <HabitsPanelCard
              habits={habits}
              onUpdateProgress={handleUpdateHabitProgress}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
