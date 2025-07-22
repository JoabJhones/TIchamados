'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; pass: string }) => Promise<User | null>;
  logout: () => void;
  register: (userInfo: Omit<User, 'id' | 'role' | 'avatarUrl'> & {password: string}) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return { id: firebaseUser.uid, ...userDoc.data() } as User;
    }
    // Handle special admin case if not in firestore
    if (firebaseUser.email?.startsWith('admin')) {
        const adminUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: 'Admin',
            role: 'admin' as 'admin',
            avatarUrl: `https://placehold.co/100x100.png`
        };
        await setDoc(doc(db, "users", firebaseUser.uid), {
           name: adminUser.name,
           email: adminUser.email,
           role: 'admin',
           avatarUrl: adminUser.avatarUrl,
        });
        return adminUser;
    }
    return null;
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.pass);
    if (userCredential.user) {
        const userData = await fetchUserData(userCredential.user);
        setUser(userData);
        return userData;
    }
    return null;
  };

  const register = async (userInfo: Omit<User, 'id' | 'role' | 'avatarUrl'> & {password: string}): Promise<User | null> => {
    const { email, password, ...rest } = userInfo;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    if (firebaseUser) {
        const newUser: User = {
            id: firebaseUser.uid,
            email: email,
            role: 'user',
            avatarUrl: 'https://placehold.co/100x100.png',
            ...rest
        };
        await setDoc(doc(db, "users", firebaseUser.uid), {
            name: newUser.name,
            email: newUser.email,
            department: newUser.department,
            contact: newUser.contact,
            role: 'user',
            avatarUrl: newUser.avatarUrl,
        });
        setUser(newUser);
        return newUser;
    }
    
    return null;
  };

  const logout = async () => {
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
