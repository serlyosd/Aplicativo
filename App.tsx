
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Post, WeeklyConfig, ThemeType, PostStatus } from './types';
import { INITIAL_WEEKLY_CONFIG, THEMES } from './constants';
import { generateId, formatDateToISO, exportToJson, getDaysInMonth } from './utils';
import Calendar from './components/Calendar';
import Patterns from './components/Patterns';
import List from './components/List';
import PostModal from './components/PostModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'padroes' | 'lista'>('agenda');
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // INICIALIZAÇÃO SÍNCRONA: Evita o "flash" de estado vazio que sobrescreve o LocalStorage
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('serlyo_gestao_data');
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        return parsed.posts || [];
      } catch (e) { return []; }
    }
    return [];
  });

  const [weeklyConfig, setWeeklyConfig] = useState<WeeklyConfig>(() => {
    const saved = localStorage.getItem('serlyo_gestao_data');
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        return parsed.weeklyConfig || INITIAL_WEEKLY_CONFIG;
      } catch (e) { return INITIAL_WEEKLY_CONFIG; }
    }
    return INITIAL_WEEKLY_CONFIG;
  });

  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('serlyo_gestao_data');
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        return parsed.currentTheme || ThemeType.DEFAULT;
      } catch (e) { return ThemeType.DEFAULT; }
    }
    return ThemeType.DEFAULT;
  });

  const [modalState, setModalState] = useState<{ open: boolean; post: Post | null; date: string | null }>({
    open: false,
    post: null,
    date: null
  });

  // PERSISTÊNCIA: Apenas salva, nunca carrega (o carregamento é feito no useState inicial)
  useEffect(() => {
    const data: AppState = { posts, weeklyConfig, currentTheme: theme };
    localStorage.setItem('serlyo_gestao_data', JSON.stringify(data));
  }, [posts, weeklyConfig, theme]);

  const handleSavePost = useCallback((updatedPost: Post) => {
    setPosts((prev) => {
      const existingIndex = prev.findIndex(p => String(p.id) === String(updatedPost.id));
      if (existingIndex >= 0) {
        const newPosts = [...prev];
        newPosts[existingIndex] = updatedPost;
        return newPosts;
      }
      return [...prev, updatedPost];
    });
    setModalState({ open: false, post: null, date: null });
  }, []);

  // EXCLUSÃO REFORÇADA: Filtro atômico baseado em string
  const handleDeletePost = useCallback((id: string) => {
    if (!id) return;
    const targetId = String(id);
    
    setPosts((prev) => {
      const updated = prev.filter(p => String(p.id) !== targetId);
      console.log(`[Sistema] Excluindo post ID: ${targetId}. Itens restantes: ${updated.length}`);
      return updated;
    });

    setModalState({ open: false, post: null, date: null });
  }, []);

  const generateMonthlyPauta = useCallback(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days = getDaysInMonth(year, month);
    
    setPosts((currentPosts) => {
      const newEntries: Post[] = [];
      days.forEach(day => {
        const dayOfWeek = day.getDay();
        const config = weeklyConfig[dayOfWeek];
        const dateStr = formatDateToISO(day);

        if (config.active) {
          const alreadyExists = currentPosts.some(p => p.date === dateStr && p.format === config.defaultFormat);
          if (!alreadyExists) {
            newEntries.push({
              id: generateId(),
              date: dateStr,
              title: `Post Automatizado: ${config.defaultFormat}`,
              format: config.defaultFormat,
              status: PostStatus.PLANEJADO,
              responsible: 'Gerador Automático'
            });
          }
        }
      });

      if (newEntries.length > 0) {
        const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(viewDate);
        alert(`Sucesso! ${newEntries.length} postagens planejadas para ${monthLabel}.`);
        return [...currentPosts, ...newEntries];
      } else {
        alert('A pauta para este mês já está completa conforme sua configuração de frequência.');
        return currentPosts;
      }
    });
  }, [viewDate, weeklyConfig]);

  const currentThemeStyles = THEMES[theme];

  return (
    <div className={`min-h-screen transition-all duration-300 ${currentThemeStyles.bg} ${currentThemeStyles.text}`}>
      <header className={`${currentThemeStyles.header} text-white shadow-xl sticky top-0 z-40`}>
        <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg text-blue-600 shadow-md">
              <i className="fa-solid fa-calendar-check text-2xl"></i>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">
              SERLYO <span className="font-light opacity-80 text-lg sm:text-xl">Gestão Financeira</span>
            </h1>
          </div>

          <nav className="flex gap-1 bg-black bg-opacity-20 p-1 rounded-xl w-full lg:w-auto">
            <button onClick={() => setActiveTab('agenda')} className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'agenda' ? 'bg-white text-blue-700 shadow-lg' : 'hover:bg-white hover:bg-opacity-10 opacity-70'}`}>Agenda</button>
            <button onClick={() => setActiveTab('padroes')} className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'padroes' ? 'bg-white text-blue-700 shadow-lg' : 'hover:bg-white hover:bg-opacity-10 opacity-70'}`}>Frequência</button>
            <button onClick={() => setActiveTab('lista')} className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'lista' ? 'bg-white text-blue-700 shadow-lg' : 'hover:bg-white hover:bg-opacity-10 opacity-70'}`}>Biblioteca</button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-10 rounded-lg text-xs font-bold uppercase">
                <i className="fa-solid fa-palette"></i>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 hidden group-hover:block z-50">
                {Object.values(ThemeType).map(t => (
                  <button key={t} onClick={() => setTheme(t)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-3 mb-1 last:mb-0 ${theme === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <div className={`w-3 h-3 rounded-full ${THEMES[t].primary}`}></div> {t}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => exportToJson({ posts, weeklyConfig, currentTheme: theme })} className="p-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all shadow-sm">
              <i className="fa-solid fa-download"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {activeTab === 'agenda' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Calendário Editorial</h2>
                <p className={`${currentThemeStyles.textMuted} font-medium uppercase text-[10px] tracking-widest`}>Controle Mensal de Pautas</p>
              </div>
              <button onClick={() => setModalState({ open: true, post: null, date: formatDateToISO(viewDate) })} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs py-4 px-10 rounded-xl shadow-2xl transition-all active:scale-95">
                <i className="fa-solid fa-plus mr-2"></i> Adicionar Manualmente
              </button>
            </div>
            <Calendar 
              posts={posts} 
              theme={currentThemeStyles} 
              viewDate={viewDate} 
              onViewDateChange={setViewDate} 
              onDayClick={(date) => setModalState({ open: true, post: null, date })} 
              onPostClick={(post) => setModalState({ open: true, post, date: null })} 
            />
          </div>
        )}

        {activeTab === 'padroes' && (
          <div className="animate-in slide-in-from-bottom-6 duration-500">
            <Patterns 
              config={weeklyConfig} 
              onUpdate={setWeeklyConfig} 
              onGenerate={generateMonthlyPauta} 
              theme={currentThemeStyles} 
              viewDate={viewDate} 
            />
          </div>
        )}

        {activeTab === 'lista' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <h2 className="text-3xl font-black tracking-tight">Biblioteca de Posts</h2>
            <List 
              posts={posts} 
              theme={currentThemeStyles} 
              onEdit={(post) => setModalState({ open: true, post, date: null })} 
              onDelete={handleDeletePost} 
            />
          </div>
        )}
      </main>

      {modalState.open && (
        <PostModal 
          post={modalState.post} 
          initialDate={modalState.date || undefined} 
          theme={currentThemeStyles} 
          onSave={handleSavePost} 
          onDelete={handleDeletePost} 
          onClose={() => setModalState({ open: false, post: null, date: null })} 
        />
      )}
    </div>
  );
};

export default App;
