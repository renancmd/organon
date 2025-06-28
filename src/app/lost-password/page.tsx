"use client";

import React from "react";
import Link from "next/link"; // Importado para navegação correta
// O ícone 'Home' foi removido pois não era utilizado

// --- Componentes UI Mock (Com Tipagem Refinada) ---
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 text-center ${className}`}>{children}</div>;
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-2xl font-bold">{children}</h1>
);
const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{children}</p>
);
const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "link";
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
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
  const variantClasses = {
    default:
      "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
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

export default function ForgotPasswordPage() {
  // A lógica de envio de e-mail pode ser adicionada aqui com useState e uma função de submit.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Link
                href="/"
                className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 text-lg font-semibold text-white dark:bg-gray-50 dark:text-gray-900"
                title="Organon"
              >
                <span className="text-2xl">O</span>
              </Link>
            </div>
            <CardTitle>Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu e-mail para receber um link de redefinição de senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
            <Button className="w-full mt-2">Enviar link de recuperação</Button>
          </CardContent>
          <div className="p-6 pt-0 text-center text-sm text-gray-600 dark:text-gray-400">
            Lembrou sua senha?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Voltar para o login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
