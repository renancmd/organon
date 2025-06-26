// app/registro/page.tsx
// Página de Registro para o aplicativo Organon.

'use client';

import React from 'react';
import { Home } from 'lucide-react';

// --- Componentes Mock ---
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg ${className}`}>{children}</div>;
const CardHeader = ({ children, className='' }: { children: React.ReactNode, className?: string }) => <div className={`p-6 text-center ${className}`}>{children}</div>;
const CardTitle = ({ children }: { children: React.ReactNode }) => <h1 className="text-2xl font-bold">{children}</h1>;
const CardDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{children}</p>;
const CardContent = ({ children, className='' }: { children: React.ReactNode, className?: string }) => <div className={`p-6 ${className}`}>{children}</div>;
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: { children: React.ReactNode; className?: string; variant?: 'default' | 'ghost' | 'link'; size?: 'default' | 'icon', [key:string]: any }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
  const variantClasses = { 
      default: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900", 
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
  };
  const sizeClasses = { default: 'h-10 py-2 px-4', icon: 'h-9 w-9' };
  return <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>{children}</button>;
};
const Input = ({ className = '', type = 'text', placeholder = '', ...props }: { className?: string; type?: string; placeholder?: string; [key:string]: any; }) => ( <input type={type} placeholder={placeholder} {...props} className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${className}`} /> );
const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => ( <label htmlFor={htmlFor} className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"> {children} </label> );


export default function RegisterPage() {

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="w-full max-w-md p-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <a href="/" className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 text-lg font-semibold text-white dark:bg-gray-50 dark:text-gray-900" title="Organon">
                             <span className="text-2xl">O</span>
                        </a>
                    </div>
                    <CardTitle>Crie sua conta</CardTitle>
                    <CardDescription>É rápido e fácil. Comece a se organizar agora mesmo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input id="name" type="text" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Senha</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                    <Button className="w-full mt-2">Criar conta</Button>
                </CardContent>
                 <div className="p-6 pt-0 text-center text-sm text-gray-600 dark:text-gray-400">
                    Já tem uma conta?{' '}
                    <a href="/sign-in" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                        Entre
                    </a>
                </div>
            </Card>
        </div>
    </div>
  );
}
