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

// --- Componentes UI (Refatorados com Variáveis CSS) ---
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-xl shadow-sm border ${className}`} // Removido p-6 e flex, pois o conteúdo já tem padding
    style={{
      backgroundColor: "var(--card-bg)",
      borderColor: "var(--card-border)",
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div
    className="p-6 border-b" // Mantido p-6 que estava no original
    style={{ borderColor: "var(--card-border)" }}
  >
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-bold">{children}</h3> // Alterado de lg para xl para bater com o original
);

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>; // Mantido p-6

const CardFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`p-6 border-t flex justify-end ${className}`} // Mantido p-6
    style={{ borderColor: "var(--card-border)" }}
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
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50";
  const variants = {
    default: "",
    ghost: "bg-transparent",
    outline: "border",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-8 w-8", // Trocado h-9 w-9 por h-8 w-8 do perfil/page
  };

  const style: React.CSSProperties =
    variant === "default"
      ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)" }
      : variant === "outline" // Adicionado estilo para outline border
      ? { borderColor: "var(--input-border)" }
      : {};

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md px-3 py-2 text-sm border transition-colors duration-300 ${
      props.className || ""
    }`} // Adicionado merge de className
    style={{
      borderColor: "var(--input-border)",
      backgroundColor: "var(--card-bg)",
      color: "var(--foreground)",
    }}
  />
);

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="text-sm font-medium mb-1 block" {...props}>
    {props.children}
  </label>
);

// Textarea refatorada para seguir o padrão do novo Input
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`flex min-h-[120px] w-full rounded-md border p-3 text-sm transition-colors duration-300 ${
      props.className || ""
    }`}
    style={{
      borderColor: "var(--input-border)",
      backgroundColor: "var(--card-bg)",
      color: "var(--foreground)",
    }}
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

  // Estado de loading agora dentro de um <main> temático
  if (loading || !user)
    return (
      <main
        className="flex-1 p-6 lg:p-8 transition-colors duration-300 flex items-center justify-center"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <p>Carregando...</p>
      </main>
    );

  return (
    <main
      className="flex-1 p-6 lg:p-8 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b"
          style={{ borderColor: "var(--card-border)" }} // Aplicada variável de borda
        >
          <h2 className="text-2xl font-bold">Registro Diário</h2>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="date"
              className="pl-10" // Input refatorado aceita className
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
                <Label>Pelo que você foi grato?</Label> {/* Label refatorada */}
                <Textarea // Textarea refatorada
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
                <Label>Qual memória você guardou?</Label> {/* Label refatorada */}
                <Textarea // Textarea refatorada
                  placeholder="Escreva aqui..."
                  value={journalEntry.memory}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setJournalEntry({ ...journalEntry, memory: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Anexos do Dia</Label> {/* Label refatorada */}
              <Button variant="outline" className="w-full text-sm"> {/* Button refatorado */}
                <Paperclip className="h-4 w-4 mr-2" />
                Adicionar Anexo
              </Button>
            </div>
            <div className="border-t" style={{ borderColor: "var(--card-border)" }}></div> {/* Borda com variável */}
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
            <Button onClick={handleSaveJournal} disabled={isSaving}> {/* Button refatorado */}
              {isSaving ? "Salvando..." : "Salvar Diário"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
