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
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  History,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useDarkMode } from "../../../hooks/useTheme"; // Importe o hook do tema

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
  createdAt: Timestamp;
  objectives: Objective[];
};
type HistoryLog = { id: string; text: string; timestamp: string };
type ItemType = "project" | "objective" | "goal" | "checkpoint" | "subcheckpoint";
type ItemIds = {
  projectId?: string;
  objectiveId?: string;
  goalId?: string;
  checkpointId?: string;
  subCheckpointId?: string;
};

// --- COMPONENTES UI COM TEMA ---
const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
  {...props}
  className={`rounded-xl shadow-sm flex flex-col border p-6 ${className}`}
  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
  >
  {children}
  </div>
);

const Button = ({ children, className = "", variant = "default", size = "default", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "ghost" | "outline", size?: "default" | "icon" }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50";
  const variants = { default: "", ghost: "bg-transparent", outline: "border" };
  const sizes = { default: "h-10 px-4 py-2", icon: "h-9 w-9" };
  const style: React.CSSProperties = variant === "default" ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)" } : { borderColor: "var(--card-border)"};
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} style={style} {...props}>{children}</button>;
};

const Checkbox = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void; }) => (
  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
  <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 shrink-0 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500" style={{ backgroundColor: "var(--card-bg)"}}/>
  </div>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--input-border)"}}>
  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
  {...props}
  className={`flex h-10 w-full rounded-md px-3 py-2 text-sm border transition-colors duration-300 ${props.className || ''}`}
  style={{ borderColor: "var(--input-border)", backgroundColor: "var(--card-bg)", color: "var(--foreground)" }}
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
  {...props}
  className={`flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm ${props.className || ""}`}
  style={{ borderColor: "var(--input-border)", backgroundColor: "var(--card-bg)", color: "var(--foreground)" }}
  />
);

