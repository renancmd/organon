// app/daily-journal/page.tsx
// Página que exibe um resumo consolidado de um dia específico.

'use client';

import React, { useState, useMemo } from 'react';
import { Check, CheckCircle2, Repeat, Clock, Calendar, Paperclip } from 'lucide-react';

// --- Estruturas de Dados (Reutilizadas) ---
type Task = { id: string; name: string; completed: boolean; dueDate?: string; };
type Event = { id: string; name: string; startTime?: string; };
type Habit = { id: string; name: string; };
type Attachment = { id: string; name: string; url: string; };
type JournalEntry = { date: string; gratitude: string; memory: string; attachments?: Attachment[]; };

// --- Dados Fictícios ---
const mockTasks: Task[] = [ { id: 'task-1', name: 'Finalizar relatório de vendas', completed: true, dueDate: '2025-06-26T17:00:00' }, { id: 'task-4', name: 'Estudar documentação da nova API', completed: true, dueDate: '2025-06-26T20:00:00' }, ];
const mockEvents: Event[] = [ { id: 'event-1', name: 'Reunião de Projeto', startTime: '14:00' }, ];
const mockHabits: Habit[] = [ { id: 'habit-1', name: 'Arrumar a cama' }, { id: 'habit-2', name: 'Beber Água (8 Copos)' }, ];
const mockJournalEntries: JournalEntry[] = [ { date: '2025-06-26', gratitude: 'Sou grato pelo dia produtivo e por ter conseguido focar nas minhas tarefas mais importantes.', memory: 'A reunião de projeto foi um sucesso, todos gostaram da apresentação. Foi um grande alívio.', attachments: [{id: 'journal-attach-1', name: 'foto-parque.jpg', url:'#'}, {id: 'journal-attach-2', name: 'ideia-inspiradora.txt', url:'#'}] }, { date: '2025-06-25', gratitude: 'Pela saúde e por ter tido uma boa noite de sono.', memory: 'Caminhada no parque no final da tarde, o clima estava ótimo.' } ];

// --- Componentes Mock ---
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="p-6 border-b dark:border-gray-800">{children}</div>;
const CardTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-xl font-bold">{children}</h3>;
const CardContent = ({ children, className='' }: { children: React.ReactNode, className?: string }) => <div className={`p-6 ${className}`}>{children}</div>;
const Input = ({ className = '', ...props }: { [key:string]: any }) => ( <input {...props} className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${className}`} /> );
const Label = ({ children, ...props }: { children: React.ReactNode, [key:string]: any }) => ( <label {...props} className="text-sm font-medium text-gray-600 dark:text-gray-400"> {children} </label> );


export default function DailyJournalPage() {
    const [selectedDate, setSelectedDate] = useState(new Date('2025-06-26T03:00:00Z')); // Usar UTC para evitar problemas de fuso

    const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

    // Simula a busca de dados para a data selecionada
    const dailyData = useMemo(() => {
        const dateStr = toYYYYMMDD(selectedDate);
        return {
            journal: mockJournalEntries.find(j => j.date === dateStr),
            tasks: mockTasks.filter(t => t.dueDate?.startsWith(dateStr) && t.completed),
            events: mockEvents, // Simplificado, em um app real filtraria por data
            habits: mockHabits, // Simplificado
        };
    }, [selectedDate]);

    return (
        <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Cabeçalho com Seletor de Data */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b dark:border-gray-800">
                    <h2 className="text-2xl font-bold">Registro Diário</h2>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                            type="date" 
                            className="pl-10"
                            value={toYYYYMMDD(selectedDate)}
                            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                        />
                    </div>
                </div>

                {/* Template do Dia */}
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Seção de Gratidão e Memória */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label>Pelo que você foi grato?</Label>
                                <p className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg min-h-[100px] text-sm">{dailyData.journal?.gratitude || 'Nenhuma nota de gratidão para este dia.'}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Qual memória você guardou?</Label>
                                <p className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg min-h-[100px] text-sm">{dailyData.journal?.memory || 'Nenhuma memória para este dia.'}</p>
                            </div>
                        </div>
                        
                        {/* Seção de Anexos */}
                        {dailyData.journal?.attachments && dailyData.journal.attachments.length > 0 && (
                             <div className="space-y-3 pt-4">
                                <Label>Anexos do Dia</Label>
                                <div className="flex flex-wrap gap-3">
                                    {dailyData.journal.attachments.map(file => (
                                        <a href={file.url} key={file.id} className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                            <Paperclip className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            {file.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Linha Divisória */}
                        <div className="border-t dark:border-gray-800"></div>

                        {/* Seção de Resumo de Atividades */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Tarefas Concluídas</h4>
                                <ul className="list-none space-y-2 pl-2">
                                    {dailyData.tasks.map(task => <li key={task.id} className="text-sm flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/>{task.name}</li>)}
                                    {dailyData.tasks.length === 0 && <li className="text-sm text-gray-500">Nenhuma tarefa concluída.</li>}
                                </ul>
                            </div>
                             <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> Eventos do Dia</h4>
                                <ul className="list-none space-y-2 pl-2">
                                     {dailyData.events.map(event => <li key={event.id} className="text-sm">{event.startTime} - {event.name}</li>)}
                                     {dailyData.events.length === 0 && <li className="text-sm text-gray-500">Nenhum evento.</li>}
                                </ul>
                            </div>
                             <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2"><Repeat className="w-5 h-5 text-orange-500" /> Hábitos Praticados</h4>
                                 <ul className="list-none space-y-2 pl-2">
                                     {dailyData.habits.map(habit => <li key={habit.id} className="text-sm">{habit.name}</li>)}
                                     {dailyData.habits.length === 0 && <li className="text-sm text-gray-500">Nenhum hábito praticado.</li>}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
