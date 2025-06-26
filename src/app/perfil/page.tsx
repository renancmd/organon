// app/perfil/page.tsx
// Página para gerenciamento de perfil e "Áreas da Vida".

'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit, Camera } from 'lucide-react';

// --- Estruturas de Dados ---
type Area = {
    id: string;
    name: string;
    color: string;
};

const mockAreasData: Area[] = [
    { id: 'area-1', name: 'Trabalho', color: 'bg-blue-500' },
    { id: 'area-2', name: 'Pessoal', color: 'bg-green-500' },
    { id: 'area-3', name: 'Estudo', color: 'bg-purple-500' },
];

const availableColors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];

// --- Componentes Mock ---
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col ${className}`}>{children}</div>;
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="p-6 border-b dark:border-gray-800">{children}</div>;
const CardTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-semibold">{children}</h3>;
const CardContent = ({ children, className='' }: { children: React.ReactNode, className?: string }) => <div className={`p-6 flex-1 ${className}`}>{children}</div>;
const CardFooter = ({ children }: { children: React.ReactNode }) => <div className="p-6 border-t dark:border-gray-800 flex justify-end">{children}</div>;
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: { children: React.ReactNode; className?: string; variant?: 'default' | 'ghost' | 'outline'; size?: 'default' | 'icon', [key:string]: any }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
  const variantClasses = { 
      default: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900", 
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      outline: "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
  };
  const sizeClasses = { default: 'h-10 py-2 px-4', icon: 'h-9 w-9' };
  return <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>{children}</button>;
};
const Input = ({ className = '', type = 'text', placeholder = '', value, onChange }: { className?: string; type?: string; placeholder?: string; value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => ( <input type={type} placeholder={placeholder} value={value} onChange={onChange} className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${className}`} /> );
const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => ( <label htmlFor={htmlFor} className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"> {children} </label> );

// --- Modal de Área ---
function AreaModal({ isOpen, onClose, onSave, area }: { isOpen: boolean; onClose: () => void; onSave: (area: Omit<Area, 'id'> | Area) => void; area: Omit<Area, 'id'> | Area | null; }) {
    const [currentArea, setCurrentArea] = useState(area);

    useEffect(() => { setCurrentArea(area); }, [area]);

    if (!isOpen || !currentArea) return null;

    const handleSave = () => {
        if (!currentArea.name) return;
        onSave(currentArea);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                    <h3 className="text-lg font-semibold">{'id' in currentArea ? 'Editar Área' : 'Nova Área'}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5" /></Button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="areaName">Nome da Área</Label>
                        <Input id="areaName" value={currentArea.name} onChange={(e) => setCurrentArea({...currentArea, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Cor</Label>
                        <div className="flex flex-wrap gap-3 pt-2">
                            {availableColors.map(color => (
                                <button key={color} onClick={() => setCurrentArea({...currentArea, color: color})} className={`w-8 h-8 rounded-full ${color} ${currentArea.color === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : ''}`}></button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 flex justify-end border-t dark:border-gray-800">
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const [areas, setAreas] = useState<Area[]>(mockAreasData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<Omit<Area, 'id'> | Area | null>(null);

    const handleSaveArea = (areaData: Omit<Area, 'id'> | Area) => {
        if ('id' in areaData) {
            setAreas(prev => prev.map(a => a.id === areaData.id ? areaData : a));
        } else {
            const newArea: Area = { ...areaData, id: `area-${Date.now()}` };
            setAreas(prev => [...prev, newArea]);
        }
    };

    const handleDeleteArea = (areaId: string) => {
        setAreas(prev => prev.filter(a => a.id !== areaId));
    };

    const handleOpenModal = (area: Omit<Area, 'id'> | Area | null) => {
        setEditingArea(area);
        setIsModalOpen(true);
    };

    return (
        <main className="flex-1 p-6 lg:p-8">
            <AreaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveArea} area={editingArea} />
            <div className="space-y-8">
                {/* Linha Superior: Perfil e Segurança */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle>Informações do Perfil</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center">
                                <div className="relative group w-28 h-28">
                                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                        <span className="text-4xl font-semibold text-gray-500">A</span>
                                    </div>
                                    <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" defaultValue="Usuário Organon" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue="usuario@organon.com" />
                            </div>
                        </CardContent>
                        <CardFooter><Button>Salvar Alterações</Button></CardFooter>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Segurança</CardTitle></CardHeader>
                         <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="current-password">Senha Atual</Label>
                                <Input id="current-password" type="password" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="new-password">Nova Senha</Label>
                                <Input id="new-password" type="password" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                         </CardContent>
                         <CardFooter><Button>Alterar Senha</Button></CardFooter>
                    </Card>
                </div>

                {/* Linha Inferior: Áreas da Vida */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Áreas da Vida</CardTitle>
                            <Button onClick={() => handleOpenModal({ name: '', color: availableColors[0] })}>Nova Área</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {areas.map(area => (
                            <div key={area.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${area.color}`}></div>
                                    <span className="font-medium">{area.name}</span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(area)}><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteArea(area.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
