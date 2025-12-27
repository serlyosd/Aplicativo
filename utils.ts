
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

export const generateId = () => crypto.randomUUID();

export const getMonthDays = (year: number, month: number) => {
  const date = new Date(year, month, 1, 12, 0, 0);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Export getDaysInMonth as an alias for getMonthDays to satisfy Calendar component
export const getDaysInMonth = getMonthDays;

export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Export formatDateToISO as an alias for formatDate to satisfy PostModal and Calendar
export const formatDateToISO = formatDate;

export const safeJsonParse = (str: string | null, fallback: any) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// Implement isHoliday to check if a given date is a holiday
export const isHoliday = (date: Date) => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const found = BRAZILIAN_HOLIDAYS.find(h => h.date === `${m}-${d}`);
  return found ? found.name : null;
};
