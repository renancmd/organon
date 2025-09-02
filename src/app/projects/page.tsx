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
  serverTimestamp,
  Timestamp, // Import Timestamp for date fields
} from "firebase/firestore";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  History,
  ArrowLeft,
  Trash2,
} from "lucide-react";

// --- ESTRUTURAS DE DADOS ---
type SubCheckpoint = { id: string; title: string; done: boolean };
type Checkpoint = {
  id: string;
  title: string;
  done: boolean;
  subCheckpoints: SubCheckpoint[];
};
type Goal = { id: string; title: string; checkpoints: Checkpoint[] };
type Objective = { id: string; title: string; goals: Goal[] };
type Project = {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  createdAt: Timestamp; // Correctly typed as Timestamp
  objectives: Objective[];
};
type HistoryLog = { id: string; text: string; timestamp: string };

// Tipos para manipulação de itens
type ItemType =
  | "project"
  | "objective"
  | "goal"
  | "checkpoint"
  | "subcheckpoint";

type ItemIds = {
  projectId?: string;
  objectiveId?: string;
  goalId?: string;
  checkpointId?: string;
  subCheckpointId?: string;
};

// --- COMPONENTES UI ---
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

const Card = ({ children, className = "", ...props }: CardProps) => (
  <div
    {...props}
    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col ${className}`}
  >
    {children}
  </div>
);

// Tipos e constantes para o componente Button
type ButtonVariant = "default" | "ghost" | "outline";
type ButtonSize = "default" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  default:
    "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900",
  ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
  outline: "border border-gray-200 dark:border-gray-700",
};

const buttonSizes: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  icon: "h-9 w-9",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const Button = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) => {
  const base: string =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50";

  return (
    <button
      className={`${base} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Checkbox = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 shrink-0 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
    />
  </div>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
    <div
      className="bg-blue-600 h-2 rounded-full"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${
      props.className || ""
    }`}
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`flex min-h-[80px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${
      props.className || ""
    }`}
  />
);

// --- CÁLCULOS DE PROGRESSO ---
const calculateCheckpointsProgress = (checkpoints: Checkpoint[]): number => {
  const total = checkpoints.reduce(
    (s, cp) => s + 1 + (cp.subCheckpoints?.length || 0),
    0
  );
  if (total === 0) return 0;
  const completed = checkpoints.reduce(
    (s, cp) =>
      s +
      (cp.done ? 1 : 0) +
      (cp.subCheckpoints?.filter((sc) => sc.done).length || 0),
    0
  );
  return (completed / total) * 100;
};

const calculateProjectProgress = (project: Project): number => {
  if (!project.objectives) return 0;
  const allGoals = project.objectives.flatMap((obj) => obj.goals);
  if (allGoals.length === 0) return 0;
  const progressSum = allGoals.reduce(
    (sum, goal) => sum + calculateCheckpointsProgress(goal.checkpoints),
    0
  );
  return progressSum / allGoals.length;
};

// --- COMPONENTES DA PÁGINA ---

const HistorySidebar = ({ logs }: { logs: HistoryLog[] }) => (
  <aside className="w-full lg:w-80 border-l dark:border-gray-800 p-6 flex-col gap-4 hidden lg:flex">
    <h3 className="font-semibold text-lg flex items-center gap-2">
      <History className="w-5 h-5" /> Histórico
    </h3>
    <div className="space-y-4 overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="text-sm">
          <p>{log.text}</p>
          <p className="text-xs text-gray-500">{log.timestamp}</p>
        </div>
      ))}
    </div>
  </aside>
);

const EditableTitle = ({
  title,
  onSave,
  className = "",
}: {
  title: string;
  onSave: (newTitle: string) => void;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(title);
  if (isEditing) {
    return (
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          onSave(text);
          setIsEditing(false);
        }}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSave(text);
            setIsEditing(false);
          }
        }}
        className={`h-auto p-0 border-none focus-visible:ring-0 ${className}`}
      />
    );
  }
  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded ${className}`}
    >
      {title}
    </span>
  );
};

