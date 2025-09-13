"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

// Simulação de hooks do Next.js para compatibilidade no ambiente
const useRouter = () => ({
  push: (href: string) => {
    window.location.hash = href;
  },
});


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
  Paperclip,
  MoreHorizontal,
  Calendar,
  Trash2,
  CheckSquare,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

// --- Estruturas de Dados ---
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

// --- Componentes UI (Refatorados com CSS Vars) ---
const Card = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={`relative rounded-xl shadow-sm border ${className}`}
    style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)"
    }}
  >
    {children}
  </div>
);

const Checkbox = ({
  id,
  checked,
  onChange,
  disabled,
  ...props
}: {
  id: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <div
    className="flex items-center pt-1"
    onClick={(e: React.MouseEvent) => e.stopPropagation()}
  >
    <input
      id={id}
      type="checkbox"
      checked={!!checked}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.(e.target.checked)
      }
      disabled={disabled}
      className="h-4 w-4 shrink-0 rounded-sm"
      style={{ borderColor: "var(--input-border)"}}
      {...props}
    />
  </div>
);

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "icon";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50";
  const sizes = { default: "h-10 px-4 py-2", icon: "h-10 w-10" };
  
  const style: React.CSSProperties =
    variant === "default"
      ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)" }
      : variant === "outline"
      ? { borderColor: "var(--card-border)", backgroundColor: "transparent" }
      : { backgroundColor: "transparent" };

  return (
    <button
      className={`${base} ${sizes[size]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ${className}`}
    style={{ borderColor: "var(--input-border)" }}
  />
);

