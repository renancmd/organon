// app/habitos/page.tsx
// Página para gerenciamento completo de hábitos.

'use client';

import React, { useState, useEffect } from 'react';
import { X, Flame, Repeat, Plus, Check, Minus, Trash2, Edit } from 'lucide-react';

// --- Estruturas de Dados ---
type Habit = {
    id: string;
    name: string;
    type: 'binario' | 'quantitativo';
    goal: number; // 1 para binário, N para quantitativo
    progress: number;
    streak: number;
    duration: number; // Duração em dias
    color: string;
};

const mockHabitsData: Habit[] = [
    { id: 'habit-1', name: 'Arrumar a cama', type: 'binario', goal: 1, progress: 1, streak: 30, duration: 30, color: 'text-blue-500' },
    { id: 'habit-2', name: 'Beber Água (Copos)', type: 'quantitativo', goal: 8, progress: 3, streak: 5, duration: 90, color: 'text-green-500' },
    { id: 'habit-3', name: 'Meditar', type: 'binario', goal: 1, progress: 0, streak: 32, duration: 60, color: 'text-purple-500' },
    { id: 'habit-4', name: 'Ler 10 páginas', type: 'binario', goal: 1, progress: 0, streak: 2, duration: 30, color: 'text-yellow-500' },
];

const availableColors = ['text-red-500', 'text-yellow-500', 'text-green-500', 'text-blue-500', 'text-purple-500', 'text-pink-500'];

