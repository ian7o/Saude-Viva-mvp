import React from 'react';
import { Theme, ThemeColorPalette } from '../context/ThemeContext';

export interface TitleStyles {
  pageTitle: React.CSSProperties;
  pageSubtitle: React.CSSProperties;
  header: React.CSSProperties;
}

export const getTitleStyles = (colors: ThemeColorPalette): TitleStyles => ({
  pageTitle: {
    color: colors.text,
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
  },
  pageSubtitle: {
    color: colors.textSecondary,
    fontSize: '14px',
    margin: '4px 0 0 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: `1px solid ${colors.border}`,
  },
});

export const getCommonStyles = (colors: ThemeColorPalette) => ({
  card: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    boxShadow: `0 1px 3px ${colors.shadow}, 0 1px 2px ${colors.shadow}`,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    marginTop: '8px',
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '14px',
    color: colors.text,
    background: colors.surfaceHover,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
  },
  inputFocus: {
    borderColor: colors.primary,
    boxShadow: `0 0 0 3px ${colors.primary}26`,
  },
  button: {
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    background: colors.primaryGradient,
    color: 'white',
    boxShadow: `0 4px 12px ${colors.primary}4D`,
  },
  successButton: {
    background: colors.successGradient,
    color: 'white',
    boxShadow: `0 4px 12px rgba(39, 174, 96, 0.3)`,
  },
  dangerButton: {
    background: colors.dangerGradient,
    color: 'white',
    boxShadow: `0 4px 12px rgba(231, 76, 60, 0.3)`,
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: colors.surface,
    padding: '32px',
    borderRadius: '16px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 40px',
    background: colors.surface,
    borderRadius: '12px',
    border: `2px dashed ${colors.border}`,
    color: colors.textSecondary,
    fontSize: '15px',
  },
  errorBox: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px',
    border: '1px solid #fecaca',
  },
});
