import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isHighContrast: boolean;
  setIsHighContrast: (highContrast: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('inspectra_theme');
    return (saved as ThemeType) || 'dark';
  });

  const [isHighContrast, setIsHighContrastState] = useState<boolean>(() => {
    const saved = localStorage.getItem('inspectra_hc');
    return saved === 'true';
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('inspectra_theme', newTheme);
  };

  const setIsHighContrast = (hc: boolean) => {
    setIsHighContrastState(hc);
    localStorage.setItem('inspectra_hc', hc.toString());
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Handle dark/light mode
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }

    // Handle high contrast mode
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [theme, isHighContrast]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isHighContrast, setIsHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
