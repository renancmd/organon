// app/tasks/page.tsx
// Esta é uma nova implementação da página de tarefas, criada do zero
// para garantir funcionalidade e estabilidade.

'use client';

import React, { useState, useEffect } from 'react';
import { X, Paperclip, MoreHorizontal, Calendar, Trash2 } from 'lucide-react';

// --- Estrutura de Dados ---
type SubTask = { id: string; name: string; completed: boolean };
type Attachment = { id: string; name: string; url: string; };
type Task = {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  completed: boolean;
  subtasks: SubTask[];
  color: string;
  attachments?: Attachment[];
};

// --- Dados Fictícios Iniciais ---
const initialTasks: Task[] = [
    { id: 'task-1', name: 'Finalizar relatório de vendas', priority: 'Urgente', completed: false, subtasks: [{id: 'sub-1', name: 'Revisar dados', completed: true}], color: 'bg-blue-500', dueDate: '2025-06-26T17:00:00', attachments: [{id: 'attach-1', name: 'template.docx', url: '#'}]},
    { id: 'task-2', name: 'Planejar próximo sprint', priority: 'Alta', completed: false, subtasks: [], color: 'bg-blue-500', dueDate: '2025-06-28T09:00:00' },
    { id: 'task-3', name: 'Agendar consulta médica', priority: 'Alta', completed: false, subtasks: [], color: 'bg-green-500' },
    { id: 'task-4', name: 'Estudar documentação da nova API', priority: 'Média', completed: true, subtasks: [], color: 'bg-purple-500' },
    { id: 'task-5', name: 'Organizar arquivos do projeto', priority: 'Baixa', completed: false, subtasks: [], color: 'bg-blue-500', dueDate: '2025-07-01T23:59:00' },
];

const areas = [
    { name: 'Trabalho', color: 'bg-blue-500'},
    { name: 'Pessoal', color: 'bg-green-500'},
    { name: 'Estudo', color: 'bg-purple-500'},
];

