import { createContext } from 'react';
import { Theme, ThemeColorPalette } from './themeTypes';

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColorPalette;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
