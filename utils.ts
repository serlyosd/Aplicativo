
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getMonthGrid = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: Date[] = [];
  
  // Padding inicial (dias do mês anterior)
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(new Date(year, month, -i)); // placeholders
  }
  
  // Dias do mês
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  return {
    days: days.filter(d => d.getMonth() === month), // Retornar apenas dias reais para grid simples
    padding: firstDay.getDay(),
    totalDays: lastDay.getDate()
  };
};

export const toISODate = (date: Date) => date.toISOString().split('T')[0];

export const loadState = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

// Compatibility aliases and functions
export const generateId = generateUUID;
export const formatDateToISO = toISODate;

export const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const isHoliday = (date: Date) => {
  const d = date.getDate();
  const m = date.getMonth(); // 0-indexed (0 = Jan)
  
  // Feriados Nacionais Fixos
  if (d === 1 && m === 0) return 'Confraternização Universal';
  if (d === 21 && m === 3) return 'Tiradentes';
  if (d === 1 && m === 4) return 'Dia do Trabalho';
  if (d === 7 && m === 9) return 'Independência';
  if (d === 12 && m === 9) return 'N. Sra. Aparecida';
  if (d === 2 && m === 10) return 'Finados';
  if (d === 15 && m === 10) return 'Proc. da República';
  if (d === 25 && m === 11) return 'Natal';
  
  return null;
};