const Textarea = ({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm ${className}`}
    style={{ borderColor: "var(--input-border)" }}
  />
);

const Label = ({
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    {...props}
    className="text-sm font-medium leading-none"
  >
    {children}
  </label>
);

const Select = ({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
    style={{ borderColor: "var(--input-border)" }}
  >
    {children}
  </select>
);

// --- MODAL DE TAREFA (Refatorado com CSS Vars) ---
function TaskModal({
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
}) {
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(task);
  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  if (!isOpen || !currentTask) return null;

  const isNewTask = !currentTask.id;

  const handleSave = () => {
    onSave(currentTask);
    onClose();
  };

  const handleSubtaskChange = (
    index: number,
    field: "name" | "completed",
    value: string | boolean
  ) => {
    const newSubtasks = [...(currentTask.subtasks || [])];
    newSubtasks[index] = { ...newSubtasks[index], [field]: value };
    setCurrentTask({ ...currentTask, subtasks: newSubtasks });
  };

  const handleAddSubtask = () =>
    setCurrentTask({
      ...currentTask,
      subtasks: [
        ...(currentTask.subtasks || []),
        { id: `sub-${Date.now()}`, name: "", completed: false },
      ],
    });

  const handleDeleteSubtask = (index: number) => {
    const newSubtasks = [...(currentTask.subtasks || [])];
    newSubtasks.splice(index, 1);
    setCurrentTask({ ...currentTask, subtasks: newSubtasks });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative z-50 w-full max-w-2xl rounded-2xl"
        style={{ backgroundColor: "var(--card-bg)" }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: "var(--card-border)"}}>
          <h3 className="text-lg font-semibold">
            {isNewTask ? "Nova Tarefa" : "Editar Tarefa"}
          </h3>
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
          <div className="flex items-center gap-4">
            <Checkbox
              id={`modal-status-${currentTask.id}`}
              checked={currentTask.completed}
              onChange={(c) => setCurrentTask({ ...currentTask, completed: c })}
              disabled={isNewTask}
            />
            <Input
              placeholder="Nome da Tarefa"
              value={currentTask.name || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentTask({ ...currentTask, name: e.target.value })
              }
              className="text-lg font-semibold border-none !h-auto !p-0 focus-visible:ring-0"
            />
          </div>
          <Textarea
            placeholder="Descrição..."
            value={currentTask.description || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setCurrentTask({ ...currentTask, description: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-date">Data</Label>
              <Input
                id="task-date"
                type="date"
                value={currentTask.date || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentTask({ ...currentTask, date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="task-time">Hora (Opcional)</Label>
              <Input
                id="task-time"
                type="time"
                value={currentTask.time || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentTask({ ...currentTask, time: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-priority">Prioridade</Label>
              <Select
                id="task-priority"
                value={currentTask.priority || "Média"}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setCurrentTask({
                    ...currentTask,
                    priority: e.target.value as Task["priority"],
                  })
                }
              >
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
                <option>Urgente</option>
              </Select>
            </div>
            <div>
              <Label>Área</Label>
              <div className="flex gap-2 pt-2">
                {areas.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() =>
                      setCurrentTask({ ...currentTask, color: a.color })
                    }
                    className={`w-8 h-8 rounded-full ${a.color} ${
                      currentTask.color === a.color
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : ""
                    }`}
                    aria-label={`Selecionar área ${a.name}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sub-tarefas</Label>
            <div className="space-y-2">
              {currentTask.subtasks?.map((sub, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Checkbox
                    id={sub.id}
                    checked={sub.completed}
                    onChange={(c) => handleSubtaskChange(i, "completed", c)}
                  />
                  <Input
                    value={sub.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSubtaskChange(i, "name", e.target.value)
                    }
                    className="h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteSubtask(i)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full text-sm mt-2"
              onClick={handleAddSubtask}
            >
              Adicionar Sub-tarefa
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Anexos</Label>
            <Button variant="outline" className="w-full text-sm">
              <Paperclip className="w-4 h-4 mr-2" />
              Adicionar Anexo
            </Button>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center border-t" style={{ borderColor: "var(--card-border)"}}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(currentTask.id!)}
            disabled={isNewTask}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE: Dropdown de Tarefas Concluídas ---
const CompletedTasksDropdown = ({
  tasks,
  onTaskClick,
  onUpdateTask,
}: {
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  onUpdateTask: (t: Partial<Task>) => void;
}) => {
  if (tasks.length === 0) return null;
  return (
    <details className="mt-6 rounded-lg border group" style={{ borderColor: "var(--card-border)"}}>
      <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span>Completadas</span>
          <span className="text-sm text-gray-500">({tasks.length})</span>
        </div>
        <ChevronDown className="transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-t p-4 space-y-2" style={{ borderColor: "var(--card-border)"}}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 text-sm text-gray-500"
          >
            <Checkbox
              id={`c-${task.id}`}
              checked={task.completed}
              onChange={(c) => onUpdateTask({ id: task.id, completed: c })}
            />
            <span
              className="line-through cursor-pointer hover:opacity-80"
              onClick={() => onTaskClick(task)}
            >
              {task.name}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
};

// --- VISUALIZAÇÕES ATUALIZADAS ---
const KanbanView = ({
  tasks,
  areas,
  onTaskClick,
  onUpdateTask,
  onTaskDrop,
}: {
  tasks: Task[];
  areas: Area[];
  onTaskClick: (t: Task) => void;
  onUpdateTask: (t: Partial<Task>) => void;
  onTaskDrop: (taskId: string, newColor: string) => void;
}) => {
  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", {
          month: "short",
          day: "numeric",
        })
      : "";
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {areas.map((area) => (
        <div
          key={area.id}
          className="flex flex-col gap-4 p-2 rounded-lg"
          style={{ backgroundColor: "var(--background)"}}
          onDragOver={(e: React.DragEvent) => e.preventDefault()}
          onDrop={(e: React.DragEvent) => {
            e.preventDefault();
            onTaskDrop(e.dataTransfer.getData("taskId"), area.color);
          }}
        >
          <div className="flex items-center gap-2 px-2 pt-2">
            <div className={`w-3 h-3 rounded-full ${area.color}`}></div>
            <h2 className="font-semibold">{area.name}</h2>
          </div>
          <div className="flex flex-col gap-4 min-h-[200px]">
            {tasks
              .filter((task) => task.color === area.color)
              .map((task) => (
                <Card
                  key={task.id}
                  className="p-3 cursor-pointer group"
                  onClick={() => onTaskClick(task)}
                  draggable
                  onDragStart={(e: React.DragEvent) =>
                    e.dataTransfer.setData("taskId", task.id)
                  }
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`k-${task.id}`}
                      checked={task.completed}
                      onChange={(c) =>
                        onUpdateTask({ id: task.id, completed: c })
                      }
                    />
                    <p
                      className={`text-sm ${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pl-7">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {task.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.date)}
                        </span>
                      )}
                      {task.subtasks?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" />
                          {task.subtasks.filter((s) => s.completed).length}/
                          {task.subtasks.length}
                        </span>
                      )}
                    </div>
                    {/* Cores semânticas são mantidas */}
                    <div
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        task.priority === "Urgente" || task.priority === "Alta"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                      }`}
                    >
                      {task.priority}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ListView = ({
  tasks,
  areas,
  onTaskClick,
  onUpdateTask,
  onDeleteTask,
  onTaskDrop,
}: {
  tasks: Task[];
  areas: Area[];
  onTaskClick: (t: Task) => void;
  onUpdateTask: (t: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onTaskDrop: (taskId: string, newColor: string) => void;
}) => (
  <div className="space-y-6">
    {areas.map((area) => (
      <div
        key={area.id}
        onDragOver={(e: React.DragEvent) => e.preventDefault()}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault();
          const taskId = e.dataTransfer.getData("taskId");
          onTaskDrop(taskId, area.color);
        }}
      >
        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className={`w-3 h-3 rounded-full ${area.color}`}></div>
          <h2 className="font-semibold">{area.name}</h2>
        </div>
        <div className="space-y-2">
          {tasks
            .filter((task) => task.color === area.color)
            .map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-grab"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}
                draggable
                onDragStart={(e: React.DragEvent) =>
                  e.dataTransfer.setData("taskId", task.id)
                }
              >
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <Checkbox
                    id={`l-${task.id}`}
                    checked={task.completed}
                    onChange={(c) =>
                      onUpdateTask({ id: task.id, completed: c })
                    }
                  />
                  <span
                    className={
                      task.completed ? "line-through text-gray-500" : ""
                    }
                  >
                    {task.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {task.date && (
                    <p className="hidden md:flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(task.date + "T00:00:00").toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  )}
                  <span className="hidden sm:inline-block text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "var(--background)"}}>
                    {task.priority}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTaskClick(task)}
                  >
                    <MoreHorizontal />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    ))}
  </div>
);
const EisenhowerMatrixView = ({
  tasks,
  onTaskClick,
  onPriorityDrop,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onPriorityDrop: (taskId: string, newPriority: Task["priority"]) => void;
}) => {
  const quadrants = {
    Urgente: tasks.filter((t) => t.priority === "Urgente" && !t.completed),
    Alta: tasks.filter((t) => t.priority === "Alta" && !t.completed),
    Média: tasks.filter((t) => t.priority === "Média" && !t.completed),
    Baixa: tasks.filter((t) => t.priority === "Baixa" && !t.completed),
  };
  const Quadrant = ({
    title,
    subtitle,
    tasks,
    bgColor,
    priority,
    onTaskClick,
  }: {
    title: string;
    subtitle: string;
    tasks: Task[];
    bgColor: string;
    priority: Task["priority"];
    onTaskClick: (task: Task) => void;
  }) => (
    <div
      className={`rounded-xl flex flex-col ${bgColor}`}
      onDragOver={(e: React.DragEvent) => e.preventDefault()}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault();
        onPriorityDrop(e.dataTransfer.getData("taskId"), priority);
      }}
    >
      <div className="p-4 border-b border-black/10 dark:border-white/10">
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm opacity-80">{subtitle}</p>
      </div>
      <div className="p-4 space-y-2 overflow-y-auto flex-1">
        {tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => onTaskClick(t)}
            className="p-2.5 rounded-lg cursor-pointer text-sm font-medium"
            style={{ backgroundColor: "rgba(var(--card-rgb), 0.8)"}}
            draggable
            onDragStart={(e: React.DragEvent) =>
              e.dataTransfer.setData("taskId", t.id)
            }
          >
            {t.name}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="grid grid-cols-[auto,1fr,1fr] grid-rows-[auto,1fr,1fr] gap-x-4 gap-y-2 h-[75vh]">
      <div className="col-start-2 text-center font-semibold p-2">Urgente</div>
      <div className="col-start-3 text-center font-semibold p-2">
        Não Urgente
      </div>
      <div className="row-start-2 flex items-center justify-center -rotate-90 font-semibold p-2">
        Importante
      </div>
      <div className="row-start-3 flex items-center justify-center -rotate-90 font-semibold p-2">
        Não Importante
      </div>
      <Quadrant
        title="Fazer"
        subtitle="Urgente e Importante"
        tasks={quadrants.Urgente}
        bgColor="bg-red-100 dark:bg-red-900/40"
        priority="Urgente"
        onTaskClick={onTaskClick}
      />
      <Quadrant
        title="Decidir"
        subtitle="Importante, Não Urgente"
        tasks={quadrants.Alta}
        bgColor="bg-blue-100 dark:bg-blue-900/40"
        priority="Alta"
        onTaskClick={onTaskClick}
      />
      <Quadrant
        title="Delegar"
        subtitle="Urgente, Não Importante"
        tasks={quadrants.Média}
        bgColor="bg-yellow-100 dark:bg-yellow-900/40"
        priority="Média"
        onTaskClick={onTaskClick}
      />
      <Quadrant
        title="Eliminar"
        subtitle="Não Urgente, Não Importante"
        tasks={quadrants.Baixa}
        bgColor="bg-green-100 dark:bg-green-900/40"
        priority="Baixa"
        onTaskClick={onTaskClick}
      />
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [view, setView] = useState<"kanban" | "list" | "matrix">("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

  const { activeTasks, completedTasks } = useMemo(() => {
    const allTasks = tasks.sort(
      (a, b) =>
        (a.date ? new Date(a.date).getTime() : Infinity) -
        (b.date ? new Date(b.date).getTime() : Infinity)
    );
    return {
      activeTasks: allTasks.filter((t) => !t.completed),
      completedTasks: allTasks.filter((t) => t.completed),
    };
  }, [tasks]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
    if (user) {
      const areasRef = collection(db, "users", user.uid, "areas");
      const tasksRef = collection(db, "users", user.uid, "tasks");
      const unsubAreas = onSnapshot(areasRef, (snapshot) =>
        setAreas(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Area))
        )
      );
      const unsubTasks = onSnapshot(tasksRef, (snapshot) =>
        setTasks(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task))
        )
      );
      return () => {
        unsubAreas();
        unsubTasks();
      };
    }
  }, [user, loading, router]);

  const handleOpenModal = (task: Partial<Task> | null) => {
    setEditingTask(
      task || {
        name: "",
        priority: "Média",
        color: areas[0]?.color || "bg-gray-500",
        subtasks: [],
        completed: false,
      }
    );
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!user) return;
    const { id, ...dataToSave } = taskData;
    try {
      if (id) {
        await updateDoc(doc(db, "users", user.uid, "tasks", id), dataToSave);
      } else {
        await addDoc(collection(db, "users", user.uid, "tasks"), {
          ...dataToSave,
          createdAt: new Date().toISOString(),
          completed: false,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !taskId) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  };

  const handleTaskDrop = async (taskId: string, newColor: string) => {
    if (!user || !taskId) return;
    await updateDoc(doc(db, "users", user.uid, "tasks", taskId), {
      color: newColor,
    });
  };

  const handlePriorityDrop = async (
    taskId: string,
    newPriority: Task["priority"]
  ) => {
    if (!user || !taskId) return;
    await updateDoc(doc(db, "users", user.uid, "tasks", taskId), {
      priority: newPriority,
    });
  };

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 transition-colors duration-300" style={{ backgroundColor: "var(--background)", color: "var(--foreground)"}}>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        areas={areas}
      />
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 rounded-lg p-1" style={{ backgroundColor: "var(--card-bg)"}}>
          <Button
            variant={view === "kanban" ? "default" : "ghost"}
            onClick={() => setView("kanban")}
          >
            Kanban
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            onClick={() => setView("list")}
          >
            Lista
          </Button>
          <Button
            variant={view === "matrix" ? "default" : "ghost"}
            onClick={() => setView("matrix")}
          >
            Matriz
          </Button>
        </div>
        <Button onClick={() => handleOpenModal(null)}>Nova Tarefa</Button>
      </header>

      {view === "kanban" && (
        <>
          <KanbanView
            tasks={activeTasks}
            areas={areas}
            onTaskClick={handleOpenModal}
            onUpdateTask={handleSaveTask}
            onTaskDrop={handleTaskDrop}
          />
          <CompletedTasksDropdown
            tasks={completedTasks}
            onTaskClick={handleOpenModal}
            onUpdateTask={handleSaveTask}
          />
        </>
      )}
      {view === "list" && (
        <>
          <ListView
            tasks={activeTasks}
            areas={areas}
            onTaskClick={handleOpenModal}
            onUpdateTask={handleSaveTask}
            onDeleteTask={handleDeleteTask}
            onTaskDrop={handleTaskDrop}
          />
          <CompletedTasksDropdown
            tasks={completedTasks}
            onTaskClick={handleOpenModal}
            onUpdateTask={handleSaveTask}
          />
        </>
      )}
      {view === "matrix" && (
        <EisenhowerMatrixView
          tasks={activeTasks}
          onTaskClick={handleOpenModal}
          onPriorityDrop={handlePriorityDrop}
        />
      )}
    </main>
  );
}

