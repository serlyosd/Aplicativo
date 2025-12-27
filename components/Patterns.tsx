
import React from 'react';
import { WeeklyConfig, PostFormat } from '../types';
import { ThemePalette } from '../constants';

interface PatternsProps {
  config: WeeklyConfig;
  onUpdate: (newConfig: WeeklyConfig) => void;
  onGenerate: () => void;
  theme: ThemePalette;
  viewDate: Date;
}

const Patterns: React.FC<PatternsProps> = ({ config, onUpdate, onGenerate, theme, viewDate }) => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(viewDate);

  const handleToggle = (idx: number) => {
    onUpdate({ ...config, [idx]: { ...config[idx], active: !config[idx].active } });
  };

  const handleFormatChange = (idx: number, format: PostFormat) => {
    onUpdate({ ...config, [idx]: { ...config[idx], defaultFormat: format } });
  };

  return (
    <div className={`${theme.card} rounded-xl shadow-lg border ${theme.border} p-6`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text}`}>Configuração de Frequência</h2>
          <p className={`${theme.textMuted} text-sm`}>Defina os dias de postagem e gere a pauta automática.</p>
        </div>
        <button onClick={onGenerate} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs py-3 px-6 rounded-lg shadow-lg transition-all active:scale-95">
          <i className="fa-solid fa-magic mr-2"></i> Gerar pauta para {monthName}
        </button>
      </div>

      <div className="grid gap-3">
        {days.map((day, idx) => (
          <div key={day} className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg border ${config[idx].active ? 'bg-blue-500 bg-opacity-5 border-blue-200' : `${theme.cardAlt} ${theme.border} opacity-60`}`}>
            <div className="flex items-center gap-3 w-40">
              <input type="checkbox" checked={config[idx].active} onChange={() => handleToggle(idx)} className="w-5 h-5 rounded cursor-pointer" />
              <span className={`font-bold ${theme.text}`}>{day}</span>
            </div>
            {config[idx].active && (
              <div className="flex gap-2">
                {Object.values(PostFormat).map(f => (
                  <button key={f} onClick={() => handleFormatChange(idx, f)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all ${config[idx].defaultFormat === f ? 'bg-blue-600 text-white border-blue-600' : `${theme.card} ${theme.textMuted} ${theme.border}`}`}>
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Patterns;
