"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  Check,
  CheckCircle2,
  Repeat,
  Clock,
  Calendar,
  Paperclip,
} from "lucide-react";

// --- Estruturas de Dados ---
type Task = { id: string; name: string; completed: boolean; date?: string };
type Event = { id: string; name: string; startTime?: string; date: string };
type Habit = {
  id: string;
  name: string;
  goal: number;
  dailyProgress?: { [date: string]: number };
};
type Attachment = { id: string; name: string; url: string };
type JournalEntry = {
  gratitude: string;
  memory: string;
  attachments?: Attachment[];
  date?: string;
};

// --- Componentes UI Mock (Com Tipagem Refinada) ---
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
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 border-b dark:border-gray-800">{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-bold">{children}</h3>
);
const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;
const CardFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`p-6 border-t dark:border-gray-800 flex justify-end ${className}`}
  >
    {children}
  </div>
);

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
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
  const variants = {
    default:
      "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    outline: "border border-gray-200 dark:border-gray-700",
  };
  const sizes = { default: "h-10 py-2 px-4", icon: "h-9 w-9" };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${
      props.className || ""
    }`}
  />
);

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    {...props}
    className="text-sm font-medium text-gray-600 dark:text-gray-400"
  >
    {props.children}
  </label>
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`flex min-h-[120px] w-full rounded-md border border-gray-200 bg-transparent p-3 text-sm dark:border-gray-800 ${
      props.className || ""
    }`}
  />
);

export default function DailyJournalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [journalEntry, setJournalEntry] = useState<JournalEntry>({
    gratitude: "",
    memory: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const toYYYYMMDD = (date: Date) => date.toISOString().split("T")[0];

  useEffect(() => {
    if (!user && !loading) {
      router.push("/sign-in");
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

      return () => {
        unsubTasks();
        unsubEvents();
        unsubHabits();
      };
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const dateStr = toYYYYMMDD(selectedDate);
      const docRef = doc(db, "users", user.uid, "journal_entries", dateStr);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          setJournalEntry(docSnap.data() as JournalEntry);
        } else {
          setJournalEntry({ gratitude: "", memory: "" });
        }
      });
    }
  }, [selectedDate, user]);

  const dailyData = useMemo(() => {
    const dateStr = toYYYYMMDD(selectedDate);
    return {
      tasks: tasks.filter((t) => t.date === dateStr && t.completed),
      events: events.filter((e) => e.date === dateStr),
      habits: habits.filter((h) => (h.dailyProgress?.[dateStr] || 0) >= h.goal),
    };
  }, [selectedDate, tasks, events, habits]);

  const handleSaveJournal = async () => {
    if (!user) return;
    setIsSaving(true);
    const dateStr = toYYYYMMDD(selectedDate);
    const docRef = doc(db, "users", user.uid, "journal_entries", dateStr);
    await setDoc(docRef, { ...journalEntry, date: dateStr }, { merge: true });
    setIsSaving(false);
    alert("Diário salvo com sucesso!");
  };

  if (loading || !user)
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b dark:border-gray-800">
          <h2 className="text-2xl font-bold">Registro Diário</h2>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="date"
              className="pl-10"
              value={toYYYYMMDD(selectedDate)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSelectedDate(new Date(e.target.value + "T00:00:00"))
              }
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label>Pelo que você foi grato?</Label>
                <Textarea
                  placeholder="Escreva aqui..."
                  value={journalEntry.gratitude}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setJournalEntry({
                      ...journalEntry,
                      gratitude: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Qual memória você guardou?</Label>
                <Textarea
                  placeholder="Escreva aqui..."
                  value={journalEntry.memory}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setJournalEntry({ ...journalEntry, memory: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Anexos do Dia</Label>
              <Button variant="outline" className="w-full text-sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Adicionar Anexo
              </Button>
            </div>
            <div className="border-t dark:border-gray-800"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Tarefas
                  Concluídas
                </h4>
                <ul className="list-none space-y-2 pl-2">
                  {dailyData.tasks.length > 0 ? (
                    dailyData.tasks.map((t) => (
                      <li
                        key={t.id}
                        className="text-sm flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        {t.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">Nenhuma tarefa.</li>
                  )}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" /> Eventos do Dia
                </h4>
                <ul className="list-none space-y-2 pl-2">
                  {dailyData.events.length > 0 ? (
                    dailyData.events.map((e) => (
                      <li key={e.id} className="text-sm">
                        {e.startTime} - {e.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">Nenhum evento.</li>
                  )}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-orange-500" /> Hábitos
                  Praticados
                </h4>
                <ul className="list-none space-y-2 pl-2">
                  {dailyData.habits.length > 0 ? (
                    dailyData.habits.map((h) => (
                      <li key={h.id} className="text-sm">
                        {h.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">Nenhum hábito.</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveJournal} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Diário"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