// --- Componentes UI Mock ---
const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string, [key: string]: any }) => <div {...props} className={`relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>{children}</div>;
const Checkbox = ({ id, checked, onChange }: { id: string; checked?: boolean; onChange?: (checked: boolean) => void; }) => (
    <div className="flex items-center pt-1" onClick={(e) => e.stopPropagation()}><input id={id} type="checkbox" checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} className="h-4 w-4 shrink-0 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"/></div>
);
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: { children: React.ReactNode; className?: string; variant?: 'default' | 'ghost' | 'outline'; size?: 'default' | 'icon', [key: string]: any }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
  const variantClasses = { default: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900", ghost: "hover:bg-gray-100 dark:hover:bg-gray-800", outline: "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"};
  const sizeClasses = { default: 'h-10 py-2 px-4', icon: 'h-10 w-10' };
  return <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>{children}</button>;
};
const Input = ({ className = '', ...props }: { [key: string]: any }) => ( <input {...props} className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${className}`} /> );
const Textarea = ({ className = '', ...props }: { [key: string]: any }) => ( <textarea {...props} className={`flex min-h-[80px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${className}`} /> );
const Label = ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => ( <label {...props} className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"> {children} </label> );
const Select = ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => ( <select {...props} className="h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"> {children} </select> );


// --- MODAIS ---
function TaskModal({ isOpen, onClose, onSave, onDelete, task }: { isOpen: boolean; onClose: () => void; onSave: (task: Task) => void; onDelete?: (taskId: string) => void; task: Partial<Task> | null; }) {
    const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);

    useEffect(() => {
        if (task) {
            setCurrentTask({ ...task });
        }
    }, [task]);
    
    if (!isOpen || !currentTask) return null;

    const isNewTask = !currentTask.id;

    const handleSave = () => {
        if (!currentTask.name) return;
        const finalTask: Task = {
            id: currentTask.id || `task-${Date.now()}`,
            name: currentTask.name,
            completed: currentTask.completed || false,
            priority: currentTask.priority || 'Média',
            color: currentTask.color || 'bg-blue-500',
            subtasks: currentTask.subtasks || [],
            attachments: currentTask.attachments || [],
            description: currentTask.description,
            dueDate: currentTask.dueDate,
        };
        onSave(finalTask);
        onClose();
    };

    const handleFieldChange = (field: keyof Task, value: any) => {
        setCurrentTask(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between p-6 border-b dark:border-gray-800">
                    <div className="w-full flex items-center gap-4">
                         {!isNewTask && <Checkbox id={`modal-status-${currentTask.id}`} checked={currentTask.completed} onChange={(c) => handleFieldChange('completed', c)} />}
                        <Input value={currentTask.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0" placeholder="Nome da Tarefa"/>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5" /></Button>
                </div>
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" placeholder="Adicionar detalhes..." value={currentTask.description || ''} onChange={(e) => handleFieldChange('description', e.target.value)} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label htmlFor="dueDate">Data de Vencimento</Label><Input id="dueDate" type="datetime-local" value={currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().slice(0, 16) : ''} onChange={(e) => handleFieldChange('dueDate', e.target.value)} /></div>
                        <div className="space-y-2"><Label htmlFor="priority">Prioridade</Label><Select id="priority" value={currentTask.priority} onChange={(e) => handleFieldChange('priority', e.target.value)}><option>Baixa</option><option>Média</option><option>Alta</option><option>Urgente</option></Select></div>
                    </div>
                    <div className="space-y-2"><Label>Código de Cores</Label><div className="flex gap-2 pt-2">{['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'].map(c=><button key={c} onClick={() => handleFieldChange('color', c)} className={`w-8 h-8 rounded-full ${c} ${currentTask.color===c?'ring-2 ring-offset-2 ring-gray-900 dark:ring-white':''}`}></button>)}</div></div>
                    <div className="space-y-4"><Label>Sub-tarefas</Label><div className="space-y-3">{currentTask.subtasks?.map(s=><div key={s.id} className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50"><Checkbox id={s.id} checked={s.completed}/><Input value={s.name} className="border-none p-0 h-auto text-sm"/></div>)}</div><Button variant="outline" className="w-full">Adicionar Sub-tarefa</Button></div>
                    <div className="space-y-3"><Label>Anexos</Label><div className="flex flex-wrap gap-2">{currentTask.attachments?.map(a=><a href={a.url} key={a.id} className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"><Paperclip className="h-4 w-4"/>{a.name}</a>)}</div><Button variant="outline" className="w-full">Adicionar Anexo</Button></div>
                </div>
                <div className="p-4 flex justify-between items-center border-t dark:border-gray-800">
                     {!isNewTask && onDelete ? (
                        <Button variant="ghost" size="icon" onClick={() => onDelete(currentTask.id!)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    ) : <div></div>}
                    <Button onClick={handleSave}>{isNewTask ? 'Criar Tarefa' : 'Salvar Alterações'}</Button>
                </div>
            </div>
        </div>
    );
}

// --- Helper de Formatação ---
const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date).replace('.', '');
};

// --- VISUALIZAÇÕES ---
const KanbanView = ({ tasks, onTaskClick, onUpdateTask, onTaskDrop }: { tasks: Task[]; onTaskClick: (t: Task) => void; onUpdateTask: (t: Task) => void; onTaskDrop: (taskId: string, newAreaColor: string) => void; }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newAreaColor: string) => {
        const taskId = e.dataTransfer.getData("taskId");
        onTaskDrop(taskId, newAreaColor);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map(area => (
                <div 
                    key={area.name} 
                    className="flex flex-col gap-4 p-2 bg-gray-100/50 dark:bg-gray-900/50 rounded-lg"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, area.color)}
                >
                    <div className="flex items-center gap-2 px-2 pt-2"><div className={`w-3 h-3 rounded-full ${area.color}`}></div><h2 className="font-semibold">{area.name}</h2></div>
                    <div className="flex flex-col gap-4 min-h-[200px]">
                        {tasks.filter(t => t.color === area.color).map(task => (
                            <Card 
                                key={task.id} 
                                className="p-3 cursor-pointer group" 
                                onClick={() => onTaskClick(task)}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task.id)}
                            >
                               <div className="flex items-start gap-3">
                                    <Checkbox id={`k-${task.id}`} checked={task.completed} onChange={(c) => onUpdateTask({ ...task, completed: c })} />
                                    <div className="flex-1 pr-4">
                                        <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.name}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            {task.dueDate ? <p className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" />{formatDateTime(task.dueDate)}</p> : <div />}
                                            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${task.priority === 'Urgente' || task.priority === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.priority}</div>
                                        </div>
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


const ListView = ({ tasks, onTaskClick, onUpdateTask, onDeleteTask, onTaskDrop }: { tasks: Task[]; onTaskClick: (t: Task) => void; onUpdateTask: (t: Task) => void; onDeleteTask: (id: string) => void; onTaskDrop: (taskId: string, newAreaColor: string) => void; }) => (
  <div className="space-y-6">
    {areas.map((area) => (
      <div 
          key={area.name}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
              const taskId = e.dataTransfer.getData("taskId");
              onTaskDrop(taskId, area.color);
          }}
      >
        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className={`w-3 h-3 rounded-full ${area.color}`}></div>
            <h2 className="font-semibold">{area.name}</h2>
        </div>
        <div className="space-y-2">
          {tasks.filter((t) => t.color === area.color).map((task) => (
              <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border rounded-lg cursor-grab"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
              >
                <div className="flex items-center gap-4 flex-1" onClick={() => onTaskClick(task)}>
                  <Checkbox id={`l-${task.id}`} checked={task.completed} onChange={(c) => onUpdateTask({ ...task, completed: c })} />
                  <span className={task.completed ? "line-through text-gray-500" : ""}>{task.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {task.dueDate && (<p className="hidden md:flex items-center gap-1 text-sm text-gray-500"><Calendar className="w-4 h-4"/>{formatDateTime(task.dueDate)}</p>)}
                  <span className="hidden sm:inline-block text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">{task.priority}</span>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                  <Button variant="ghost" size="icon" onClick={() => onTaskClick(task)}><MoreHorizontal/></Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    ))}
  </div>
);

const EisenhowerMatrixView = ({ tasks, onTaskClick, onPriorityDrop }: { tasks: Task[], onTaskClick: (task: Task) => void, onPriorityDrop: (taskId: string, newPriority: Task['priority']) => void }) => {
    const quadrants = { Urgente: tasks.filter(t => t.priority === 'Urgente'), Alta: tasks.filter(t => t.priority === 'Alta'), Média: tasks.filter(t => t.priority === 'Média'), Baixa: tasks.filter(t => t.priority === 'Baixa')};
    
    const Quadrant = ({ title, subtitle, tasks, bgColor, priority, onTaskClick, onDrop }: { title: string, subtitle: string, tasks: Task[], bgColor: string, priority: Task['priority'], onTaskClick: (task: Task) => void, onDrop: (priority: Task['priority']) => void }) => (
        <div 
            className={`rounded-xl flex flex-col ${bgColor}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(priority)}
        >
            <div className="p-4 border-b border-black/10 dark:border-white/10"><h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p></div>
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
                {tasks.map(t=>(
                    <div 
                        key={t.id} 
                        onClick={()=>onTaskClick(t)} 
                        className="p-2.5 bg-white/80 dark:bg-gray-950/80 rounded-lg cursor-pointer text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-950 transition-colors"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("taskId", t.id)}
                    >
                        {t.name}
                    </div>
                ))}
            </div>
        </div>
    );

    const handleDrop = (priority: Task['priority']) => (e: React.DragEvent<HTMLDivElement>) => {
        const taskId = e.dataTransfer.getData("taskId");
        onPriorityDrop(taskId, priority);
    };

    return (
        <div className="grid grid-cols-[auto,1fr,1fr] grid-rows-[auto,1fr,1fr] gap-x-4 gap-y-2 h-[75vh]">
            <div className="col-start-2 text-center font-semibold p-2">Urgente</div><div className="col-start-3 text-center font-semibold p-2">Não Urgente</div>
            <div className="row-start-2 flex items-center justify-center -rotate-90 font-semibold p-2">Importante</div><div className="row-start-3 flex items-center justify-center -rotate-90 font-semibold p-2">Não Importante</div>
            <div className="row-start-2 col-start-2" onDragOver={e=>e.preventDefault()} onDrop={handleDrop('Urgente')}><Quadrant title="Fazer" subtitle="Urgente e Importante" tasks={quadrants.Urgente} bgColor="bg-red-100 dark:bg-red-900/40" priority="Urgente" onTaskClick={onTaskClick} onDrop={() => {}} /></div>
            <div className="row-start-2 col-start-3" onDragOver={e=>e.preventDefault()} onDrop={handleDrop('Alta')}><Quadrant title="Decidir" subtitle="Importante, Não Urgente" tasks={quadrants.Alta} bgColor="bg-blue-100 dark:bg-blue-900/40" priority="Alta" onTaskClick={onTaskClick} onDrop={() => {}}/></div>
            <div className="row-start-3 col-start-2" onDragOver={e=>e.preventDefault()} onDrop={handleDrop('Média')}><Quadrant title="Delegar" subtitle="Urgente, Não Importante" tasks={quadrants.Média} bgColor="bg-yellow-100 dark:bg-yellow-900/40" priority="Média" onTaskClick={onTaskClick} onDrop={() => {}}/></div>
            <div className="row-start-3 col-start-3" onDragOver={e=>e.preventDefault()} onDrop={handleDrop('Baixa')}><Quadrant title="Eliminar" subtitle="Não Urgente, Não Importante" tasks={quadrants.Baixa} bgColor="bg-green-100 dark:bg-green-900/40" priority="Baixa" onTaskClick={onTaskClick} onDrop={() => {}}/></div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function TasksPage() {
    const [view, setView] = useState<'kanban' | 'list' | 'matrix'>('kanban');
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

    const handleOpenModal = (task: Partial<Task> | null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSaveTask = (taskToSave: Task) => {
        const exists = tasks.some(t => t.id === taskToSave.id);
        if (exists) {
            setTasks(tasks.map(t => (t.id === taskToSave.id ? taskToSave : t)));
        } else {
            setTasks([...tasks, taskToSave]);
        }
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const handleTaskDrop = (taskId: string, newAreaColor: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, color: newAreaColor } : task
            )
        );
    };

    const handlePriorityDrop = (taskId: string, newPriority: Task['priority']) => {
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === taskId ? { ...task, priority: newPriority } : task
            )
        );
    };
    
    const renderView = () => {
        switch (view) {
            case 'kanban':
                return <KanbanView tasks={tasks} onTaskClick={handleOpenModal} onUpdateTask={handleSaveTask} onTaskDrop={handleTaskDrop} />;
            case 'list':
                return <ListView tasks={tasks} onTaskClick={handleOpenModal} onUpdateTask={handleSaveTask} onDeleteTask={handleDeleteTask} onTaskDrop={handleTaskDrop} />;
            case 'matrix':
                return <EisenhowerMatrixView tasks={tasks} onTaskClick={handleOpenModal} onPriorityDrop={handlePriorityDrop} />;
            default:
                return <KanbanView tasks={tasks} onTaskClick={handleOpenModal} onUpdateTask={handleSaveTask} onTaskDrop={handleTaskDrop} />;
        }
    };

    return (
        <main className="flex-1 p-4 md:p-8">
            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
                task={editingTask}
            />
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
                    <Button variant={view === 'kanban' ? 'default' : 'ghost'} onClick={() => setView('kanban')}>Kanban</Button>
                    <Button variant={view === 'list' ? 'default' : 'ghost'} onClick={() => setView('list')}>Lista</Button>
                    <Button variant={view === 'matrix' ? 'default' : 'ghost'} onClick={() => setView('matrix')}>Matriz</Button>
                </div>
                <Button onClick={() => handleOpenModal({})}>Nova Tarefa</Button>
            </div>
            {renderView()}
        </main>
    );
}
