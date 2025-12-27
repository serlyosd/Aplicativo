
import React, { useState } from 'react';
import { Post, PostFormat, PostStatus, WeeklyConfig, ThemeType } from './types';
import { generateId, getMonthDays, formatDate, safeJsonParse } from './utils';
import { INITIAL_WEEKLY_CONFIG } from './constants';

// --- COMPONENTES DE INTERFACE ---

const SidebarItem = ({ active, id, icon, label, onClick }: any) => (
  <button 
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${active === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
  >
    <i className={`fa-solid ${icon} w-5`}></i>
    {label}
  </button>
);

const App: React.FC = () => {
  // 1. ESTADO INICIAL (Carregamento Único)
  const [posts, setPosts] = useState<Post[]>(() => safeJsonParse(localStorage.getItem('serlyo_posts_v3'), []));
  const [config, setConfig] = useState<WeeklyConfig>(() => safeJsonParse(localStorage.getItem('serlyo_config_v3'), INITIAL_WEEKLY_CONFIG));
  const [view, setView] = useState<'agenda' | 'lista' | 'ajustes'>('agenda');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 2. MOTOR DE PERSISTÊNCIA (Ação Direta)
  const commitPosts = (newPosts: Post[]) => {
    localStorage.setItem('serlyo_posts_v3', JSON.stringify(newPosts));
    setPosts(newPosts);
  };

  const commitConfig = (newCfg: WeeklyConfig) => {
    localStorage.setItem('serlyo_config_v3', JSON.stringify(newCfg));
    setConfig(newCfg);
  };

  // 3. AÇÕES (CRUD)
  const handleSavePost = (post: Post) => {
    const updated = posts.some(p => p.id === post.id) 
      ? posts.map(p => p.id === post.id ? post : p)
      : [...posts, post];
    commitPosts(updated);
    setSelectedPost(null);
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('Deseja excluir esta pauta permanentemente?')) {
      const filtered = posts.filter(p => p.id !== id);
      commitPosts(filtered);
      setSelectedPost(null);
      console.log(`[V3] Exclusão confirmada para: ${id}`);
    }
  };

  const createQuickPost = (date: string) => {
    setSelectedPost({
      id: generateId(),
      date,
      title: '',
      format: PostFormat.POST,
      status: PostStatus.PLANEJADO,
      responsible: '',
      note: ''
    });
  };

  const generateMonth = () => {
    const days = getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());
    const newOnes: Post[] = [];
    days.forEach(d => {
      const cfg = config[d.getDay()];
      if (cfg.active) {
        const dStr = formatDate(d);
        if (!posts.some(p => p.date === dStr)) {
          newOnes.push({
            id: generateId(),
            date: dStr,
            title: `Pauta Sugerida: ${cfg.defaultFormat}`,
            format: cfg.defaultFormat,
            status: PostStatus.PLANEJADO,
            responsible: 'Sistema',
            note: ''
          });
        }
      }
    });
    if (newOnes.length) commitPosts([...posts, ...newOnes]);
    alert(`${newOnes.length} pautas criadas para o mês.`);
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Lateral */}
      <aside className="w-72 border-r bg-slate-50 flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-calendar-check text-xl"></i>
            </div>
            <h1 className="text-xl font-black tracking-tighter">SERLYO</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestão de Conteúdo</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem id="agenda" label="Agenda Editorial" icon="fa-calendar-days" active={view} onClick={setView} />
          <SidebarItem id="lista" label="Biblioteca" icon="fa-table-list" active={view} onClick={setView} />
          <SidebarItem id="ajustes" label="Frequência" icon="fa-sliders" active={view} onClick={setView} />
        </nav>

        <div className="p-6">
           <button onClick={() => createQuickPost(formatDate(new Date()))} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition-all">
             Nova Pauta
           </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-6xl mx-auto p-12">
          {view === 'agenda' && <CalendarView posts={posts} current={currentMonth} setCurrent={setCurrentMonth} onDayClick={createQuickPost} onPostClick={setSelectedPost} />}
          {view === 'lista' && <ListView posts={posts} onEdit={setSelectedPost} onDelete={handleDeletePost} />}
          {view === 'ajustes' && <SettingsView config={config} setConfig={commitConfig} onGenerate={generateMonth} />}
        </div>
      </main>

      {/* Modal de Edição */}
      {selectedPost && (
        <EditorModal 
          post={selectedPost} 
          onSave={handleSavePost} 
          onDelete={handleDeletePost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}
    </div>
  );
};

// --- SUBCOMPONENTES ---

