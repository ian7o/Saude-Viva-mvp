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
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: `1px solid ${colors.border}`,
  },
});

export const getCommonStyles = (colors: ThemeColorPalette) => ({
  card: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    boxShadow: colors.shadow,
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
    transition: 'all 0.2s ease',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #27ae60, #1e8449)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
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
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
});