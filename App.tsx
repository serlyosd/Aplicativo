
import React, { useState, useEffect } from 'react';
import { ContentFormat, ContentStatus, SocialNetwork, NexusPost, StrategyConfig } from './types';
import { generateUUID, getMonthGrid, toISODate, loadState, isHoliday } from './utils';

// --- CONFIGURAÇÃO INICIAL ---
const INITIAL_STRATEGY: StrategyConfig = {
  0: { active: false, defaultFormat: ContentFormat.STORY },
  1: { active: true, defaultFormat: ContentFormat.POST },
  2: { active: true, defaultFormat: ContentFormat.REELS },
  3: { active: true, defaultFormat: ContentFormat.CAROUSEL },
  4: { active: true, defaultFormat: ContentFormat.REELS },
  5: { active: true, defaultFormat: ContentFormat.POST },
  6: { active: false, defaultFormat: ContentFormat.STORY },
};

// --- COMPONENTES VISUAIS (ATOMIC DESIGN) ---

const Button = ({ children, onClick, variant = 'primary', className = '', icon, mobileIconOnly = false }: any) => {
  const base = "flex items-center justify-center gap-2 px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-bold text-xs lg:text-sm uppercase tracking-wider transition-all duration-300 active:scale-95";
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/20",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:border-slate-400 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "bg-transparent text-slate-400 hover:text-slate-900"
  };
  
  return (
    <button onClick={onClick} className={`${base} ${styles[variant as keyof typeof styles]} ${className}`}>
      {icon && <i className={`fa-solid ${icon} ${mobileIconOnly ? 'text-lg lg:text-base' : ''}`}></i>}
      <span className={mobileIconOnly ? 'hidden lg:inline' : ''}>{children}</span>
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ status }: { status: ContentStatus }) => {
  const colors = {
    [ContentStatus.IDEA]: 'bg-slate-100 text-slate-600 border-slate-200',
    [ContentStatus.PRODUCTION]: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    [ContentStatus.SCHEDULED]: 'bg-sky-50 text-sky-700 border-sky-100',
    [ContentStatus.PUBLISHED]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return <span className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-md text-[10px] lg:text-xs font-black uppercase tracking-widest border ${colors[status]}`}>{status}</span>;
};

// --- APLICAÇÃO PRINCIPAL ---

export default function NexusApp() {
  // Estado Global
  const [posts, setPosts] = useState<NexusPost[]>(() => loadState('nexus_db_v2', []));
  const [strategy, setStrategy] = useState<StrategyConfig>(() => loadState('nexus_strategy_v2', INITIAL_STRATEGY));
  const [view, setView] = useState<'planner' | 'studio' | 'archive' | 'strategy'>('planner');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NexusPost | null>(null);

  // Persistência Automática (Sincrona)
  const savePosts = (newPosts: NexusPost[]) => {
    setPosts(newPosts);
    localStorage.setItem('nexus_db_v2', JSON.stringify(newPosts));
  };

  const saveStrategy = (newStrat: StrategyConfig) => {
    setStrategy(newStrat);
    localStorage.setItem('nexus_strategy_v2', JSON.stringify(newStrat));
  };

  // --- LÓGICA DE NEGÓCIO ---

  // 1. Arquivar (A solução para o problema de exclusão)
  const archivePost = (id: string) => {
    const updated = posts.map(p => p.id === id ? { ...p, isArchived: true } : p);
    savePosts(updated);
    setIsModalOpen(false);
  };

  // 2. Restaurar
  const restorePost = (id: string) => {
    const updated = posts.map(p => p.id === id ? { ...p, isArchived: false } : p);
    savePosts(updated);
  };

  // 3. Exclusão Permanente (Correção da Lixeira)
  const hardDelete = (id: string) => {
    // Usar window.confirm para garantir interação do usuário
    if (window.confirm('Esta ação removerá definitivamente o item do sistema. Continuar?')) {
      // Cria uma nova array filtrando o ID exato
      const updated = posts.filter(p => p.id !== id);
      savePosts(updated);
    }
  };

  // 4. Salvar/Criar
  const handleSave = (post: NexusPost) => {
    const exists = posts.some(p => p.id === post.id);
    const updated = exists 
      ? posts.map(p => p.id === post.id ? post : p)
      : [...posts, post];
    savePosts(updated);
    setIsModalOpen(false);
  };

  const openNew = (dateStr?: string) => {
    setEditingPost({
      id: generateUUID(),
      date: dateStr || toISODate(new Date()),
      title: '',
      format: ContentFormat.POST,
      socialNetwork: SocialNetwork.INSTAGRAM,
      status: ContentStatus.IDEA,
      owner: 'Serlyo',
      isArchived: false
    });
    setIsModalOpen(true);
  };

  const generateBulk = () => {
    const { days } = getMonthGrid(currentDate);
    const newPosts: NexusPost[] = [];
    
    days.forEach(day => {
      const cfg = strategy[day.getDay()];
      const dStr = toISODate(day);
      const hasPost = posts.some(p => p.date === dStr && !p.isArchived);
      
      if (cfg.active && !hasPost) {
        newPosts.push({
          id: generateUUID(),
          date: dStr,
          title: 'Espaço Criativo',
          format: cfg.defaultFormat,
          socialNetwork: SocialNetwork.INSTAGRAM,
          status: ContentStatus.IDEA,
          owner: 'Serlyo',
          isArchived: false
        });
      }
    });
    
    if (newPosts.length > 0) {
      savePosts([...posts, ...newPosts]);
      alert(`${newPosts.length} slots criados com sucesso.`);
    }
  };

  // Helper de Cores de Status para o Calendário (Atualizado com mais distinção)
  const getStatusDotColor = (post: NexusPost) => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Publicado (Verde)
    if (post.status === ContentStatus.PUBLISHED) return 'bg-emerald-500 shadow-emerald-500/50';
    
    // 2. Atrasado (Vermelho - Prioridade sobre outros status se a data passou)
    if (post.date < today) return 'bg-red-500 shadow-red-500/50 animate-pulse';
    
    // 3. Agendado (Azul Céu)
    if (post.status === ContentStatus.SCHEDULED) return 'bg-sky-500 shadow-sky-500/50';
    
    // 4. Produção (Roxo/Indigo)
    if (post.status === ContentStatus.PRODUCTION) return 'bg-indigo-500 shadow-indigo-500/50';
    
    // 5. Ideia (Cinza Escuro)
    return 'bg-slate-400'; 
  };

  // Helper para Tooltip de Status
  const getStatusText = (post: NexusPost) => {
    const today = new Date().toISOString().split('T')[0];
    if (post.status === ContentStatus.PUBLISHED) return 'Publicado';
    if (post.date < today) return 'Atrasado';
    return post.status;
  };

  // Filtragem de View
  const activePosts = posts.filter(p => !p.isArchived);
  const archivedPosts = posts.filter(p => p.isArchived);

  // Itens de Menu
  const menuItems = [
    { id: 'planner', icon: 'fa-calendar-days', label: 'Agenda' },
    { id: 'studio', icon: 'fa-list-check', label: 'Pautas' },
    { id: 'strategy', icon: 'fa-sliders', label: 'Config' },
    { id: 'archive', icon: 'fa-trash-can', label: 'Lixo' },
  ];

  // --- UI RENDERERS ---

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FFFFFF] text-slate-800 font-sans selection:bg-slate-200 selection:text-slate-900">
      
      {/* SIDEBAR (Desktop Only) */}
      <aside className="hidden lg:flex w-80 bg-[#1E293B] text-slate-400 flex-col shrink-0 transition-all z-20 shadow-2xl relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="h-32 flex items-center justify-start px-8 border-b border-slate-700/50">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-[#1E293B] text-2xl font-black shadow-lg shadow-white/10 shrink-0">
            S
          </div>
          <div className="ml-5">
            <h1 className="font-black tracking-tight text-white text-3xl leading-none font-serif tracking-wide">SERLYO</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-2 font-bold">Gestão Financeira</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-3 mt-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl transition-all duration-300 group ${
                view === item.id 
                  ? 'bg-slate-800 text-white shadow-lg border border-slate-700' 
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-6 text-center text-xl ${view === item.id ? 'text-sky-400' : ''}`}></i>
              <span className="text-base font-bold tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white pb-20 lg:pb-0">
        
        {/* Header Responsive */}
        <header className="h-20 lg:h-28 px-4 lg:px-12 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-30 sticky top-0 shadow-sm lg:shadow-none">
          <div className="overflow-hidden">
            <h2 className="text-xl lg:text-4xl font-black tracking-tight text-slate-900 truncate">
              {view === 'planner' && 'Agenda Editorial'}
              {view === 'studio' && 'Gerenciador'}
              {view === 'strategy' && 'Estratégia'}
              {view === 'archive' && 'Arquivo'}
            </h2>
            <p className="text-xs lg:text-base text-slate-400 font-medium mt-1 lg:mt-2 flex items-center gap-2">
              <i className="fa-regular fa-calendar text-slate-300"></i>
              {view === 'planner' && new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}
              {view !== 'planner' && 'Painel'}
            </p>
          </div>
          <div className="flex gap-2 lg:gap-4 shrink-0">
            {view === 'planner' && <Button onClick={generateBulk} variant="secondary" icon="fa-wand-magic-sparkles" mobileIconOnly={true}>Gerar</Button>}
            <Button onClick={() => openNew()} icon="fa-plus" mobileIconOnly={true}>Novo</Button>
          </div>
        </header>

        {/* BARRA FIXA DE CONTROLES E LEGENDA (Apenas no Planner) */}
        {view === 'planner' && (
          <div className="px-4 lg:px-12 py-3 lg:py-4 bg-white/95 backdrop-blur-sm border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-3 lg:gap-4 shrink-0 z-20 shadow-sm">
             {/* Navegação de Data */}
             <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200 w-full lg:w-auto justify-between lg:justify-start">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="flex-1 lg:flex-none w-10 lg:w-10 h-10 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors text-base flex items-center justify-center"><i className="fa-solid fa-chevron-left"></i></button>
                <button onClick={() => setCurrentDate(new Date())} className="flex-[2] lg:flex-none px-6 text-xs font-black uppercase hover:bg-slate-50 rounded-xl text-slate-600 transition-colors tracking-widest">Hoje</button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="flex-1 lg:flex-none w-10 lg:w-10 h-10 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors text-base flex items-center justify-center"><i className="fa-solid fa-chevron-right"></i></button>
             </div>
             
             {/* Legenda Fixa - Com Scroll Horizontal no Mobile */}
             <div className="w-full overflow-x-auto no-scrollbar">
                <div className="flex flex-nowrap lg:flex-wrap items-center gap-4 lg:gap-5 px-2 lg:px-6 py-2 min-w-max">
                    <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold uppercase text-slate-500 tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-red-500/50"></span> Atrasado
                    </div>
                    <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold uppercase text-slate-500 tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span> Ideia
                    </div>
                    <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold uppercase text-slate-500 tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-indigo-500/50"></span> Produção
                    </div>
                    <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold uppercase text-slate-500 tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-sky-500 shadow-sky-500/50"></span> Agendado
                    </div>
                    <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold uppercase text-slate-500 tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-emerald-500/50"></span> Publicado
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 lg:px-12 pb-24 lg:pb-16 pt-6">
          
          {/* VIEW: PLANNER (Calendário Clean Professional) */}
          {view === 'planner' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Container com scroll horizontal no mobile para não quebrar o layout */}
              <div className="rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white overflow-x-auto">
                <div className="min-w-[800px] lg:min-w-0"> {/* Força largura mínima no mobile */}
                    {/* Cabeçalho dos Dias (Fundo Escuro) */}
                    <div className="grid grid-cols-7 bg-slate-800">
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(d => (
                        <div key={d} className="py-4 lg:py-6 text-center text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-white border-r border-slate-700 last:border-r-0">{d}</div>
                    ))}
                    </div>
                    
                    {/* Grid Clean */}
                    <div className="grid grid-cols-7 bg-slate-200 gap-px border-b border-slate-200">
                    {(() => {
                        const { days, padding } = getMonthGrid(currentDate);
                        return [
                        ...Array(padding).fill(null).map((_, i) => <div key={`pad-${i}`} className="h-40 lg:h-56 bg-slate-50/50"></div>),
                        ...days.map(d => {
                            const dStr = toISODate(d);
                            const isToday = dStr === toISODate(new Date());
                            const dayPosts = activePosts.filter(p => p.date === dStr);
                            const holidayName = isHoliday(d);
                            
                            return (
                            <div 
                                key={dStr} 
                                onClick={() => openNew(dStr)}
                                className={`h-40 lg:h-56 p-2 lg:p-4 bg-white hover:bg-slate-50 transition-all cursor-pointer group relative flex flex-col ${isToday ? 'bg-blue-50/20' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2 lg:mb-3">
                                    <span className={`text-sm lg:text-base font-bold w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center rounded-lg transition-all ${isToday ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-400 group-hover:text-slate-700'}`}>
                                        {d.getDate()}
                                    </span>
                                    {holidayName && (
                                        <span className="text-[8px] lg:text-[10px] font-bold text-amber-500 uppercase tracking-tight text-right leading-none max-w-[60px] lg:max-w-[100px] bg-amber-50 px-1.5 lg:px-2 py-1 rounded-md">{holidayName}</span>
                                    )}
                                </div>
                                
                                <div className="flex-1 space-y-1.5 lg:space-y-2.5 overflow-y-auto custom-scrollbar pr-1">
                                {dayPosts.map(p => (
                                    <div 
                                    key={p.id}
                                    onClick={(e) => { e.stopPropagation(); setEditingPost(p); setIsModalOpen(true); }}
                                    className="group/item relative bg-white border border-slate-200 pl-3 lg:pl-4 pr-2 lg:pr-3 py-2 lg:py-3 rounded-lg lg:rounded-xl shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all cursor-pointer"
                                    >
                                    {/* Indicador Visual */}
                                    <div className={`absolute top-3 lg:top-4 left-2 lg:left-3 w-2 h-2 lg:w-3 lg:h-3 rounded-full border-2 border-white shadow-sm ${getStatusDotColor(p)}`}></div>
                                    
                                    <div className="pl-3 lg:pl-4">
                                        <p className="text-[10px] lg:text-xs font-bold text-slate-800 truncate leading-tight mb-0.5 lg:mb-1.5">{p.title || 'Sem título'}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-wide">{p.format}</p>
                                            <i className={`fa-brands ${p.socialNetwork === SocialNetwork.LINKEDIN ? 'fa-linkedin text-blue-700' : 'fa-instagram text-pink-600'} text-[9px] lg:text-xs`}></i>
                                        </div>
                                    </div>

                                    {/* Tooltip escondido no mobile, visível no desktop */}
                                    <div className="hidden lg:block absolute opacity-0 group-hover/item:opacity-100 pointer-events-none bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-slate-900 text-white text-xs p-4 rounded-xl shadow-2xl z-50 transition-opacity duration-200">
                                        <div className="font-bold border-b border-slate-700 pb-2 mb-2 text-sm leading-snug">{p.title}</div>
                                        <div className="flex justify-between text-slate-400 font-medium">
                                            <span>{p.format}</span>
                                            <span className={p.status === ContentStatus.PUBLISHED ? 'text-emerald-400' : 'text-slate-300'}>{getStatusText(p)}</span>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                    </div>
                                ))}
                                </div>

                                {/* Botão Add Fantasma */}
                                <div className="absolute top-2 right-2 lg:top-4 lg:right-4 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs hover:bg-slate-900 hover:text-white transition-colors shadow-sm"><i className="fa-solid fa-plus"></i></div>
                                </div>
                            </div>
                            );
                        })
                        ];
                    })()}
                    </div>
                </div>
              </div>
              <p className="lg:hidden text-center text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold animate-pulse">
                <i className="fa-solid fa-arrows-left-right mr-1"></i> Deslize para ver a semana completa
              </p>
            </div>
          )}

          {/* VIEW: STUDIO (Lista Responsiva) */}
          {view === 'studio' && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border border-slate-100 shadow-2xl shadow-slate-100/50">
              {/* Tabela Desktop / Cards Mobile */}
              <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px] lg:min-w-0">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                      <tr>
                        <th className="px-6 lg:px-10 py-4 lg:py-6 text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-500">Data</th>
                        <th className="px-6 lg:px-10 py-4 lg:py-6 text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-500">Pauta / Detalhes</th>
                        <th className="px-6 lg:px-10 py-4 lg:py-6 text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-500">Canal / Resp.</th>
                        <th className="px-6 lg:px-10 py-4 lg:py-6 text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-500 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activePosts.sort((a,b) => b.date.localeCompare(a.date)).map(post => (
                        <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 lg:px-10 py-4 lg:py-6">
                            <div className="font-bold text-slate-700 text-sm lg:text-base">{new Date(post.date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                            {isHoliday(new Date(post.date + 'T12:00:00')) && (
                                <span className="text-[9px] text-amber-500 font-bold uppercase mt-1 block">{isHoliday(new Date(post.date + 'T12:00:00'))}</span>
                            )}
                          </td>
                          <td className="px-6 lg:px-10 py-4 lg:py-6">
                            <div className="flex items-center gap-4 mb-2">
                              <div className={`w-3 h-3 rounded-full shadow-sm ${getStatusDotColor(post)}`}></div>
                              <div className="font-bold text-slate-900 text-sm lg:text-base">{post.title || 'Sem título'}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase bg-slate-100 px-3 py-1 rounded-md border border-slate-200">{post.format}</span>
                              <Badge status={post.status} />
                            </div>
                          </td>
                          <td className="px-6 lg:px-10 py-4 lg:py-6">
                            <div className="flex items-center gap-3 mb-1">
                                <i className={`fa-brands ${post.socialNetwork === SocialNetwork.LINKEDIN ? 'fa-linkedin text-blue-700' : 'fa-instagram text-pink-600'} text-lg`}></i>
                                <span className="text-sm font-bold text-slate-700">{post.socialNetwork}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{post.owner}</div>
                          </td>
                          <td className="px-6 lg:px-10 py-4 lg:py-6 text-right">
                            <div className="flex justify-end gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <Button variant="secondary" className="px-3 py-2 lg:px-4 lg:py-3" onClick={() => { setEditingPost(post); setIsModalOpen(true); }}>
                                <i className="fa-solid fa-pen text-sm"></i>
                              </Button>
                              <Button variant="danger" className="px-3 py-2 lg:px-4 lg:py-3" onClick={() => archivePost(post.id)}>
                                <i className="fa-solid fa-trash-can text-sm"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </Card>
          )}

          {/* VIEW: ARQUIVO (Responsivo) */}
          {view === 'archive' && (
            <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-red-50 border border-red-100 rounded-2xl p-6 lg:p-8 flex items-start gap-4 lg:gap-6 shadow-sm">
                  <div className="bg-white p-3 lg:p-4 rounded-2xl text-red-500 shadow-sm border border-red-100">
                     <i className="fa-solid fa-triangle-exclamation text-xl lg:text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-lg lg:text-xl text-red-900">Área de Exclusão</h3>
                    <p className="text-sm lg:text-base text-red-700 mt-2">Itens nesta lista não aparecem na agenda. A exclusão aqui é permanente e irreversível.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                  {archivedPosts.map(post => (
                    <Card key={post.id} className="p-6 lg:p-8 opacity-80 hover:opacity-100 transition-all hover:shadow-2xl hover:-translate-y-1 ring-1 ring-slate-100 group">
                      <div className="flex justify-between items-start mb-4 lg:mb-6">
                        <span className="text-[10px] lg:text-xs font-black uppercase text-slate-500 bg-slate-50 px-2 lg:px-3 py-1.5 rounded border border-slate-100">{post.date}</span>
                        <div className="flex gap-2">
                             <i className={`fa-brands ${post.socialNetwork === SocialNetwork.LINKEDIN ? 'fa-linkedin text-blue-700' : 'fa-instagram text-pink-600'} text-xl lg:text-2xl opacity-50`}></i>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-4 line-clamp-2 min-h-[3rem] lg:min-h-[3.5rem] text-sm lg:text-base leading-relaxed">{post.title || 'Sem título'}</h3>
                      <div className="flex flex-wrap gap-2 lg:gap-3 mb-6 lg:mb-8">
                        <span className="text-[9px] lg:text-[10px] bg-slate-100 text-slate-500 px-2 lg:px-3 py-1 rounded font-bold uppercase">{post.format}</span>
                        <span className="text-[9px] lg:text-[10px] bg-slate-100 text-slate-500 px-2 lg:px-3 py-1 rounded font-bold uppercase">{post.status}</span>
                      </div>
                      
                      <div className="flex gap-3 lg:gap-4 pt-4 lg:pt-6 border-t border-slate-50">
                        <button onClick={() => restorePost(post.id)} className="flex-1 py-3 lg:py-4 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-bold uppercase transition-colors text-slate-600 shadow-sm">
                          Restaurar
                        </button>
                        <button onClick={() => hardDelete(post.id)} className="flex-1 py-3 lg:py-4 bg-red-50 hover:bg-red-600 hover:text-white border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase transition-all shadow-sm">
                          Excluir
                        </button>
                      </div>
                    </Card>
                  ))}
               </div>
            </div>
          )}
          
          {/* VIEW: CONFIG (Responsivo) */}
          {view === 'strategy' && (
             <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-6 lg:p-10 border-slate-100 shadow-2xl shadow-slate-100/50">
                  <h3 className="text-xl lg:text-2xl font-black mb-6 lg:mb-8 text-slate-900 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-base">
                        <i className="fa-solid fa-rotate"></i>
                    </div>
                    Padrão Semanal
                  </h3>
                  <div className="space-y-3 lg:space-y-4">
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, idx) => (
                      <div key={day} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-6 rounded-2xl border transition-all gap-4 ${strategy[idx].active ? 'bg-slate-50 border-slate-200' : 'bg-white border-transparent opacity-60 hover:opacity-100'}`}>
                         <div className="flex items-center gap-5">
                           <input 
                              type="checkbox" 
                              checked={strategy[idx].active}
                              onChange={() => {
                                const newS = {...strategy, [idx]: { ...strategy[idx], active: !strategy[idx].active }};
                                saveStrategy(newS);
                              }}
                              className="w-6 h-6 accent-slate-900 rounded-lg cursor-pointer border-slate-300"
                           />
                           <span className={`font-bold text-sm lg:text-base ${strategy[idx].active ? 'text-slate-900' : 'text-slate-400'}`}>{day}</span>
                         </div>
                         {strategy[idx].active && (
                           <select 
                              value={strategy[idx].defaultFormat}
                              onChange={(e) => {
                                const newS = {...strategy, [idx]: { ...strategy[idx], defaultFormat: e.target.value as ContentFormat }};
                                saveStrategy(newS);
                              }}
                              className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold uppercase outline-none focus:border-slate-900 text-slate-700 cursor-pointer hover:bg-white shadow-sm min-w-[140px]"
                           >
                              {Object.values(ContentFormat).map(f => <option key={f} value={f}>{f}</option>)}
                           </select>
                         )}
                      </div>
                    ))}
                  </div>
                </Card>
             </div>
          )}

        </div>
        
        {/* BOTTOM NAV (Mobile Only) */}
        <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-40 flex justify-around pb-safe pt-2">
            {menuItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setView(item.id as any)}
                    className={`flex flex-col items-center justify-center p-3 w-full transition-colors ${view === item.id ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    <i className={`fa-solid ${item.icon} text-xl mb-1 ${view === item.id ? 'text-slate-900' : ''}`}></i>
                    <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
                </button>
            ))}
        </nav>

      </main>

      {/* MODAL GLOBAL (Responsivo) */}
      {isModalOpen && editingPost && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-3xl rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
              
              <div className="px-6 lg:px-10 py-6 lg:py-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                 <div>
                   <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-slate-900">Detalhes</h2>
                   <div className="flex items-center gap-3 mt-2">
                      <span className={`w-3 h-3 rounded-full ${getStatusDotColor(editingPost)}`}></span>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">ID: {editingPost.id.split('-')[0]}</p>
                   </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 hover:text-red-500 text-lg">
                   <i className="fa-solid fa-times"></i>
                 </button>
              </div>

              <div className="p-6 lg:p-10 space-y-6 lg:space-y-8 overflow-y-auto custom-scrollbar">
                 {/* Linha 1 */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-2 lg:space-y-3">
                       <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Data</label>
                       <input 
                          type="date" 
                          value={editingPost.date}
                          onChange={e => setEditingPost({...editingPost, date: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 lg:py-4 px-4 lg:px-5 font-bold text-base lg:text-lg text-slate-800 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                       />
                       {isHoliday(new Date(editingPost.date + 'T12:00:00')) && (
                            <span className="text-xs text-amber-500 font-bold uppercase ml-1 block mt-1"><i className="fa-solid fa-star mr-1"></i>{isHoliday(new Date(editingPost.date + 'T12:00:00'))}</span>
                       )}
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                       <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Canal</label>
                       <div className="flex gap-3">
                           <button 
                                onClick={() => setEditingPost({...editingPost, socialNetwork: SocialNetwork.INSTAGRAM})}
                                className={`flex-1 py-3 lg:py-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${editingPost.socialNetwork === SocialNetwork.INSTAGRAM ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                           >
                               <i className="fa-brands fa-instagram text-lg lg:text-xl"></i> Instagram
                           </button>
                           <button 
                                onClick={() => setEditingPost({...editingPost, socialNetwork: SocialNetwork.LINKEDIN})}
                                className={`flex-1 py-3 lg:py-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${editingPost.socialNetwork === SocialNetwork.LINKEDIN ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                           >
                               <i className="fa-brands fa-linkedin text-lg lg:text-xl"></i> LinkedIn
                           </button>
                       </div>
                    </div>
                 </div>

                 {/* Título */}
                 <div className="space-y-2 lg:space-y-3">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Headline / Título</label>
                    <input 
                        type="text" 
                        placeholder="Sobre o que vamos falar?"
                        value={editingPost.title}
                        onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 lg:py-5 px-4 lg:px-5 font-bold text-lg lg:text-xl text-slate-800 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder:text-slate-300"
                    />
                 </div>

                 {/* Linha 2 */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-2 lg:space-y-3">
                       <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Formato</label>
                       <select 
                          value={editingPost.format}
                          onChange={e => setEditingPost({...editingPost, format: e.target.value as ContentFormat})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 lg:py-4 px-4 lg:px-5 font-bold text-base text-slate-800 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all appearance-none cursor-pointer"
                       >
                          {Object.values(ContentFormat).map(f => <option key={f} value={f}>{f}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                       <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Responsável</label>
                       <select 
                          value={editingPost.owner}
                          onChange={e => setEditingPost({...editingPost, owner: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 lg:py-4 px-4 lg:px-5 font-bold text-base text-slate-800 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all appearance-none cursor-pointer"
                       >
                          <option value="Serlyo">Serlyo</option>
                          <option value="Ana Celia">Ana Celia</option>
                       </select>
                    </div>
                 </div>
                 
                 {/* Status */}
                 <div className="space-y-2 lg:space-y-3">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Status de Produção</label>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        {Object.values(ContentStatus).map((status) => (
                            <button
                                key={status}
                                onClick={() => setEditingPost({...editingPost, status: status as ContentStatus})}
                                className={`py-3 lg:py-4 px-2 lg:px-3 rounded-xl text-[10px] lg:text-xs font-black uppercase border transition-all ${
                                    editingPost.status === status 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-[1.02]' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                 </div>
              </div>

              <div className="p-6 lg:p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-4 lg:gap-6 shrink-0">
                 <button onClick={() => archivePost(editingPost.id)} className="w-full lg:w-auto px-8 py-4 lg:py-5 rounded-2xl text-red-500 font-bold text-sm uppercase hover:bg-red-50 transition-colors border border-transparent hover:border-red-100 bg-red-50/50 lg:bg-transparent">
                    Arquivar
                 </button>
                 <button onClick={() => handleSave(editingPost)} className="w-full lg:flex-1 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 py-4 lg:py-5">
                    Salvar Alterações
                 </button>
              </div>

           </div>
        </div>
      )}

    </div>
  );
}
