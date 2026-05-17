import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export enum ThemeColors {
  Light = 'light',
  Dark = 'dark',
}

export interface ThemeColorPalette {
  background: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryHover: string;
  accent: string;
  shadow: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColorPalette;
  toggleTheme: () => void;
}

const lightColors: ThemeColorPalette = {
  background: '#f1f5f9',
  surface: '#ffffff',
  surfaceHover: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  textSecondary: '#64748b',
  primary: '#3498db',
  primaryHover: '#2980b9',
  accent: '#10b981',
  shadow: 'rgba(0,0,0,0.05)',
};

const darkColors: ThemeColorPalette = {
  background: '#020617',
  surface: '#0f172a',
  surfaceHover: '#1e293b',
  border: '#334155',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  primary: '#3b82f6',
  primaryHover: '#60a5fa',
  accent: '#22c55e',
  shadow: 'rgba(0,0,0,0.5)',
};

const colorMap: Record<Theme, ThemeColorPalette> = {
  [ThemeColors.Light]: lightColors,
  [ThemeColors.Dark]: darkColors,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || ThemeColors.Light;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.style.backgroundColor = colorMap[theme].background;
    document.body.style.color = colorMap[theme].text;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === ThemeColors.Light ? ThemeColors.Dark : ThemeColors.Light);

  const value: ThemeContextType = {
    theme,
    colors: colorMap[theme],
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const getThemeColors = (theme: Theme): ThemeColorPalette => colorMap[theme];