const CalendarView = ({ posts, current, setCurrent, onDayClick, onPostClick }: any) => {
  const year = current.getFullYear();
  const month = current.getMonth();
  const days = getMonthDays(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(current);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black capitalize tracking-tight">{monthLabel}</h2>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={() => setCurrent(new Date(year, month - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"><i className="fa-solid fa-chevron-left"></i></button>
          <button onClick={() => setCurrent(new Date())} className="px-6 font-bold text-xs uppercase hover:bg-white rounded-xl transition-all">Hoje</button>
          <button onClick={() => setCurrent(new Date(year, month + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"><i className="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] py-2">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={i} className="h-32"></div>)}
        {days.map(d => {
          const dStr = formatDate(d);
          const dayPosts = posts.filter((p: any) => p.date === dStr);
          const isToday = formatDate(new Date()) === dStr;
          return (
            <div 
              key={dStr} 
              onClick={() => onDayClick(dStr)}
              className={`h-40 p-4 border rounded-[2rem] transition-all cursor-pointer group hover:border-blue-500 hover:bg-blue-50/30 ${isToday ? 'border-blue-200 bg-blue-50/50 ring-2 ring-blue-500/10' : 'border-slate-100'}`}
            >
              <span className={`text-lg font-black ${isToday ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-500'}`}>{d.getDate()}</span>
              <div className="mt-2 space-y-1">
                {dayPosts.map((p: any) => (
                  <div 
                    key={p.id} 
                    onClick={(e) => { e.stopPropagation(); onPostClick(p); }}
                    className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-[10px] font-bold truncate hover:scale-105 transition-transform"
                  >
                    {p.title || 'Sem título'}
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

const ListView = ({ posts, onEdit, onDelete }: any) => (
  <div className="animate-in slide-in-from-bottom-4 duration-500">
    <h2 className="text-3xl font-black mb-8">Biblioteca de Pautas</h2>
    <div className="bg-slate-50 rounded-[2.5rem] border overflow-hidden">
      <table className="w-full text-left">
        <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
          <tr>
            <th className="px-8 py-6">Data</th>
            <th className="px-8 py-6">Pauta / Formato</th>
            <th className="px-8 py-6">Status</th>
            <th className="px-8 py-6 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {posts.map((p: any) => (
            <tr key={p.id} className="hover:bg-white transition-colors group">
              <td className="px-8 py-6 font-bold text-sm text-slate-500">{new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
              <td className="px-8 py-6">
                <div className="font-black text-slate-900">{p.title || 'Pauta sem título'}</div>
                <div className="text-[10px] text-blue-600 font-bold uppercase mt-1">{p.format}</div>
              </td>
              <td className="px-8 py-6">
                <span className="px-3 py-1 bg-white border rounded-lg text-[9px] font-black uppercase shadow-sm">{p.status}</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(p)} className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center hover:text-blue-600 shadow-sm"><i className="fa-solid fa-pen"></i></button>
                  <button onClick={() => onDelete(p.id)} className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 shadow-sm"><i className="fa-solid fa-trash-can"></i></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SettingsView = ({ config, setConfig, onGenerate }: any) => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black">Frequência Semanal</h2>
          <p className="text-slate-400 font-medium">Defina os dias de postagem recorrente.</p>
        </div>
        <button onClick={onGenerate} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">Gerar Mês</button>
      </div>
      <div className="space-y-4">
        {days.map((day, idx) => (
          <div key={day} className={`p-6 rounded-[2rem] border flex items-center justify-between transition-all ${config[idx].active ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-transparent opacity-40'}`}>
            <div className="flex items-center gap-4">
              <input type="checkbox" checked={config[idx].active} onChange={() => setConfig({...config, [idx]: {...config[idx], active: !config[idx].active}})} className="w-6 h-6 rounded-lg" />
              <span className="font-black text-slate-900">{day}</span>
            </div>
            {config[idx].active && (
              <div className="flex gap-2">
                {[PostFormat.POST, PostFormat.REELS, PostFormat.STORIES].map(f => (
                  <button key={f} onClick={() => setConfig({...config, [idx]: {...config[idx], defaultFormat: f}})} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${config[idx].defaultFormat === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>{f}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EditorModal = ({ post, onSave, onDelete, onClose }: any) => {
  const [data, setData] = useState<Post>(post);
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black tracking-tight">Editar Publicação</h2>
          <button onClick={onClose} className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center hover:rotate-90 transition-all"><i className="fa-solid fa-times"></i></button>
        </div>
        <div className="p-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Data</label>
              <input type="date" value={data.date} onChange={e => setData({...data, date: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Formato</label>
              <select value={data.format} onChange={e => setData({...data, format: e.target.value as PostFormat})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none">
                {Object.values(PostFormat).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Título da Pauta</label>
            <input type="text" placeholder="Ex: 5 erros no Imposto de Renda" value={data.title} onChange={e => setData({...data, title: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Status</label>
              <select value={data.status} onChange={e => setData({...data, status: e.target.value as PostStatus})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none">
                {Object.values(PostStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Responsável</label>
              <input type="text" placeholder="Nome do editor" value={data.responsible} onChange={e => setData({...data, responsible: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none" />
            </div>
          </div>
        </div>
        <div className="p-10 bg-slate-50 flex flex-col gap-3">
          <button onClick={() => onSave(data)} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">Salvar Alterações</button>
          <button onClick={() => onDelete(data.id)} className="w-full text-rose-500 py-3 rounded-2xl font-black uppercase text-[10px] hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
            <i className="fa-solid fa-trash-can"></i> Excluir Definitivamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
