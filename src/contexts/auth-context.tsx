
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Import the initialized app

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; pass: string }) => Promise<User | null>;
  logout: () => void;
  register: (userInfo: Omit<User, 'id' | 'role' | 'avatarUrl'> & {password: string}) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Functions to interact with Firebase services
const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    const db = getFirestore(app);
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return { id: firebaseUser.uid, ...userDoc.data() } as User;
    }
    // If user exists in Auth but not in Firestore, create the Firestore document.
    // This is crucial for the admin user.
    if (firebaseUser.email?.startsWith('admin')) {
        const adminUser: Omit<User, 'id'> = {
            email: firebaseUser.email!,
            name: 'Admin',
            role: 'admin',
            avatarUrl: `https://placehold.co/100x100.png`
        };
        await setDoc(doc(db, "users", firebaseUser.uid), adminUser);
        return { id: firebaseUser.uid, ...adminUser };
    }
    return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userData = await fetchUserData(firebaseUser);
            setUser(userData);
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    
    if (!user && !isAuthPage) {
        router.push('/login');
    } else if (user && isAuthPage) {
        router.push('/');
    }
  }, [user, loading, pathname, router]);

  const login = async (credentials: { email: string; pass: string }): Promise<User | null> => {
    const auth = getAuth(app);
    // First, try to sign in
    try {
        const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.pass);
        const userData = await fetchUserData(userCredential.user);
        setUser(userData);
        return userData;
    } catch (error: any) {
        // If user is not found, and it's an admin, try to create it.
        if (error.code === 'auth/user-not-found' && credentials.email.startsWith('admin')) {
            const newUserCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.pass);
            const newAdminUser = await fetchUserData(newUserCredential.user); // fetchUserData will create the firestore doc
            setUser(newAdminUser);
            return newAdminUser;
        }
        // For any other error, re-throw it to be handled by the form.
        throw error;
    }
  };

  const register = async (userInfo: Omit<User, 'id' | 'role' | 'avatarUrl'> & {password: string}): Promise<User | null> => {
    const { email, password, ...rest } = userInfo;
    const auth = getAuth(app);
    const db = getFirestore(app);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    if (firebaseUser) {
        const newUser: Omit<User, 'id'> = {
            email: email,
            role: 'user',
            avatarUrl: `https://placehold.co/100x100.png?text=${rest.name[0]}`,
            ...rest
        };
        await setDoc(doc(db, "users", firebaseUser.uid), newUser);
        const fullUser = { id: firebaseUser.uid, ...newUser };
        setUser(fullUser);
        return fullUser;
    }
    
    return null;
  };

  const logout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