// --- Componentes Mock ---
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="p-6 border-b dark:border-gray-800">{children}</div>;
const CardTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-semibold">{children}</h3>;
const CardContent = ({ children, className='' }: { children: React.ReactNode, className?: string }) => <div className={`p-6 ${className}`}>{children}</div>;
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: { children: React.ReactNode; className?: string; variant?: 'default' | 'ghost' | 'outline'; size?: 'default' | 'icon', [key:string]: any }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
  const variantClasses = { default: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900", ghost: "hover:bg-gray-100 dark:hover:bg-gray-800", outline: "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" };
  const sizeClasses = { default: 'h-10 py-2 px-4', icon: 'h-9 w-9' };
  return <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>{children}</button>;
};
const Input = ({ className = '', ...props }: { [key:string]: any }) => ( <input {...props} className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${className}`} /> );
const Label = ({ children, ...props }: { children: React.ReactNode, [key:string]: any }) => ( <label {...props} className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"> {children} </label> );
const Select = ({ children, ...props }: { children: React.ReactNode, [key:string]: any }) => ( <select {...props} className="h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"> {children} </select> );
const Checkbox = ({ id, checked, onChange }: { id: string; checked?: boolean; onChange?: (checked: boolean) => void; }) => (
    <div className="flex items-center pt-1" onClick={(e) => e.stopPropagation()}>
        <input id={id} type="checkbox" checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} className="h-5 w-5 shrink-0 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"/>
    </div>
);

// --- Modal de Hábito ---
function HabitModal({ isOpen, onClose, onSave, onDelete, habit }: { isOpen: boolean; onClose: () => void; onSave: (habit: Habit) => void; onDelete?: (habitId: string) => void; habit: Partial<Habit> | null; }) {
    const [currentHabit, setCurrentHabit] = useState(habit);
    useEffect(() => { setCurrentHabit(habit); }, [habit]);

    if (!isOpen || !currentHabit) return null;

    const handleSave = () => {
        if (!currentHabit.name) return;
        
        const habitToSave: Habit = {
            id: currentHabit.id || `habit-${Date.now()}`,
            name: currentHabit.name,
            type: currentHabit.type || 'binario',
            goal: currentHabit.type === 'binario' ? 1 : (currentHabit.goal || 1),
            progress: currentHabit.progress || 0,
            streak: currentHabit.streak || 0,
            duration: currentHabit.duration || 30,
            color: currentHabit.color || availableColors[0],
        };
        onSave(habitToSave);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                    <h3 className="text-lg font-semibold">{currentHabit.id ? 'Editar Hábito' : 'Novo Hábito'}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5" /></Button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2"><Label htmlFor="habitName">Nome</Label><Input id="habitName" value={currentHabit.name || ''} onChange={(e) => setCurrentHabit({...currentHabit, name: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="habitType">Tipo</Label><Select id="habitType" value={currentHabit.type || 'binario'} onChange={(e) => setCurrentHabit({...currentHabit, type: e.target.value as Habit['type'], goal: e.target.value === 'binario' ? 1 : currentHabit.goal})}><option value="binario">Diário (Sim/Não)</option><option value="quantitativo">Quantitativo (Contagem)</option></Select></div>
                        <div className="space-y-2"><Label htmlFor="habitDuration">Duração (dias)</Label><Input id="habitDuration" type="number" min="1" value={currentHabit.duration || 30} onChange={(e) => setCurrentHabit({...currentHabit, duration: parseInt(e.target.value, 10)})} /></div>
                    </div>
                    {currentHabit.type === 'quantitativo' && (<div className="space-y-2"><Label htmlFor="habitGoal">Meta Diária</Label><Input id="habitGoal" type="number" min="1" value={currentHabit.goal || 1} onChange={(e) => setCurrentHabit({...currentHabit, goal: parseInt(e.target.value, 10)})} /></div>)}
                    <div className="space-y-2"><Label>Cor</Label><div className="flex flex-wrap gap-3 pt-2">{availableColors.map(color => (<button key={color} onClick={() => setCurrentHabit({...currentHabit, color: color})} className={`w-8 h-8 rounded-full ${color.replace('text-', 'bg-')} ${currentHabit.color === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : ''}`}></button>))}</div></div>
                </div>
                <div className="p-6 flex justify-between items-center border-t dark:border-gray-800">
                    {currentHabit.id && onDelete ? (
                        <Button variant="ghost" size="icon" onClick={() => onDelete(currentHabit.id!)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    ) : <div></div>}
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </div>
        </div>
    );
}

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>(mockHabitsData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Partial<Habit> | null>(null);

    const handleSaveHabit = (habitData: Habit) => {
        if (habits.some(h => h.id === habitData.id)) {
            setHabits(prev => prev.map(h => h.id === habitData.id ? {...h, ...habitData} : h));
        } else {
            setHabits(prev => [...prev, habitData]);
        }
    };
    
    const handleProgress = (habitId: string, amount: number) => {
        setHabits(habits.map(h => {
            if (h.id === habitId && h.streak < h.duration) {
                const newProgress = Math.max(0, h.progress + amount);
                const goalMetToday = newProgress >= h.goal;
                // Simplificação: incrementa streak se a meta foi batida.
                // Uma implementação real usaria datas para evitar múltiplos incrementos no mesmo dia.
                const newStreak = goalMetToday && h.progress < h.goal ? h.streak + 1 : h.streak;
                return {...h, progress: newProgress, streak: newStreak };
            }
            return h;
        }))
    }

    const handleDeleteHabit = (habitId: string) => {
        setHabits(prev => prev.filter(h => h.id !== habitId));
    };

    const handleOpenModal = (habit: Partial<Habit> | null) => {
        setEditingHabit(habit);
        setIsModalOpen(true);
    };

    const activeHabits = habits.filter(h => h.streak < h.duration);
    const completedHabits = habits.filter(h => h.streak >= h.duration);

    return (
        <main className="flex-1 p-6 lg:p-8 space-y-8">
            <HabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveHabit} onDelete={handleDeleteHabit} habit={editingHabit} />
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Monitor de Hábitos</h2>
                <Button onClick={() => handleOpenModal({ name: '', type: 'binario', goal: 1, color: availableColors[0], duration: 30 })}><Plus className="w-4 h-4 mr-2" /> Novo Hábito</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Hábitos Ativos</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeHabits.map(habit => (
                        <div key={habit.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex flex-col justify-between group">
                            <div onClick={() => handleOpenModal(habit)} className="cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Repeat className={`w-5 h-5 ${habit.color}`} />
                                        <p className="font-semibold">{habit.name}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {e.stopPropagation(); handleDeleteHabit(habit.id)}}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-orange-500">
                                    <Flame className="w-4 h-4" />
                                    <span>{habit.streak} / {habit.duration} dias</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-end mt-4">
                               {habit.type === 'binario' ? (
                                   <Checkbox id={`habit-${habit.id}`} checked={habit.progress >= 1} onChange={(checked) => handleProgress(habit.id, checked ? 1 : -1)} />
                               ) : (
                                   <div className="flex items-center gap-2">
                                       <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleProgress(habit.id, -1)}><Minus className="h-4 w-4" /></Button>
                                       <span className="font-bold text-base w-12 text-center">{habit.progress}/{habit.goal}</span>
                                       <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleProgress(habit.id, 1)}><Plus className="h-4 w-4" /></Button>
                                   </div>
                               )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle>Hábitos Concluídos</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                     {completedHabits.map(habit => (
                        <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 opacity-60">
                             <div className="flex items-center gap-2">
                                <Check className={`w-5 h-5 ${habit.color}`}/>
                                <p className="font-medium line-through">{habit.name}</p>
                             </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Flame className="w-4 h-4 text-green-500" />
                                <span>{habit.streak} / {habit.duration} dias</span>
                            </div>
                        </div>
                    ))}
                     {completedHabits.length === 0 && <p className="text-sm text-center text-gray-500 py-4">Nenhum hábito totalmente concluído ainda.</p>}
                </CardContent>
            </Card>
        </main>
    );
}
