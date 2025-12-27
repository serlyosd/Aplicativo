
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
    if (post) setFormData(post);
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Defina um título para a postagem.");
      return;
    }
    onSave(formData);
  };

  const handleActionDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (post && post.id) {
      if (window.confirm('Tem certeza que deseja apagar permanentemente?')) {
        console.log("[Modal] Solicitando exclusão do ID:", post.id);
        onDelete(String(post.id));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div className={`${theme.card} rounded-2xl shadow-2xl w-full max-w-lg border ${theme.border} overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className={`${theme.header} text-white p-5 flex justify-between items-center`}>
          <h2 className="text-xl font-bold uppercase tracking-tight">{post ? 'Editar Postagem' : 'Novo Post'}</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform p-2">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase mb-1 opacity-60">Data Agendada</label>
              <input type="date" className={`w-full p-3 border ${theme.border} rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-blue-500`} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase mb-1 opacity-60">Tipo de Conteúdo</label>
              <select className={`w-full p-3 border ${theme.border} rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-blue-500`} value={formData.format} onChange={e => setFormData({...formData, format: e.target.value as PostFormat})}>
                {Object.values(PostFormat).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase mb-1 opacity-60">Título / Pauta Curta</label>
            <input type="text" placeholder="Ex: Planejamento Financeiro 2024" className={`w-full p-3 border ${theme.border} rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-blue-500`} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase mb-1 opacity-60">Status Atual</label>
              <select className={`w-full p-3 border ${theme.border} rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-blue-500`} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as PostStatus})}>
                {Object.values(PostStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase mb-1 opacity-60">Editor Responsável</label>
              <input type="text" className={`w-full p-3 border ${theme.border} rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-blue-500`} value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} />
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row gap-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white font-black uppercase text-xs py-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
              <i className="fa-solid fa-check mr-2"></i> Confirmar Alteração
            </button>
            {post && (
              <button type="button" onClick={handleActionDelete} className="px-8 bg-red-600 text-white font-black uppercase text-xs py-4 rounded-xl shadow-lg hover:bg-red-700 active:scale-95 transition-all">
                <i className="fa-solid fa-trash"></i>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
