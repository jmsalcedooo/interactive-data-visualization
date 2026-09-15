import { ColorTheme } from '../types';

export const THEME_PALETTES: Record<ColorTheme, { name: string; colors: string[]; bgBadge: string }> = {
  indigo: {
    name: 'Electric Indigo',
    colors: ['#6366f1', '#818cf8', '#38bdf8', '#a855f7', '#06b6d4', '#ec4899', '#34d399', '#fbbf24'],
    bgBadge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  },
  emerald: {
    name: 'Cyber Emerald',
    colors: ['#10b981', '#34d399', '#06b6d4', '#a3e635', '#22d3ee', '#14b8a6', '#facc15', '#6366f1'],
    bgBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  sunset: {
    name: 'Neon Sunset',
    colors: ['#f97316', '#fb7185', '#fbbf24', '#f43f5e', '#a855f7', '#6366f1', '#38bdf8', '#34d399'],
    bgBadge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
  slate: {
    name: 'Galactic Slate',
    colors: ['#94a3b8', '#38bdf8', '#818cf8', '#34d399', '#cbd5e1', '#a855f7', '#fbbf24', '#f43f5e'],
    bgBadge: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  vibrant: {
    name: 'Hyper Violet',
    colors: ['#a855f7', '#ec4899', '#6366f1', '#38bdf8', '#34d399', '#facc15', '#fb7185', '#c084fc'],
    bgBadge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
};

