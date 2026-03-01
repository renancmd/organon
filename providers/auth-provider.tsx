'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';


interface AuthContextType {
	user: User | null;
	loading: boolean;
}


const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
});


export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {

		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});


		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{/* Opcional: Você pode renderizar um loader global aqui enquanto `loading` for true */}
			{!loading && children}
		</AuthContext.Provider>
	);
};
