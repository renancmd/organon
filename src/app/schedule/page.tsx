"use client";

import React, { useState, useMemo, useEffect } from "react";
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
} from "firebase/firestore";
import {
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";

// --- Estruturas de Dados ---
type Event = {
  id: string;
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color: string;
  location?: string;
  recurrence?: "Nenhuma" | "Diário" | "Semanal" | "Mensal";
  createdAt?: Date;
};

const availableColors = [
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
];

// --- Componentes UI Mock (Com Tipagem Refinada) ---
// O componente Card foi removido pois não era utilizado.

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
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50";
  const variantClasses = {
    default:
      "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    outline: "border border-gray-200 dark:border-gray-700",
  };
  const sizeClasses = { default: "h-10 py-2 px-4", icon: "h-9 w-9" };
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800`}
  >
    {props.children}
  </select>
);

// --- Modal de Evento ---
function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<Event>) => void;
  onDelete: (eventId: string) => void;
  event: Partial<Event> | null;
  selectedDate: Date;
}) {
  const [currentEvent, setCurrentEvent] = useState<Partial<Event> | null>(null);

  useEffect(() => {
    if (event) {
      const initialEvent = event.id
        ? event
        : { ...event, date: selectedDate.toISOString().split("T")[0] };
      setCurrentEvent(initialEvent);
    }
  }, [event, selectedDate]);

  if (!isOpen || !currentEvent) return null;

  const handleSave = () => {
    onSave(currentEvent);
    onClose();
  };

  const handleFieldChange = (field: keyof Event, value: string) =>
    setCurrentEvent((prev) => (prev ? { ...prev, [field]: value } : null));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative z-50 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h3 className="text-lg font-semibold">
            {currentEvent.id ? "Editar Evento" : "Novo Evento"}
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
            <Label>Nome do Evento</Label>
            <Input
              value={currentEvent.name || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFieldChange("name", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={currentEvent.date || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFieldChange("date", e.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="time"
                value={currentEvent.startTime || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFieldChange("startTime", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input
                type="time"
                value={currentEvent.endTime || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFieldChange("endTime", e.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Localização</Label>
            <Input
              value={currentEvent.location || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFieldChange("location", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Recorrência</Label>
            <Select
              value={currentEvent.recurrence || "Nenhuma"}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleFieldChange("recurrence", e.target.value)
              }
            >
              <option>Nenhuma</option>
              <option>Diário</option>
              <option>Semanal</option>
              <option>Mensal</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 pt-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleFieldChange("color", color)}
                  className={`w-8 h-8 rounded-full ${color} ${
                    currentEvent.color === color
                      ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white"
                      : ""
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center border-t dark:border-gray-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(currentEvent.id!)}
            disabled={!currentEvent.id}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

// --- Componente Calendário ---
const CalendarView = ({
  onDateClick,
  events,
  currentDate,
  selectedDate,
}: {
  onDateClick: (date: Date) => void;
  events: Event[];
  currentDate: Date;
  selectedDate: Date;
}) => {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : new Date(year, month, i - firstDay + 1)
  );
  return (
    <div className="grid grid-cols-7 gap-2">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
        <div
          key={day}
          className="text-center font-semibold text-xs text-gray-500 uppercase pb-2"
        >
          {day}
        </div>
      ))}
      {days.map((day, i) => {
        const isToday = day && day.toDateString() === new Date().toDateString();
        const isSelected =
          day && day.toDateString() === selectedDate.toDateString();
        return (
          <div
            key={i}
            onClick={() => day && onDateClick(day)}
            className={`p-2 h-28 rounded-lg flex flex-col cursor-pointer transition-colors border ${
              day
                ? "border-gray-200 dark:border-gray-800"
                : "border-transparent"
            } ${
              isSelected
                ? "bg-gray-100 dark:bg-gray-800"
                : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            }`}
          >
            {day && (
              <>
                <span
                  className={`font-semibold text-sm self-end ${
                    isToday
                      ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      : ""
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="flex-1 overflow-y-auto mt-1 space-y-1 text-[11px] font-medium">
                  {events
                    .filter((e) => e.date === day.toISOString().split("T")[0])
                    .map((e) => (
                      <div
                        key={e.id}
                        title={e.name}
                        className={`flex items-center gap-1.5 p-1 rounded ${e.color}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white/70"></div>
                        <span className="truncate text-white">{e.name}</span>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function AgendaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);

  useEffect(() => {
    if (!user && !loading) {
      router.push("/sign-in");
    }
    if (user) {
      const eventsRef = collection(db, "users", user.uid, "events");
      const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
        const eventsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Event)
        );
        setEvents(eventsData);
      });
      return () => unsubscribe();
    }
  }, [user, loading, router]);

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    if (!user) return;
    const { id, ...dataToSave } = eventData;
    if (id) {
      await updateDoc(doc(db, "users", user.uid, "events", id), dataToSave);
    } else {
      await addDoc(collection(db, "users", user.uid, "events"), {
        ...dataToSave,
        createdAt: new Date(),
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user || !eventId) return;
    await deleteDoc(doc(db, "users", user.uid, "events", eventId));
    setIsModalOpen(false);
  };

  const handleOpenModal = (event: Partial<Event> | null) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const selectedDayEvents = useMemo(() => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    return events
      .filter((e) => e.date === dateStr)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }, [selectedDate, events]);

  if (loading || !user)
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)]">
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={editingEvent}
        selectedDate={selectedDate}
      />
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold">
            {currentDate.toLocaleString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                )
              }
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                )
              }
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        <CalendarView
          onDateClick={setSelectedDate}
          events={events}
          currentDate={currentDate}
          selectedDate={selectedDate}
        />
      </main>
      <aside className="w-full lg:w-96 border-l dark:border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto">
        <Button
          onClick={() =>
            handleOpenModal({
              name: "",
              color: availableColors[0],
              recurrence: "Nenhuma",
            })
          }
        >
          Novo Evento
        </Button>
        <div>
          <h3 className="font-semibold text-lg mb-4">
            {selectedDate.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          <div className="space-y-3">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 group relative p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50"
                >
                  <div
                    className={`w-1.5 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${event.color}`}
                  ></div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleOpenModal(event)}
                  >
                    <p className="font-medium">{event.name}</p>
                    {event.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    )}
                    {event.startTime && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3" />
                        {event.startTime}{" "}
                        {event.endTime && `- ${event.endTime}`}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhum evento para este dia.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
