
import React, { useState, useEffect } from 'react';
import { Post, PostFormat, PostStatus } from '../types';
import { generateId, formatDateToISO } from '../utils';
import { ThemePalette } from '../constants';

interface PostModalProps {
  post?: Post | null;
  initialDate?: string;
  onSave: (post: Post) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  theme: ThemePalette;
}

const PostModal: React.FC<PostModalProps> = ({ post, initialDate, onSave, onDelete, onClose, theme }) => {
  const [formData, setFormData] = useState<Post>({
    id: generateId(),
    date: initialDate || formatDateToISO(new Date()),
    title: '',
    format: PostFormat.POST,
    status: PostStatus.PLANEJADO,
    responsible: '',
    summary: '',
    link: ''
  });

  useEffect(() => {
    if (post) {
      setFormData({ ...post, id: String(post.id) });
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Defina um título para a postagem.");
      return;
    }
    onSave(formData);
  };

  const handleManualDelete = (e: React.MouseEvent) => {
    // Garantimos que nenhum outro evento ocorra
    e.preventDefault();
    e.stopPropagation();

    if (post && post.id) {
      const targetId = String(post.id);
      if (window.confirm("Atenção: Esta postagem será apagada permanentemente da sua biblioteca. Confirmar exclusão?")) {
        console.log("[Modal] Enviando ordem de exclusão para o App. ID:", targetId);
        onDelete(targetId);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`${theme.card} rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-xl border ${theme.border} overflow-hidden flex flex-col transform transition-all animate-in slide-in-from-bottom-8 duration-500`}>
        
        {/* Header Elegante */}
        <div className={`${theme.header} text-white p-8 flex justify-between items-center relative overflow-hidden`}>
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{post ? 'Editar Pauta' : 'Nova Pauta'}</h2>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.3em]">Editor de Conteúdo</p>
          </div>
          <button onClick={onClose} className="relative z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all hover:rotate-90">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fa-solid fa-pencil text-8xl -mr-8 -mt-8"></i>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <form id="pauta-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Data Prevista</label>
                <input 
                  type="date" 
                  className={`w-full p-4 border ${theme.border} rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold`}
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Formato de Entrega</label>
                <select 
                  className={`w-full p-4 border ${theme.border} rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold`}
                  value={formData.format} 
                  onChange={e => setFormData({...formData, format: e.target.value as PostFormat})}
                >
                  {Object.values(PostFormat).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Título da Publicação</label>
              <input 
                type="text" 
                placeholder="Ex: Como economizar no mercado..." 
                className={`w-full p-4 border ${theme.border} rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold placeholder:font-normal`}
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Status da Produção</label>
                <select 
                  className={`w-full p-4 border ${theme.border} rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold`}
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value as PostStatus})}
                >
                  {Object.values(PostStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Editor / Responsável</label>
                <input 
                  type="text" 
                  placeholder="Nome do editor"
                  className={`w-full p-4 border ${theme.border} rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold placeholder:font-normal`}
                  value={formData.responsible} 
                  onChange={e => setFormData({...formData, responsible: e.target.value})} 
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Reforçado */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex flex-col gap-4">
          <button 
            type="submit" 
            form="pauta-form" 
            className="w-full bg-blue-600 text-white font-black uppercase text-xs py-5 rounded-2xl shadow-[0_10px_30px_-5px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            {post ? 'Salvar Alterações' : 'Agendar Publicação'}
          </button>
          
          {post && (
            <button 
              type="button" 
              onClick={handleManualDelete} 
              className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-rose-100 bg-white text-rose-600 font-black uppercase text-[10px] hover:bg-rose-50 hover:border-rose-200 transition-all"
            >
              <i className="fa-solid fa-trash-can group-hover:shake"></i>
              Excluir Postagem Permanentemente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostModal;
