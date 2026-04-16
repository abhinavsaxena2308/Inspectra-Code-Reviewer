import React, { createContext, useContext } from 'react';
import { useUser, useAuth as useClerkAuth } from "@clerk/react";

interface AuthContextType {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: any) => void;
  updateProfile: (profile: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();

  const signOut = async () => {
    await clerkSignOut();
  };

  const setUser = (user: any) => {
    // This is essentially a no-op now as Clerk manages the user state
    console.warn("setUser called manually. Clerk handles user state automatically.");
  };

  const updateProfile = async (profile: Record<string, any>) => {
    if (user) {
      await user.update({
        firstName: profile.firstName,
        lastName: profile.lastName,
        // Add more fields if needed, mapping profile to Clerk user fields
      });
    }
  };

  const val = {
    user: user ? {
      ...user,
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName,
      avatarUrl: user.imageUrl,
    } : null,
    loading: !isLoaded,
    signOut,
    setUser,
    updateProfile
  };

  return (
    <AuthContext.Provider value={val}>
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
