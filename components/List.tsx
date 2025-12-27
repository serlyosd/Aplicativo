
import React, { useState } from 'react';
import { Post, PostStatus, PostFormat } from '../types';
import { ThemePalette } from '../constants';

interface ListProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  theme: ThemePalette;
}

const List: React.FC<ListProps> = ({ posts, onEdit, onDelete, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (post.responsible?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case PostStatus.PUBLICADO: return 'bg-emerald-100 text-emerald-700';
      case PostStatus.ADIADO: return 'bg-red-100 text-red-700';
      case PostStatus.PLANEJADO: return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Excluir este post permanentemente?')) {
      console.log("Confirmando exclusão na lista para o ID:", id);
      onDelete(String(id));
    }
  };

  return (
    <div className={`${theme.card} rounded-xl shadow-lg border ${theme.border} overflow-hidden`}>
      <div className={`p-4 ${theme.cardAlt} border-b ${theme.border} flex flex-col md:flex-row gap-4 justify-between items-center`}>
        <div className="relative w-full md:w-96">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Buscar por título ou responsável..."
            className={`w-full pl-10 pr-4 py-2 border ${theme.border} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent ${theme.text}`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className={`text-sm font-medium ${theme.textMuted} whitespace-nowrap`}>Filtrar:</span>
          <select
            className={`w-full md:w-48 p-2 border ${theme.border} rounded-lg outline-none bg-transparent ${theme.text}`}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            {Object.values(PostStatus).map(s => (
              <option key={s} value={s} className="bg-white text-slate-800">{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className={`${theme.cardAlt} ${theme.textMuted} uppercase text-[10px] font-black border-b ${theme.border}`}>
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Conteúdo</th>
              <th className="px-6 py-4">Responsável</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme.border}`}>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={5} className={`px-6 py-12 text-center ${theme.textMuted} italic`}>
                  Nenhuma postagem encontrada para os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-slate-50 hover:bg-opacity-10 transition-colors group">
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${theme.text}`}>
                    {new Date(post.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold text-blue-500 mb-1`}>{post.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 ${theme.cardAlt} border ${theme.border} rounded-full w-fit ${theme.textMuted} font-black uppercase`}>
                        {post.format}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${theme.textMuted}`}>
                    {post.responsible || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(post)}
                        className={`p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all active:scale-90`}
                        title="Editar"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, post.id)}
                        className={`p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90`}
                        title="Excluir"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className={`p-4 ${theme.cardAlt} border-t ${theme.border} text-[10px] ${theme.textMuted} uppercase font-black`}>
        Total de itens: {filteredPosts.length}
      </div>
    </div>
  );
};

export default List;