// --- CÁLCULOS DE PROGRESSO ---
const calculateCheckpointsProgress = (checkpoints: Checkpoint[]): number => { const total = checkpoints.reduce( (s, cp) => s + 1 + (cp.subCheckpoints?.length || 0), 0 ); if (total === 0) return 0; const completed = checkpoints.reduce( (s, cp) => s + (cp.done ? 1 : 0) + (cp.subCheckpoints?.filter((sc) => sc.done).length || 0), 0 ); return (completed / total) * 100; };
const calculateProjectProgress = (project: Project): number => { if (!project.objectives) return 0; const allGoals = project.objectives.flatMap((obj) => obj.goals); if (allGoals.length === 0) return 0; const progressSum = allGoals.reduce( (sum, goal) => sum + calculateCheckpointsProgress(goal.checkpoints), 0 ); return progressSum / allGoals.length; };
const formatFirebaseTimestamp = (timestamp: Timestamp | null | undefined): string => { if (!timestamp) return 'Data indisponível'; if (timestamp.toDate) { return timestamp.toDate().toLocaleDateString('pt-BR'); } return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR'); };


// --- COMPONENTES DA PÁGINA ---
const HistorySidebar = ({ logs }: { logs: HistoryLog[] }) => (
  <aside className="w-full lg:w-80 border-l p-6 flex-col gap-4 hidden lg:flex" style={{ borderColor: 'var(--card-border)'}}>
  <h3 className="font-semibold text-lg flex items-center gap-2"><History className="w-5 h-5" /> Histórico</h3>
  <div className="space-y-4 overflow-y-auto">{logs.map((log) => (<div key={log.id} className="text-sm"><p>{log.text}</p><p className="text-xs" style={{ color: 'var(--foreground-muted)'}}>{log.timestamp}</p></div>))}</div>
  </aside>
);

const EditableTitle = ({ title, onSave, className = "" }: { title: string; onSave: (newTitle: string) => void; className?: string; }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(title);
  if (isEditing) {
    return <Input value={text} onChange={(e) => setText(e.target.value)} onBlur={() => { onSave(text); setIsEditing(false); }} autoFocus onKeyDown={(e) => { if (e.key === "Enter") { onSave(text); setIsEditing(false); } }} className={`h-auto p-0 border-none focus-visible:ring-0 ${className}`} />;
  }
  return <span onClick={() => setIsEditing(true)} className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded ${className}`}>{title}</span>;
};

const EditableTextarea = ({ text, onSave, className = "" }: { text: string; onSave: (newText: string) => void; className?: string; }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  if (isEditing) {
    return <Textarea value={currentText} onChange={(e) => setCurrentText(e.target.value)} onBlur={() => { onSave(currentText); setIsEditing(false); }} autoFocus className={`text-base ${className}`} />;
  }
  return <p onClick={() => setIsEditing(true)} className={`mt-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded whitespace-pre-wrap ${className}`} style={{ color: 'var(--foreground-muted)'}}>{text || "Adicione uma descrição completa."}</p>;
};

const ProjectDetailView = ({ project, onBack, onUpdate, onAdd, onDelete, logs }: { project: Project; onBack: () => void; onUpdate: (p: Project) => void; onAdd: (type: ItemType, parentIds: ItemIds) => void; onDelete: (type: ItemType, ids: ItemIds) => void; logs: HistoryLog[]; }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)]">
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
    <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
    <div className="space-y-6">
    <div>
    <EditableTitle title={project.name} onSave={(newName) => onUpdate({ ...project, name: newName })} className="text-3xl font-bold" />
    <p className="text-sm mt-1" style={{color: 'var(--foreground-muted)'}}>Criado em: {formatFirebaseTimestamp(project.createdAt)}</p>
    <EditableTextarea text={project.fullDescription} onSave={(newDescription) => onUpdate({ ...project, fullDescription: newDescription })}/>
    </div>
    <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Objetivos</h2><Button onClick={() => onAdd("objective", { projectId: project.id })}><Plus className="w-4 h-4 mr-2" /> Objetivo</Button></div>
    <div className="space-y-4">
    {project.objectives.map((obj) => (
      <Card key={obj.id} className="p-0">
      <div className="p-4 border-b flex justify-between items-center group" style={{ borderColor: 'var(--card-border)'}}>
      <EditableTitle title={obj.title} onSave={(newTitle) => onUpdate({ ...project, objectives: project.objectives.map((o) => (o.id === obj.id ? { ...o, title: newTitle } : o)), })}/>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAdd("goal", { objectiveId: obj.id })}><Plus className="w-4 h-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete("objective", { objectiveId: obj.id })}><Trash2 className="w-4 h-4 text-red-500" /></Button></div>
      </div>
      <div className="p-4 space-y-3">
      {obj.goals.map((goal) => {
        const goalProgress = calculateCheckpointsProgress(goal.checkpoints);
        return (
          <div key={goal.id} className="p-2 rounded-lg group">
          <div className="flex items-center justify-between"><div onClick={() => toggle(goal.id)} className="flex items-center gap-2 cursor-pointer">{expanded[goal.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}<EditableTitle title={goal.title} onSave={(newTitle) => onUpdate({ ...project, objectives: project.objectives.map((o) => o.id === obj.id ? { ...o, goals: o.goals.map((g) => g.id === goal.id ? { ...g, title: newTitle } : g) } : o), })}/></div><div className="opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAdd("checkpoint", { objectiveId: obj.id, goalId: goal.id, })}><Plus className="w-4 h-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete("goal", { objectiveId: obj.id, goalId: goal.id, })}><Trash2 className="w-4 h-4 text-red-500" /></Button></div></div>
          {expanded[goal.id] && (<div className="pl-6 mt-2 space-y-3"><ProgressBar progress={goalProgress} />{goal.checkpoints.map((cp) => (<div key={cp.id} className="group/item"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Checkbox checked={cp.done} onChange={(c) => onUpdate({ ...project, objectives: project.objectives.map((o) => o.id === obj.id ? { ...o, goals: o.goals.map((g) => g.id === goal.id ? { ...g, checkpoints: g.checkpoints.map((cpt) => cpt.id === cp.id ? { ...cpt, done: c } : cpt) } : g), } : o), })}/><EditableTitle title={cp.title} onSave={(newTitle) => onUpdate({ ...project, objectives: project.objectives.map((o) => o.id === obj.id ? { ...o, goals: o.goals.map((g) => g.id === goal.id ? { ...g, checkpoints: g.checkpoints.map((cpt) => cpt.id === cp.id ? { ...cpt, title: newTitle } : cpt) } : g), } : o), })}/></div><div className="opacity-0 group-hover/item:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAdd("subcheckpoint", { objectiveId: obj.id, goalId: goal.id, checkpointId: cp.id, })}><Plus className="w-3 h-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete("checkpoint", { objectiveId: obj.id, goalId: goal.id, checkpointId: cp.id, })}><Trash2 className="w-3 h-3 text-red-500" /></Button></div></div><div className="pl-6 space-y-1 mt-1">{cp.subCheckpoints.map((sub) => (<div key={sub.id} className="flex items-center gap-2 group/subitem"><Checkbox checked={sub.done} onChange={(c) => onUpdate({ ...project, objectives: project.objectives.map((o) => o.id === obj.id ? { ...o, goals: o.goals.map((g) => g.id === goal.id ? { ...g, checkpoints: g.checkpoints.map((cpt) => cpt.id === cp.id ? { ...cpt, subCheckpoints: cpt.subCheckpoints.map((s) => s.id === sub.id ? { ...s, done: c } : s), } : cpt), } : g), } : o), })} /><EditableTitle title={sub.title} onSave={(newTitle) => onUpdate({ ...project, objectives: project.objectives.map((o) => o.id === obj.id ? { ...o, goals: o.goals.map((g) => g.id === goal.id ? { ...g, checkpoints: g.checkpoints.map((cpt) => cpt.id === cp.id ? { ...cpt, subCheckpoints: cpt.subCheckpoints.map((s) => s.id === sub.id ? { ...s, title: newTitle } : s), } : cpt), } : g), } : o), })} /><div className="ml-auto opacity-0 group-hover/subitem:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete("subcheckpoint", { objectiveId: obj.id, goalId: goal.id, checkpointId: cp.id, subCheckpointId: sub.id, })}><Trash2 className="w-3 h-3 text-red-500" /></Button></div></div>))}</div></div>))}</div>)}
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

const ProjectsListView = ({ projects, onSelect, onAdd, onDelete }: { projects: Project[]; onSelect: (p: Project) => void; onAdd: () => void; onDelete: (projectId: string) => void; }) => (
  <main className="flex-1 p-6 lg:p-8">
  <div className="flex items-center justify-between mb-6"><h1 className="text-3xl font-bold">Projetos</h1><Button onClick={onAdd}><Plus className="w-4 h-4 mr-2" /> Novo Projeto</Button></div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {projects.map((p) => {
    const progress = calculateProjectProgress(p);
    return (
      <div key={p.id} onClick={() => onSelect(p)} className="cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <Card className="h-full p-0">
      <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start"><h3 className="text-xl font-bold mb-2 pr-2">{p.name}</h3><Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}><Trash2 className="w-4 h-4 text-red-500" /></Button></div>
      <p className="text-sm min-h-[60px]" style={{ color: 'var(--foreground-muted)'}}>{p.description}</p>
      </div>
      <div className="p-6 pt-0 mt-auto">
      <div className="flex justify-between items-center mb-2 text-sm"><p>Progresso</p><p className="font-semibold">{Math.round(progress)}%</p></div>
      <ProgressBar progress={progress} />
      </div>
      </Card>
      </div>
    );
  })}
  </div>
  </main>
);

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function ProjectsPage() {
  useDarkMode(); // Ativa o hook do tema
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<HistoryLog[]>([]);

  useEffect(() => {
    if (!user && !loading) { router.push("/sign-in"); }
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

  const logAction = (text: string) => { const newLog: HistoryLog = { id: `log-${Date.now()}`, text, timestamp: new Date().toLocaleString("pt-BR") }; setHistory((prev) => [newLog, ...prev]); };
  const handleUpdateProject = async (updatedProject: Project) => { if (!user) return; const { id, ...dataToSave } = updatedProject; await updateDoc(doc(db, "users", user.uid, "projects", id), dataToSave); setSelectedProject(updatedProject); };

  const handleAdd = async (type: ItemType, parentIds?: ItemIds) => {
    const newName = prompt(`Digite o nome para o novo ${type}:`);
    if (!newName || !user) return;
    if (type === "project") { await addDoc(collection(db, "users", user.uid, "projects"), { name: newName, description: "Adicione uma breve descrição.", fullDescription: "Adicione uma descrição completa.", createdAt: serverTimestamp(), objectives: [], }); return; }
    const projectToUpdate = projects.find((p) => p.id === selectedProject?.id);
    if (!projectToUpdate) return;
    let newObjectives;
    switch (type) {
      case "objective": newObjectives = [...projectToUpdate.objectives, { id: `obj-${Date.now()}`, title: newName, goals: [] }]; break;
      case "goal": newObjectives = projectToUpdate.objectives.map((o) => o.id === parentIds!.objectiveId ? { ...o, goals: [...o.goals, { id: `goal-${Date.now()}`, title: newName, checkpoints: [] }] } : o); break;
      case "checkpoint": newObjectives = projectToUpdate.objectives.map((o) => o.id === parentIds!.objectiveId ? { ...o, goals: o.goals.map((g) => g.id === parentIds!.goalId ? { ...g, checkpoints: [...g.checkpoints, { id: `cp-${Date.now()}`, title: newName, done: false, subCheckpoints: [] }] } : g), } : o); break;
      case "subcheckpoint": newObjectives = projectToUpdate.objectives.map((o) => o.id === parentIds!.objectiveId ? { ...o, goals: o.goals.map((g) => g.id === parentIds!.goalId ? { ...g, checkpoints: g.checkpoints.map((c) => c.id === parentIds!.checkpointId ? { ...c, subCheckpoints: [...c.subCheckpoints, { id: `sub-${Date.now()}`, title: newName, done: false }] } : c), } : g), } : o); break;
      default: newObjectives = projectToUpdate.objectives;
    }
    await handleUpdateProject({ ...projectToUpdate, objectives: newObjectives });
  };

  const handleDelete = async (type: ItemType, ids: ItemIds) => {
    if (!confirm("Tem certeza que deseja excluir? A ação não pode ser desfeita.") || !user || !selectedProject) return;
    let updatedObjectives;
    switch (type) {
      case "objective": updatedObjectives = selectedProject.objectives.filter((o) => o.id !== ids.objectiveId); break;
      case "goal": updatedObjectives = selectedProject.objectives.map((o) => o.id === ids.objectiveId ? { ...o, goals: o.goals.filter((g) => g.id !== ids.goalId) } : o); break;
      case "checkpoint": updatedObjectives = selectedProject.objectives.map((o) => o.id === ids.objectiveId ? { ...o, goals: o.goals.map((g) => g.id === ids.goalId ? { ...g, checkpoints: g.checkpoints.filter((c) => c.id !== ids.checkpointId) } : g), } : o); break;
      case "subcheckpoint": updatedObjectives = selectedProject.objectives.map((o) => o.id === ids.objectiveId ? { ...o, goals: o.goals.map((g) => g.id === ids.goalId ? { ...g, checkpoints: g.checkpoints.map((c) => c.id === ids.checkpointId ? { ...c, subCheckpoints: c.subCheckpoints.filter((s) => s.id !== ids.subCheckpointId) } : c), } : g), } : o); break;
      default: updatedObjectives = selectedProject.objectives;
    }
    await handleUpdateProject({ ...selectedProject, objectives: updatedObjectives });
    logAction(`Item do tipo "${type}" foi excluído.`);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user || !confirm("Tem certeza que deseja excluir este projeto? Esta ação é permanente.")) return;
    await deleteDoc(doc(db, "users", user.uid, "projects", projectId));
    logAction("Projeto excluído.");
  };

  if (loading || !user) return <div className="flex-1 flex items-center justify-center"><p>Carregando...</p></div>;

  return (
    <main className="flex-1 transition-colors duration-300" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
    {selectedProject ? (
      <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} onUpdate={handleUpdateProject} onAdd={handleAdd} onDelete={handleDelete} logs={history} />
    ) : (
    <ProjectsListView projects={projects} onSelect={setSelectedProject} onAdd={() => handleAdd("project")} onDelete={handleDeleteProject} />
    )}
    </main>
  );
}


