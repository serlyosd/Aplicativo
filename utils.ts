
import { BRAZILIAN_HOLIDAYS } from './constants';

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Normaliza uma data para o meio-dia (12:00) 
 * para evitar problemas de fuso horário.
 */
export const normalizeDate = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
};

export const formatDateToISO = (date: Date): string => {
  const d = normalizeDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isHoliday = (date: Date): string | null => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const key = `${month}-${day}`;
  const found = BRAZILIAN_HOLIDAYS.find(h => h.date === key);
  return found ? found.name : null;
};

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1, 12, 0, 0);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const exportToJson = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `serlyo_backup_${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
