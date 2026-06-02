export type Theme = 'light' | 'dark';

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
  primaryGradient: string;
  successGradient: string;
  dangerGradient: string;
  danger: string;
  dangerHover: string;
}

export const colorMap: Record<Theme, ThemeColorPalette> = {
  light: {
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
    primaryGradient: 'linear-gradient(135deg, #3498db, #2980b9)',
    successGradient: 'linear-gradient(135deg, #27ae60, #1e8449)',
    dangerGradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    danger: '#e74c3c',
    dangerHover: '#c0392b',
  },
  dark: {
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
    primaryGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    successGradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    dangerGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    danger: '#ef4444',
    dangerHover: '#dc2626',
  },
};
