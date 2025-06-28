"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import {
  X,
  Flame,
  Repeat,
  Plus,
  Check,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- Estrutura de Dados Refatorada ---
type Habit = {
  id: string;
  name: string;
  type: "binario" | "quantitativo";
  goal: number; // 1 para binário, N para quantitativo
  color: string;
  dailyProgress?: { [date: string]: number };
  createdAt: Timestamp;
};

const availableColors = [
  "text-red-500",
  "text-yellow-500",
  "text-green-500",
  "text-blue-500",
  "text-purple-500",
  "text-pink-500",
];

// --- Componentes UI (Com Tipagem Refinada) ---
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
const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;

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
    className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
  >
    {props.children}
  </label>
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
  >
    {props.children}
  </select>
);

// --- Modal de Hábito (Refatorado) ---
function HabitModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  habit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Partial<Habit>) => void;
  onDelete?: (habitId: string) => void;
  habit: Partial<Habit> | null;
}) {
  const [currentHabit, setCurrentHabit] = useState(habit);
  useEffect(() => {
    setCurrentHabit(habit);
  }, [habit]);

  if (!isOpen || !currentHabit) return null;

  const handleSave = () => {
    if (currentHabit.name) {
      onSave(currentHabit);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h3 className="text-lg font-semibold">
            {currentHabit.id ? "Editar Hábito" : "Novo Hábito"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="habitName">Nome</Label>
            <Input
              id="habitName"
              value={currentHabit.name || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentHabit({ ...currentHabit, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="habitType">Tipo</Label>
            <Select
              id="habitType"
              value={currentHabit.type || "binario"}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setCurrentHabit({
                  ...currentHabit,
                  type: e.target.value as Habit["type"],
                  goal:
                    e.target.value === "binario" ? 1 : currentHabit.goal || 1,
                })
              }
            >
              <option value="binario">Diário (Sim/Não)</option>
              <option value="quantitativo">Quantitativo (Contagem)</option>
            </Select>
          </div>
          {currentHabit.type === "quantitativo" && (
            <div className="space-y-2">
              <Label htmlFor="habitGoal">Meta Diária</Label>
              <Input
                id="habitGoal"
                type="number"
                min="1"
                value={currentHabit.goal || 1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentHabit({
                    ...currentHabit,
                    goal: parseInt(e.target.value, 10) || 1,
                  })
                }
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-3 pt-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    setCurrentHabit({ ...currentHabit, color: color })
                  }
                  className={`w-8 h-8 rounded-full ${color.replace(
                    "text-",
                    "bg-"
                  )} ${
                    currentHabit.color === color
                      ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white"
                      : ""
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center border-t dark:border-gray-800">
          {currentHabit.id && onDelete ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(currentHabit.id!)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          ) : (
            <div></div>
          )}
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

// --- Componente do Grid de Hábitos ---
const HabitGrid = ({
  habits,
  week,
  onProgress,
  onEdit,
}: {
  habits: Habit[];
  week: Date[];
  onProgress: (habit: Habit, date: Date, progress: number) => void;
  onEdit: (habit: Habit) => void;
}) => {
  const calculateStreak = (habit: Habit): number => {
    let currentStreak = 0;
    const today = new Date(); // Corrigido para const
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dateToCheck = new Date(today);
      dateToCheck.setDate(today.getDate() - i);
      const dateStr = dateToCheck.toISOString().split("T")[0];
      const progress = habit.dailyProgress?.[dateStr] || 0;
      if (progress >= habit.goal) {
        currentStreak++;
      } else {
        if (dateToCheck.getTime() === today.getTime() && i === 0) {
          continue;
        }
        break;
      }
    }
    return currentStreak;
  };

  return (
    <div
      className="grid gap-x-2 gap-y-4 overflow-x-auto"
      style={{
        gridTemplateColumns:
          "minmax(150px, 1.5fr) repeat(7, minmax(50px, 1fr)) minmax(100px, 0.5fr)",
      }}
    >
      <div className="font-semibold text-sm sticky left-0 bg-white dark:bg-gray-900 z-10 pr-2">
        Hábito
      </div>
      {week.map((day, i) => (
        <div key={i} className="text-center font-semibold text-sm">
          <div className="text-xs text-gray-500">
            {day.toLocaleDateString("pt-BR", { weekday: "short" })}
          </div>
          <div>{day.getDate()}</div>
        </div>
      ))}
      <div className="sticky right-0 bg-white dark:bg-gray-900"></div>

      {habits.map((habit) => {
        const streak = calculateStreak(habit);
        return (
          <React.Fragment key={habit.id}>
            <div className="flex items-center gap-2 font-medium sticky left-0 bg-white dark:bg-gray-900 z-10 pr-2">
              <Repeat className={`w-4 h-4 ${habit.color} shrink-0`} />
              <span>{habit.name}</span>
            </div>
            {week.map((day) => {
              const dateStr = day.toISOString().split("T")[0];
              const progress = habit.dailyProgress?.[dateStr] || 0;
              const isComplete = progress >= habit.goal;
              const handleClick = () => {
                if (habit.type === "binario") {
                  onProgress(habit, day, isComplete ? 0 : 1);
                } else {
                  onProgress(habit, day, progress + 1);
                }
              };

              return (
                <div key={dateStr} className="flex items-center justify-center">
                  <button
                    onClick={handleClick}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-white ${
                      isComplete
                        ? `${habit.color.replace("text-", "bg-")}`
                        : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {isComplete && habit.type === "binario" && (
                      <Check className="w-5 h-5" />
                    )}
                    {habit.type === "quantitativo" && (
                      <span className="text-xs font-bold text-black dark:text-white">
                        {progress}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
            <div className="flex items-center justify-end gap-1 sticky right-0 bg-white dark:bg-gray-900 z-10 pl-2">
              <div className="flex items-center gap-1 text-sm text-orange-500">
                <Flame className="w-4 h-4" />
                <span>{streak}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(habit)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// --- Componente Principal ---
export default function HabitsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay());
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Partial<Habit> | null>(null);

  useEffect(() => {
    if (!user && !loading) {
      router.push("/sign-in");
    }
    if (user) {
      const habitsRef = collection(db, "users", user.uid, "habits");
      const unsubscribe = onSnapshot(habitsRef, (snapshot) => {
        const habitsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Habit)
        );
        setHabits(habitsData);
      });
      return () => unsubscribe();
    }
  }, [user, loading, router]);

  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    if (!user) return;
    const { id, ...dataToSave } = habitData;
    if (id) {
      await updateDoc(doc(db, "users", user.uid, "habits", id), dataToSave);
    } else {
      await addDoc(collection(db, "users", user.uid, "habits"), {
        ...dataToSave,
        dailyProgress: {},
        createdAt: Timestamp.now(),
      });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "habits", habitId));
  };

  const handleProgress = async (
    habit: Habit,
    date: Date,
    newProgress: number
  ) => {
    if (!user) return;
    const dateStr = date.toISOString().split("T")[0];
    const updatedProgress = { ...habit.dailyProgress, [dateStr]: newProgress };
    await updateDoc(doc(db, "users", user.uid, "habits", habit.id), {
      dailyProgress: updatedProgress,
    });
  };

  const handleOpenModal = (habit: Partial<Habit> | null) => {
    setEditingHabit(
      habit || { name: "", type: "binario", goal: 1, color: availableColors[0] }
    );
    setIsModalOpen(true);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  const changeWeek = (offset: number) =>
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + offset * 7);
      return newDate;
    });

  if (loading || !user)
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );

  return (
    <main className="flex-1 p-6 lg:p-8 space-y-6">
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        habit={editingHabit}
      />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentWeekStart(() => {
                const today = new Date();
                today.setDate(today.getDate() - today.getDay());
                today.setHours(0, 0, 0, 0);
                return today;
              })
            }
          >
            Esta Semana
          </Button>
          <Button variant="outline" size="icon" onClick={() => changeWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => handleOpenModal(null)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Hábito
        </Button>
      </div>
      <Card>
        <CardContent>
          <HabitGrid
            habits={habits}
            week={weekDays}
            onProgress={handleProgress}
            onEdit={handleOpenModal}
          />
        </CardContent>
      </Card>
    </main>
  );
}
