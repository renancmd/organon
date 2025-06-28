"use client";

import React, { useState } from "react";
import Link from "next/link"; // Adicionado
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// --- Componentes Mock (Com Tipagem Refinada) ---
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

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors w-full h-10 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 disabled:opacity-50 ${
      props.className || ""
    }`}
    {...props}
  >
    {props.children}
  </button>
);

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
    className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
    {...props}
  >
    {props.children}
  </label>
);

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      router.push("/");
    } catch (err: unknown) {
      // Usar unknown é mais seguro que 'any'
      let message = "Falha ao criar a conta. Tente novamente.";
      if (err instanceof Error && "code" in err) {
        const firebaseError = err as { code: string };
        if (firebaseError.code === "auth/email-already-in-use") {
          message = "Este e-mail já está em uso.";
        } else if (firebaseError.code === "auth/weak-password") {
          message = "A senha deve ter pelo menos 6 caracteres.";
        } else if (firebaseError.code === "permission-denied") {
          message =
            "Erro de permissão ao salvar dados. Verifique as regras de segurança.";
        }
      }
      setError(message);
      console.error("[RegisterPage] - Erro capturado no handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <Link href="/" className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 dark:bg-gray-50">
                <span className="text-2xl font-semibold text-white dark:text-gray-900">
                  O
                </span>
              </div>
            </Link>
            <CardTitle>Crie sua conta</CardTitle>
            <CardDescription>
              É rápido e fácil. Comece a se organizar agora mesmo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          </CardContent>
          <div className="p-6 pt-0 text-center text-sm text-gray-600 dark:text-gray-400">
            Já tem uma conta?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Entre
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
