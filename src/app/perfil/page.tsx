"use client";

import { useDarkMode } from "../../../hooks/useTheme";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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

// ---------- COMPONENTES DE UI ----------
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-xl shadow-sm flex flex-col border p-6 ${className}`}
    style={{
      backgroundColor: "var(--card-bg)",
      borderColor: "var(--card-border)",
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-between items-center border-b pb-4 mb-4" style={{ borderColor: "var(--card-border)" }}>
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex-1 ${className}`}>{children}</div>
);

const CardFooter = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex justify-end mt-4 ${className}`}>{children}</div>
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
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50";
  const variants = {
    default: "",
    ghost: "bg-transparent",
    outline: "border",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-8 w-8",
  };

  const style: React.CSSProperties =
    variant === "default"
      ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)" }
      : {};

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} style={style} {...props}>
      {children}
    </button>
  );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="flex h-10 w-full rounded-md px-3 py-2 text-sm border transition-colors duration-300"
    style={{ borderColor: "var(--input-border)", backgroundColor: "var(--card-bg)", color: "var(--foreground)" }}
  />
);

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="text-sm font-medium mb-1 block" {...props}>
    {props.children}
  </label>
);

// ---------- MODAL DE ÁREA ----------
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="relative z-50 w-full max-w-md rounded-lg"
        style={{ backgroundColor: "var(--card-bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>{currentArea.id ? "Editar Área" : "Nova Área"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={currentArea.name || ""}
              onChange={(e) => setCurrentArea({ ...currentArea, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {availableColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrentArea({ ...currentArea, color: c })}
                  className={`w-8 h-8 rounded-full ${c} ${currentArea.color === c ? "ring-2 ring-offset-2" : ""}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => currentArea && onSave(currentArea)}>Salvar</Button>
        </CardFooter>
      </div>
    </div>
  );
}

// ---------- PÁGINA PRINCIPAL ----------
export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Partial<Area> | null>(null);

  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProfile(docSnap.data() as UserProfile);
      };
      fetchProfile();

      const areasCollectionRef = collection(db, "users", user.uid, "areas");
      const unsubscribe = onSnapshot(areasCollectionRef, (querySnapshot) => {
        const areasData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Area));
        setAreas(areasData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push("/sign-in");
  }, [user, loading, router]);

  if (loading || !user) return <p>Carregando...</p>;

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
        await addDoc(collectionRef, { name: areaData.name, color: areaData.color });
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
    <main className="flex-1 p-6 lg:p-8 transition-colors duration-300" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AreaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveArea} area={editingArea} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PERFIL */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={profile?.name || ""}
                onChange={(e) => setProfile((p) => (p ? { ...p, name: e.target.value } : null))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                onChange={(e) => setProfile((p) => (p ? { ...p, email: e.target.value } : null))}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
          </CardFooter>
        </Card>

        {/* ÁREAS */}
        <Card>
          <CardHeader>
            <CardTitle>Áreas da Vida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {areas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between p-3 rounded-lg group"
                style={{ backgroundColor: "var(--card-bg)" }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${area.color}`}></div>
                  <span style={{ color: "var(--foreground)" }}>{area.name}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenModal(area)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteArea(area.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleOpenModal({ name: "", color: availableColors[0] })}>Nova Área</Button>
          </CardFooter>
        </Card>

        {/* APARÊNCIA */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <button
              onClick={() => isDark && toggleDarkMode()}
              className="flex flex-col items-center justify-center space-y-2 rounded-lg border-2 p-4 transition-colors duration-300"
              style={{
                borderColor: !isDark ? "var(--button-bg)" : "var(--card-border)",
              }}
            >
              <div
                className="w-16 h-12 rounded-md flex items-center justify-center"
                style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}
              >
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              </div>
              <span>Claro</span>
            </button>

            <button
              onClick={() => !isDark && toggleDarkMode()}
              className="flex flex-col items-center justify-center space-y-2 rounded-lg border-2 p-4 transition-colors duration-300"
              style={{
                borderColor: isDark ? "var(--button-bg)" : "var(--card-border)",
              }}
            >
              <div
                className="w-16 h-12 rounded-md flex items-center justify-center"
                style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}
              >
                <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
              </div>
              <span>Escuro</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4 transition-colors duration-300"
              style={{ borderColor: "var(--card-border)" }}
            >
              <div className="w-16 h-12 rounded-md flex">
                <div className="w-1/2 h-full bg-white rounded-l-md"></div>
                <div className="w-1/2 h-full bg-gray-900 rounded-r-md"></div>
              </div>
              <span>Sistema</span>
            </button>
          </CardContent>
        </Card>

        <Button variant="default" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
        </Button>
      </div>
    </main>
  );
}
