"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Ajuste o caminho se necessário
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Trash2, Edit, Camera, LogOut } from "lucide-react";

// --- Estruturas de Dados ---
type Area = { id: string; name: string; color: string };
type UserProfile = { name: string; email: string; profileImageUrl?: string };

const availableColors = [
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

// --- Componentes UI Mock (Simplificados) ---
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 border-b dark:border-gray-800">{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);
const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 flex-1 ${className}`}>{children}</div>;
const CardFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`p-6 border-t dark:border-gray-800 flex justify-end ${className}`}
  >
    {children}
  </div>
);
const Button = ({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);
const Input = ({
  className = "",
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${className}`}
    {...props}
  />
);
const Label = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <label className="text-sm font-medium leading-none" {...props}>
    {children}
  </label>
);

// --- Modal de Área ---
function AreaModal({
  isOpen,
  onClose,
  onSave,
  area,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (area: Partial<Area>) => void;
  area: Partial<Area> | null;
}) {
  // Componente Modal para criar/editar áreas...
  const [currentArea, setCurrentArea] = useState(area);
  useEffect(() => {
    setCurrentArea(area);
  }, [area]);
  if (!isOpen || !currentArea) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {currentArea.id ? "Editar Área" : "Nova Área"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <Label>Nome</Label>
          <Input
            value={currentArea.name || ""}
            onChange={(e) =>
              setCurrentArea({ ...currentArea, name: e.target.value })
            }
          />{" "}
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2 pt-2">
            {availableColors.map((c) => (
              <button
                key={c}
                onClick={() => setCurrentArea({ ...currentArea, color: c })}
                className={`w-8 h-8 rounded-full ${c} ${
                  currentArea.color === c ? "ring-2 ring-offset-2" : ""
                }`}
              />
            ))}
          </div>
        </div>
        <div className="p-6 border-t flex justify-end">
          <Button onClick={() => onSave(currentArea)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Partial<Area> | null>(null);

  // Efeito para buscar os dados do perfil e ouvir as áreas em tempo real
  useEffect(() => {
    if (user) {
      // Busca os dados do perfil uma vez
      const fetchProfile = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          console.log("Nenhum documento de perfil encontrado!");
        }
      };
      fetchProfile();

      // Ouve as mudanças nas áreas em tempo real
      const areasCollectionRef = collection(db, "users", user.uid, "areas");
      const unsubscribe = onSnapshot(areasCollectionRef, (querySnapshot) => {
        const areasData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Area)
        );
        setAreas(areasData);
      });

      return () => unsubscribe(); // Limpa o ouvinte ao desmontar
    }
  }, [user]);

  // Redireciona se não houver usuário após o carregamento inicial
  if (loading) return <p>Carregando...</p>;
  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const handleOpenModal = (area: Partial<Area> | null) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (profile) {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, profile);
      alert("Perfil salvo com sucesso!");
    }
  };

  const handleSaveArea = async (areaData: Partial<Area>) => {
    if (areaData.id) {
      // Editando
      const docRef = doc(db, "users", user.uid, "areas", areaData.id);
      await updateDoc(docRef, { name: areaData.name, color: areaData.color });
    } else {
      // Criando
      const collectionRef = collection(db, "users", user.uid, "areas");
      await addDoc(collectionRef, {
        name: areaData.name,
        color: areaData.color,
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteArea = async (areaId: string) => {
    const docRef = doc(db, "users", user.uid, "areas", areaId);
    await deleteDoc(docRef);
  };

  return (
    <main className="flex-1 p-6 lg:p-8">
      <AreaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveArea}
        area={editingArea}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={profile?.name || ""}
                onChange={(e) =>
                  setProfile((p) => (p ? { ...p, name: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                readOnly
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Áreas da Vida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {areas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${area.color}`}></div>
                  <span className="font-medium">{area.name}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenModal(area)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteArea(area.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() =>
                handleOpenModal({ name: "", color: availableColors[0] })
              }
            >
              Nova Área
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
        </Button>
      </div>
    </main>
  );
}
