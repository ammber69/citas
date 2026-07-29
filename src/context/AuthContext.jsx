import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc 
} from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // { rol, ciudad, ciudadNombre, nombre }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Buscar datos del usuario en Firestore
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Usuario existe en Auth pero no en Firestore — probablemente SuperAdmin recién creado
            setUserData(null);
          }
        } catch (error) {
          console.error('Error al cargar datos de usuario:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Cargar datos del usuario inmediatamente después del login
    const userDoc = await getDoc(doc(db, 'usuarios', result.user.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    }
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    logout,
    isSuperAdmin: userData?.rol === 'superadmin',
    isAdmin: userData?.rol === 'admin' || userData?.rol === 'superadmin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
