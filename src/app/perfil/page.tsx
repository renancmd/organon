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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Trash2, Edit, LogOut } from "lucide-react";

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

// --- Componentes UI Mock (Com Tipagem Refinada) ---
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

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "icon";
};

const Button = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50";
  const variants = {
    default:
      "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    outline: "border border-gray-200 dark:border-gray-700",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-8 w-8",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 ${
      props.className || ""
    }`}
    {...props}
  />
);

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="text-sm font-medium leading-none" {...props}>
    {props.children}
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
            onChange={(
              e: React.ChangeEvent<HTMLInputElement> // CORRIGIDO
            ) => setCurrentArea({ ...currentArea, name: e.target.value })}
          />
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
          <Button onClick={() => currentArea && onSave(currentArea)}>
            Salvar
          </Button>
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

  useEffect(() => {
    if (user) {
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

      const areasCollectionRef = collection(db, "users", user.uid, "areas");
      const unsubscribe = onSnapshot(areasCollectionRef, (querySnapshot) => {
        const areasData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Area)
        );
        setAreas(areasData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <p>Carregando...</p>;
  }

  const handleOpenModal = (area: Partial<Area> | null) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (profile && user) {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { name: profile.name });
      alert("Perfil salvo com sucesso!");
    }
  };

  const handleSaveArea = async (areaData: Partial<Area>) => {
    if (user && areaData.name) {
      if (areaData.id) {
        const docRef = doc(db, "users", user.uid, "areas", areaData.id);
        await updateDoc(docRef, { name: areaData.name, color: areaData.color });
      } else {
        const collectionRef = collection(db, "users", user.uid, "areas");
        await addDoc(collectionRef, {
          name: areaData.name,
          color: areaData.color,
        });
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteArea = async (areaId: string) => {
    if (user) {
      const docRef = doc(db, "users", user.uid, "areas", areaId);
      await deleteDoc(docRef);
    }
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
                onChange={(
                  e: React.ChangeEvent<HTMLInputElement> // CORRIGIDO
                ) =>
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
                className="bg-gray-100 dark:bg-gray-800"
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
                <div className="opacity-0 group-hover:opacity-100 flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenModal(area)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
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
