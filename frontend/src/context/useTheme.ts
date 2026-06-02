import { useContext } from 'react';
import { ThemeContext } from './context';
import { Theme, ThemeColorPalette, colorMap } from './themeTypes';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const getThemeColors = (theme: Theme): ThemeColorPalette => colorMap[theme];
