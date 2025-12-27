
import React from 'react';
import { Post, PostFormat } from '../types';
import { getDaysInMonth, formatDateToISO, isHoliday } from '../utils';
import { ThemePalette } from '../constants';

interface CalendarProps {
  posts: Post[];
  onDayClick: (date: string) => void;
  onPostClick: (post: Post) => void;
  theme: ThemePalette;
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ posts, onDayClick, onPostClick, theme, viewDate, onViewDateChange }) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getDaysInMonth(year, month);
  
  const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0).getDay();
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getFormatIcon = (format: PostFormat) => {
    switch (format) {
      case PostFormat.REELS: return 'fa-solid fa-clapperboard text-blue-500';
      case PostFormat.STORIES: return 'fa-solid fa-circle-play text-pink-500';
      default: return 'fa-solid fa-image text-emerald-500';
    }
  };

  const nextMonth = () => onViewDateChange(new Date(year, month + 1, 1, 12, 0, 0));
  const prevMonth = () => onViewDateChange(new Date(year, month - 1, 1, 12, 0, 0));
  const today = () => onViewDateChange(new Date());

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(viewDate);

  return (
    <div className={`${theme.card} rounded-xl shadow-lg border ${theme.border} overflow-hidden`}>
      <div className={`${theme.cardAlt} border-b ${theme.border} p-4 flex justify-between items-center`}>
        <h2 className={`text-xl font-bold capitalize ${theme.text}`}>
          {monthName} <span className={`${theme.textMuted} font-normal`}>{year}</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={today} className={`px-3 py-1 ${theme.card} border ${theme.border} rounded-md text-sm hover:opacity-80 transition-all ${theme.text}`}>Hoje</button>
          <button onClick={prevMonth} className={`p-1 px-3 ${theme.card} border ${theme.border} rounded-md hover:opacity-80 transition-all ${theme.text}`}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button onClick={nextMonth} className={`p-1 px-3 ${theme.card} border ${theme.border} rounded-md hover:opacity-80 transition-all ${theme.text}`}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 text-center font-bold text-xs uppercase ${theme.textMuted} ${theme.cardAlt} border-b ${theme.border} py-2`}>
        <div>Dom</div>
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sáb</div>
      </div>

      <div className={`grid grid-cols-7 gap-[1px] ${theme.border.replace('border-', 'bg-')}`}>
        {blanks.map(b => (
          <div key={`blank-${b}`} className={`${theme.cardAlt} h-32 opacity-40`}></div>
        ))}
        {days.map(date => {
          const dateStr = formatDateToISO(date);
          const dayPosts = posts.filter(p => p.date === dateStr);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const holidayName = isHoliday(date);
          const isToday = formatDateToISO(new Date()) === dateStr;

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={`h-32 p-1 overflow-y-auto cursor-pointer hover:bg-blue-50 hover:bg-opacity-10 transition-colors ${
                isWeekend ? theme.cardAlt : theme.card
              } ${isToday ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-blue-600 text-white' : theme.text
                }`}>
                  {date.getDate()}
                </span>
                {holidayName && (
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded flex items-center" title={holidayName}>
                    <i className="fa-solid fa-star text-[7px] mr-1"></i>
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPostClick(post);
                    }}
                    className={`text-[10px] leading-tight bg-opacity-10 border ${theme.border} rounded p-1 hover:border-blue-500 hover:shadow-sm transition-all truncate flex items-center gap-1 ${theme.cardAlt} ${theme.text}`}
                  >
                    <i className={`${getFormatIcon(post.format)} shrink-0`}></i>
                    <span className="truncate">{post.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
