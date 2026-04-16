import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: any) => void;
  updateProfile: (profile: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Mock authentication check from localStorage
        const savedUser = localStorage.getItem('inspectra_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error fetching mock user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('inspectra_user');
    setUser(null);
  };

  const updateProfile = async (profile: Record<string, any>) => {
    const updatedUser = { ...user, ...profile };
    localStorage.setItem('inspectra_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setUser, updateProfile }}>
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
