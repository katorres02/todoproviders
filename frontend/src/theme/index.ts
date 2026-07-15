import { createTheme, PaletteMode } from '@mui/material';
import type { Priority, TaskStatus } from '../types';

/**
 * Chart palette follows the dataviz method: categorical slots in fixed order,
 * status colors reserved for state, both stepped per surface (light/dark) and
 * validated for CVD-safe adjacency.
 */
export const chartColors = (mode: PaletteMode) => ({
  surface: mode === 'light' ? '#fcfcfb' : '#1a1a19',
  series1: mode === 'light' ? '#2a78d6' : '#3987e5', // blue
  series2: '#008300', // green
  series4: mode === 'light' ? '#eda100' : '#c98500', // yellow
  neutral: mode === 'light' ? '#c3c2b7' : '#52514e',
  grid: mode === 'light' ? '#e1e0d9' : '#2c2c2a',
  mutedInk: '#898781',
});

export const statusColor = (mode: PaletteMode): Record<TaskStatus, string> => ({
  PENDING: mode === 'light' ? '#898781' : '#a5a49c',
  IN_PROGRESS: mode === 'light' ? '#2a78d6' : '#3987e5',
  COMPLETED: mode === 'light' ? '#008300' : '#0ca30c',
});

// Reserved status palette (good/warning/serious/critical) — always paired with a text label.
export const priorityColor: Record<Priority, string> = {
  LOW: '#0ca30c',
  MEDIUM: '#fab219',
  HIGH: '#ec835a',
  CRITICAL: '#d03b3b',
};

export function buildTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#7C3AED' : '#A78BFA' },
      secondary: { main: mode === 'light' ? '#DB2777' : '#F472B6' },
      background:
        mode === 'light'
          ? { default: '#f9f9f7', paper: '#fcfcfb' }
          : { default: '#0d0d0d', paper: '#1a1a19' },
      success: { main: '#0ca30c' },
      warning: { main: '#fab219' },
      error: { main: '#d03b3b' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: { root: { minHeight: 44 } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${mode === 'light' ? 'rgba(11,11,11,0.10)' : 'rgba(255,255,255,0.10)'}`,
          },
        },
        defaultProps: { elevation: 0 },
      },
      MuiIconButton: {
        styleOverrides: { root: { padding: 10 } },
      },
    },
  });
}
