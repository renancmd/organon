'use client'; // Necessário se você estiver usando Next.js App Router

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase'; // Ajuste o caminho para o seu arquivo de configuração do Firebase

// Define a tipagem do nosso contexto
interface AuthContextType {
	user: User | null;
	loading: boolean;
}

// Cria o contexto com valores padrão
const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
});

// Hook personalizado para facilitar o uso do contexto
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// onAuthStateChanged é um listener do Firebase que observa mudanças no estado de login
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});

		// Limpa o listener quando o componente é desmontado para evitar memory leaks
		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{/* Opcional: Você pode renderizar um loader global aqui enquanto `loading` for true */}
			{!loading && children}
		</AuthContext.Provider>
	);
};
