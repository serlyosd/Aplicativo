
import { PostFormat, WeeklyConfig, ThemeType } from './types';

export const BRAZILIAN_HOLIDAYS = [
  { date: '01-01', name: 'Confraternização Universal' },
  { date: '04-21', name: 'Tiradentes' },
  { date: '05-01', name: 'Dia do Trabalho' },
  { date: '09-07', name: 'Independência' },
  { date: '10-12', name: 'Nsa. Sra. Aparecida' },
  { date: '11-02', name: 'Finados' },
  { date: '11-15', name: 'Proclamação da República' },
  { date: '12-25', name: 'Natal' }
];

export const INITIAL_WEEKLY_CONFIG: WeeklyConfig = {
  0: { active: false, defaultFormat: PostFormat.STORIES },
  1: { active: true, defaultFormat: PostFormat.POST },
  2: { active: true, defaultFormat: PostFormat.REELS },
  3: { active: true, defaultFormat: PostFormat.POST },
  4: { active: true, defaultFormat: PostFormat.REELS },
  5: { active: true, defaultFormat: PostFormat.POST },
  6: { active: false, defaultFormat: PostFormat.STORIES },
};

export interface ThemePalette {
  bg: string;
  header: string;
  primary: string;
  secondary: string;
  card: string;
  cardAlt: string;
  text: string;
  textMuted: string;
  border: string;
}

export const THEMES: Record<ThemeType, ThemePalette> = {
  [ThemeType.DEFAULT]: {
    bg: 'bg-slate-50',
    header: 'bg-blue-600',
    primary: 'bg-blue-600',
    secondary: 'bg-blue-700',
    card: 'bg-white',
    cardAlt: 'bg-slate-50',
    text: 'text-slate-800',
    textMuted: 'text-slate-500',
    border: 'border-slate-200'
  },
  [ThemeType.DARK]: {
    bg: 'bg-slate-950',
    header: 'bg-slate-900',
    primary: 'bg-indigo-600',
    secondary: 'bg-indigo-700',
    card: 'bg-slate-900',
    cardAlt: 'bg-slate-800',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    border: 'border-slate-700'
  },
  [ThemeType.CREATIVE]: {
    bg: 'bg-emerald-50',
    header: 'bg-emerald-600',
    primary: 'bg-emerald-600',
    secondary: 'bg-emerald-700',
    card: 'bg-white',
    cardAlt: 'bg-emerald-50',
    text: 'text-emerald-950',
    textMuted: 'text-emerald-700',
    border: 'border-emerald-200'
  }
};
