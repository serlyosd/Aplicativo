
import React, { useState } from 'react';
import { Post, PostStatus } from '../types';
import { ThemePalette } from '../constants';

interface ListProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  theme: ThemePalette;
}

const List: React.FC<ListProps> = ({ posts, onEdit, onDelete, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = posts
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusStyle = (status: PostStatus) => {
    switch (status) {
      // Use POSTADO instead of non-existent PUBLICADO
      case PostStatus.POSTADO: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      // Use PRODUCAO instead of non-existent ADIADO
      case PostStatus.PRODUCAO: return 'bg-rose-100 text-rose-700 border-rose-200';
      case PostStatus.PLANEJADO: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`${theme.card} rounded-2xl shadow-2xl border ${theme.border} overflow-hidden animate-in fade-in duration-700`}>
      <div className="p-6 border-b bg-slate-50 bg-opacity-50">
        <div className="relative group">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Pesquisar pautas ou títulos..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
            <tr>
              <th className="px-8 py-5">Data de Publicação</th>
              <th className="px-8 py-5">Conteúdo / Formato</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <i className="fa-solid fa-folder-open text-5xl mb-4"></i>
                    <p className="font-black uppercase text-xs">Nenhum registro encontrado</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(post => (
                <tr key={post.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-slate-900">
                      {new Date(post.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-blue-700 group-hover:text-blue-800 transition-colors">{post.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-500">
                        {post.format}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${getStatusStyle(post.status)} shadow-sm`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onEdit(post)} 
                        className="w-9 h-9 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-700"
                        title="Editar postagem"
                      >
                        <i className="fa-solid fa-pen-to-square text-sm"></i>
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Excluir esta pauta permanentemente?')) onDelete(post.id); }} 
                        className="w-9 h-9 flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-700"
                        title="Excluir postagem"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