const EditableTextarea = ({
  text,
  onSave,
  className = "",
}: {
  text: string;
  onSave: (newText: string) => void;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  if (isEditing) {
    return (
      <Textarea
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        onBlur={() => {
          onSave(currentText);
          setIsEditing(false);
        }}
        autoFocus
        className={`text-base ${className}`}
      />
    );
  }
  return (
    <p
      onClick={() => setIsEditing(true)}
      className={`mt-4 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded whitespace-pre-wrap ${className}`}
    >
      {text || "Adicione uma descrição completa."}
    </p>
  );
};

const ProjectDetailView = ({
  project,
  onBack,
  onUpdate,
  onAdd,
  onDelete,
  logs,
}: {
  project: Project;
  onBack: () => void;
  onUpdate: (p: Project) => void;
  onAdd: (type: ItemType, parentIds: ItemIds) => void;
  onDelete: (type: ItemType, ids: ItemIds) => void;
  logs: HistoryLog[];
}) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)]">
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="space-y-6">
          <div>
            <EditableTitle
              title={project.name}
              onSave={(newName) => onUpdate({ ...project, name: newName })}
              className="text-3xl font-bold"
            />
            <p className="text-sm text-gray-500 mt-1">
              Criado em:{" "}
              {project.createdAt?.toDate().toLocaleDateString("pt-BR")}
            </p>
            <EditableTextarea
              text={project.fullDescription}
              onSave={(newDescription) =>
                onUpdate({ ...project, fullDescription: newDescription })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Objetivos</h2>
            <Button
              onClick={() => onAdd("objective", { projectId: project.id })}
            >
              <Plus className="w-4 h-4 mr-2" /> Objetivo
            </Button>
          </div>
          <div className="space-y-4">
            {project.objectives.map((obj) => (
              <Card key={obj.id}>
                <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center group">
                  <EditableTitle
                    title={obj.title}
                    onSave={(newTitle) =>
                      onUpdate({
                        ...project,
                        objectives: project.objectives.map((o) =>
                          o.id === obj.id ? { ...o, title: newTitle } : o
                        ),
                      })
                    }
                  />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onAdd("goal", { objectiveId: obj.id })}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onDelete("objective", { objectiveId: obj.id })
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {obj.goals.map((goal) => {
                    const goalProgress = calculateCheckpointsProgress(
                      goal.checkpoints
                    );
                    return (
                      <div key={goal.id} className="p-2 rounded-lg group">
                        <div className="flex items-center justify-between">
                          <div
                            onClick={() => toggle(goal.id)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {expanded[goal.id] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <EditableTitle
                              title={goal.title}
                              onSave={(newTitle) =>
                                onUpdate({
                                  ...project,
                                  objectives: project.objectives.map((o) =>
                                    o.id === obj.id
                                      ? {
                                          ...o,
                                          goals: o.goals.map((g) =>
                                            g.id === goal.id
                                              ? { ...g, title: newTitle }
                                              : g
                                          ),
                                        }
                                      : o
                                  ),
                                })
                              }
                            />
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                onAdd("checkpoint", {
                                  objectiveId: obj.id,
                                  goalId: goal.id,
                                })
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                onDelete("goal", {
                                  objectiveId: obj.id,
                                  goalId: goal.id,
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        {expanded[goal.id] && (
                          <div className="pl-6 mt-2 space-y-3">
                            <ProgressBar progress={goalProgress} />
                            {goal.checkpoints.map((cp) => (
                              <div key={cp.id} className="group/item">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={cp.done}
                                      onChange={(c) =>
                                        onUpdate({
                                          ...project,
                                          objectives: project.objectives.map(
                                            (o) =>
                                              o.id === obj.id
                                                ? {
                                                    ...o,
                                                    goals: o.goals.map((g) =>
                                                      g.id === goal.id
                                                        ? {
                                                            ...g,
                                                            checkpoints:
                                                              g.checkpoints.map(
                                                                (cpt) =>
                                                                  cpt.id ===
                                                                  cp.id
                                                                    ? {
                                                                        ...cpt,
                                                                        done: c,
                                                                      }
                                                                    : cpt
                                                              ),
                                                          }
                                                        : g
                                                    ),
                                                  }
                                                : o
                                          ),
                                        })
                                      }
                                    />
                                    <EditableTitle
                                      title={cp.title}
                                      onSave={(newTitle) =>
                                        onUpdate({
                                          ...project,
                                          objectives: project.objectives.map(
                                            (o) =>
                                              o.id === obj.id
                                                ? {
                                                    ...o,
                                                    goals: o.goals.map((g) =>
                                                      g.id === goal.id
                                                        ? {
                                                            ...g,
                                                            checkpoints:
                                                              g.checkpoints.map(
                                                                (cpt) =>
                                                                  cpt.id ===
                                                                  cp.id
                                                                    ? {
                                                                        ...cpt,
                                                                        title:
                                                                          newTitle,
                                                                      }
                                                                    : cpt
                                                              ),
                                                          }
                                                        : g
                                                    ),
                                                  }
                                                : o
                                          ),
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        onAdd("subcheckpoint", {
                                          objectiveId: obj.id,
                                          goalId: goal.id,
                                          checkpointId: cp.id,
                                        })
                                      }
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        onDelete("checkpoint", {
                                          objectiveId: obj.id,
                                          goalId: goal.id,
                                          checkpointId: cp.id,
                                        })
                                      }
                                    >
                                      <Trash2 className="w-3 h-3 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="pl-6 space-y-1 mt-1">
                                  {cp.subCheckpoints.map((sub) => (
                                    <div
                                      key={sub.id}
                                      className="flex items-center gap-2 group/subitem"
                                    >
                                      <Checkbox
                                        checked={sub.done}
                                        onChange={(c) =>
                                          onUpdate({
                                            ...project,
                                            objectives: project.objectives.map(
                                              (o) =>
                                                o.id === obj.id
                                                  ? {
                                                      ...o,
                                                      goals: o.goals.map((g) =>
                                                        g.id === goal.id
                                                          ? {
                                                              ...g,
                                                              checkpoints:
                                                                g.checkpoints.map(
                                                                  (cpt) =>
                                                                    cpt.id ===
                                                                    cp.id
                                                                      ? {
                                                                          ...cpt,
                                                                          subCheckpoints:
                                                                            cpt.subCheckpoints.map(
                                                                              (
                                                                                s
                                                                              ) =>
                                                                                s.id ===
                                                                                sub.id
                                                                                  ? {
                                                                                      ...s,
                                                                                      done: c,
                                                                                    }
                                                                                  : s
                                                                            ),
                                                                        }
                                                                      : cpt
                                                                ),
                                                            }
                                                          : g
                                                      ),
                                                    }
                                                  : o
                                            ),
                                          })
                                        }
                                      />
                                      <EditableTitle
                                        title={sub.title}
                                        onSave={(newTitle) =>
                                          onUpdate({
                                            ...project,
                                            objectives: project.objectives.map(
                                              (o) =>
                                                o.id === obj.id
                                                  ? {
                                                      ...o,
                                                      goals: o.goals.map((g) =>
                                                        g.id === goal.id
                                                          ? {
                                                              ...g,
                                                              checkpoints:
                                                                g.checkpoints.map(
                                                                  (cpt) =>
                                                                    cpt.id ===
                                                                    cp.id
                                                                      ? {
                                                                          ...cpt,
                                                                          subCheckpoints:
                                                                            cpt.subCheckpoints.map(
                                                                              (
                                                                                s
                                                                              ) =>
                                                                                s.id ===
                                                                                sub.id
                                                                                  ? {
                                                                                      ...s,
                                                                                      title:
                                                                                        newTitle,
                                                                                    }
                                                                                  : s
                                                                            ),
                                                                        }
                                                                      : cpt
                                                                ),
                                                            }
                                                          : g
                                                      ),
                                                    }
                                                  : o
                                            ),
                                          })
                                        }
                                      />
                                      <div className="ml-auto opacity-0 group-hover/subitem:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() =>
                                            onDelete("subcheckpoint", {
                                              objectiveId: obj.id,
                                              goalId: goal.id,
                                              checkpointId: cp.id,
                                              subCheckpointId: sub.id,
                                            })
                                          }
                                        >
                                          <Trash2 className="w-3 h-3 text-red-500" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <HistorySidebar logs={logs} />
    </div>
  );
};

const ProjectsListView = ({
  projects,
  onSelect,
  onAdd,
}: {
  projects: Project[];
  onSelect: (p: Project) => void;
  onAdd: () => void;
}) => (
  <main className="flex-1 p-6 lg:p-8">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Projetos</h1>
      <Button onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" /> Novo Projeto
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((p) => {
        const progress = calculateProjectProgress(p);
        return (
          <Card
            key={p.id}
            onClick={() => onSelect(p)}
            className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">{p.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 min-h-[60px]">
                {p.description}
              </p>
            </div>
            <div className="p-6 pt-0 mt-auto">
              <div className="flex justify-between items-center mb-2 text-sm">
                <p>Progresso</p>
                <p className="font-semibold">{Math.round(progress)}%</p>
              </div>
              <ProgressBar progress={progress} />
            </div>
          </Card>
        );
      })}
    </div>
  </main>
);

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<HistoryLog[]>([]);

  useEffect(() => {
    if (!user && !loading) {
      router.push("/sign-in");
    }
    if (user) {
      const projectsRef = collection(db, "users", user.uid, "projects");
      const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
        const projectsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Project)
        );
        setProjects(projectsData);
      });
      return () => unsubscribe();
    }
  }, [user, loading, router]);

  const logAction = (text: string) => {
    const newLog: HistoryLog = {
      id: `log-${Date.now()}`,
      text,
      timestamp: new Date().toLocaleString("pt-BR"),
    };
    setHistory((prev) => [newLog, ...prev]);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    if (!user) return;
    const { id, ...dataToSave } = updatedProject;
    await updateDoc(doc(db, "users", user.uid, "projects", id), dataToSave);
    setSelectedProject(updatedProject);
  };

  const handleAdd = async (type: ItemType, parentIds?: ItemIds) => {
    const newName = prompt(`Digite o nome para o novo ${type}:`);
    if (!newName || !user) return;

    if (type === "project") {
      await addDoc(collection(db, "users", user.uid, "projects"), {
        name: newName,
        description: "Adicione uma breve descrição.",
        fullDescription: "Adicione uma descrição completa.",
        createdAt: serverTimestamp(),
        objectives: [],
      });
      return;
    }

    const projectToUpdate = JSON.parse(
      JSON.stringify(projects.find((p) => p.id === selectedProject?.id))
    );
    if (!projectToUpdate) return;

    switch (type) {
      case "objective":
        projectToUpdate.objectives.push({
          id: `obj-${Date.now()}`,
          title: newName,
          goals: [],
        });
        break;
      case "goal":
        projectToUpdate.objectives
          .find((o: Objective) => o.id === parentIds!.objectiveId)
          ?.goals.push({
            id: `goal-${Date.now()}`,
            title: newName,
            checkpoints: [],
          });
        break;
      case "checkpoint":
        projectToUpdate.objectives
          .find((o: Objective) => o.id === parentIds!.objectiveId)
          ?.goals.find((g: Goal) => g.id === parentIds!.goalId)
          ?.checkpoints.push({
            id: `cp-${Date.now()}`,
            title: newName,
            done: false,
            subCheckpoints: [],
          });
        break;
      case "subcheckpoint":
        projectToUpdate.objectives
          .find((o: Objective) => o.id === parentIds!.objectiveId)
          ?.goals.find((g: Goal) => g.id === parentIds!.goalId)
          ?.checkpoints.find(
            (c: Checkpoint) => c.id === parentIds!.checkpointId
          )
          ?.subCheckpoints.push({
            id: `sub-${Date.now()}`,
            title: newName,
            done: false,
          });
        break;
    }
    await handleUpdateProject(projectToUpdate);
  };

  const handleDelete = async (type: ItemType, ids: ItemIds) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir? A ação não pode ser desfeita."
      ) ||
      !user ||
      !selectedProject
    )
      return;

    const projectToUpdate = JSON.parse(JSON.stringify(selectedProject));

    switch (type) {
      case "objective":
        projectToUpdate.objectives = projectToUpdate.objectives.filter(
          (o: Objective) => o.id !== ids.objectiveId
        );
        break;
      case "goal":
        projectToUpdate.objectives.forEach((o: Objective) => {
          if (o.id === ids.objectiveId)
            o.goals = o.goals.filter((g: Goal) => g.id !== ids.goalId);
        });
        break;
      case "checkpoint":
        projectToUpdate.objectives.forEach((o: Objective) => {
          if (o.id === ids.objectiveId)
            o.goals.forEach((g: Goal) => {
              if (g.id === ids.goalId)
                g.checkpoints = g.checkpoints.filter(
                  (c: Checkpoint) => c.id !== ids.checkpointId
                );
            });
        });
        break;
      case "subcheckpoint":
        projectToUpdate.objectives.forEach((o: Objective) => {
          if (o.id === ids.objectiveId)
            o.goals.forEach((g: Goal) => {
              if (g.id === ids.goalId)
                g.checkpoints.forEach((c: Checkpoint) => {
                  if (c.id === ids.checkpointId)
                    c.subCheckpoints = c.subCheckpoints.filter(
                      (s: SubCheckpoint) => s.id !== ids.subCheckpointId
                    );
                });
            });
        });
        break;
    }
    await handleUpdateProject(projectToUpdate);
    logAction(`Item do tipo "${type}" foi excluído.`);
  };

  if (loading || !user)
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );

  if (selectedProject) {
    return (
      <ProjectDetailView
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onUpdate={handleUpdateProject}
        onAdd={handleAdd}
        onDelete={handleDelete}
        logs={history}
      />
    );
  }

  return (
    <ProjectsListView
      projects={projects}
      onSelect={setSelectedProject}
      onAdd={() => handleAdd("project")}
    />
  );
}
